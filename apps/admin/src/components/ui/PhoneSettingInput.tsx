'use client'

import { useEffect, useRef, useState } from 'react'

interface Country {
  code: string
  flag: string
  name: string
}

const COUNTRIES: Country[] = [
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+1',   flag: '🇺🇸', name: 'United States' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
]

function parseValue(stored: string): { country: Country; number: string } {
  const fallback = COUNTRIES[0]
  if (!stored) return { country: fallback, number: '' }

  // Try longest codes first so +971 is matched before +97
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length)
  for (const c of sorted) {
    if (stored.startsWith(c.code)) {
      return { country: c, number: stored.slice(c.code.length).trim() }
    }
  }
  return { country: fallback, number: stored }
}

interface Props {
  id?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
}

export function PhoneSettingInput({ id, value, onChange, placeholder }: Props) {
  const parsed = parseValue(value)
  const [country, setCountry] = useState<Country>(parsed.country)
  const [number,  setNumber]  = useState(parsed.number)
  const [open,    setOpen]    = useState(false)
  const [search,  setSearch]  = useState('')
  const wrapRef   = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Sync if parent resets the value externally
  useEffect(() => {
    const p = parseValue(value)
    setCountry(p.country)
    setNumber(p.number)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value === '' ? value : null])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40)
  }, [open])

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  function selectCountry(c: Country) {
    setCountry(c)
    setOpen(false)
    setSearch('')
    onChange(number ? `${c.code} ${number}` : '')
  }

  function onNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = e.target.value
    setNumber(n)
    onChange(n ? `${country.code} ${n}` : '')
  }

  const filtered = COUNTRIES.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.includes(search),
  )

  const base = 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors'

  return (
    <div ref={wrapRef} className="relative flex">
      {/* Country trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`${base} flex items-center gap-1.5 px-3 py-2.5 rounded-l-lg border-r-0 shrink-0 hover:bg-slate-50 dark:hover:bg-slate-600`}
        aria-label="Select country code"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{country.code}</span>
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Number input */}
      <input
        id={id}
        type="tel"
        value={number}
        onChange={onNumberChange}
        placeholder={placeholder ?? '50 123 4567'}
        className={`${base} flex-1 px-3 py-2.5 rounded-r-lg min-w-0 placeholder-slate-400`}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 w-72 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country…"
              className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md px-3 py-1.5 text-slate-800 dark:text-slate-100 text-xs outline-none focus:border-[#C9A84C] placeholder-slate-400"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-4">No results</p>
            ) : (
              filtered.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${c.code === country.code && c.name === country.name ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-slate-700 dark:text-slate-200'}`}
                >
                  <span className="text-base shrink-0">{c.flag}</span>
                  <span className="flex-1 text-xs truncate">{c.name}</span>
                  <span className="text-slate-400 text-xs font-mono shrink-0">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
