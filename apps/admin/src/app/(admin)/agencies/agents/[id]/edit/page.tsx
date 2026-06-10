'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAgencies, getAgents, updateAgent, uploadMedia } from '@/lib/api'
import type { Agency, Agent } from '@/types'
import { ImageCropper } from '@/components/ui/ImageCropper'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { IconChevronRight, IconBriefcase, IconUpload, IconX, IconLoader } from '@/components/ui/icons'

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'
const sect = 'text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-6 mb-3 border-b border-slate-100 dark:border-slate-700 pb-1'

export default function EditAgentPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [agent,     setAgent]     = useState<Agent | null>(null)
  const [agencies,  setAgencies]  = useState<Agency[]>([])
  const [loading,   setLoading]   = useState(true)
  const [agencyId,  setAgencyId]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [whatsapp,  setWhatsapp]  = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [cropSrc,   setCropSrc]   = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      getAgencies().then(res => setAgencies(res.data ?? [])),
      getAgents().then(res => {
        const found = (res.data ?? []).find(a => String(a.id) === id)
        if (found) {
          setAgent(found)
          setAgencyId(String(found.agency_id ?? ''))
          setPhone(found.phone ?? '')
          setWhatsapp(found.whatsapp ?? '')
          setAvatarUrl(found.user?.avatar_url ?? '')
        }
      }),
    ]).finally(() => setLoading(false))
  }, [id])

  const agencyOptions = [
    { value: '', label: '— None —' },
    ...agencies.map(a => ({ value: String(a.id), label: a.name, icon: <IconBriefcase size={13} /> })),
  ]

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
      const file = new File([blob], 'avatar.png', { type: 'image/png' })
      const res  = await uploadMedia(file, 'avatars')
      setAvatarUrl(res.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally { setUploading(false) }
  }

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      await updateAgent(Number(id), {
        agency_id: agencyId ? Number(agencyId) : undefined,
        phone: phone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
      } as Parameters<typeof updateAgent>[1])
      router.push('/agencies?tab=agents')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <IconLoader size={28} className="text-[#C9A84C] animate-spin" />
    </div>
  )

  if (!agent) return (
    <div className="py-16 text-center">
      <p className="text-slate-400">Agent not found.</p>
      <Link href="/agencies?tab=agents" className="mt-3 inline-block text-sm text-[#C9A84C] hover:underline">Back to Agents</Link>
    </div>
  )

  const initials = (agent.user?.name ?? 'A').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

  return (
    <>
      {cropSrc && <ImageCropper src={cropSrc} aspect={1} onConfirm={onCropConfirm} onCancel={() => setCropSrc(null)} />}
      <div className="max-w-xl">
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/agencies?tab=agents" className="hover:text-[#C9A84C] transition-colors">Agents</Link>
          <IconChevronRight size={14} />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Edit: {agent.user?.name}</span>
        </nav>

        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Edit Agent</h1>

        <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          {error && <p className="text-red-500 text-sm p-3 rounded-lg bg-red-50 dark:bg-red-900/20 mb-4">{error}</p>}

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Profile Photo</label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-600 bg-[#C9A84C]/10 flex items-center justify-center shrink-0 overflow-hidden">
                {avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  : <span className="text-[#C9A84C] font-bold text-lg">{initials}</span>
                }
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
                  {uploading ? <span className="text-xs text-slate-400">Uploading…</span> : <><IconUpload size={14} /> Upload & Crop</>}
                </button>
                <input type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="or paste URL…" className={inp + ' text-xs'} />
                {avatarUrl && <button type="button" onClick={() => setAvatarUrl('')} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"><IconX size={11} /> Remove</button>}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" aria-label="Upload profile photo" className="hidden" onChange={onFileChange} />
          </div>

          {/* Read-only account info */}
          <p className={sect}>Account Info</p>
          <div className="space-y-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Name</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{agent.user?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Email</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{agent.user?.email}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">To change name or email, edit from the <Link href="/users" className="text-[#C9A84C] hover:underline">Users page</Link>.</p>

          <p className={sect}>Details</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Agency</label>
              <CustomSelect value={agencyId} onChange={setAgencyId} options={agencyOptions} placeholder="— None —" searchable={agencies.length > 5} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="agt-phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
                <input id="agt-phone" type="text" value={phone} onChange={e => setPhone(e.target.value)} className={inp} placeholder="+971 50 000 0000" />
              </div>
              <div>
                <label htmlFor="agt-wa" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">WhatsApp</label>
                <input id="agt-wa" type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inp} placeholder="+971 50 000 0000" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
            <Link href="/agencies?tab=agents" className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</Link>
            <button type="submit" disabled={saving || uploading} className="px-6 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
