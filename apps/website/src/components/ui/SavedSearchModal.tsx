'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, CheckCircle2, Trash2, ChevronRight } from 'lucide-react'
import { createSavedSearch, deleteSavedSearch, type SavedSearch } from '@/lib/api'

interface SavedSearchModalProps {
  onClose: () => void
  /** Current active filters to save */
  currentFilters: Record<string, unknown>
  /** Summary of active filters for display */
  filterSummary: string
  /** Already saved searches for this user */
  savedSearches: SavedSearch[]
  onSaved: (search: SavedSearch) => void
  onDeleted: (id: number) => void
}

export function SavedSearchModal({
  onClose,
  currentFilters,
  filterSummary,
  savedSearches,
  onSaved,
  onDeleted,
}: SavedSearchModalProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleSave() {
    if (!name.trim()) { setError('Please enter a name for this search'); return }
    setSaving(true); setError('')
    try {
      const res = await createSavedSearch(name.trim(), currentFilters)
      onSaved(res.data)
      setSaved(true)
      setTimeout(onClose, 1500)
    } catch {
      setError('Failed to save search. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await deleteSavedSearch(id)
      onDeleted(id)
    } catch {
      // silently ignore
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-overlay backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2 }}
          className="relative bg-brand-section border border-gold-border rounded-sm shadow-2xl w-full max-w-md"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-gold" />
              <h2 className="text-white font-semibold text-sm tracking-wide">Save This Search</h2>
            </div>
            <button type="button" onClick={onClose} className="text-muted hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="p-6">
            {saved ? (
              <div className="text-center py-6">
                <CheckCircle2 size={40} className="text-gold mx-auto mb-3" />
                <p className="text-white font-semibold">Search saved!</p>
                <p className="text-muted text-sm mt-1">We&apos;ll notify you when new matches appear.</p>
              </div>
            ) : (
              <>
                {/* Current filters summary */}
                {filterSummary && (
                  <div className="mb-4 px-3 py-2 bg-white/5 rounded-sm border border-white/5">
                    <p className="text-muted text-xs tracking-wider uppercase mb-1">Current filters</p>
                    <p className="text-white text-sm">{filterSummary}</p>
                  </div>
                )}

                <label className="block text-white/60 text-xs tracking-wider uppercase mb-2">
                  Name this search
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="e.g. 3-bed villa in Palm Jumeirah"
                  maxLength={100}
                  autoFocus
                  className="w-full px-4 py-3 bg-brand border border-white/10 focus:border-gold text-white text-sm placeholder-muted outline-none rounded-sm transition-colors mb-2"
                />
                {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-gold text-brand font-semibold text-sm tracking-widest uppercase rounded-sm hover:bg-gold-light disabled:opacity-60 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save & Get Alerts'}
                </button>
              </>
            )}

            {/* Existing saved searches */}
            {savedSearches.length > 0 && !saved && (
              <div className="mt-6">
                <p className="text-white/40 text-xs tracking-wider uppercase mb-3">
                  Your Saved Searches ({savedSearches.length}/10)
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {savedSearches.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-white/5 rounded-sm group"
                    >
                      <a
                        href={`/properties?${new URLSearchParams(
                          Object.fromEntries(
                            Object.entries(s.filters).filter(([, v]) => v != null && v !== '').map(([k, v]) => [k, String(v)])
                          )
                        ).toString()}`}
                        className="flex items-center gap-2 flex-1 min-w-0 text-muted hover:text-white transition-colors"
                      >
                        <ChevronRight size={12} className="shrink-0" />
                        <span className="text-sm truncate">{s.name}</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                        aria-label="Delete saved search"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
