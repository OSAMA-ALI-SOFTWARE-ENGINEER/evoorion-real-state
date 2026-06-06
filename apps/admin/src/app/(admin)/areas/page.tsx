'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { getAreas, createArea, updateArea, deleteArea } from '@/lib/api'
import type { Area, PriceRange } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function pct(v: number | null | undefined) {
  return v != null ? `${v}%` : '—'
}

// ── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  area?: Area | null
  onSave: (data: Partial<Area>) => Promise<void>
  onClose: () => void
}

function AreaModal({ area, onSave, onClose }: ModalProps) {
  const [name,           setName]           = useState(area?.name ?? '')
  const [slug,           setSlug]           = useState(area?.slug ?? '')
  const [description,    setDescription]    = useState(area?.description ?? '')
  const [heroImageUrl,   setHeroImageUrl]   = useState(area?.hero_image_url ?? '')
  const [latitude,       setLatitude]       = useState(area?.latitude?.toString() ?? '')
  const [longitude,      setLongitude]      = useState(area?.longitude?.toString() ?? '')
  const [longTermRoi,    setLongTermRoi]    = useState(area?.long_term_roi?.toString() ?? '')
  const [shortTermRoi,   setShortTermRoi]   = useState(area?.short_term_roi?.toString() ?? '')
  const [appreciation,   setAppreciation]   = useState(area?.appreciation?.toString() ?? '')
  const [offPlanDiscount,setOffPlanDiscount]= useState(area?.off_plan_discount?.toString() ?? '')
  const [priceRangesRaw, setPriceRangesRaw] = useState(
    area?.price_ranges ? JSON.stringify(area.price_ranges, null, 2) : ''
  )
  const [metaTitle,      setMetaTitle]      = useState(area?.meta_title ?? '')
  const [metaDesc,       setMetaDesc]       = useState(area?.meta_description ?? '')
  const [autoSlug,       setAutoSlug]       = useState(!area)
  const [error,          setError]          = useState('')
  const [saving,         setSaving]         = useState(false)

  function handleName(v: string) {
    setName(v)
    if (autoSlug) setSlug(slugify(v))
  }

  function parseNum(s: string): number | undefined {
    const n = parseFloat(s)
    return isNaN(n) ? undefined : n
  }

  function parsePriceRanges(): PriceRange[] | undefined {
    if (!priceRangesRaw.trim()) return undefined
    try {
      return JSON.parse(priceRangesRaw) as PriceRange[]
    } catch {
      return null as unknown as PriceRange[]
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    const ranges = parsePriceRanges()
    if (ranges === null) { setError('Price ranges: invalid JSON'); return }
    setSaving(true)
    try {
      const data: Partial<Area> = {
        name: name.trim(),
        slug: slug.trim(),
        description:     description.trim() || undefined,
        hero_image_url:  heroImageUrl.trim() || undefined,
        latitude:        parseNum(latitude),
        longitude:       parseNum(longitude),
        long_term_roi:   parseNum(longTermRoi),
        short_term_roi:  parseNum(shortTermRoi),
        appreciation:    parseNum(appreciation),
        off_plan_discount: parseNum(offPlanDiscount),
        price_ranges:    ranges,
        meta_title:      metaTitle.trim() || undefined,
        meta_description: metaDesc.trim() || undefined,
      }
      await onSave(data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  const inp  = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white'
  const sect = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-5 mb-3 border-b border-slate-100 pb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-2 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{area ? 'Edit Area' : 'New Area'}</h3>
        </div>

        <form onSubmit={submit} className="overflow-y-auto px-6 py-4 space-y-0 flex-1">
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          {/* ── Basic ───────────────────────────────────────────────── */}
          <p className={sect}>Basic</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="area-name" className="block text-sm font-medium text-slate-700 mb-1.5">Name <span className="text-red-400">*</span></label>
              <input id="area-name" type="text" required value={name} onChange={e => handleName(e.target.value)} className={inp} />
            </div>
            <div>
              <label htmlFor="area-slug" className="block text-sm font-medium text-slate-700 mb-1.5">Slug <span className="text-red-400">*</span></label>
              <input id="area-slug" type="text" required value={slug} onChange={e => { setAutoSlug(false); setSlug(e.target.value) }} className={inp + ' font-mono'} />
            </div>
            <div>
              <label htmlFor="area-desc" className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
              <textarea id="area-desc" rows={2} value={description} onChange={e => setDescription(e.target.value)} className={inp + ' resize-none'} />
            </div>
          </div>

          {/* ── Media ───────────────────────────────────────────────── */}
          <p className={sect}>Media</p>
          <div>
            <label htmlFor="area-hero" className="block text-sm font-medium text-slate-700 mb-1.5">Hero Image URL</label>
            <input id="area-hero" type="url" value={heroImageUrl} onChange={e => setHeroImageUrl(e.target.value)} placeholder="https://…" className={inp} />
          </div>

          {/* ── Location ────────────────────────────────────────────── */}
          <p className={sect}>Location</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="area-lat" className="block text-sm font-medium text-slate-700 mb-1.5">Latitude</label>
              <input id="area-lat" type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="25.204849" className={inp} />
            </div>
            <div>
              <label htmlFor="area-lng" className="block text-sm font-medium text-slate-700 mb-1.5">Longitude</label>
              <input id="area-lng" type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="55.270783" className={inp} />
            </div>
          </div>

          {/* ── Investment ──────────────────────────────────────────── */}
          <p className={sect}>Investment Metrics <span className="normal-case font-normal tracking-normal text-slate-400">(%)</span></p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="area-lt-roi" className="block text-sm font-medium text-slate-700 mb-1.5">Long-term ROI</label>
              <input id="area-lt-roi" type="number" step="0.1" min="0" value={longTermRoi} onChange={e => setLongTermRoi(e.target.value)} placeholder="8.5" className={inp} />
            </div>
            <div>
              <label htmlFor="area-st-roi" className="block text-sm font-medium text-slate-700 mb-1.5">Short-term ROI</label>
              <input id="area-st-roi" type="number" step="0.1" min="0" value={shortTermRoi} onChange={e => setShortTermRoi(e.target.value)} placeholder="6.0" className={inp} />
            </div>
            <div>
              <label htmlFor="area-apprec" className="block text-sm font-medium text-slate-700 mb-1.5">Appreciation</label>
              <input id="area-apprec" type="number" step="0.1" min="0" value={appreciation} onChange={e => setAppreciation(e.target.value)} placeholder="12.0" className={inp} />
            </div>
            <div>
              <label htmlFor="area-discount" className="block text-sm font-medium text-slate-700 mb-1.5">Off-plan Discount</label>
              <input id="area-discount" type="number" step="0.1" min="0" value={offPlanDiscount} onChange={e => setOffPlanDiscount(e.target.value)} placeholder="15.0" className={inp} />
            </div>
          </div>

          {/* ── Price Ranges ────────────────────────────────────────── */}
          <p className={sect}>Price Ranges <span className="normal-case font-normal tracking-normal text-slate-400">(JSON)</span></p>
          <div>
            <textarea
              rows={5}
              value={priceRangesRaw}
              onChange={e => setPriceRangesRaw(e.target.value)}
              spellCheck={false}
              placeholder={'[\n  {"type":"Studio","min":500000,"max":800000},\n  {"type":"1BR","min":900000,"max":1500000}\n]'}
              className={inp + ' font-mono text-xs resize-none'}
            />
            <p className="text-[11px] text-slate-400 mt-1">Array of objects with type, min, max. Leave blank to clear.</p>
          </div>

          {/* ── SEO ─────────────────────────────────────────────────── */}
          <p className={sect}>SEO</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="area-meta-title" className="block text-sm font-medium text-slate-700 mb-1.5">Meta Title</label>
              <input id="area-meta-title" type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={60} className={inp} />
            </div>
            <div>
              <label htmlFor="area-meta-desc" className="block text-sm font-medium text-slate-700 mb-1.5">Meta Description</label>
              <textarea id="area-meta-desc" rows={2} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} maxLength={160} className={inp + ' resize-none'} />
            </div>
          </div>

          <div className="h-4" />
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={e => submit(e as unknown as FormEvent)} disabled={saving} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AreasPage() {
  const [areas,    setAreas]    = useState<Area[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState<Area | null | undefined>(undefined)
  const [toDelete, setToDelete] = useState<Area | null>(null)
  const [acting,   setActing]   = useState(false)

  function load() {
    setLoading(true)
    getAreas().then(res => setAreas(res.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  async function handleSave(data: Partial<Area>) {
    if (editing && editing.id) {
      await updateArea(editing.id, data)
    } else {
      await createArea(data)
    }
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteArea(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Delete failed') }
    finally { setActing(false) }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm"
        >
          + New Area
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">LT ROI</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ST ROI</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Apprec.</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-20" /></td>
                  ))}
                </tr>
              ))
            ) : areas.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No areas yet.</td></tr>
            ) : areas.map(a => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-5 py-3.5 font-medium text-slate-800">
                  {a.name}
                  {a.hero_image_url && (
                    <span className="ml-1.5 inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" title="Has hero image" />
                  )}
                </td>
                <td className="px-4 py-3.5 text-slate-400 font-mono text-xs">{a.slug}</td>
                <td className="px-4 py-3.5 text-slate-600 text-xs">{pct(a.long_term_roi)}</td>
                <td className="px-4 py-3.5 text-slate-600 text-xs">{pct(a.short_term_roi)}</td>
                <td className="px-4 py-3.5 text-slate-600 text-xs">{pct(a.appreciation)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditing(a)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Edit</button>
                    <span className="text-slate-200">|</span>
                    <button type="button" onClick={() => setToDelete(a)} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing !== undefined && (
        <AreaModal area={editing} onSave={handleSave} onClose={() => setEditing(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete area"
          message={`Delete "${toDelete.name}"? Properties linked to it may be affected.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
