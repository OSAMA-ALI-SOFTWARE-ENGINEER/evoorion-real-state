'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  getAreas, getDevelopers, getOperationTypes, createProperty, updateProperty,
  uploadPropertyImage, updatePropertyImage, deletePropertyImage,
} from '@/lib/api'
import type { Area, Developer, OperationType, Property, PropertyImage } from '@/types'

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
  roi_min:           string
  roi_max:           string
  area_id:           string
  developer_id:      string
  operation_type_id: string
  meta_title:        string
  meta_description:  string
  amenities:         string[]
}

function blank(): FormState {
  return {
    title: '', description: '', type: 'apartment', status: 'available',
    price: '', currency: 'AED', location: '', area_sqft: '',
    bedrooms: '', bathrooms: '', is_featured: false,
    roi_min: '', roi_max: '', area_id: '', developer_id: '',
    operation_type_id: '', meta_title: '', meta_description: '',
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
    roi_min:           p.roi_min != null ? String(p.roi_min) : '',
    roi_max:           p.roi_max != null ? String(p.roi_max) : '',
    area_id:           p.area_id != null ? String(p.area_id) : '',
    developer_id:      p.developer_id != null ? String(p.developer_id) : '',
    operation_type_id: p.operation_type_id != null ? String(p.operation_type_id) : '',
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
    roi_min:           f.roi_min ? Number(f.roi_min) : undefined,
    roi_max:           f.roi_max ? Number(f.roi_max) : undefined,
    area_id:           Number(f.area_id),
    developer_id:      Number(f.developer_id),
    operation_type_id: Number(f.operation_type_id),
    meta_title:        f.meta_title || undefined,
    meta_description:  f.meta_description || undefined,
    amenities:         f.amenities.length ? f.amenities : undefined,
  }
}

// ── Field components ──────────────────────────────────────────────────────────

function Field({ label, children, required, htmlFor }: { label: string; children: React.ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white text-slate-800 transition-colors'
const selectCls = inputCls

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
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 shrink-0"
        >
          Add
        </button>
      </div>
      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {amenities.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
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
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Images</h2>
        <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          uploading
            ? 'bg-slate-100 text-slate-400 pointer-events-none'
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
          className="border-2 border-dashed border-slate-200 rounded-lg p-10 text-center cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <p className="text-slate-400 text-sm">No images yet — click to upload</p>
          <p className="text-slate-300 text-xs mt-1">JPEG, PNG, WebP · max 10 MB each</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images
            .slice()
            .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.order - b.order)
            .map(img => (
              <div key={img.id} className={`relative rounded-lg overflow-hidden border-2 transition-colors ${img.is_primary ? 'border-[#C9A84C]' : 'border-transparent'}`}>
                <div className="relative aspect-[4/3] bg-slate-100">
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                </div>
                {/* Overlay actions */}
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

          {/* Drop zone tile */}
          <div
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:border-[#C9A84C]/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <span className="text-slate-300 text-2xl">+</span>
          </div>
        </div>
      )}
      <p className="text-[11px] text-slate-400">
        Star (★) = set as primary. Images require Cloudinary credentials in backend <code className="font-mono">.env</code>.
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
  const isEdit = !!property

  const [form,    setForm]    = useState<FormState>(isEdit ? fromProperty(property!) : blank)
  const [areas,   setAreas]   = useState<Area[]>([])
  const [devs,    setDevs]    = useState<Developer[]>([])
  const [opTypes, setOpTypes] = useState<OperationType[]>([])
  const [error,   setError]   = useState('')
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    Promise.all([
      getAreas(),
      getDevelopers(),
      getOperationTypes(),
    ]).then(([a, d, o]) => {
      setAreas(a.data ?? [])
      setDevs(d.data ?? [])
      setOpTypes(o.data ?? [])
    }).catch(() => { /* non-critical */ })
  }, [])

  function set(key: keyof FormState, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await updateProperty(property!.slug, toPayload(form) as Partial<Property>)
      } else {
        await createProperty(toPayload(form) as Partial<Property>)
      }
      router.push('/properties')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column (main) ── */}
        <div className="lg:col-span-2 space-y-5 bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Property Details</h2>

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
            <textarea
              rows={5}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={inputCls + ' resize-y'}
              placeholder="Full property description…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Type" required htmlFor="prop-type">
              <select id="prop-type" value={form.type} onChange={e => set('type', e.target.value)} className={selectCls} required>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="penthouse">Penthouse</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </Field>
            <Field label="Location">
              <input
                type="text"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className={inputCls}
                placeholder="e.g. Palm Jumeirah Frond C"
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

          <hr className="border-slate-100" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">SEO</h2>

          <Field label="Meta Title">
            <input type="text" value={form.meta_title} onChange={e => set('meta_title', e.target.value)} className={inputCls} placeholder="SEO page title" />
          </Field>
          <Field label="Meta Description">
            <textarea rows={2} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} className={inputCls + ' resize-none'} placeholder="SEO description (max 160 chars)" />
          </Field>

          <hr className="border-slate-100" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Amenities</h2>
          <AmenityInput amenities={form.amenities} onChange={v => set('amenities', v)} />
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Listing</h2>

            <Field label="Status" required htmlFor="prop-status">
              <select id="prop-status" value={form.status} onChange={e => set('status', e.target.value)} className={selectCls} required>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </Field>

            <div className="flex gap-3">
              <div className="flex-1">
                <Field label="Price" required>
                  <input type="number" min="0" step="0.01" required value={form.price} onChange={e => set('price', e.target.value)} className={inputCls} placeholder="0" />
                </Field>
              </div>
              <div className="w-20">
                <Field label="Currency">
                  <input type="text" maxLength={3} value={form.currency} onChange={e => set('currency', e.target.value.toUpperCase())} className={inputCls} />
                </Field>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={e => set('is_featured', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#C9A84C] focus:ring-[#C9A84C]"
              />
              <span className="text-sm text-slate-700">Featured property</span>
            </label>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Classification</h2>

            <Field label="Area" required htmlFor="prop-area">
              <select id="prop-area" value={form.area_id} onChange={e => set('area_id', e.target.value)} className={selectCls} required>
                <option value="">Select area…</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </Field>

            <Field label="Developer" required htmlFor="prop-developer">
              <select id="prop-developer" value={form.developer_id} onChange={e => set('developer_id', e.target.value)} className={selectCls} required>
                <option value="">Select developer…</option>
                {devs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>

            <Field label="Operation Type" required htmlFor="prop-optype">
              <select id="prop-optype" value={form.operation_type_id} onChange={e => set('operation_type_id', e.target.value)} className={selectCls} required>
                <option value="">Select type…</option>
                {opTypes.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
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
              className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>

    {isEdit && property && (
      <ImageManager slug={property.slug} initial={property.images ?? []} />
    )}
    </div>
  )
}
