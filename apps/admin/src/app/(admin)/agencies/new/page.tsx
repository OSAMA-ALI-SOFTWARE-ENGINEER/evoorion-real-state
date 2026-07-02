'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createAgency, uploadMedia, getRegions } from '@/lib/api'
import type { Region } from '@/types'
import { ImageCropper } from '@/components/ui/ImageCropper'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { IconChevronRight, IconBriefcase, IconUpload, IconX } from '@/components/ui/icons'

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

export default function NewAgencyPage() {
  const router = useRouter()
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [phone,     setPhone]     = useState('')
  const [address,   setAddress]   = useState('')
  const [logoUrl,   setLogoUrl]   = useState('')
  const [cropSrc,   setCropSrc]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const [regions,   setRegions]   = useState<Region[]>([])
  const [regionId,  setRegionId]  = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = ev => setCropSrc(ev.target?.result as string)
    reader.readAsDataURL(f)
    e.target.value = ''
  }

  async function onCropConfirm(blob: Blob) {
    setCropSrc(null)
    setUploading(true)
    try {
      const file = new File([blob], 'logo.png', { type: 'image/png' })
      const res  = await uploadMedia(file, 'agencies')
      setLogoUrl(res.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await createAgency({
        name: name.trim(),
        contact_email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
        region_id: regionId ? Number(regionId) : null,
      })
      router.push('/agencies')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <>
      {cropSrc && <ImageCropper src={cropSrc} aspect={1} onConfirm={onCropConfirm} onCancel={() => setCropSrc(null)} />}
      <div className="max-w-xl">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/agencies" className="hover:text-[#C9A84C] transition-colors">Agencies</Link>
          <IconChevronRight size={14} />
          <span className="text-slate-600 dark:text-slate-300 font-medium">New Agency</span>
        </nav>

        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">New Agency</h1>

        <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-5">
          {error && <p className="text-red-500 text-sm p-3 rounded-lg bg-red-50 dark:bg-red-900/20">{error}</p>}

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Logo</label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                {logoUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  : <IconBriefcase size={28} className="text-slate-300 dark:text-slate-500" />
                }
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
                  {uploading ? <span className="text-xs text-slate-400">Uploading…</span> : <><IconUpload size={14} /> Upload & Crop</>}
                </button>
                <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="or paste URL…" className={inp + ' text-xs'} />
                {logoUrl && <button type="button" onClick={() => setLogoUrl('')} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"><IconX size={11} /> Remove</button>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" aria-label="Upload agency logo" className="hidden" onChange={onFileChange} />
          </div>

          <div>
            <label htmlFor="ag-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name <span className="text-red-400">*</span></label>
            <input id="ag-name" type="text" required value={name} onChange={e => setName(e.target.value)} className={inp} placeholder="e.g. Haus & Haus" />
          </div>
          <div>
            <label htmlFor="ag-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Contact Email</label>
            <input id="ag-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className={inp} />
          </div>
          <div>
            <label htmlFor="ag-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
            <input id="ag-phone" type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="+971 4 000 0000" />
          </div>
          <div>
            <label htmlFor="ag-addr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Address</label>
            <input id="ag-addr" type="text" value={address} onChange={e => setAddress(e.target.value)} className={inp} />
          </div>

          <div>
            <label htmlFor="ag-region" className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Region</label>
            <CustomSelect
              value={regionId}
              onChange={setRegionId}
              options={[
                { value: '', label: 'No region (global)' },
                ...regions.filter(r => r.is_active).map(r => ({ value: String(r.id), label: `${r.flag ?? ''} ${r.name}`.trim() })),
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Link href="/agencies" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</Link>
            <button type="submit" disabled={saving || uploading} className="px-6 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Creating…' : 'Create Agency'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
