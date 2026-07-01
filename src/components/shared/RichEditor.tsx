"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import TiptapLink from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback } from "react";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Minus, Undo, Redo,
} from "lucide-react";
import MediaPickerModal from "./MediaPickerModal";

interface Props {
  defaultValue?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarBtn({
  onClick, active = false, disabled = false, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`p-1.5 rounded-md text-sm transition-colors ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : disabled
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-gray-200 mx-1 shrink-0" />;
}

export default function RichEditor({
  defaultValue = "",
  onChange,
  placeholder = "Write something…",
  minHeight = 120,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapImage.configure({ inline: false, allowBase64: false }),
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content:   defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: { class: "rich-editor-content focus:outline-none" },
    },
  });

  const insertImage = useCallback((url: string) => {
    editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const setLink = useCallback(() => {
    const prev = editor?.getAttributes("link").href as string | undefined;
    const url  = window.prompt("URL", prev ?? "https://");
    if (url === null) return;
    if (!url) { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-transparent transition">
        {/* ── Toolbar ── */}
        <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/80">
          <ToolbarBtn
            title="Bold" onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn
            title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn
            title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
            <Minus className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn title="Link" onClick={setLink} active={editor.isActive("link")}>
            <LinkIcon className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          {/* Image — opens MediaPicker */}
          <ToolbarBtn title="Insert Image" onClick={() => setShowPicker(true)}>
            <ImageIcon className="h-4 w-4" />
          </ToolbarBtn>

          <Divider />

          <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="h-4 w-4" />
          </ToolbarBtn>
        </div>

        {/* ── Editor area ── */}
        <div style={{ minHeight }} className="px-4 py-3 bg-white cursor-text" onClick={() => editor.commands.focus()}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* ── Media Picker Modal ── */}
      {showPicker && (
        <MediaPickerModal
          onSelect={insertImage}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
