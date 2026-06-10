'use client'

import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  IconUsers,
  IconSettings,
  IconKey,
  IconSliders,
  IconCheck,
} from '@/components/ui/icons'
import { PhoneSettingInput } from '@/components/ui/PhoneSettingInput'

type Settings = Record<string, string | null>

interface FieldDef {
  key: string
  label: string
  placeholder?: string
  type?: 'text' | 'url' | 'tel' | 'phone' | 'password' | 'number' | 'email' | 'toggle'
  hint?: string
}

interface TabDef {
  id: string
  label: string
  icon: React.ReactNode
  hint?: string
  fields: FieldDef[]
}

const TABS: TabDef[] = [
  {
    id: 'contact',
    label: 'Contact',
    icon: <IconUsers size={16} />,
    fields: [
      { key: 'contact_whatsapp',       label: 'WhatsApp Number', type: 'phone' },
      { key: 'contact_email',          label: 'Contact Email',   placeholder: 'info@evoorion.com', type: 'email' },
      { key: 'contact_phone',          label: 'Phone',           type: 'phone' },
      { key: 'contact_address',        label: 'Address',         placeholder: 'Office 2402, Burj Al Salam Tower, Sheikh Zayed Road, Dubai, UAE' },
      { key: 'contact_hours_weekdays', label: 'Weekday Hours',   placeholder: 'Monday – Saturday: 9:00 AM – 7:00 PM' },
      { key: 'contact_hours_sunday',   label: 'Sunday Hours',    placeholder: 'Sunday: By Appointment' },
    ],
  },
  {
    id: 'social',
    label: 'Social Media',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
    fields: [
      { key: 'social_facebook',  label: 'Facebook URL',    placeholder: 'https://facebook.com/…',  type: 'url' },
      { key: 'social_instagram', label: 'Instagram URL',   placeholder: 'https://instagram.com/…', type: 'url' },
      { key: 'social_twitter',   label: 'X / Twitter URL', placeholder: 'https://x.com/…',         type: 'url' },
      { key: 'social_linkedin',  label: 'LinkedIn URL',    placeholder: 'https://linkedin.com/…',  type: 'url' },
      { key: 'social_youtube',   label: 'YouTube URL',     placeholder: 'https://youtube.com/…',   type: 'url' },
    ],
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    hint: 'Controls where uploaded property images are stored. "local" writes to the server disk (development only). "cloudinary" uses Cloudinary CDN.',
    fields: [
      { key: 'storage_driver',        label: 'Storage Driver',       placeholder: 'local', hint: 'local or cloudinary' },
      { key: 'cloudinary_cloud_name', label: 'Cloudinary Cloud Name', placeholder: 'my-cloud' },
      { key: 'cloudinary_api_key',    label: 'Cloudinary API Key',    type: 'password' },
      { key: 'cloudinary_api_secret', label: 'Cloudinary API Secret', type: 'password' },
    ],
  },
  {
    id: 'oauth',
    label: 'Social Login',
    icon: <IconKey size={16} />,
    hint: 'Client ID and Secret come from Google Cloud Console and Meta for Developers. Redirect URIs must point to your backend /api/v1/auth/social/{provider}/callback.',
    fields: [
      { key: 'google_client_id',       label: 'Google Client ID' },
      { key: 'google_client_secret',   label: 'Google Client Secret',   type: 'password' },
      { key: 'facebook_client_id',     label: 'Facebook App ID' },
      { key: 'facebook_client_secret', label: 'Facebook App Secret',    type: 'password' },
    ],
  },
  {
    id: 'email',
    label: 'Email / SMTP',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    hint: 'Used for transactional emails (lead notifications, password resets). Changes take effect immediately — no server restart needed.',
    fields: [
      { key: 'mail_host',         label: 'SMTP Host',     placeholder: 'smtp.mailgun.org' },
      { key: 'mail_port',         label: 'SMTP Port',     placeholder: '587', type: 'number' },
      { key: 'mail_username',     label: 'SMTP Username', placeholder: 'postmaster@mg.example.com' },
      { key: 'mail_password',     label: 'SMTP Password', type: 'password' },
      { key: 'mail_encryption',   label: 'Encryption',    placeholder: 'tls', hint: 'tls or ssl' },
      { key: 'mail_from_address', label: 'From Address',  placeholder: 'hello@evoorion.com', type: 'email' },
      { key: 'mail_from_name',    label: 'From Name',     placeholder: 'EVOORION' },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <IconSliders size={16} />,
    fields: [
      { key: 'google_maps_key',     label: 'Google Maps API Key',  type: 'password', hint: 'Enable Maps Embed API in Google Cloud Console' },
      { key: 'google_analytics_id', label: 'Google Analytics ID',  placeholder: 'G-XXXXXXXXXX' },
      { key: 'meta_pixel_id',       label: 'Meta Pixel ID',        placeholder: '1234567890123456' },
    ],
  },
  {
    id: 'leads',
    label: 'Lead Notifications',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.22 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91A16 16 0 0016.09 17.9l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    hint: 'Control who receives an email when a new lead is submitted through the website.',
    fields: [
      {
        key: 'lead_notify_recipients',
        label: 'Notification Recipients',
        placeholder: 'admin@example.com, manager@example.com',
        hint: 'Comma-separated email addresses. These always receive every new lead.',
      },
      {
        key: 'lead_notify_agent',
        label: "Notify Property's Primary Agent",
        type: 'toggle',
        hint: "If enabled, the primary agent on the property receives a notification for each lead on that property.",
      },
      {
        key: 'lead_notify_developer',
        label: "Notify Property's Developer",
        type: 'toggle',
        hint: "If enabled, the developer listed on the property receives a notification (requires developer email to be set).",
      },
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
      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
    >
      <option value="local">local — Server disk (dev only)</option>
      <option value="cloudinary">cloudinary — Cloudinary CDN</option>
    </select>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

export default function SettingsPage() {
  const { user: me }  = useAuth()
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const [values,    setValues]    = useState<Settings>({})
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')

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

  const currentTab = TABS.find(t => t.id === activeTab) ?? TABS[0]

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 max-w-4xl">
        <div className="flex flex-row sm:flex-col gap-1 sm:w-48 sm:shrink-0 overflow-x-auto pb-1 sm:pb-0">
          {TABS.map((_, i) => (
            <div key={i} className="h-9 shrink-0 sm:w-full w-24 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((__, j) => (
            <div key={j} className="space-y-1.5">
              <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24" />
              <div className="h-9 bg-slate-100 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Tab nav — horizontal scroll on mobile, vertical sidebar on sm+ */}
        <nav className="flex flex-row sm:flex-col gap-1 sm:gap-0.5 sm:w-48 sm:shrink-0 overflow-x-auto pb-1 sm:pb-0 sm:overflow-x-visible">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'shrink-0 flex items-center gap-2 sm:gap-2.5 px-3 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap sm:whitespace-normal sm:w-full text-left',
                activeTab === tab.id
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200',
              ].join(' ')}
            >
              <span className={activeTab === tab.id ? 'text-[#C9A84C]' : 'text-slate-400 dark:text-slate-500'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Tab header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-[#C9A84C]">{currentTab.icon}</span>
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{currentTab.label}</h2>
                {currentTab.hint && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{currentTab.hint}</p>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="p-6 space-y-5">
              {currentTab.fields.map(field => (
                <div key={field.key}>
                  <label htmlFor={field.key} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    {field.label}
                  </label>

                  {field.key === 'storage_driver' ? (
                    <StorageDriverSelect value={values[field.key] ?? ''} onChange={v => set(field.key, v)} />
                  ) : field.type === 'phone' ? (
                    <PhoneSettingInput
                      id={field.key}
                      value={values[field.key] ?? ''}
                      onChange={v => set(field.key, v)}
                    />
                  ) : field.type === 'toggle' ? (
                    <label className="inline-flex items-center gap-3 cursor-pointer select-none">
                      <div className="relative">
                        <input
                          id={field.key}
                          type="checkbox"
                          checked={values[field.key] === '1'}
                          onChange={e => set(field.key, e.target.checked ? '1' : '0')}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 rounded-full bg-slate-200 dark:bg-slate-600 peer-checked:bg-[#C9A84C] transition-colors duration-200" />
                        <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 peer-checked:translate-x-5" />
                      </div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {values[field.key] === '1' ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
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
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{field.hint}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Save bar */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-700/30">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
              {saved && (
                <span className="text-emerald-600 text-sm font-medium flex items-center gap-1">
                  <IconCheck size={14} /> Saved
                </span>
              )}
              <p className="text-xs text-slate-400 ml-auto">Changes save per-tab</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
