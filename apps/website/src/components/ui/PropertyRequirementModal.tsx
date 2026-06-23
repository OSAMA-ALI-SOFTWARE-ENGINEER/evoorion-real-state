'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, CheckCircle2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { PhoneInput } from '@/components/ui/PhoneInput'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

interface Area { id: number; name: string; slug: string }

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Townhouse', 'Duplex', 'Studio']
const BEDROOM_OPTIONS = ['Studio', '1', '2', '3', '4', '5+']
const BUDGET_PRESETS = [
  { label: 'Under AED 1M',     min: 0,         max: 1_000_000 },
  { label: 'AED 1M – 3M',     min: 1_000_000, max: 3_000_000 },
  { label: 'AED 3M – 7M',     min: 3_000_000, max: 7_000_000 },
  { label: 'AED 7M – 15M',    min: 7_000_000, max: 15_000_000 },
  { label: 'AED 15M – 30M',   min: 15_000_000, max: 30_000_000 },
  { label: 'AED 30M+',         min: 30_000_000, max: null },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function PropertyRequirementModal({ open, onClose }: Props) {
  const [areas, setAreas]             = useState<Area[]>([])
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [phone, setPhone]             = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [budgetPreset, setBudgetPreset]   = useState<number | null>(null)
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [bedrooms, setBedrooms]           = useState<string[]>([])
  const [notes, setNotes]             = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [error, setError]             = useState('')

  // Fetch areas once
  useEffect(() => {
    fetch(`${API_BASE}/areas`)
      .then((r) => r.json())
      .then((d) => setAreas(d.data ?? []))
      .catch(() => {})
  }, [])

  // Reset form when closed
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setName(''); setEmail(''); setPhone(''); setSelectedAreas([])
        setBudgetPreset(null); setPropertyTypes([]); setBedrooms([])
        setNotes(''); setSubmitted(false); setError('')
      }, 300)
    }
  }, [open])

  // Close on ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  function toggle<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setSubmitting(true)
    setError('')

    const preset = budgetPreset !== null ? BUDGET_PRESETS[budgetPreset] : null

    try {
      const res = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone || undefined,
          source: 'website',
          type: 'requirement',
          budget_min: preset?.min ?? undefined,
          budget_max: preset?.max ?? undefined,
          message: notes.trim() || undefined,
          requirement_data: {
            location_preferences: selectedAreas,
            property_types: propertyTypes,
            bedrooms,
          },
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] bg-overlay backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[71] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-brand-section border border-gold-border rounded-sm shadow-2xl">

              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-white/5">
                <div>
                  <p className="text-xs text-gold tracking-[0.15em] uppercase mb-1">Personalised Match</p>
                  <h2 className="text-xl font-serif text-white">Can&apos;t find what you&apos;re looking for?</h2>
                  <p className="text-muted text-sm mt-1">Tell us your requirements and we&apos;ll match you with suitable properties within 24 hours.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-muted hover:text-white transition-colors ml-4 shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {submitted ? (
                <div className="p-10 flex flex-col items-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-gold" />
                  </div>
                  <h3 className="text-white text-lg font-serif">We&apos;ll be in touch</h3>
                  <p className="text-muted text-sm max-w-sm">Our advisors have received your requirements and will match you with the most suitable properties within 24 hours.</p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-6 py-2.5 bg-gold hover:bg-gold-light text-brand text-sm font-semibold tracking-wider uppercase rounded-sm transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">

                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted tracking-wider uppercase mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ahmed Al-Rashid"
                        className="w-full bg-brand border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-muted/40 text-sm focus:outline-none focus:border-gold/40 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted tracking-wider uppercase mb-1.5">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ahmed@example.com"
                        className="w-full bg-brand border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-muted/40 text-sm focus:outline-none focus:border-gold/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs text-muted tracking-wider uppercase mb-1.5">Phone Number</label>
                    <PhoneInput value={phone} onChange={setPhone} placeholder="50 123 4567" />
                  </div>

                  {/* Location preferences */}
                  {areas.length > 0 && (
                    <div>
                      <label className="block text-xs text-muted tracking-wider uppercase mb-2">Preferred Locations</label>
                      <div className="flex flex-wrap gap-2">
                        {areas.map((area) => {
                          const active = selectedAreas.includes(area.slug)
                          return (
                            <button
                              key={area.slug}
                              type="button"
                              onClick={() => setSelectedAreas((prev) => toggle(prev, area.slug))}
                              className={`px-3 py-1.5 rounded-full text-xs tracking-wide border transition-all duration-150 ${
                                active
                                  ? 'bg-gold text-brand border-gold font-semibold'
                                  : 'border-white/10 text-muted hover:border-gold/30 hover:text-white'
                              }`}
                            >
                              {area.name}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Budget */}
                  <div>
                    <label className="block text-xs text-muted tracking-wider uppercase mb-2">Budget Range</label>
                    <div className="flex flex-wrap gap-2">
                      {BUDGET_PRESETS.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setBudgetPreset(budgetPreset === i ? null : i)}
                          className={`px-3 py-1.5 rounded-full text-xs tracking-wide border transition-all duration-150 ${
                            budgetPreset === i
                              ? 'bg-gold text-brand border-gold font-semibold'
                              : 'border-white/10 text-muted hover:border-gold/30 hover:text-white'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property type */}
                  <div>
                    <label className="block text-xs text-muted tracking-wider uppercase mb-2">Property Type</label>
                    <div className="flex flex-wrap gap-2">
                      {PROPERTY_TYPES.map((pt) => {
                        const active = propertyTypes.includes(pt)
                        return (
                          <button
                            key={pt}
                            type="button"
                            onClick={() => setPropertyTypes((prev) => toggle(prev, pt))}
                            className={`px-3 py-1.5 rounded-full text-xs tracking-wide border transition-all duration-150 ${
                              active
                                ? 'bg-gold text-brand border-gold font-semibold'
                                : 'border-white/10 text-muted hover:border-gold/30 hover:text-white'
                            }`}
                          >
                            {pt}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-xs text-muted tracking-wider uppercase mb-2">Bedrooms</label>
                    <div className="flex flex-wrap gap-2">
                      {BEDROOM_OPTIONS.map((b) => {
                        const active = bedrooms.includes(b)
                        return (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBedrooms((prev) => toggle(prev, b))}
                            className={`w-14 py-2 rounded-sm text-xs font-semibold tracking-wider border transition-all duration-150 ${
                              active
                                ? 'bg-gold text-brand border-gold'
                                : 'border-white/10 text-muted hover:border-gold/30 hover:text-white'
                            }`}
                          >
                            {b}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs text-muted tracking-wider uppercase mb-1.5">Additional Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific requirements — floor level, view, furnishing, etc."
                      className="w-full bg-brand border border-white/10 rounded-sm px-4 py-3 text-white placeholder:text-muted/40 text-sm focus:outline-none focus:border-gold/40 transition-colors resize-none"
                    />
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold hover:bg-gold-light text-brand font-semibold tracking-wider uppercase text-sm rounded-sm transition-colors disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    {submitting ? 'Sending…' : 'Send My Requirements'}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
