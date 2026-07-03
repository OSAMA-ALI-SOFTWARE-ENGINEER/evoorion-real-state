'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  getAreas, getDevelopers, getOperationTypes, createProperty, updateProperty,
  uploadPropertyImage, updatePropertyImage, deletePropertyImage, getRegions,
  getAgents, getPropertyAgents, assignPropertyAgent, unassignPropertyAgent,
  type Region,
} from '@/lib/api'
import type { Agent, Area, Developer, OperationType, Property, PropertyImage } from '@/types'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { CustomSelect } from '@/components/ui/CustomSelect'

interface FormState {
  title:             string
  description:       string
  type:              string
  status:            string
  price:             string
  currency:          string
  location:          string
  area_sqft:         string
  bedrooms:          string
  bathrooms:         string
  is_featured:       boolean
  is_active:         boolean
  roi_min:           string
  roi_max:           string
  area_id:           string
  developer_id:      string
  operation_type_id: string
  region_id:         string
  meta_title:        string
  meta_description:  string
  amenities:         string[]
}

function blank(): FormState {
  return {
    title: '', description: '', type: 'apartment', status: 'available',
    price: '', currency: 'AED', location: '', area_sqft: '',
    bedrooms: '', bathrooms: '', is_featured: false, is_active: true,
    roi_min: '', roi_max: '', area_id: '', developer_id: '',
    operation_type_id: '', region_id: '', meta_title: '', meta_description: '',
    amenities: [],
  }
}

function fromProperty(p: Property): FormState {
  return {
    title:             p.title ?? '',
    description:       p.description ?? '',
    type:              p.type ?? 'apartment',
    status:            p.status ?? 'available',
    price:             String(p.price ?? ''),
    currency:          p.currency ?? 'AED',
    location:          p.location ?? '',
    area_sqft:         p.area_sqft != null ? String(p.area_sqft) : '',
    bedrooms:          p.bedrooms != null ? String(p.bedrooms) : '',
    bathrooms:         p.bathrooms != null ? String(p.bathrooms) : '',
    is_featured:       p.is_featured ?? false,
    is_active:         p.is_active ?? true,
    roi_min:           p.roi_min != null ? String(p.roi_min) : '',
    roi_max:           p.roi_max != null ? String(p.roi_max) : '',
    area_id:           p.area_id != null ? String(p.area_id) : '',
    developer_id:      p.developer_id != null ? String(p.developer_id) : '',
    operation_type_id: p.operation_type_id != null ? String(p.operation_type_id) : '',
    region_id:         p.region_id != null ? String(p.region_id) : '',
    meta_title:        p.meta_title ?? '',
    meta_description:  p.meta_description ?? '',
    amenities:         p.amenities?.map(a => a.amenity) ?? [],
  }
}

function toPayload(f: FormState): Record<string, unknown> {
  return {
    title:             f.title,
    description:       f.description || undefined,
    type:              f.type,
    status:            f.status,
    price:             Number(f.price),
    currency:          f.currency,
    location:          f.location || undefined,
    area_sqft:         f.area_sqft ? Number(f.area_sqft) : undefined,
    bedrooms:          f.bedrooms ? Number(f.bedrooms) : undefined,
    bathrooms:         f.bathrooms ? Number(f.bathrooms) : undefined,
    is_featured:       f.is_featured,
    is_active:         f.is_active,
    roi_min:           f.roi_min ? Number(f.roi_min) : undefined,
    roi_max:           f.roi_max ? Number(f.roi_max) : undefined,
    area_id:           Number(f.area_id),
    developer_id:      Number(f.developer_id),
    operation_type_id: Number(f.operation_type_id),
    region_id:         f.region_id ? Number(f.region_id) : undefined,
    meta_title:        f.meta_title || undefined,
    meta_description:  f.meta_description || undefined,
    amenities:         f.amenities.length ? f.amenities : undefined,
  }
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors'
const selectCls = inputCls + ' appearance-none cursor-pointer'
const card = 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700'
const sectionHead = 'text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider'
const divider = 'border-slate-100 dark:border-slate-700'

// ── Field ─────────────────────────────────────────────────────────────────────

function Field({ label, children, required, htmlFor }: { label: string; children: React.ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

// ── LocationCombo — free-text input with area name suggestions ────────────────

function LocationCombo({ value, onChange, areas }: { value: string; onChange: (v: string) => void; areas: Area[] }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const suggestions = areas
    .filter(a => a.name.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 8)

  const showDrop = open && value.length > 0 && suggestions.length > 0

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="e.g. Dubai Marina, Palm Jumeirah…"
        className={inputCls}
        autoComplete="off"
      />
      {showDrop && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map(a => (
            <button
              key={a.id}
              type="button"
              onMouseDown={() => { onChange(a.name); setOpen(false) }}
              className="w-full px-3.5 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {a.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── AmenityInput ──────────────────────────────────────────────────────────────

function AmenityInput({ amenities, onChange }: { amenities: string[]; onChange: (a: string[]) => void }) {
  const [draft, setDraft] = useState('')

  function add() {
    const trimmed = draft.trim()
    if (!trimmed || amenities.includes(trimmed)) { setDraft(''); return }
    onChange([...amenities, trimmed])
    setDraft('')
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          aria-label="Add amenity"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="e.g. Private Pool"
          className={inputCls}
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shrink-0 transition-colors"
        >
          Add
        </button>
      </div>
      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {amenities.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-full">
              {a}
              <button
                type="button"
                onClick={() => onChange(amenities.filter((_, j) => j !== i))}
                className="text-slate-400 hover:text-red-500 leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ImageManager ──────────────────────────────────────────────────────────────

function ImageManager({ slug, initial }: { slug: string; initial: PropertyImage[] }) {
  const [images,    setImages]    = useState<PropertyImage[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setError('')
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const noPrimary = images.every(i => !i.is_primary)
        const res = await uploadPropertyImage(slug, file, noPrimary)
        setImages(prev => [...prev, res.data])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function setPrimary(img: PropertyImage) {
    setError('')
    try {
      await updatePropertyImage(slug, img.id, { is_primary: true })
      setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === img.id })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    }
  }

  async function remove(img: PropertyImage) {
    setError('')
    try {
      await deletePropertyImage(slug, img.id)
      setImages(prev => prev.filter(i => i.id !== img.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div className={`${card} p-6 space-y-4`}>
      <div className="flex items-center justify-between">
        <h2 className={sectionHead}>Images</h2>
        <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          uploading
            ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 pointer-events-none'
            : 'bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900'
        }`}>
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            '+ Upload Images'
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            onChange={e => handleFiles(e.target.files)}
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-lg p-10 text-center cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <p className="text-slate-400 text-sm">No images yet — click to upload</p>
          <p className="text-slate-300 dark:text-slate-500 text-xs mt-1">JPEG, PNG, WebP · max 10 MB each</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images
            .slice()
            .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.order - b.order)
            .map(img => (
              <div key={img.id} className={`relative rounded-lg overflow-hidden border-2 transition-colors ${img.is_primary ? 'border-[#C9A84C]' : 'border-transparent'}`}>
                <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700">
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-end justify-between p-1.5 opacity-0 hover:opacity-100">
                  <button
                    type="button"
                    title={img.is_primary ? 'Primary image' : 'Set as primary'}
                    onClick={() => !img.is_primary && setPrimary(img)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-colors ${
                      img.is_primary
                        ? 'bg-[#C9A84C] text-slate-900 cursor-default'
                        : 'bg-white/80 text-slate-500 hover:bg-[#C9A84C] hover:text-slate-900'
                    }`}
                  >
                    ★
                  </button>
                  <button
                    type="button"
                    title="Delete image"
                    onClick={() => remove(img)}
                    className="w-7 h-7 rounded-full bg-white/80 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                </div>
                {img.is_primary && (
                  <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-[#C9A84C] text-slate-900 px-1.5 py-0.5 rounded leading-none">
                    PRIMARY
                  </span>
                )}
              </div>
            ))}

          <div
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <span className="text-slate-300 dark:text-slate-500 text-2xl">+</span>
          </div>
        </div>
      )}
      <p className="text-[11px] text-slate-400">
        Hover an image to set it as primary (★) or delete (✕). Storage driver and credentials are configured in <strong>Settings → Storage & Media</strong>.
      </p>
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────

interface PropertyFormProps {
  property?: Property
}

export function PropertyForm({ property }: PropertyFormProps) {
  const router = useRouter()
  const isEdit  = !!property
  const formRef = useRef<HTMLFormElement>(null)

  const [form,    setForm]    = useState<FormState>(isEdit ? fromProperty(property!) : blank)
  const [areas,   setAreas]   = useState<Area[]>([])
  const [devs,    setDevs]    = useState<Developer[]>([])
  const [opTypes, setOpTypes] = useState<OperationType[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [brokers, setBrokers] = useState<Agent[]>([])
  const [agentId, setAgentId] = useState('')          // selected broker (one per property)
  const [initialAgentId, setInitialAgentId] = useState('')
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    Promise.all([
      getAreas(),
      getDevelopers(),
      getOperationTypes(),
      getRegions(),
      getAgents(),
    ]).then(([a, d, o, r, ag]) => {
      setAreas(a.data ?? [])
      setDevs(d.data ?? [])
      setOpTypes(o.data ?? [])
      setRegions(r.data ?? [])
      setBrokers((ag.data as Agent[]) ?? [])
    }).catch(() => { /* non-critical */ })

    if (isEdit) {
      getPropertyAgents(property!.slug)
        .then(res => {
          const current = res.data?.[0]
          if (current) { setAgentId(String(current.id)); setInitialAgentId(String(current.id)) }
        })
        .catch(() => { /* non-critical */ })
    }
  }, [isEdit, property])

  function set(key: keyof FormState, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      let slug = property?.slug
      if (isEdit) {
        await updateProperty(property!.slug, toPayload(form) as Partial<Property>)
      } else {
        const created = await createProperty(toPayload(form) as Partial<Property>)
        slug = created.data?.slug
      }
      // Sync single-broker assignment (one broker per property)
      if (slug && agentId !== initialAgentId) {
        if (initialAgentId) await unassignPropertyAgent(slug, Number(initialAgentId)).catch(() => {})
        if (agentId)        await assignPropertyAgent(slug, Number(agentId))
      }
      router.push('/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const areaOptions = [
    { value: '', label: 'Select area…' },
    ...areas.map(a => ({ value: String(a.id), label: a.name })),
  ]
  const devOptions = [
    { value: '', label: 'Select developer…' },
    ...devs.map(d => ({ value: String(d.id), label: d.name })),
  ]
  const opOptions = [
    { value: '', label: 'Select type…' },
    ...opTypes.map(o => ({ value: String(o.id), label: o.name })),
  ]

  const typeOptions = [
    { value: 'apartment',  label: 'Apartment' },
    { value: 'villa',      label: 'Villa' },
    { value: 'penthouse',  label: 'Penthouse' },
    { value: 'townhouse',  label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' },
  ]
  const statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'sold',      label: 'Sold' },
    { value: 'rented',    label: 'Rented' },
  ]
  const currencyOptions = [
    { value: 'AED', label: 'AED' },
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'SAR', label: 'SAR' },
  ]

  return (
    <div className="space-y-6">
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (main) ── */}
        <div className={`lg:col-span-2 space-y-5 ${card} p-6`}>
          <h2 className={sectionHead}>Property Details</h2>

          <Field label="Title" required>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={inputCls}
              placeholder="e.g. Luxury Villa in Palm Jumeirah"
            />
          </Field>

          <Field label="Description">
            <RichTextEditor
              value={form.description}
              onChange={v => set('description', v)}
              placeholder="Full property description…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type" required>
              <CustomSelect
                value={form.type}
                onChange={v => set('type', v)}
                options={typeOptions}
                placeholder="Select type…"
              />
            </Field>
            <Field label="Location">
              <LocationCombo
                value={form.location}
                onChange={v => set('location', v)}
                areas={areas}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms">
              <input type="number" min="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className={inputCls} placeholder="0" />
            </Field>
            <Field label="Bathrooms">
              <input type="number" min="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className={inputCls} placeholder="0" />
            </Field>
            <Field label="Area (sqft)">
              <input type="number" min="0" step="0.01" value={form.area_sqft} onChange={e => set('area_sqft', e.target.value)} className={inputCls} placeholder="0" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="ROI Min (%)">
              <input type="number" min="0" step="0.01" value={form.roi_min} onChange={e => set('roi_min', e.target.value)} className={inputCls} placeholder="e.g. 6" />
            </Field>
            <Field label="ROI Max (%)">
              <input type="number" min="0" step="0.01" value={form.roi_max} onChange={e => set('roi_max', e.target.value)} className={inputCls} placeholder="e.g. 9" />
            </Field>
          </div>

          <hr className={`border-t ${divider}`} />
          <h2 className={sectionHead}>SEO</h2>

          <Field label="Meta Title">
            <input type="text" value={form.meta_title} onChange={e => set('meta_title', e.target.value)} className={inputCls} placeholder="SEO page title" />
          </Field>
          <Field label="Meta Description">
            <textarea rows={2} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} className={inputCls + ' resize-none'} placeholder="SEO description (max 160 chars)" />
          </Field>

          <hr className={`border-t ${divider}`} />
          <h2 className={sectionHead}>Amenities</h2>
          <AmenityInput amenities={form.amenities} onChange={v => set('amenities', v)} />
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">
          <div className={`${card} p-6 space-y-5`}>
            <h2 className={sectionHead}>Listing</h2>

            <Field label="Status" required>
              <CustomSelect
                value={form.status}
                onChange={v => set('status', v)}
                options={statusOptions}
                placeholder="Select status…"
              />
            </Field>

            <div className="flex gap-3">
              <div className="flex-1">
                <Field label="Price" required>
                  <input type="number" min="0" step="0.01" required value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} placeholder="0" />
                </Field>
              </div>
              <div className="w-28">
                <Field label="Currency">
                  <CustomSelect
                    value={form.currency}
                    onChange={v => set('currency', v)}
                    options={currencyOptions}
                    placeholder="AED"
                  />
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => set('is_featured', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Featured property</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => set('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Published <span className="text-xs text-slate-400">(visible on website)</span>
                </span>
              </label>
            </div>
          </div>

          <div className={`${card} p-6 space-y-5`}>
            <h2 className={sectionHead}>Classification</h2>

            <Field label="Area" required>
              <CustomSelect
                value={form.area_id}
                onChange={v => set('area_id', v)}
                options={areaOptions}
                placeholder="Select area…"
                searchable={areas.length > 5}
              />
            </Field>

            <Field label="Developer" required>
              <CustomSelect
                value={form.developer_id}
                onChange={v => set('developer_id', v)}
                options={devOptions}
                placeholder="Select developer…"
                searchable={devs.length > 5}
              />
            </Field>

            <Field label="Operation Type" required>
              <CustomSelect
                value={form.operation_type_id}
                onChange={v => set('operation_type_id', v)}
                options={opOptions}
                placeholder="Select type…"
              />
            </Field>

            <Field label="Region">
              <CustomSelect
                value={form.region_id}
                onChange={v => set('region_id', v)}
                options={[
                  { value: '', label: 'No region' },
                  ...regions.map(r => ({ value: String(r.id), label: `${r.flag ?? ''} ${r.name}`.trim() })),
                ]}
                placeholder="Select region…"
              />
            </Field>

            <Field label="Assigned Broker">
              <CustomSelect
                value={agentId}
                onChange={v => setAgentId(v)}
                options={[
                  { value: '', label: 'No broker' },
                  ...brokers.map(b => ({
                    value: String(b.id),
                    label: `${b.user?.name ?? `Agent #${b.id}`}${b.agency?.name ? ` — ${b.agency.name}` : ''}`,
                  })),
                ]}
                placeholder="Select broker…"
                searchable={brokers.length > 5}
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Website WhatsApp &amp; email buttons on this property will contact this broker directly.
              </p>
            </Field>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] disabled:opacity-60 text-slate-900 font-semibold text-sm transition-colors"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Property'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/properties')}
              className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>

    {isEdit && property && (
      <>
        <ImageManager slug={property.slug} initial={property.images ?? []} />

        <div className="flex items-center gap-3 pt-2 pb-6">
          <button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] disabled:opacity-60 text-slate-900 font-semibold text-sm transition-colors"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/properties')}
            className="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </>
    )}
    </div>
  )
}
