import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import DOMPurify from "dompurify";
import { useCallback, useRef, useState } from "react";

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const TEXT_COLORS = [
  "#101828", "#475467", "#667085", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ffffff", "#000000",
];

const BG_COLORS = [
  "#fef9c3", "#dcfce7", "#dbeafe", "#f3e8ff", "#fee2e2",
  "#ffedd5", "#e0f2fe", "#fce7f3", "#f1f5f9", "#f9fafb",
];

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center w-8 h-8 rounded text-sm transition-colors
        ${active
          ? "bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-400"
          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />;
}

export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing...",
  className = "",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

  const linkInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-brand-500 underline" } }),
      Image.configure({ HTMLAttributes: { class: "max-w-full rounded" } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      const sanitized = DOMPurify.sanitize(html, {
        ADD_TAGS: ["table", "thead", "tbody", "tfoot", "tr", "th", "td", "colgroup", "col"],
        ADD_ATTR: ["colspan", "rowspan", "style", "class", "href", "target", "src", "alt"],
      });
      onChange?.(sanitized);
    },
    editorProps: {
      attributes: {
        class: "rte-rendered focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const handleInsertImage = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl("");
  }, [editor, imageUrl]);

  const handleInsertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const currentHeading = [1, 2, 3, 4, 5, 6].find((level) =>
    editor.isActive("heading", { level })
  );

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Heading selector */}
        <div className="relative">
          <select
            value={currentHeading ?? "p"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "p") {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: parseInt(val) as 1|2|3|4|5|6 }).run();
              }
            }}
            className="h-8 px-2 text-sm rounded bg-transparent border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer focus:outline-none"
            title="Heading"
          >
            <option value="p">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>
        </div>

        <Divider />

        {/* Bold */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <strong className="text-xs font-bold">B</strong>
        </ToolbarButton>
        {/* Italic */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <em className="text-xs font-bold">I</em>
        </ToolbarButton>
        {/* Underline */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <span className="text-xs font-bold underline">U</span>
        </ToolbarButton>
        {/* Strikethrough */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <span className="text-xs font-bold line-through">S</span>
        </ToolbarButton>

        <Divider />

        {/* Text Align */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 6h18M3 12h12M3 18h15" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M6 12h12M4 18h16" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M9 12h12M6 18h15" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="7" r="1.5" fill="currentColor"/><path d="M9 7h12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><path d="M9 12h12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/><circle cx="5" cy="17" r="1.5" fill="currentColor"/><path d="M9 17h12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/></svg>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M9 7h12M9 12h12M9 17h12" stroke="currentColor" strokeWidth={2} strokeLinecap="round"/><text x="2" y="9" fontSize="6" fill="currentColor">1.</text><text x="2" y="14" fontSize="6" fill="currentColor">2.</text><text x="2" y="19" fontSize="6" fill="currentColor">3.</text></svg>
        </ToolbarButton>

        <Divider />

        {/* Blockquote */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9.135 20c-.89 0-1.627-.297-2.21-.89C6.308 18.516 6 17.757 6 16.865c0-.568.145-1.108.435-1.622.29-.514.688-.92 1.193-1.217L10.378 12H6V4h8v8.378L10.865 14.5A4.43 4.43 0 0110 16.865C10 18.855 9.712 20 9.135 20zm10 0c-.89 0-1.627-.297-2.21-.89-.617-.594-.925-1.353-.925-2.245 0-.568.145-1.108.435-1.622.29-.514.688-.92 1.193-1.217L20.378 12H16V4h8v8.378L20.865 14.5A4.43 4.43 0 0120 16.865C20 18.855 19.712 20 19.135 20z"/></svg>
        </ToolbarButton>

        {/* Code block */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton onClick={() => { setShowLinkInput((v) => !v); setShowImageInput(false); setShowTextColorPicker(false); setShowBgColorPicker(false); }} active={editor.isActive("link")} title="Insert Link">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-10 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-72">
              <p className="text-xs text-gray-500 mb-2">Enter URL</p>
              <input
                ref={linkInputRef}
                autoFocus
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetLink()}
                placeholder="https://example.com"
                className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={handleSetLink} className="flex-1 bg-brand-500 text-white text-xs py-1 rounded hover:bg-brand-600">Apply</button>
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }} className="flex-1 border border-gray-200 dark:border-gray-600 text-xs py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Remove</button>
              </div>
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <ToolbarButton onClick={() => { setShowImageInput((v) => !v); setShowLinkInput(false); setShowTextColorPicker(false); setShowBgColorPicker(false); }} title="Insert Image">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2}/><circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2}/><polyline points="21 15 16 10 5 21" strokeWidth={2}/></svg>
          </ToolbarButton>
          {showImageInput && (
            <div className="absolute top-10 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-72">
              <p className="text-xs text-gray-500 mb-2">Image URL</p>
              <input
                ref={imageInputRef}
                autoFocus
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInsertImage()}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-sm dark:bg-gray-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <button type="button" onClick={handleInsertImage} className="w-full mt-2 bg-brand-500 text-white text-xs py-1 rounded hover:bg-brand-600">Insert</button>
            </div>
          )}
        </div>

        {/* Table */}
        <ToolbarButton onClick={handleInsertTable} title="Insert Table">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1" strokeWidth={2}/><path d="M3 9h18M3 15h18M9 3v18M15 3v18" strokeWidth={2}/></svg>
        </ToolbarButton>

        <Divider />

        {/* Text Color */}
        <div className="relative">
          <ToolbarButton onClick={() => { setShowTextColorPicker((v) => !v); setShowBgColorPicker(false); setShowLinkInput(false); setShowImageInput(false); }} title="Text Color">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold leading-none" style={{ color: editor.getAttributes("textStyle").color || "currentColor" }}>A</span>
              <div className="w-4 h-1 rounded-full" style={{ backgroundColor: editor.getAttributes("textStyle").color || "#101828" }} />
            </div>
          </ToolbarButton>
          {showTextColorPicker && (
            <div className="absolute top-10 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-40">
              <p className="text-xs text-gray-500 mb-2">Text Color</p>
              <div className="grid grid-cols-6 gap-1">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => { editor.chain().focus().setColor(color).run(); setShowTextColorPicker(false); }}
                    className="w-5 h-5 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button type="button" onClick={() => { editor.chain().focus().unsetColor().run(); setShowTextColorPicker(false); }} className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Reset</button>
            </div>
          )}
        </div>

        {/* Background / Highlight Color */}
        <div className="relative">
          <ToolbarButton onClick={() => { setShowBgColorPicker((v) => !v); setShowTextColorPicker(false); setShowLinkInput(false); setShowImageInput(false); }} title="Background Color" active={editor.isActive("highlight")}>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold leading-none">A</span>
              <div className="w-4 h-1 rounded-full bg-yellow-300" />
            </div>
          </ToolbarButton>
          {showBgColorPicker && (
            <div className="absolute top-10 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-40">
              <p className="text-xs text-gray-500 mb-2">Highlight Color</p>
              <div className="grid grid-cols-5 gap-1">
                {BG_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => { editor.chain().focus().setHighlight({ color }).run(); setShowBgColorPicker(false); }}
                    className="w-5 h-5 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowBgColorPicker(false); }} className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Reset</button>
            </div>
          )}
        </div>
      </div>

      {/* Table controls (shown when cursor is in a table) */}
      {editor.isActive("table") && (
        <div className="flex flex-wrap gap-1 px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-950 text-xs">
          <span className="text-blue-500 font-medium mr-1">Table:</span>
          {[
            { label: "+ Col Before", fn: () => editor.chain().focus().addColumnBefore().run() },
            { label: "+ Col After", fn: () => editor.chain().focus().addColumnAfter().run() },
            { label: "- Col", fn: () => editor.chain().focus().deleteColumn().run() },
            { label: "+ Row Before", fn: () => editor.chain().focus().addRowBefore().run() },
            { label: "+ Row After", fn: () => editor.chain().focus().addRowAfter().run() },
            { label: "- Row", fn: () => editor.chain().focus().deleteRow().run() },
            { label: "Delete Table", fn: () => editor.chain().focus().deleteTable().run() },
            { label: "Merge Cells", fn: () => editor.chain().focus().mergeCells().run() },
            { label: "Split Cell", fn: () => editor.chain().focus().splitCell().run() },
          ].map(({ label, fn }) => (
            <button key={label} type="button" onClick={fn} className="px-2 py-0.5 rounded border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900">
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Editor Content */}
      <div
        className="rich-text-editor-content"
        onClick={() => { setShowLinkInput(false); setShowImageInput(false); setShowTextColorPicker(false); setShowBgColorPicker(false); }}
      >
        {!editor.getText() && !editor.isFocused && (
          <div className="absolute pointer-events-none px-4 py-3 text-gray-400 text-sm">{placeholder}</div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
