'use client'

import { useCallback, useRef, useState } from 'react'
import { uploadMedia } from '@/lib/api'
import type { Area, AreaMediaItem, PriceRange } from '@/types'
import { ImageCropper } from './ImageCropper'
import { RichTextEditor } from './RichTextEditor'
import Link from 'next/link'
import {
  IconMap, IconPlus, IconTrash, IconPhoto, IconVideo, IconFile,
  IconGripVertical, IconChevronRight, IconLoader,
} from './icons'

// ── Style tokens ──────────────────────────────────────────────────────────────

const inp   = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'
const sect  = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-6 mb-3 border-b border-slate-100 dark:border-slate-700 pb-1'
const card  = 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5'
const label = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5'

function slugPreview(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function fmtPrice(v: number) {
  return v >= 1_000_000
    ? `${(v / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`
    : v >= 1_000
      ? `${(v / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })}K`
      : String(v)
}

// ── Price Ranges ──────────────────────────────────────────────────────────────

function PriceRangeEditor({ value, onChange }: { value: PriceRange[]; onChange: (v: PriceRange[]) => void }) {
  function update(i: number, field: keyof PriceRange, raw: string) {
    const next = value.map((r, j) => j !== i ? r : {
      ...r,
      [field]: field === 'type' ? raw : (raw === '' ? 0 : Number(raw)),
    })
    onChange(next)
  }
  function add() { onChange([...value, { type: '', min: 0, max: 0 }]) }
  function remove(i: number) { onChange(value.filter((_, j) => j !== i)) }

  return (
    <div className="space-y-2">
      {value.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type (e.g. Studio)"
            value={r.type}
            onChange={e => update(i, 'type', e.target.value)}
            className={inp + ' flex-[2]'}
          />
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={r.min === 0 ? '' : r.min}
            onChange={e => update(i, 'min', e.target.value)}
            className={inp + ' flex-1'}
          />
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={r.max === 0 ? '' : r.max}
            onChange={e => update(i, 'max', e.target.value)}
            className={inp + ' flex-1'}
          />
          {r.min > 0 && r.max > 0 && (
            <span className="text-[10px] text-slate-400 whitespace-nowrap w-20 shrink-0 text-right">
              {fmtPrice(r.min)}–{fmtPrice(r.max)}
            </span>
          )}
          <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0">
            <IconTrash size={13} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#C9A84C] hover:text-[#D4B668] py-1">
        <IconPlus size={12} /> Add range
      </button>
    </div>
  )
}

// ── Gallery Item ──────────────────────────────────────────────────────────────

function GalleryItemView({
  item, index, total, isPrimary,
  onSetPrimary, onRemove, onCaptionChange,
  onDragStart, onDragOver, onDrop,
}: {
  item: AreaMediaItem
  index: number
  total: number
  isPrimary: boolean
  onSetPrimary: () => void
  onRemove: () => void
  onCaptionChange: (c: string) => void
  onDragStart: (i: number) => void
  onDragOver: (e: React.DragEvent, i: number) => void
  onDrop: (e: React.DragEvent, i: number) => void
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={e => { e.preventDefault(); onDragOver(e, index) }}
      onDrop={e => onDrop(e, index)}
      className="flex items-start gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800/60 group"
    >
      {/* drag handle */}
      <div className="text-slate-300 dark:text-slate-600 mt-0.5 cursor-grab active:cursor-grabbing shrink-0">
        <IconGripVertical size={14} />
      </div>

      {/* thumbnail */}
      <div className="w-14 h-14 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 flex items-center justify-center">
        {item.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.caption ?? ''} className="w-full h-full object-cover" />
        ) : item.type === 'video' ? (
          <IconVideo size={22} className="text-slate-400" />
        ) : (
          <IconFile size={22} className="text-slate-400" />
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={item.caption ?? ''}
          onChange={e => onCaptionChange(e.target.value)}
          placeholder="Caption (optional)"
          className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#C9A84C] mb-1"
        />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 uppercase">{item.type}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[10px] text-slate-400">#{index + 1} of {total}</span>
          {item.type === 'image' && (
            <button type="button" onClick={onSetPrimary}
              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${isPrimary ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'text-slate-400 hover:text-[#C9A84C]'}`}>
              {isPrimary ? 'Primary' : 'Set primary'}
            </button>
          )}
        </div>
      </div>

      {/* remove */}
      <button type="button" onClick={onRemove}
        className="p-1 rounded-md text-slate-300 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <IconTrash size={13} />
      </button>
    </div>
  )
}

// ── Main Form ─────────────────────────────────────────────────────────────────

export interface AreaFormProps {
  initial?: Partial<Area>
  onSave: (data: Partial<Area>) => Promise<void>
  saveLabel?: string
  mode?: 'new' | 'edit'
}

export function AreaForm({ initial = {}, onSave, saveLabel = 'Save', mode = 'new' }: AreaFormProps) {
  // Basic
  const [name,            setName]            = useState(initial.name ?? '')
  const [description,     setDescription]     = useState(initial.description ?? '')
  // Location
  const [latitude,        setLatitude]        = useState(initial.latitude?.toString() ?? '')
  const [longitude,       setLongitude]       = useState(initial.longitude?.toString() ?? '')
  const [mapTab,          setMapTab]          = useState<'coords' | 'preview'>('coords')
  // Investment
  const [longTermRoi,     setLongTermRoi]     = useState(initial.long_term_roi?.toString() ?? '')
  const [shortTermRoi,    setShortTermRoi]    = useState(initial.short_term_roi?.toString() ?? '')
  const [appreciation,    setAppreciation]    = useState(initial.appreciation?.toString() ?? '')
  const [offPlanDiscount, setOffPlanDiscount] = useState(initial.off_plan_discount?.toString() ?? '')
  // Price ranges
  const [priceRanges,     setPriceRanges]     = useState<PriceRange[]>(initial.price_ranges ?? [])
  // SEO
  const [metaTitle,       setMetaTitle]       = useState(initial.meta_title ?? '')
  const [metaDesc,        setMetaDesc]        = useState(initial.meta_description ?? '')
  // Hero image
  const [heroUrl,         setHeroUrl]         = useState(initial.hero_image_url ?? '')
  const [cropSrc,         setCropSrc]         = useState<string | null>(null)
  const [heroUploading,   setHeroUploading]   = useState(false)
  const heroInputRef = useRef<HTMLInputElement>(null)
  const cropBlobRef  = useRef<Blob | null>(null)
  // Gallery
  const [gallery,         setGallery]         = useState<AreaMediaItem[]>(
    () => (initial.gallery ?? []).map((item, i) => ({ ...item, order: item.order ?? i }))
  )
  const [galleryUploading, setGalleryUploading] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const draggedIdx = useRef<number | null>(null)
  // Form
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  const slug = slugPreview(name)
  const hasCoords = latitude && longitude
  const primaryIdx = gallery.findIndex(g => g.is_primary)

  // ── Hero upload ──────────────────────────────────────────────────────────

  function onHeroFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    e.target.value = ''
  }

  function onCropCancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    cropBlobRef.current = null
  }

  async function onCropConfirm(blob: Blob) {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setHeroUploading(true)
    try {
      const file = new File([blob], 'hero.png', { type: 'image/png' })
      const res  = await uploadMedia(file, 'areas')
      setHeroUrl(res.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hero upload failed')
    } finally { setHeroUploading(false) }
  }

  // ── Gallery upload ───────────────────────────────────────────────────────

  async function onGalleryFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    setGalleryUploading(true)
    try {
      const items: AreaMediaItem[] = []
      for (const file of files) {
        const res  = await uploadMedia(file, 'areas')
        const type: AreaMediaItem['type'] = file.type.startsWith('image/')
          ? 'image' : file.type.startsWith('video/')
            ? 'video' : 'file'
        items.push({ url: res.url, type, order: gallery.length + items.length, file_name: file.name })
      }
      setGallery(prev => [...prev, ...items])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gallery upload failed')
    } finally { setGalleryUploading(false) }
  }

  // ── Drag & drop ──────────────────────────────────────────────────────────

  function onDragStart(i: number) { draggedIdx.current = i }

  function onDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (draggedIdx.current === null || draggedIdx.current === i) return
    const next = [...gallery]
    const [moved] = next.splice(draggedIdx.current, 1)
    next.splice(i, 0, moved)
    draggedIdx.current = i
    setGallery(next.map((item, j) => ({ ...item, order: j })))
  }

  function onDrop(e: React.DragEvent, _i: number) {
    e.preventDefault()
    draggedIdx.current = null
  }

  function setCaption(i: number, caption: string) {
    setGallery(prev => prev.map((item, j) => j === i ? { ...item, caption } : item))
  }

  function setPrimary(i: number) {
    setGallery(prev => prev.map((item, j) => ({ ...item, is_primary: j === i })))
  }

  function removeGalleryItem(i: number) {
    setGallery(prev => {
      const next = prev.filter((_, j) => j !== i).map((item, j) => ({ ...item, order: j }))
      if (i === primaryIdx && next.some(g => g.type === 'image')) {
        const firstImg = next.findIndex(g => g.type === 'image')
        if (firstImg >= 0) next[firstImg] = { ...next[firstImg], is_primary: true }
      }
      return next
    })
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        hero_image_url: heroUrl.trim() || undefined,
        gallery: gallery.length > 0 ? gallery : undefined,
        latitude:  latitude  ? parseFloat(latitude)  : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        long_term_roi:     longTermRoi     ? parseFloat(longTermRoi)     : undefined,
        short_term_roi:    shortTermRoi    ? parseFloat(shortTermRoi)    : undefined,
        appreciation:      appreciation    ? parseFloat(appreciation)    : undefined,
        off_plan_discount: offPlanDiscount ? parseFloat(offPlanDiscount) : undefined,
        price_ranges: priceRanges.length > 0 ? priceRanges : undefined,
        meta_title:       metaTitle.trim() || undefined,
        meta_description: metaDesc.trim()  || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {cropSrc && (
        <ImageCropper src={cropSrc} aspect={16 / 9} onConfirm={onCropConfirm} onCancel={onCropCancel} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          {/* ── Left: main content ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Basic */}
            <div className={card}>
              <p className={sect + ' mt-0'}>Basic Information</p>
              <div className="space-y-4">
                <div>
                  <label className={label}>Name <span className="text-red-400">*</span></label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Downtown Dubai" className={inp} />
                </div>
                {/* Slug — read only */}
                {name && (
                  <div>
                    <label className={label + ' text-slate-400'}>
                      Slug <span className="font-normal text-xs text-slate-400">(auto-generated)</span>
                    </label>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{slug}</span>
                    </div>
                  </div>
                )}
                <div>
                  <label className={label}>Description</label>
                  <RichTextEditor value={description} onChange={setDescription} placeholder="Describe this area…" />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className={card}>
              <p className={sect + ' mt-0'}>Location</p>
              <div className="flex gap-2 mb-3">
                <button type="button" onClick={() => setMapTab('coords')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${mapTab === 'coords' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  Coordinates
                </button>
                <button type="button" onClick={() => setMapTab('preview')} disabled={!hasCoords}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${mapTab === 'preview' ? 'bg-[#C9A84C]/10 text-[#C9A84C]' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                  Map Preview
                </button>
              </div>
              {mapTab === 'coords' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Latitude</label>
                    <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)}
                      placeholder="25.2048" className={inp} />
                  </div>
                  <div>
                    <label className={label}>Longitude</label>
                    <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)}
                      placeholder="55.2708" className={inp} />
                  </div>
                </div>
              ) : hasCoords ? (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 h-56">
                  <iframe
                    title="Area location preview"
                    className="w-full h-full border-0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(longitude) - 0.05},${parseFloat(latitude) - 0.05},${parseFloat(longitude) + 0.05},${parseFloat(latitude) + 0.05}&layer=mapnik&marker=${latitude},${longitude}`}
                  />
                </div>
              ) : (
                <div className="h-24 rounded-lg border border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center gap-2 text-slate-400">
                  <IconMap size={18} />
                  <span className="text-sm">Enter coordinates first</span>
                </div>
              )}
            </div>

            {/* Investment Metrics */}
            <div className={card}>
              <p className={sect + ' mt-0'}>Investment Metrics <span className="normal-case font-normal tracking-normal text-slate-400">(%)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Long-term ROI</label>
                  <input type="number" step="0.1" min="0" value={longTermRoi} onChange={e => setLongTermRoi(e.target.value)} placeholder="8.5" className={inp} />
                </div>
                <div>
                  <label className={label}>Short-term ROI</label>
                  <input type="number" step="0.1" min="0" value={shortTermRoi} onChange={e => setShortTermRoi(e.target.value)} placeholder="6.0" className={inp} />
                </div>
                <div>
                  <label className={label}>Appreciation</label>
                  <input type="number" step="0.1" min="0" value={appreciation} onChange={e => setAppreciation(e.target.value)} placeholder="12.0" className={inp} />
                </div>
                <div>
                  <label className={label}>Off-plan Discount</label>
                  <input type="number" step="0.1" min="0" value={offPlanDiscount} onChange={e => setOffPlanDiscount(e.target.value)} placeholder="15.0" className={inp} />
                </div>
              </div>
            </div>

            {/* Price Ranges */}
            <div className={card}>
              <p className={sect + ' mt-0'}>Price Ranges</p>
              <PriceRangeEditor value={priceRanges} onChange={setPriceRanges} />
            </div>

            {/* SEO */}
            <div className={card}>
              <p className={sect + ' mt-0'}>SEO</p>
              <div className="space-y-4">
                <div>
                  <label className={label}>Meta Title <span className="font-normal text-slate-400 text-xs">({metaTitle.length}/60)</span></label>
                  <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} maxLength={60} className={inp} />
                </div>
                <div>
                  <label className={label}>Meta Description <span className="font-normal text-slate-400 text-xs">({metaDesc.length}/160)</span></label>
                  <textarea rows={2} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} maxLength={160} className={inp + ' resize-none'} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: sidebar ────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Hero image */}
            <div className={card}>
              <p className={sect + ' mt-0'}>Hero Image</p>
              {heroUrl ? (
                <div className="relative rounded-lg overflow-hidden aspect-video mb-3 bg-slate-100 dark:bg-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroUrl} alt="Hero" className="w-full h-full object-cover" />
                  <button type="button"
                    onClick={() => setHeroUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors">
                    <IconTrash size={13} />
                  </button>
                </div>
              ) : (
                <div
                  className="aspect-video rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-400 mb-3 cursor-pointer hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors"
                  onClick={() => heroInputRef.current?.click()}
                >
                  <IconPhoto size={28} />
                  <span className="text-xs font-medium">Click to upload</span>
                </div>
              )}
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onHeroFilePick}
              />
              {heroUploading ? (
                <div className="flex items-center justify-center gap-2 py-2 text-slate-400 text-xs">
                  <IconLoader size={14} className="animate-spin" /> Uploading…
                </div>
              ) : (
                <button type="button" onClick={() => heroInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <IconPhoto size={13} /> {heroUrl ? 'Replace' : 'Upload'} image
                </button>
              )}
            </div>

            {/* Gallery */}
            <div className={card}>
              <p className={sect + ' mt-0'}>Gallery</p>
              {gallery.length > 0 && (
                <div className="space-y-2 mb-3">
                  {gallery.map((item, i) => (
                    <GalleryItemView
                      key={`${item.url}-${i}`}
                      item={item}
                      index={i}
                      total={gallery.length}
                      isPrimary={i === primaryIdx || (primaryIdx < 0 && i === 0 && item.type === 'image')}
                      onSetPrimary={() => setPrimary(i)}
                      onRemove={() => removeGalleryItem(i)}
                      onCaptionChange={c => setCaption(i, c)}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                    />
                  ))}
                </div>
              )}
              <input
                ref={galleryInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                className="hidden"
                onChange={onGalleryFilePick}
              />
              {galleryUploading ? (
                <div className="flex items-center justify-center gap-2 py-2 text-slate-400 text-xs">
                  <IconLoader size={14} className="animate-spin" /> Uploading…
                </div>
              ) : (
                <button type="button" onClick={() => galleryInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-xs font-medium hover:border-[#C9A84C] hover:text-[#C9A84C] transition-colors">
                  <IconPlus size={13} /> Add images / videos / files
                </button>
              )}
              {gallery.length > 1 && (
                <p className="text-[10px] text-slate-400 mt-2 text-center">Drag to reorder</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link href="/areas" className="flex-1 flex items-center justify-center py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </Link>
              <button type="submit" disabled={saving || heroUploading || galleryUploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50 transition-colors">
                {saving && <IconLoader size={13} className="animate-spin" />}
                {saving ? 'Saving…' : saveLabel}
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
