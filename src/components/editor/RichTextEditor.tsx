// WYSIWYG berbasis TipTap (headless — satu-satunya dependensi UI eksternal,
// keputusan di docs/konsep-ui-ux.md §6): toolbar kustom memakai token tema,
// nilai masuk/keluar berupa HTML (disimpan ke kolom body konten).
// RELASI: src/modules/content/ContentEditorPage.tsx — pemakai utama.
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Icon, type IconName } from "@/components/ui/icons";

function ToolbarButton({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: IconName;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md transition-colors",
        active ? "bg-accent-soft text-accent" : "text-ink2 hover:bg-surface2 hover:text-ink",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <Icon name={icon} className="size-4" />
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface2/50 px-2 py-1.5">
      <ToolbarButton icon="heading2" label="Heading 2" active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <ToolbarButton icon="heading3" label="Heading 3" active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <Divider />
      <ToolbarButton icon="bold" label="Tebal" active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()} />
      <ToolbarButton icon="italic" label="Miring" active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()} />
      <ToolbarButton icon="strikethrough" label="Coret" active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()} />
      <Divider />
      <ToolbarButton icon="list" label="Daftar poin" active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <ToolbarButton icon="list-ordered" label="Daftar bernomor" active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <ToolbarButton icon="quote" label="Kutipan" active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <ToolbarButton icon="code" label="Blok kode" active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <Divider />
      <ToolbarButton icon="undo" label="Urungkan" disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()} />
      <ToolbarButton icon="redo" label="Ulangi" disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
  // NEXT: tombol sisip gambar dari Media Library (modal pemilih media —
  // RELASI: src/modules/media) + tombol tautan internal dengan saran konten.
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-line" />;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Tulis isi konten di sini…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: { class: "prose-x px-4 py-3", "data-placeholder": placeholder },
    },
  });

  // Sinkron saat konten dari API tiba setelah editor terpasang (mode sunting).
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value && editor.isEmpty) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface focus-within:border-accent">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
