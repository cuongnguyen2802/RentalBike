"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, Upload, ImageIcon, Check, Loader2, FileIcon } from "lucide-react";

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  mtime: string;
  isImage: boolean;
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPickerModal({ onSelect, onClose }: Props) {
  const [files,      setFiles]      = useState<MediaFile[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [tab,        setTab]        = useState<"library" | "upload">("library");
  const inputRef = useRef<HTMLInputElement>(null);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setFiles(data.files ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchFiles(); }, []);

  async function handleUpload(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append("files", f));
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      await fetchFiles();
      // Auto-select last uploaded image
      const first = data.files?.find((f: { url: string }) => f.url);
      if (first) { setSelected(first.url); setTab("library"); }
    } finally {
      setUploading(false);
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Media Library</h2>
            <p className="text-xs text-gray-500 mt-0.5">{files.length} files · select an image to insert</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-3 shrink-0">
          {(["library", "upload"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg capitalize transition-colors ${
                tab === t ? "bg-emerald-600 text-white" : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {t === "library" ? "Library" : "Upload New"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "upload" ? (
            /* ── Upload zone ── */
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
                isDragging ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
              }`}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={e => e.target.files && handleUpload(e.target.files)}
              />
              {uploading ? (
                <><Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto mb-3" /><p className="text-sm text-gray-500">Uploading…</p></>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-600">Drag & drop files here</p>
                  <p className="text-xs text-gray-400 mt-1">or click to browse · JPG, PNG, WebP, GIF, PDF · max 10 MB</p>
                </>
              )}
            </div>
          ) : (
            /* ── Library grid ── */
            loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No files uploaded yet.</p>
                <button onClick={() => setTab("upload")} className="mt-2 text-sm text-emerald-600 hover:underline">Upload your first file →</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {files.map(file => (
                  <button
                    key={file.filename}
                    type="button"
                    onClick={() => setSelected(file.url)}
                    className={`relative group rounded-xl overflow-hidden border-2 aspect-square transition-all ${
                      selected === file.url
                        ? "border-emerald-500 shadow-md shadow-emerald-200"
                        : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {file.isImage ? (
                      <Image src={file.url} alt={file.filename} fill className="object-cover" sizes="160px" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FileIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {/* Selected tick */}
                    {selected === file.url && (
                      <span className="absolute top-1.5 right-1.5 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </span>
                    )}
                    {/* Filename tooltip */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] py-1 px-1.5 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatSize(file.size)}
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50">
          <p className="text-xs text-gray-500">
            {selected ? `Selected: ${selected.split("/").pop()}` : "No image selected"}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { if (selected) { onSelect(selected); onClose(); } }}
              disabled={!selected}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Insert Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
