'use client'

import { useEffect, useRef, useState } from 'react'
import { IconChevronDown, IconSearch } from '@/components/ui/icons'

export interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  searchable?: boolean
  className?: string
  disabled?: boolean
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchable = false,
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const ref               = useRef<HTMLDivElement>(null)
  const inputRef          = useRef<HTMLInputElement>(null)

  const selected = options.find(o => o.value === value)

  const filtered = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  useEffect(() => {
    if (!open) setQuery('')
    if (open && searchable) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open, searchable])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        className={[
          'w-full flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm transition-colors focus:outline-none',
          'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200',
          'hover:border-slate-300 dark:hover:border-slate-500 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          open ? 'border-[#C9A84C] ring-1 ring-[#C9A84C]' : '',
        ].join(' ')}
      >
        {selected?.icon && (
          <span className="shrink-0 text-slate-400 dark:text-slate-500">{selected.icon}</span>
        )}
        <span className="flex-1 text-left truncate">
          {selected ? selected.label : <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>}
        </span>
        <IconChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600 shadow-xl overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-slate-100 dark:border-slate-700">
              <div className="relative">
                <IconSearch size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#C9A84C]"
                />
              </div>
            </div>
          )}
          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-slate-400 text-center">No options found</li>
            )}
            {filtered.map(opt => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => { onChange(opt.value); setOpen(false) }}
                  className={[
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left',
                    opt.value === value
                      ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60',
                  ].join(' ')}
                >
                  {opt.icon && (
                    <span className={`shrink-0 ${opt.value === value ? 'text-[#C9A84C]' : 'text-slate-400 dark:text-slate-500'}`}>
                      {opt.icon}
                    </span>
                  )}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.description && (
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">{opt.description}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
