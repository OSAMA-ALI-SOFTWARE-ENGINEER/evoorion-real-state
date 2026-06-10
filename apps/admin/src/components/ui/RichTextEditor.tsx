'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

const TOOLBAR = [
  { cmd: 'bold',                label: 'B',  title: 'Bold',           cls: 'font-bold' },
  { cmd: 'italic',              label: 'I',  title: 'Italic',         cls: 'italic' },
  { cmd: 'formatBlock', arg: 'h2', label: 'H2', title: 'Heading 2' },
  { cmd: 'formatBlock', arg: 'h3', label: 'H3', title: 'Heading 3' },
  { cmd: 'insertUnorderedList', label: '•—', title: 'Bullet list' },
  { cmd: 'insertOrderedList',   label: '1.', title: 'Numbered list' },
] as const

export function RichTextEditor({ value, onChange, placeholder = 'Full property description…', minHeight = '160px' }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const skipSync  = useRef(false)
  const [empty, setEmpty] = useState(!value)

  // push external value changes into the editor (e.g., initial load)
  useEffect(() => {
    const el = editorRef.current
    if (!el || skipSync.current) return
    if (el.innerHTML !== value) {
      el.innerHTML = value ?? ''
      setEmpty(!value)
    }
  }, [value])

  function exec(cmd: string, arg?: string) {
    document.execCommand(cmd, false, arg)
    editorRef.current?.focus()
    flush()
  }

  function flush() {
    const html = editorRef.current?.innerHTML ?? ''
    const isEmpty = html === '' || html === '<br>'
    setEmpty(isEmpty)
    skipSync.current = true
    onChange(isEmpty ? '' : html)
    requestAnimationFrame(() => { skipSync.current = false })
  }

  const btn = 'px-2 py-1 text-xs rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors select-none'

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden transition-colors focus-within:border-[#C9A84C] focus-within:ring-1 focus-within:ring-[#C9A84C]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60">
        {TOOLBAR.map(t => (
          <button
            key={t.cmd + ('arg' in t ? t.arg : '')}
            type="button"
            title={t.title}
            onMouseDown={e => { e.preventDefault(); exec(t.cmd, 'arg' in t ? t.arg : undefined) }}
            className={`${btn} ${'cls' in t ? t.cls : ''}`}
          >
            {t.label}
          </button>
        ))}
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-600 mx-1 shrink-0" />
        <button
          type="button"
          title="Remove formatting"
          onMouseDown={e => { e.preventDefault(); exec('removeFormat') }}
          className={`${btn} font-mono`}
        >
          T×
        </button>
      </div>

      {/* Editable content */}
      <div className="relative">
        {empty && (
          <p className="absolute top-2.5 left-3.5 text-slate-400 text-sm pointer-events-none select-none" aria-hidden>
            {placeholder}
          </p>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={flush}
          onKeyDown={e => {
            // Escape → blur
            if (e.key === 'Escape') editorRef.current?.blur()
          }}
          className="px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-700 outline-none overflow-y-auto
            [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-800 dark:[&_h2]:text-slate-100 [&_h2]:mt-3 [&_h2]:mb-1.5
            [&_h3]:text-sm  [&_h3]:font-semibold [&_h3]:text-slate-700 dark:[&_h3]:text-slate-200 [&_h3]:mt-2 [&_h3]:mb-1
            [&_ul]:list-disc   [&_ul]:pl-5 [&_ul]:my-1.5 [&_ul]:space-y-0.5
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1.5 [&_ol]:space-y-0.5
            [&_strong]:font-semibold [&_em]:italic [&_p]:my-1"
          style={{ minHeight }}
        />
      </div>
    </div>
  )
}
