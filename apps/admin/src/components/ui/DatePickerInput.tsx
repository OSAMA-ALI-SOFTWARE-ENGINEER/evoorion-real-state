'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string       // 'YYYY-MM-DD' or ''
  onChange: (v: string) => void
  minDate?: Date      // defaults to tomorrow
  placeholder?: string
  label?: string
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']

function today() {
  const d = new Date(); d.setHours(0,0,0,0); return d
}

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function fromYMD(s: string): Date | null {
  if (!s) return null
  const [y,m,d] = s.split('-').map(Number)
  return new Date(y, m-1, d)
}

export function DatePickerInput({ value, onChange, minDate, placeholder = 'Select date…' }: Props) {
  const [open,    setOpen]    = useState(false)
  const [viewY,   setViewY]   = useState<number | null>(null)
  const [viewM,   setViewM]   = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const min   = minDate ?? (() => { const d = today(); d.setDate(d.getDate() + 1); return d })()
  const sel   = fromYMD(value)
  const initY = sel?.getFullYear() ?? min.getFullYear()
  const initM = sel?.getMonth()    ?? min.getMonth()

  const displayY = viewY ?? initY
  const displayM = viewM ?? initM

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  function prevMonth() {
    if (displayM === 0) { setViewY(displayY - 1); setViewM(11) }
    else                { setViewM(displayM - 1) }
  }

  function nextMonth() {
    if (displayM === 11) { setViewY(displayY + 1); setViewM(0) }
    else                 { setViewM(displayM + 1) }
  }

  function selectDay(d: Date) {
    onChange(toYMD(d))
    setOpen(false)
  }

  function buildCalendar() {
    const first = new Date(displayY, displayM, 1)
    const cells: (Date | null)[] = Array(first.getDay()).fill(null)
    const last  = new Date(displayY, displayM + 1, 0).getDate()
    for (let i = 1; i <= last; i++) cells.push(new Date(displayY, displayM, i))
    return cells
  }

  const cells = buildCalendar()

  function fmtDisplay(s: string) {
    const d = fromYMD(s)
    if (!d) return ''
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-left focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-colors hover:border-slate-300 dark:hover:border-slate-500"
      >
        <span className={value ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}>
          {value ? fmtDisplay(value) : placeholder}
        </span>
        <span className="text-slate-400 text-xs ml-2">📅</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden w-72">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#C9A84C]/10 border-b border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm transition-colors"
            >
              ‹
            </button>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {MONTHS[displayM]} {displayY}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm transition-colors"
            >
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-2 pb-0.5">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase pb-1">{d}</div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
            {cells.map((d, i) => {
              if (!d) return <div key={`e-${i}`} />
              const disabled  = d < min
              const isSelected = value === toYMD(d)
              const isToday   = toYMD(d) === toYMD(today())
              return (
                <button
                  key={toYMD(d)}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(d)}
                  className={`relative aspect-square w-full flex items-center justify-center text-sm rounded-full transition-colors font-medium
                    ${isSelected
                      ? 'bg-[#C9A84C] text-slate-900 shadow-sm'
                      : isToday && !disabled
                      ? 'border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/10'
                      : disabled
                      ? 'text-slate-200 dark:text-slate-700 cursor-not-allowed'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-[#C9A84C]/15 hover:text-[#9A7A2E] dark:hover:text-[#C9A84C]'
                    }`}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>

          {/* Footer actions */}
          {value && (
            <div className="px-3 pb-3 -mt-1 flex justify-end">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false) }}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Clear date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
