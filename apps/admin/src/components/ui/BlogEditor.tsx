'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { uploadMedia } from '@/lib/api'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

function Btn({ onClick, active, disabled, title, children }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors select-none ${
        active
          ? 'bg-[#C9A84C] text-slate-900'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
      } disabled:opacity-30 disabled:cursor-default`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-0.5 self-center shrink-0" />
}

export function BlogEditor({ value, onChange, placeholder = 'Write your post content here…', minHeight = 420 }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: { HTMLAttributes: { class: 'bg-slate-900 text-slate-100 rounded-lg px-4 py-3 text-sm font-mono overflow-x-auto my-3' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-[#C9A84C] pl-4 italic text-slate-500 dark:text-slate-400 my-3' } },
      }),
      Image.configure({ inline: false, allowBase64: false, HTMLAttributes: { class: 'rounded-lg max-w-full my-3' } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { class: 'text-[#C9A84C] underline underline-offset-2 hover:text-[#D4B668]' } }),
      Placeholder.configure({ placeholder }),
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'w-full aspect-video rounded-lg my-3' } }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-slate dark:prose-invert max-w-none focus:outline-none min-h-full',
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue
            uploadMedia(file, 'blog').then(r => {
              view.dispatch(view.state.tr.replaceSelectionWith(
                view.state.schema.nodes.image.create({ src: r.url, alt: '' })
              ))
            })
            return true
          }
        }
        return false
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files
        if (!files?.length) return false
        for (const file of Array.from(files)) {
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.from
            uploadMedia(file, 'blog').then(r => {
              view.dispatch(view.state.tr.insert(pos, view.state.schema.nodes.image.create({ src: r.url, alt: '' })))
            })
            return true
          }
        }
        return false
      },
    },
  })

  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (editor.getHTML() !== value && value !== undefined) {
      editor.commands.setContent(value || '')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value === '' ? value : null])

  async function handleFileUpload(file: File) {
    try {
      const r = await uploadMedia(file, 'blog')
      editor?.chain().focus().setImage({ src: r.url, alt: file.name.replace(/\.[^.]+$/, '') }).run()
    } catch (e) { console.error(e) }
  }

  function addLink() {
    const prev = editor?.getAttributes('link').href ?? ''
    const url  = window.prompt('Enter URL', prev)
    if (!url) { editor?.chain().focus().unsetLink().run(); return }
    editor?.chain().focus().setLink({ href: url }).run()
  }

  function addYoutube() {
    const url = window.prompt('YouTube URL')
    if (url) editor?.commands.setYoutubeVideo({ src: url })
  }

  if (!editor) return (
    <div className="border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 animate-pulse" style={{ minHeight }} />
  )

  return (
    <div className="flex flex-col border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden focus-within:border-[#C9A84C] focus-within:ring-1 focus-within:ring-[#C9A84C] transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2.5 py-2 bg-slate-50 dark:bg-slate-700/60 border-b border-slate-200 dark:border-slate-600">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><b>B</b></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><i>I</i></Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><s>S</s></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><code className="text-xs font-mono">` `</code></Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Heading 1"><span className="text-xs font-bold">H1</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><span className="text-xs font-bold">H2</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><span className="text-xs font-bold">H3</span></Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><span className="text-xs">• ≡</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><span className="text-xs">1.</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><span className="text-xs font-serif">"</span></Btn>
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block"><code className="text-[10px] font-mono">{'</>'}</code></Btn>
        <Sep />
        <Btn onClick={addLink} active={editor.isActive('link')} title="Insert link"><span className="text-xs">🔗</span></Btn>
        <Btn onClick={() => fileRef.current?.click()} title="Upload image"><span className="text-xs">🖼</span></Btn>
        <Btn onClick={addYoutube} title="Embed YouTube"><span className="text-xs">▶</span></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><span className="text-xs">—</span></Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><span className="text-xs">↩</span></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><span className="text-xs">↪</span></Btn>
      </div>

      {/* Content */}
      <EditorContent
        editor={editor}
        className="flex-1 px-5 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 overflow-y-auto
          [&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-slate-400
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none
          [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-5 [&_.ProseMirror_h1]:mb-2
          [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:mb-2
          [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:mb-1
          [&_.ProseMirror_p]:my-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:my-2
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:my-2
          [&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_hr]:border-slate-200 [&_.ProseMirror_hr]:dark:border-slate-600 [&_.ProseMirror_hr]:my-4"
        style={{ minHeight }}
      />

      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = '' }} />
    </div>
  )
}
