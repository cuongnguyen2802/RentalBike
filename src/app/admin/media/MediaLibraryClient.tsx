"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Upload, ImageIcon, FileIcon, Trash2, X, Loader2, Check,
  LayoutGrid, List as ListIcon, Copy, CheckCheck,
} from "lucide-react";

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  mtime: string;
  isImage: boolean;
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MediaLibraryClient() {
  const [files,       setFiles]       = useState<MediaFile[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [uploading,   setUploading]   = useState(false);
  const [uploadQueue, setUploadQueue] = useState<string[]>([]);  // filenames being uploaded
  const [isDragging,  setIsDragging]  = useState(false);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [view,        setView]        = useState<"grid" | "list">("grid");
  const [deleteIds,   setDeleteIds]   = useState<Set<string>>(new Set());
  const [copied,      setCopied]      = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);

  const inputRef    = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ── */
  async function fetchFiles() {
    setLoading(true);
    try {
      const res  = await fetch("/api/media");
      const data = await res.json();
      setFiles(data.files ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchFiles(); }, []);

  /* ── Upload ── */
  async function handleUpload(fileList: FileList | File[]) {
    const arr = Array.from(fileList);
    if (!arr.length) return;

    setUploading(true);
    setUploadQueue(arr.map(f => f.name));
    setError(null);

    try {
      const fd = new FormData();
      arr.forEach(f => fd.append("files", f));
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      const errors = data.files?.filter((f: { error?: string }) => f.error);
      if (errors?.length) setError(errors.map((e: { error: string }) => e.error).join(", "));

      await fetchFiles();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setUploadQueue([]);
    }
  }

  /* ── Drag & drop ── */
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => {
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) setIsDragging(false);
  }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Delete single ── */
  async function handleDelete(filename: string) {
    setDeleteIds(prev => new Set(prev).add(filename));
    try {
      await fetch("/api/media", { method: "DELETE", body: JSON.stringify({ filename }), headers: { "Content-Type": "application/json" } });
      setFiles(prev => prev.filter(f => f.filename !== filename));
      setSelected(prev => { const n = new Set(prev); n.delete(filename); return n; });
    } catch {
      setError("Delete failed.");
    } finally {
      setDeleteIds(prev => { const n = new Set(prev); n.delete(filename); return n; });
    }
  }

  /* ── Delete selected ── */
  async function handleBulkDelete() {
    const ids = Array.from(selected);
    await Promise.all(ids.map(id => handleDelete(id)));
    setSelected(new Set());
  }

  /* ── Toggle select ── */
  function toggleSelect(filename: string) {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(filename)) n.delete(filename);
      else n.add(filename);
      return n;
    });
  }

  /* ── Copy URL ── */
  function copyUrl(url: string) {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  const selectedCount = selected.size;
  const imageFiles    = files.filter(f => f.isImage);
  const otherFiles    = files.filter(f => !f.isImage);

  return (
    <div
      ref={dropZoneRef}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative"
    >
      {/* Full-page drag overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-40 bg-emerald-500/20 backdrop-blur-sm border-4 border-dashed border-emerald-400 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl px-10 py-6 text-center shadow-2xl">
            <Upload className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-bold text-emerald-700">Drop files to upload</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{files.length} files · drag anywhere to upload</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}>
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          {selectedCount > 0 && (
            <button onClick={handleBulkDelete} className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors">
              <Trash2 className="h-4 w-4" /> Delete {selectedCount}
            </button>
          )}

          <input ref={inputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={e => e.target.files && handleUpload(e.target.files)} />
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "Uploading…" : "Upload Files"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Upload queue */}
      {uploading && uploadQueue.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-700">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-semibold">Uploading {uploadQueue.length} file{uploadQueue.length > 1 ? "s" : ""}…</span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      )}

      {/* Drop zone prompt (when empty) */}
      {!loading && files.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center cursor-pointer hover:border-emerald-300 hover:bg-gray-50 transition-colors" onClick={() => inputRef.current?.click()}>
          <ImageIcon className="h-14 w-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No files yet</p>
          <p className="text-gray-400 text-sm mt-1">Drag & drop or click to upload</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      )}

      {/* ── File grid ── */}
      {!loading && files.length > 0 && view === "grid" && (
        <div>
          {imageFiles.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Images ({imageFiles.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6">
                {imageFiles.map(file => (
                  <FileCard
                    key={file.filename}
                    file={file}
                    selected={selected.has(file.filename)}
                    deleting={deleteIds.has(file.filename)}
                    copied={copied === file.url}
                    onToggle={() => toggleSelect(file.filename)}
                    onDelete={() => handleDelete(file.filename)}
                    onCopy={() => copyUrl(file.url)}
                  />
                ))}
              </div>
            </>
          )}
          {otherFiles.length > 0 && (
            <>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Other Files ({otherFiles.length})</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {otherFiles.map(file => (
                  <FileCard
                    key={file.filename}
                    file={file}
                    selected={selected.has(file.filename)}
                    deleting={deleteIds.has(file.filename)}
                    copied={copied === file.url}
                    onToggle={() => toggleSelect(file.filename)}
                    onDelete={() => handleDelete(file.filename)}
                    onCopy={() => copyUrl(file.url)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── File list view ── */}
      {!loading && files.length > 0 && view === "list" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                <th className="pl-5 pr-3 py-3 w-10">
                  <input type="checkbox"
                    checked={selected.size === files.length && files.length > 0}
                    onChange={e => setSelected(e.target.checked ? new Set(files.map(f => f.filename)) : new Set())}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file.filename} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors ${selected.has(file.filename) ? "bg-emerald-50/50" : ""}`}>
                  <td className="pl-5 pr-3 py-3">
                    <input type="checkbox" checked={selected.has(file.filename)} onChange={() => toggleSelect(file.filename)} className="rounded" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {file.isImage ? (
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <Image src={file.url} alt={file.filename} fill className="object-cover" sizes="40px" />
                        </div>
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <FileIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">{file.filename}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{file.isImage ? "Image" : "File"}</td>
                  <td className="px-4 py-3 text-gray-500">{formatSize(file.size)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(file.mtime)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => copyUrl(file.url)} title="Copy URL" className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">
                        {copied === file.url ? <CheckCheck className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDelete(file.filename)} disabled={deleteIds.has(file.filename)} title="Delete" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30">
                        {deleteIds.has(file.filename) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── File card (grid view) ── */
function FileCard({
  file, selected, deleting, copied,
  onToggle, onDelete, onCopy,
}: {
  file: MediaFile;
  selected: boolean;
  deleting: boolean;
  copied: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  return (
    <div className={`relative group rounded-xl overflow-hidden border-2 transition-all ${selected ? "border-emerald-500 shadow-md shadow-emerald-100" : "border-transparent hover:border-gray-200"}`}>
      {/* Image / icon */}
      <div className="aspect-square bg-gray-100 cursor-pointer" onClick={onToggle}>
        {file.isImage ? (
          <div className="relative w-full h-full">
            <Image src={file.url} alt={file.filename} fill className="object-cover" sizes="200px" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileIcon className="h-10 w-10 text-gray-300" />
          </div>
        )}
      </div>

      {/* Selected tick */}
      {selected && (
        <div className="absolute top-2 left-2 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center shadow">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Hover action bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-1">
        <p className="text-white text-[10px] truncate flex-1">{formatSize(file.size)}</p>
        <button onClick={onCopy} title="Copy URL" className="p-1 rounded text-white/80 hover:text-white hover:bg-white/20 transition-colors">
          {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <button onClick={onDelete} disabled={deleting} title="Delete" className="p-1 rounded text-white/80 hover:text-red-400 hover:bg-white/20 transition-colors">
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Filename */}
      <div className="px-2 py-1.5 bg-white border-t border-gray-100">
        <p className="text-[11px] text-gray-600 truncate">{file.filename.split("-").slice(2).join("-") || file.filename}</p>
      </div>
    </div>
  );
}
