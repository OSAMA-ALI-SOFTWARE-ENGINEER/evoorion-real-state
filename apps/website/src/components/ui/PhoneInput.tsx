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
  { code: '+1',   flag: '🇨🇦', name: 'Canada' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
]

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  defaultCountryCode?: string
}

export function PhoneInput({ value, onChange, placeholder, defaultCountryCode }: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState<Country>(
    () => (defaultCountryCode ? COUNTRIES.find(c => c.code === defaultCountryCode) : undefined) ?? COUNTRIES[0]
  )
  const [number, setNumber] = useState('')
  // Update default country when prop changes (e.g. locale switches)
  useEffect(() => {
    if (!defaultCountryCode) return
    const match = COUNTRIES.find(c => c.code === defaultCountryCode)
    if (match) setCountry(match)
  }, [defaultCountryCode])

  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // sync internal number when parent resets value to ''
  useEffect(() => {
    if (!value) setNumber('')
  }, [value])

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50)
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
    onChange(number ? c.code + ' ' + number : '')
  }

  function onNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    const n = e.target.value
    setNumber(n)
    onChange(n ? country.code + ' ' + n : '')
  }

  const filtered = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search),
  )

  const base =
    'bg-white/5 border border-white/10 focus:border-gold text-white text-sm outline-none transition-colors duration-200'

  return (
    <div ref={wrapRef} className="relative flex">
      {/* Country code trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`${base} flex items-center gap-1.5 px-3 py-3 rounded-l-sm border-r-0 shrink-0 hover:bg-white/10`}
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span className="text-xs text-white/70">{country.code}</span>
        <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Number field */}
      <input
        type="tel"
        value={number}
        onChange={onNumberChange}
        placeholder={placeholder ?? 'Number'}
        className={`${base} flex-1 px-3 py-3 rounded-r-sm min-w-0 placeholder-muted`}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 w-72 mt-1 bg-brand border border-white/10 rounded-sm shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country…"
              className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white text-xs outline-none focus:border-gold placeholder-white/30"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-white/30 text-xs text-center py-4">No results</p>
            ) : (
              filtered.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectCountry(c)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors ${c.code === country.code && c.name === country.name ? 'bg-white/10' : ''}`}
                >
                  <span className="text-base shrink-0">{c.flag}</span>
                  <span className="flex-1 text-white text-xs truncate">{c.name}</span>
                  <span className="text-white/40 text-xs shrink-0">{c.code}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
