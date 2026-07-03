'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { submitLead } from '@/lib/api'
import { BUDGET_RANGES, type BudgetRange } from '@/types'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { useAuth } from '@/context/AuthContext'
import { useLocale } from 'next-intl'

interface LeadFormProps {
  propertyId?: number
  variant?: 'default' | 'compact'
  title?: string
  subtitle?: string
}

interface FormState {
  name: string
  email: string
  phone: string
  whatsapp: string
  budget: BudgetRange | ''
  message: string
  company_website: string
}

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  budget: '',
  message: '',
  company_website: '',
}

// ── Custom budget dropdown ─────────────────────────────────────────────────────

function BudgetSelect({
  value,
  onChange,
}: {
  value: BudgetRange | ''
  onChange: (v: BudgetRange | '') => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const base =
    'w-full bg-white/5 border border-white/10 text-sm px-4 py-3 outline-none transition-colors duration-200 rounded-sm'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`${base} flex items-center justify-between hover:bg-white/10 focus:border-gold`}
      >
        <span className={value ? 'text-white' : 'text-white/40'}>
          {value ? BUDGET_RANGES[value].label : 'Budget Range'}
        </span>
        <svg
          className={`w-4 h-4 text-white/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 16 16"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-brand border border-white/10 rounded-sm shadow-2xl overflow-hidden">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full px-4 py-2.5 text-left text-xs text-white/30 hover:bg-white/5 transition-colors border-b border-white/5"
            >
              Clear selection
            </button>
          )}
          {(Object.keys(BUDGET_RANGES) as BudgetRange[]).map(key => (
            <button
              key={key}
              type="button"
              onClick={() => { onChange(key); setOpen(false) }}
              className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors ${value === key ? 'text-gold' : 'text-white/80'}`}
            >
              {BUDGET_RANGES[key].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

const LOCALE_PHONE: Record<string, string> = {
  ar: '+966',
  de: '+49',
  'en-gb': '+44',
}

export function LeadForm({
  propertyId,
  variant = 'default',
  title = 'Get in Touch',
  subtitle = 'Our investment advisors will reach out within 24 hours.',
}: LeadFormProps) {
  const { user } = useAuth()
  const locale = useLocale()
  const defaultPhoneCode = LOCALE_PHONE[locale] ?? '+971'
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Pre-fill name & email from logged-in user, only if the fields are still empty
  useEffect(() => {
    if (!user) return
    setForm(prev => ({
      ...prev,
      name:  prev.name  || user.name  || '',
      email: prev.email || user.email || '',
    }))
  }, [user])

  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMessage('')

    const budgetRange = form.budget ? BUDGET_RANGES[form.budget] : null

    try {
      await submitLead({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        property_id: propertyId,
        budget_min: budgetRange?.min,
        budget_max: budgetRange?.max,
        message: form.message || undefined,
        source: 'website',
        company_website: form.company_website || undefined,
      })
      setStatus('success')
      setForm(INITIAL)
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong. Please try again or contact us directly.')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <CheckCircle2 size={48} className="text-gold" />
        <h3 className="font-serif text-xl text-white">Thank You</h3>
        <p className="text-muted text-sm max-w-xs">
          Your inquiry has been received. One of our investment advisors will be in touch shortly.
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus('idle')
            setForm({
              ...INITIAL,
              name:  user?.name  ?? '',
              email: user?.email ?? '',
            })
          }}
          className="text-gold text-sm underline underline-offset-4 mt-2"
        >
          Send another message
        </button>
      </div>
    )
  }

  const inputCls =
    'w-full bg-white/5 border border-white/10 focus:border-gold text-white placeholder-muted text-sm px-4 py-3 outline-none transition-colors duration-200 rounded-sm'

  return (
    <div>
      {variant === 'default' && (
        <div className="mb-6">
          <h3 className="font-serif text-2xl text-white mb-1">{title}</h3>
          <p className="text-muted text-sm">{subtitle}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot — invisible to humans, bots auto-fill it */}
        <input
          type="text"
          name="company_website"
          value={form.company_website}
          onChange={e => setForm(prev => ({ ...prev, company_website: e.target.value }))}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Full Name *"
            required
            value={form.name}
            onChange={set('name')}
            className={inputCls}
          />
          <input
            type="email"
            placeholder="Email Address *"
            required
            value={form.email}
            onChange={set('email')}
            className={inputCls}
          />
        </div>

        <PhoneInput
          value={form.phone}
          onChange={v => setForm(prev => ({ ...prev, phone: v }))}
          placeholder="Phone number"
          defaultCountryCode={defaultPhoneCode}
        />
        <PhoneInput
          value={form.whatsapp}
          onChange={v => setForm(prev => ({ ...prev, whatsapp: v }))}
          placeholder="WhatsApp number"
          defaultCountryCode={defaultPhoneCode}
        />

        <BudgetSelect
          value={form.budget}
          onChange={v => setForm(prev => ({ ...prev, budget: v }))}
        />

        <textarea
          placeholder="Your Message or Enquiry"
          rows={variant === 'compact' ? 3 : 4}
          value={form.message}
          onChange={set('message')}
          className={`${inputCls} resize-none`}
        />

        {status === 'error' && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light disabled:opacity-60 transition-colors duration-300"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending…
            </>
          ) : (
            'Send Enquiry'
          )}
        </button>
      </form>
    </div>
  )
}
