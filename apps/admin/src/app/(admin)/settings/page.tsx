'use client'

import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

type Settings = Record<string, string | null>

interface FieldDef {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'url' | 'tel' | 'password'
}

interface GroupDef {
  title: string
  fields: FieldDef[]
}

const GROUPS: GroupDef[] = [
  {
    title: 'Contact',
    fields: [
      { key: 'contact_whatsapp', label: 'WhatsApp Number', placeholder: '+971501234567', type: 'tel' },
      { key: 'contact_email',    label: 'Contact Email',   placeholder: 'info@evoorion.com' },
      { key: 'contact_phone',    label: 'Contact Phone',   placeholder: '+97141234567', type: 'tel' },
      { key: 'contact_address',  label: 'Address',         placeholder: 'Dubai, UAE' },
    ],
  },
  {
    title: 'Social Media',
    fields: [
      { key: 'social_facebook',  label: 'Facebook URL',   placeholder: 'https://facebook.com/…', type: 'url' },
      { key: 'social_instagram', label: 'Instagram URL',  placeholder: 'https://instagram.com/…', type: 'url' },
      { key: 'social_twitter',   label: 'X / Twitter URL',placeholder: 'https://x.com/…', type: 'url' },
      { key: 'social_linkedin',  label: 'LinkedIn URL',   placeholder: 'https://linkedin.com/…', type: 'url' },
      { key: 'social_youtube',   label: 'YouTube URL',    placeholder: 'https://youtube.com/…', type: 'url' },
    ],
  },
  {
    title: 'Integrations',
    fields: [
      { key: 'google_maps_key',      label: 'Google Maps API Key',    type: 'password' },
      { key: 'google_analytics_id',  label: 'Google Analytics ID',   placeholder: 'G-XXXXXXXXXX' },
      { key: 'meta_pixel_id',        label: 'Meta Pixel ID',         placeholder: '1234567890123456' },
    ],
  },
]

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

  const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white'

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        {Array.from({ length: 3 }).map((_, i) => (
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
          <h2 className="text-sm font-semibold text-slate-700 mb-4">{group.title}</h2>
          <div className="space-y-4">
            {group.fields.map(field => (
              <div key={field.key}>
                <label htmlFor={field.key} className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
                <input
                  id={field.key}
                  type={field.type ?? 'text'}
                  value={values[field.key] ?? ''}
                  onChange={e => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={inp}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {saved && <span className="text-emerald-600 text-sm font-medium">Saved!</span>}
      </div>
    </div>
  )
}
