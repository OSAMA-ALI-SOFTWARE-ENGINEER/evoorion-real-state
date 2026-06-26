'use client'

import { useState } from 'react'
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react'
import { subscribeNewsletter } from '@/lib/api'

export function NewsletterSignup() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')
    try {
      await subscribeNewsletter(email.trim())
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-gold text-sm">
        <CheckCircle2 size={16} />
        <span>You&apos;re subscribed! Stay tuned for market insights.</span>
      </div>
    )
  }

  return (
    <div>
      <p className="text-white/60 text-xs tracking-wider uppercase mb-3 flex items-center gap-1.5">
        <Mail size={12} />
        Market Insights
      </p>
      <p className="text-white/70 text-sm mb-4">
        Get Dubai market reports and exclusive listings delivered to your inbox.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder="Your email address"
          required
          className="flex-1 min-w-0 px-4 py-2.5 bg-white/5 border border-white/10 focus:border-gold text-white text-sm placeholder-white/30 outline-none rounded-sm transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          aria-label="Subscribe to newsletter"
          className="shrink-0 px-4 py-2.5 bg-gold text-brand font-semibold text-sm rounded-sm hover:bg-gold-light disabled:opacity-60 transition-colors flex items-center"
        >
          <ArrowRight size={16} />
        </button>
      </form>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}
