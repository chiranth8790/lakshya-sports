import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  RemoveFormatting,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none p-3.5 min-h-[140px] focus:outline-none text-xs font-medium text-gray-800 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Keep editor content in sync when value changes externally (e.g., when switching products in editor)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white focus-within:border-black transition shadow-xs">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 border-b border-gray-200 text-gray-600">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('strike') ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Heading 3"
        >
          <Heading3 className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg transition hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-black text-white hover:bg-black' : ''
          }`}
          title="Quote"
        >
          <Quote className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
