'use client'

import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type Settings = Record<string, string | null>

interface FieldDef {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'url' | 'tel' | 'password' | 'number' | 'email'
  hint?: string
}

interface GroupDef {
  title: string
  hint?: string
  fields: FieldDef[]
}

const GROUPS: GroupDef[] = [
  {
    title: 'Contact',
    fields: [
      { key: 'contact_whatsapp',  label: 'WhatsApp Number',  placeholder: '+971501234567', type: 'tel' },
      { key: 'contact_email',     label: 'Contact Email',    placeholder: 'info@evoorion.com', type: 'email' },
      { key: 'contact_phone',     label: 'Phone',            placeholder: '+97141234567', type: 'tel' },
      { key: 'contact_address',   label: 'Address',          placeholder: 'Dubai, UAE' },
    ],
  },
  {
    title: 'Social Media',
    fields: [
      { key: 'social_facebook',   label: 'Facebook URL',   placeholder: 'https://facebook.com/…',  type: 'url' },
      { key: 'social_instagram',  label: 'Instagram URL',  placeholder: 'https://instagram.com/…', type: 'url' },
      { key: 'social_twitter',    label: 'X / Twitter URL',placeholder: 'https://x.com/…',         type: 'url' },
      { key: 'social_linkedin',   label: 'LinkedIn URL',   placeholder: 'https://linkedin.com/…',  type: 'url' },
      { key: 'social_youtube',    label: 'YouTube URL',    placeholder: 'https://youtube.com/…',   type: 'url' },
    ],
  },
  {
    title: 'Storage & Media Uploads',
    hint: 'Controls where uploaded property images are stored. "local" writes to the server disk (development only). "cloudinary" uses Cloudinary CDN.',
    fields: [
      {
        key: 'storage_driver',
        label: 'Storage Driver',
        placeholder: 'local',
        hint: 'local or cloudinary',
      },
      { key: 'cloudinary_cloud_name', label: 'Cloudinary Cloud Name', placeholder: 'my-cloud' },
      { key: 'cloudinary_api_key',    label: 'Cloudinary API Key',    type: 'password' },
      { key: 'cloudinary_api_secret', label: 'Cloudinary API Secret', type: 'password' },
    ],
  },
  {
    title: 'Social Login (OAuth)',
    hint: 'Client ID and Secret come from Google Cloud Console and Meta for Developers. Redirect URIs must point to your backend /api/v1/auth/social/{provider}/callback.',
    fields: [
      { key: 'google_client_id',      label: 'Google Client ID' },
      { key: 'google_client_secret',  label: 'Google Client Secret',  type: 'password' },
      { key: 'facebook_client_id',    label: 'Facebook App ID' },
      { key: 'facebook_client_secret',label: 'Facebook App Secret',   type: 'password' },
    ],
  },
  {
    title: 'Email / SMTP',
    hint: 'Used for transactional emails (lead notifications, password resets). Changes take effect immediately — no server restart needed.',
    fields: [
      { key: 'mail_host',         label: 'SMTP Host',       placeholder: 'smtp.mailgun.org' },
      { key: 'mail_port',         label: 'SMTP Port',       placeholder: '587', type: 'number' },
      { key: 'mail_username',     label: 'SMTP Username',   placeholder: 'postmaster@mg.example.com' },
      { key: 'mail_password',     label: 'SMTP Password',   type: 'password' },
      { key: 'mail_encryption',   label: 'Encryption',      placeholder: 'tls', hint: 'tls or ssl' },
      { key: 'mail_from_address', label: 'From Address',    placeholder: 'hello@evoorion.com', type: 'email' },
      { key: 'mail_from_name',    label: 'From Name',       placeholder: 'EVOORION' },
    ],
  },
  {
    title: 'Integrations',
    fields: [
      { key: 'google_maps_key',     label: 'Google Maps API Key',   type: 'password', hint: 'Enable Maps Embed API in Google Cloud Console' },
      { key: 'google_analytics_id', label: 'Google Analytics ID',   placeholder: 'G-XXXXXXXXXX' },
      { key: 'meta_pixel_id',       label: 'Meta Pixel ID',         placeholder: '1234567890123456' },
    ],
  },
]

// ── Storage driver select ─────────────────────────────────────────────────────

function StorageDriverSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      id="storage_driver"
      aria-label="Storage Driver"
      value={value || 'local'}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white text-slate-800"
    >
      <option value="local">local — Server disk (dev only)</option>
      <option value="cloudinary">cloudinary — Cloudinary CDN</option>
    </select>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { user: me } = useAuth()
  const [values,  setValues]  = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    getSettings()
      .then(res => setValues(res.data ?? {}))
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  if (me?.role !== 'super_admin') {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-400">Super admin access required.</p>
      </div>
    )
  }

  async function save() {
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      const res = await updateSettings(values)
      setValues(res.data ?? values)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  function set(key: string, val: string) {
    setValues(prev => ({ ...prev, [key]: val || null }))
  }

  const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white text-slate-800'

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-32" />
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-24" />
                <div className="h-9 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {GROUPS.map(group => (
        <div key={group.title} className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-1">{group.title}</h2>
          {group.hint && <p className="text-xs text-slate-400 mb-4 leading-relaxed">{group.hint}</p>}

          <div className={`space-y-4 ${group.hint ? '' : 'mt-4'}`}>
            {group.fields.map(field => (
              <div key={field.key}>
                <label htmlFor={field.key} className="block text-sm font-medium text-slate-700 mb-1.5">
                  {field.label}
                </label>

                {field.key === 'storage_driver' ? (
                  <StorageDriverSelect
                    value={values[field.key] ?? ''}
                    onChange={v => set(field.key, v)}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type ?? 'text'}
                    value={values[field.key] ?? ''}
                    onChange={e => set(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className={inp}
                    autoComplete="off"
                  />
                )}

                {field.hint && (
                  <p className="text-[11px] text-slate-400 mt-1">{field.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4 pb-8">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save All Settings'}
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  )
}
