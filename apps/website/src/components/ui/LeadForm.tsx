'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { submitLead } from '@/lib/api'
import { BUDGET_RANGES, type BudgetRange } from '@/types'

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
}

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  whatsapp: '',
  budget: '',
  message: '',
}

export function LeadForm({
  propertyId,
  variant = 'default',
  title = 'Get in Touch',
  subtitle = 'Our investment advisors will reach out within 24 hours.',
}: LeadFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

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
          onClick={() => setStatus('idle')}
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
        <div className={variant === 'default' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
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

        <div className={variant === 'default' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : ''}>
          <input
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={set('phone')}
            className={inputCls}
          />
          <input
            type="tel"
            placeholder="WhatsApp Number"
            value={form.whatsapp}
            onChange={set('whatsapp')}
            className={inputCls}
          />
        </div>

        <select value={form.budget} onChange={set('budget')} className={`${inputCls} appearance-none cursor-pointer`}>
          <option value="">Budget Range</option>
          {(Object.keys(BUDGET_RANGES) as BudgetRange[]).map((key) => (
            <option key={key} value={key} className="bg-brand text-white">
              {BUDGET_RANGES[key].label}
            </option>
          ))}
        </select>

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
