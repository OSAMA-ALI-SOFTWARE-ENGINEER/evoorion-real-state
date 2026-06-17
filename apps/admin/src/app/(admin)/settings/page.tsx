'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { getSettings, updateSettings, uploadMedia } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { ImageCropperModal } from '@/components/ui/ImageCropperModal'
import { SectionBgEditor } from '@/components/ui/SectionBgEditor'
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
  fields?: FieldDef[]
  custom?: boolean
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
    id: 'theme',
    label: 'Theme & Colors',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
    custom: true,
    hint: 'Customize the website colour palette. Changes are reflected immediately — no rebuild required.',
  },
  {
    id: 'images',
    label: 'Section Images',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    custom: true,
    hint: 'Upload background images for each homepage section. Leave blank to use the default CSS gradient.',
  },
  {
    id: 'sections',
    label: 'Section Backgrounds',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="11" width="18" height="5" rx="1"/><rect x="3" y="19" width="18" height="2" rx="1"/>
      </svg>
    ),
    custom: true,
    hint: 'Set a solid colour, gradient, or image background for any section — homepage or inner pages.',
  },
  {
    id: 'partners',
    label: 'Partners & Strip',
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    custom: true,
    hint: 'Manage developer/partner logos shown in the scrolling trust strip on the homepage.',
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

// ── Luxury colour presets ─────────────────────────────────────────────────────

interface Palette {
  name: string
  brand: string
  brandSection: string
  gold: string
  goldLight: string
  muted: string
}

const PALETTES: Palette[] = [
  { name: 'Navy & Gold',         brand: '#0A0F1E', brandSection: '#0D1526', gold: '#C9A84C', goldLight: '#D4B77A', muted: '#A0ABBB' },
  { name: 'Emerald & Gold',      brand: '#0A1A10', brandSection: '#0D2218', gold: '#C9A84C', goldLight: '#D4B77A', muted: '#9AABAA' },
  { name: 'Obsidian & Platinum', brand: '#0D0D0D', brandSection: '#181818', gold: '#E2E2E2', goldLight: '#F5F5F5', muted: '#909090' },
  { name: 'Midnight & Rose Gold',brand: '#100A1E', brandSection: '#180D2A', gold: '#B76E79', goldLight: '#D4909A', muted: '#A09AAB' },
  { name: 'Charcoal & Champagne',brand: '#1A1714', brandSection: '#231F1C', gold: '#D4AF8C', goldLight: '#E8CCB0', muted: '#A09890' },
  { name: 'Forest & Bronze',     brand: '#0F1A0F', brandSection: '#162216', gold: '#8B6914', goldLight: '#A87E2A', muted: '#90A090' },
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

// ── Theme & Colors tab ────────────────────────────────────────────────────────

const COLOR_FIELDS = [
  { key: 'color_brand',         label: 'Primary Background',   hint: 'Main dark background used across all pages' },
  { key: 'color_brand_section', label: 'Section Background',   hint: 'Slightly lighter background for alternate sections' },
  { key: 'color_gold',          label: 'Accent / Gold',        hint: 'Primary accent — buttons, borders, highlights' },
  { key: 'color_gold_light',    label: 'Accent Light',         hint: 'Hover state of the accent colour' },
  { key: 'color_muted',         label: 'Muted Text',           hint: 'Secondary text — descriptions, captions' },
]

function ThemeTab({ values, set }: { values: Settings; set: (k: string, v: string) => void }) {
  function applyPalette(p: Palette) {
    set('color_brand', p.brand)
    set('color_brand_section', p.brandSection)
    set('color_gold', p.gold)
    set('color_gold_light', p.goldLight)
    set('color_muted', p.muted)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Preset palettes */}
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Luxury Presets</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PALETTES.map(p => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPalette(p)}
              className="group flex items-center gap-2.5 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-[#C9A84C] transition-colors text-left"
            >
              {/* Colour swatches */}
              <div className="flex shrink-0">
                <div className="w-5 h-9 rounded-l" style={{ background: p.brand }} />
                <div className="w-5 h-9"          style={{ background: p.gold }} />
                <div className="w-5 h-9 rounded-r" style={{ background: p.muted }} />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-[#C9A84C] transition-colors leading-tight">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-700" />

      {/* Individual colour pickers */}
      <div className="space-y-5">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Colours</p>
        {COLOR_FIELDS.map(f => (
          <div key={f.key} className="flex items-start gap-4">
            <div className="shrink-0 flex flex-col items-center gap-2 mt-0.5">
              <div
                className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer relative overflow-hidden"
                style={{ background: values[f.key] ?? '#000000' }}
              >
                <input
                  type="color"
                  value={values[f.key] ?? '#000000'}
                  onChange={e => set(f.key, e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  aria-label={f.label}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{f.label}</label>
              <input
                type="text"
                value={values[f.key] ?? ''}
                onChange={e => set(f.key, e.target.value)}
                placeholder="#000000"
                maxLength={7}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-mono focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />
              {f.hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{f.hint}</p>}
            </div>
            {/* Live preview swatch */}
            <div
              className="shrink-0 w-16 h-10 rounded-lg mt-0.5 border border-slate-200 dark:border-slate-600 flex items-center justify-center"
              style={{ background: values[f.key] ?? '#000' }}
            >
              <span className="text-[10px] font-mono" style={{ color: values[f.key] === values['color_brand'] ? (values['color_gold'] ?? '#C9A84C') : '#ffffff' }}>Aa</span>
            </div>
          </div>
        ))}
      </div>

      {/* Live preview bar */}
      <div>
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Preview</p>
        <div
          className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600"
          style={{ background: values['color_brand'] ?? '#0A0F1E' }}
        >
          <div
            className="px-6 py-4"
            style={{ background: values['color_brand_section'] ?? '#0D1526' }}
          >
            <p className="text-xs tracking-widest uppercase mb-1" style={{ color: values['color_gold'] ?? '#C9A84C' }}>
              Luxury Real Estate
            </p>
            <p className="text-xl font-bold" style={{ color: '#ffffff' }}>
              Invest in Dubai.{' '}
              <span style={{ color: values['color_gold'] ?? '#C9A84C' }}>Secure Your Legacy.</span>
            </p>
            <p className="text-sm mt-1" style={{ color: values['color_muted'] ?? '#A0ABBB' }}>
              Exclusive off-market opportunities. High returns.
            </p>
          </div>
          <div className="px-6 py-3 flex items-center gap-3">
            <span
              className="px-4 py-1.5 rounded text-xs font-semibold"
              style={{ background: values['color_gold'] ?? '#C9A84C', color: values['color_brand'] ?? '#0A0F1E' }}
            >
              Explore
            </span>
            <span
              className="px-4 py-1.5 rounded text-xs border"
              style={{ borderColor: values['color_gold'] ?? '#C9A84C', color: '#ffffff' }}
            >
              Book Call
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section Images tab ────────────────────────────────────────────────────────

const IMAGE_SECTIONS = [
  { key: 'image_hero',      label: 'Hero Section', aspect: 16 / 9, hint: 'Full-screen background image on the homepage hero. Recommended: 1920×1080px or larger.' },
  { key: 'image_cta',       label: 'CTA Banner',   aspect: 21 / 9, hint: 'Background for the "Ready to Build Your Portfolio?" call-to-action section.' },
  { key: 'image_why_dubai', label: 'Why Dubai',    aspect: 16 / 9, hint: 'Background for the "Why Invest in Dubai" statistics section.' },
]

interface SectionCropState { file: File; key: string; aspect: number }

function SectionImagesTab({ values, set }: { values: Settings; set: (k: string, v: string) => void }) {
  const [uploading,  setUploading]  = useState<string | null>(null)
  const [cropState,  setCropState]  = useState<SectionCropState | null>(null)
  const refs = useRef<Record<string, HTMLInputElement | null>>({})

  async function upload(key: string, file: File) {
    setUploading(key)
    try {
      const res = await uploadMedia(file, 'general')
      set(key, res.url)
    } catch {
      // upload failed — leave existing value
    } finally {
      setUploading(null)
    }
  }

  return (
    <>
      {cropState && (
        <ImageCropperModal
          file={cropState.file}
          aspect={cropState.aspect}
          maxWidth={1920}
          quality={0.82}
          onDone={croppedFile => { const key = cropState.key; setCropState(null); upload(key, croppedFile) }}
          onCancel={() => setCropState(null)}
        />
      )}

      <div className="p-6 space-y-6">
        {IMAGE_SECTIONS.map(s => {
          const url = values[s.key] ?? ''
          const busy = uploading === s.key
          return (
            <div key={s.key} className="border border-slate-200 dark:border-slate-600 rounded-xl overflow-hidden">
              {/* Preview */}
              <div className="relative w-full h-40 bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {url ? (
                  <Image src={url} alt={s.label} fill className="object-cover" unoptimized />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span className="text-xs">Using default gradient</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{s.label}</p>
                {s.hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 mb-3">{s.hint}</p>}

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => refs.current[s.key]?.click()}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 disabled:opacity-50 transition-colors"
                  >
                    {busy ? 'Uploading…' : 'Upload image'}
                  </button>

                  {url && (
                    <button
                      type="button"
                      onClick={() => set(s.key, '')}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Remove
                    </button>
                  )}

                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-[#C9A84C] transition-colors truncate max-w-[200px]"
                    >
                      {url.split('/').pop()}
                    </a>
                  )}

                  <input
                    ref={el => { refs.current[s.key] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label={`Upload image for ${s.label}`}
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) setCropState({ file: f, key: s.key, aspect: s.aspect })
                      e.target.value = ''
                    }}
                  />
                </div>

                {/* Or paste URL */}
                <input
                  type="url"
                  value={url}
                  onChange={e => set(s.key, e.target.value)}
                  placeholder="Or paste an image URL…"
                  className="mt-3 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

// ── Partners tab ──────────────────────────────────────────────────────────────

interface Partner {
  name: string
  logo_url: string
}

interface LogoCropState { file: File; index: number }

function PartnersTab({ values, set }: { values: Settings; set: (k: string, v: string) => void }) {
  const [partners,  setPartners]  = useState<Partner[]>([])
  const [uploading, setUploading] = useState<number | null>(null)
  const [cropState, setCropState] = useState<LogoCropState | null>(null)
  const logoRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    try {
      const parsed = JSON.parse(values['partners_list'] ?? '[]')
      if (Array.isArray(parsed)) setPartners(parsed)
    } catch { /* ignore */ }
  }, [values['partners_list']])

  function persist(updated: Partner[]) {
    setPartners(updated)
    set('partners_list', JSON.stringify(updated))
  }

  function updateName(i: number, name: string) {
    const updated = [...partners]
    updated[i] = { ...updated[i], name }
    persist(updated)
  }

  function updateLogo(i: number, logo_url: string) {
    const updated = [...partners]
    updated[i] = { ...updated[i], logo_url }
    persist(updated)
  }

  function move(i: number, dir: -1 | 1) {
    const updated = [...partners]
    const j = i + dir
    if (j < 0 || j >= updated.length) return;
    [updated[i], updated[j]] = [updated[j], updated[i]]
    persist(updated)
  }

  function remove(i: number) {
    persist(partners.filter((_, idx) => idx !== i))
  }

  function add() {
    persist([...partners, { name: '', logo_url: '' }])
  }

  async function uploadLogo(i: number, file: File) {
    setUploading(i)
    try {
      const res = await uploadMedia(file, 'general')
      updateLogo(i, res.url)
    } catch { /* ignore */ }
    finally { setUploading(null) }
  }

  function onLogoFileSelected(i: number, file: File) {
    setCropState({ file, index: i })
  }

  const speed = parseInt(values['trust_strip_speed'] ?? '25', 10) || 25
  const label = values['trust_strip_label'] ?? 'Trusted by Leading Developers'

  return (
    <>
    {cropState && (
      <ImageCropperModal
        file={cropState.file}
        maxWidth={400}
        quality={0.88}
        onDone={croppedFile => { const idx = cropState.index; setCropState(null); uploadLogo(idx, croppedFile) }}
        onCancel={() => setCropState(null)}
      />
    )}
    <div className="p-6 space-y-8">
      {/* Strip settings */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Strip Label</label>
          <input
            type="text"
            value={label}
            onChange={e => set('trust_strip_label', e.target.value)}
            placeholder="Trusted by Leading Developers"
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Scroll Speed — <span className="font-mono text-[#C9A84C]">{speed}s</span>
          </label>
          <input
            type="range"
            min={5}
            max={60}
            step={1}
            value={speed}
            onChange={e => set('trust_strip_speed', e.target.value)}
            className="w-full accent-[#C9A84C]"
            aria-label={`Scroll speed: ${speed} seconds`}
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>Fast (5s)</span>
            <span>Slow (60s)</span>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-700" />

      {/* Partners list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Partner Logos</p>
          <button
            type="button"
            onClick={add}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors"
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Partner
          </button>
        </div>

        <div className="space-y-3">
          {partners.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-600 rounded-xl">
              {/* Logo preview / upload */}
              <div
                className="shrink-0 w-16 h-12 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-700 overflow-hidden cursor-pointer relative"
                onClick={() => logoRefs.current[i]?.click()}
                title="Click to upload logo"
              >
                {p.logo_url ? (
                  <Image src={p.logo_url} alt={p.name} fill className="object-contain p-1" unoptimized />
                ) : uploading === i ? (
                  <div className="w-4 h-4 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-slate-300">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                )}
                <input
                  ref={el => { logoRefs.current[i] = el }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label={`Upload logo for ${p.name || `partner ${i + 1}`}`}
                  onChange={e => { const f = e.target.files?.[0]; if (f) onLogoFileSelected(i, f); e.target.value = '' }}
                />
              </div>

              {/* Name */}
              <input
                type="text"
                value={p.name}
                onChange={e => updateName(i, e.target.value)}
                placeholder="Partner name"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
              />

              {/* Reorder */}
              <div className="flex flex-col gap-0.5">
                <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="18 15 12 9 6 15"/></svg>
                </button>
                <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === partners.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-20">
                  <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              </div>

              {/* Delete */}
              <button
                type="button"
                aria-label="Remove partner"
                onClick={() => remove(i)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          ))}

          {partners.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6 border border-dashed border-slate-200 dark:border-slate-600 rounded-xl">
              No partners yet — click &quot;Add Partner&quot; to get started.
            </p>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

// ── Section Backgrounds tab ───────────────────────────────────────────────────

const SECTION_GROUPS = [
  {
    label: 'Homepage',
    sections: [
      { key: 'section_bg_what_we_do',  label: 'What We Do',  hint: 'Service cards section.',        aspect: 21 / 9 },
      { key: 'section_bg_our_process', label: 'Our Process', hint: '4-step process section.',       aspect: 21 / 9 },
      { key: 'section_bg_trust_strip', label: 'Trust Strip', hint: 'Developer logos scroll strip.', aspect: 21 / 9 },
    ],
  },
  {
    label: 'Page Heroes',
    sections: [
      { key: 'section_bg_hero_about',       label: 'About',       hint: 'Hero banner on the About page.',       aspect: 21 / 9 },
      { key: 'section_bg_hero_contact',     label: 'Contact',     hint: 'Hero banner on the Contact page.',     aspect: 21 / 9 },
      { key: 'section_bg_hero_investments', label: 'Investments', hint: 'Hero banner on the Investments page.', aspect: 21 / 9 },
      { key: 'section_bg_hero_properties',  label: 'Properties',  hint: 'Hero banner on the Properties page.',  aspect: 21 / 9 },
      { key: 'section_bg_hero_blog',        label: 'Blog',        hint: 'Hero banner on the Blog page.',        aspect: 21 / 9 },
      { key: 'section_bg_hero_locations',   label: 'Locations',   hint: 'Hero banner on the Locations page.',   aspect: 21 / 9 },
    ],
  },
  {
    label: 'About Page',
    sections: [
      { key: 'section_bg_about_difference', label: 'Our Difference', hint: 'Feature cards mid-page.', aspect: 21 / 9 },
      { key: 'section_bg_about_cta',        label: 'Bottom CTA',     hint: '"Let\'s build" banner.',  aspect: 21 / 9 },
    ],
  },
  {
    label: 'Investments Page',
    sections: [
      { key: 'section_bg_investments_strategies', label: 'Strategy Cards', hint: 'Investment type cards section.', aspect: 21 / 9 },
    ],
  },
]

function SectionsBgTab({ values, set }: { values: Settings; set: (k: string, v: string) => void }) {
  return (
    <div className="p-6 space-y-8">
      {SECTION_GROUPS.map(group => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">{group.label}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.sections.map(s => (
              <SectionBgEditor
                key={s.key}
                label={s.label}
                hint={s.hint}
                aspect={s.aspect}
                value={values[s.key] ?? null}
                onChange={v => set(s.key, v)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
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
        {/* Tab nav */}
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

            {/* Custom tab bodies */}
            {currentTab.id === 'theme'    && <ThemeTab    values={values} set={set} />}
            {currentTab.id === 'images'   && <SectionImagesTab values={values} set={set} />}
            {currentTab.id === 'sections' && <SectionsBgTab values={values} set={set} />}
            {currentTab.id === 'partners' && <PartnersTab values={values} set={set} />}

            {/* Standard field tabs */}
            {!currentTab.custom && (
              <div className="p-6 space-y-5">
                {currentTab.fields?.map(field => (
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
            )}

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
