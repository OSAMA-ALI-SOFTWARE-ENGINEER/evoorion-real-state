'use client'

import { useEffect, useState } from 'react'
import { getSettings, updateSettings, getRegions } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { IconCheck } from '@/components/ui/icons'
import type { Region } from '@/types'

type Locale = 'en' | 'ar' | 'de'
type ActiveTab = Locale | 'regions'

interface FieldDef {
  key: string[]
  label: string
  multiline?: boolean
  dir?: 'ltr' | 'rtl'
}

interface SectionDef {
  id: string
  title: string
  fields: FieldDef[]
}

const SECTIONS: SectionDef[] = [
  {
    id: 'hero',
    title: 'Hero Section',
    fields: [
      { key: ['hero', 'eyebrow'],     label: 'Eyebrow label' },
      { key: ['hero', 'line1'],       label: 'Headline line 1' },
      { key: ['hero', 'line2'],       label: 'Headline line 2 (italic/gold)' },
      { key: ['hero', 'subtext'],     label: 'Sub-text paragraph', multiline: true },
      { key: ['hero', 'ctaPrimary'],  label: 'Primary CTA button' },
      { key: ['hero', 'ctaSecondary'],label: 'Secondary CTA button' },
      { key: ['hero', 'statPropertiesSold'],   label: 'Stat label — Properties Sold' },
      { key: ['hero', 'statTransactions'],     label: 'Stat label — Transactions' },
      { key: ['hero', 'statClientSatisfaction'],label: 'Stat label — Client Satisfaction' },
    ],
  },
  {
    id: 'nav',
    title: 'Navigation',
    fields: [
      { key: ['nav', 'home'],              label: 'Home' },
      { key: ['nav', 'investments'],       label: 'Investments' },
      { key: ['nav', 'portfolio'],         label: 'Portfolio' },
      { key: ['nav', 'browseProperties'],  label: 'Browse Properties (mega-menu title)' },
      { key: ['nav', 'browsePropertiesDesc'], label: 'Browse Properties description' },
      { key: ['nav', 'exploreLocations'],    label: 'Explore Locations (mega-menu title)' },
      { key: ['nav', 'exploreLocationsDesc'],label: 'Explore Locations description' },
      { key: ['nav', 'blog'],    label: 'Blog' },
      { key: ['nav', 'about'],   label: 'About' },
      { key: ['nav', 'contact'], label: 'Contact' },
      { key: ['nav', 'signIn'],  label: 'Sign In' },
      { key: ['nav', 'bookCall'],        label: 'Book Call (mobile)' },
      { key: ['nav', 'bookPrivateCall'], label: 'Book Private Call (desktop)' },
      { key: ['nav', 'searchPlaceholder'], label: 'Search placeholder text' },
    ],
  },
  {
    id: 'whatWeDo',
    title: 'What We Do Section',
    fields: [
      { key: ['whatWeDo', 'eyebrow'],   label: 'Eyebrow label' },
      { key: ['whatWeDo', 'headline1'], label: 'Headline line 1' },
      { key: ['whatWeDo', 'headline2'], label: 'Headline line 2 (italic/gold)' },
      { key: ['whatWeDo', 'body'],      label: 'Body paragraph', multiline: true },
      { key: ['whatWeDo', 'service1Title'], label: 'Service 1 — Title' },
      { key: ['whatWeDo', 'service1Desc'],  label: 'Service 1 — Description', multiline: true },
      { key: ['whatWeDo', 'service2Title'], label: 'Service 2 — Title' },
      { key: ['whatWeDo', 'service2Desc'],  label: 'Service 2 — Description', multiline: true },
      { key: ['whatWeDo', 'service3Title'], label: 'Service 3 — Title' },
      { key: ['whatWeDo', 'service3Desc'],  label: 'Service 3 — Description', multiline: true },
    ],
  },
  {
    id: 'whyDubai',
    title: 'Why Invest in Dubai Section',
    fields: [
      { key: ['whyDubai', 'eyebrow'],   label: 'Eyebrow label' },
      { key: ['whyDubai', 'headline1'], label: 'Headline line 1' },
      { key: ['whyDubai', 'headline2'], label: 'Headline line 2 (italic/gold)' },
      { key: ['whyDubai', 'stat1Value'], label: 'Stat 1 — Value' },
      { key: ['whyDubai', 'stat1Label'], label: 'Stat 1 — Label' },
      { key: ['whyDubai', 'stat1Desc'],  label: 'Stat 1 — Description' },
      { key: ['whyDubai', 'stat2Value'], label: 'Stat 2 — Value' },
      { key: ['whyDubai', 'stat2Label'], label: 'Stat 2 — Label' },
      { key: ['whyDubai', 'stat2Desc'],  label: 'Stat 2 — Description' },
      { key: ['whyDubai', 'stat3Value'], label: 'Stat 3 — Value' },
      { key: ['whyDubai', 'stat3Label'], label: 'Stat 3 — Label' },
      { key: ['whyDubai', 'stat3Desc'],  label: 'Stat 3 — Description' },
      { key: ['whyDubai', 'stat4Value'], label: 'Stat 4 — Value' },
      { key: ['whyDubai', 'stat4Label'], label: 'Stat 4 — Label' },
      { key: ['whyDubai', 'stat4Desc'],  label: 'Stat 4 — Description' },
    ],
  },
  {
    id: 'process',
    title: 'The Process Section',
    fields: [
      { key: ['process', 'eyebrow'],   label: 'Eyebrow label' },
      { key: ['process', 'headline1'], label: 'Headline line 1' },
      { key: ['process', 'headline2'], label: 'Headline line 2 (italic/gold)' },
      { key: ['process', 'step'],      label: '"Step" label (inside circles)' },
      { key: ['process', 'step1Title'], label: 'Step 1 — Title' },
      { key: ['process', 'step1Desc'],  label: 'Step 1 — Description', multiline: true },
      { key: ['process', 'step2Title'], label: 'Step 2 — Title' },
      { key: ['process', 'step2Desc'],  label: 'Step 2 — Description', multiline: true },
      { key: ['process', 'step3Title'], label: 'Step 3 — Title' },
      { key: ['process', 'step3Desc'],  label: 'Step 3 — Description', multiline: true },
      { key: ['process', 'step4Title'], label: 'Step 4 — Title' },
      { key: ['process', 'step4Desc'],  label: 'Step 4 — Description', multiline: true },
    ],
  },
  {
    id: 'footer',
    title: 'Footer',
    fields: [
      { key: ['footer', 'tagline'],          label: 'Brand tagline', multiline: true },
      { key: ['footer', 'quickLinks'],        label: 'Column heading — Quick Links' },
      { key: ['footer', 'investments'],       label: 'Column heading — Investments' },
      { key: ['footer', 'contactUs'],         label: 'Column heading — Contact' },
      { key: ['footer', 'officeHours'],       label: 'Office Hours label' },
      { key: ['footer', 'offPlanProperties'], label: 'Link — Off-Plan Properties' },
      { key: ['footer', 'readyProperties'],   label: 'Link — Ready Properties' },
      { key: ['footer', 'privateAdvisory'],   label: 'Link — Private Advisory' },
      { key: ['footer', 'browseAll'],         label: 'Link — Browse All' },
      { key: ['footer', 'serving'],           label: 'Serving locations strip', multiline: true },
      { key: ['footer', 'rights'],            label: 'Copyright suffix' },
      { key: ['footer', 'privacy'],           label: 'Privacy Policy' },
      { key: ['footer', 'terms'],             label: 'Terms of Service' },
    ],
  },
  {
    id: 'common',
    title: 'Common UI Labels',
    fields: [
      { key: ['common', 'loading'],          label: 'Loading…' },
      { key: ['common', 'error'],            label: 'Generic error message' },
      { key: ['common', 'noResults'],        label: 'No results' },
      { key: ['common', 'viewAll'],          label: 'View All' },
      { key: ['common', 'learnMore'],        label: 'Learn More' },
      { key: ['common', 'getInTouch'],       label: 'Get in Touch' },
      { key: ['common', 'signOut'],          label: 'Sign Out' },
      { key: ['common', 'savedProperties'],  label: 'Saved Properties' },
      { key: ['common', 'myEnquiries'],      label: 'My Enquiries' },
    ],
  },
]

const LOCALE_META: Record<Locale, { label: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English',  flag: '🇬🇧', dir: 'ltr' },
  ar: { label: 'Arabic',   flag: '🇦🇪', dir: 'rtl' },
  de: { label: 'German',   flag: '🇩🇪', dir: 'ltr' },
}

type Translations = Record<string, Record<string, string>>

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'

function getNestedValue(obj: Translations, path: string[]): string {
  let cur: unknown = obj
  for (const k of path) {
    if (!cur || typeof cur !== 'object') return ''
    cur = (cur as Record<string, unknown>)[k]
  }
  return typeof cur === 'string' ? cur : ''
}

function setNestedValue(obj: Translations, path: string[], value: string): Translations {
  const [section, field] = path
  return {
    ...obj,
    [section]: {
      ...(obj[section] ?? {}),
      [field]: value,
    },
  }
}

export default function TranslationsPage() {
  const { user: me } = useAuth()
  const [activeTab, setActiveTab] = useState<ActiveTab>('en')
  const [allTranslations, setAllTranslations] = useState<Record<Locale, Translations>>({
    en: {}, ar: {}, de: {},
  })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id)
  const [regions,    setRegions]    = useState<Region[]>([])
  const [openRegion, setOpenRegion] = useState<string | null>(null)
  const [settings,   setSettings]   = useState<Record<string, string>>({})

  useEffect(() => {
    getSettings()
      .then(res => {
        const data = res.data ?? {}
        const parsed: Record<Locale, Translations> = { en: {}, ar: {}, de: {} }
        for (const locale of ['en', 'ar', 'de'] as Locale[]) {
          const raw = data[`translations_${locale}`]
          if (raw) {
            try { parsed[locale] = JSON.parse(raw) } catch { /* use empty */ }
          }
        }
        setAllTranslations(parsed)
        // Store all settings (including region keys) for the Regions tab
        const flat: Record<string, string> = {}
        for (const [k, v] of Object.entries(data)) {
          if (v != null) flat[k] = v
        }
        setSettings(flat)
      })
      .catch(() => setError('Failed to load translations'))
      .finally(() => setLoading(false))
    getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
  }, [])

  if (me?.role !== 'super_admin') {
    return (
      <div className="py-24 text-center">
        <p className="text-slate-400">Super admin access required.</p>
      </div>
    )
  }

  async function save() {
    setError(''); setSaving(true); setSaved(false)
    try {
      const payload: Record<string, string> = {}
      for (const locale of ['en', 'ar', 'de'] as Locale[]) {
        payload[`translations_${locale}`] = JSON.stringify(allTranslations[locale])
      }
      await updateSettings(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  async function handleSave() {
    setError(''); setSaving(true); setSaved(false)
    try {
      // Save only region-related keys from settings
      const regionKeys: Record<string, string> = {}
      for (const [k, v] of Object.entries(settings)) {
        if (k.startsWith('region_')) regionKeys[k] = v
      }
      await updateSettings(regionKeys)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  function setValue(path: string[], value: string) {
    setAllTranslations(prev => ({
      ...prev,
      [activeTab as Locale]: setNestedValue(prev[activeTab as Locale], path, value),
    }))
  }

  function getValue(path: string[]): string {
    return getNestedValue(allTranslations[activeTab as Locale], path)
  }

  const activeLocale = activeTab as Locale
  const meta = activeTab !== 'regions' ? LOCALE_META[activeLocale] : LOCALE_META['en']
  const currentSection = SECTIONS.find(s => s.id === activeSection) ?? SECTIONS[0]

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-2">
          {['en', 'ar', 'de', 'regions'].map(l => (
            <div key={l} className="h-9 w-28 bg-slate-100 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
        <div className="h-[500px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Locale tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.entries(LOCALE_META) as [Locale, typeof LOCALE_META[Locale]][]).map(([locale, lm]) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActiveTab(locale)}
            className={[
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === locale
                ? 'bg-[#C9A84C] text-slate-900'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#C9A84C]',
            ].join(' ')}
          >
            <span>{lm.flag}</span>
            {lm.label}
            {activeTab === locale && lm.dir === 'rtl' && (
              <span className="text-xs opacity-70">(RTL)</span>
            )}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setActiveTab('regions')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'regions' ? 'bg-[#C9A84C] text-slate-900' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#C9A84C]'}`}
        >
          Regions
        </button>

        <div className="ml-auto">
          <button
            type="button"
            onClick={activeTab === 'regions' ? handleSave : save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm disabled:opacity-50"
          >
            {saved ? (
              <><IconCheck size={15} /> Saved</>
            ) : saving ? (
              'Saving…'
            ) : activeTab === 'regions' ? (
              'Save Regions'
            ) : (
              'Save All Locales'
            )}
          </button>
        </div>
      </div>

      {activeTab !== 'regions' && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Section nav */}
          <nav className="flex flex-row sm:flex-col gap-1 sm:w-48 sm:shrink-0 overflow-x-auto pb-1 sm:pb-0">
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={[
                  'shrink-0 sm:w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                  activeSection === sec.id
                    ? 'bg-[#C9A84C]/10 text-[#C9A84C]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                ].join(' ')}
              >
                {sec.title}
              </button>
            ))}
          </nav>

          {/* Fields */}
          <div className="flex-1 min-w-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <span className="text-lg">{meta.flag}</span>
              <div>
                <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {meta.label} — {currentSection.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {meta.dir === 'rtl' ? 'Text direction: Right-to-Left' : 'Text direction: Left-to-Right'}
                </p>
              </div>
            </div>

            {/* Field list */}
            <div className="p-6 space-y-5" dir={meta.dir}>
              {currentSection.fields.map(field => {
                const val = getValue(field.key)
                return (
                  <div key={field.key.join('.')}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      {field.label}
                      <span className="ml-2 font-mono text-[10px] text-slate-400">
                        {field.key.join('.')}
                      </span>
                    </label>
                    {field.multiline ? (
                      <textarea
                        rows={3}
                        title={field.label}
                        value={val}
                        onChange={e => setValue(field.key, e.target.value)}
                        dir={meta.dir}
                        className={inp + ' resize-y'}
                      />
                    ) : (
                      <input
                        type="text"
                        title={field.label}
                        value={val}
                        onChange={e => setValue(field.key, e.target.value)}
                        dir={meta.dir}
                        className={inp}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'regions' && (
        <div className="space-y-3">
          {regions.filter(r => r.is_active).length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-400 text-sm">No regions configured.</p>
              <a href="/regions" className="text-[#C9A84C] text-sm hover:underline">Go to Regions →</a>
            </div>
          ) : regions.filter(r => r.is_active).map(region => {
            const fields = [
              { key: `region_${region.code}_hero_title`,             label: 'Hero Title' },
              { key: `region_${region.code}_hero_subtitle`,          label: 'Hero Subtitle' },
              { key: `region_${region.code}_investment_description`, label: 'Investment Description', multiline: true },
              { key: `region_${region.code}_cta_label`,             label: 'CTA Button Label' },
              { key: `region_${region.code}_whatsapp`,              label: 'WhatsApp Number (fallback for properties without a broker)' },
              { key: `region_${region.code}_contact_email`,         label: 'Contact Email (fallback for properties without a broker)' },
            ]
            return (
              <div key={region.code} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenRegion(openRegion === region.code ? null : region.code)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {region.flag && <span className="text-lg">{region.flag}</span>}
                    <span className="font-medium text-slate-800 dark:text-slate-100">{region.name}</span>
                    <span className="text-xs text-slate-400 uppercase">{region.code}</span>
                  </div>
                  <span className="text-slate-400">{openRegion === region.code ? '▲' : '▼'}</span>
                </button>
                {openRegion === region.code && (
                  <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                    {fields.map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
                          {field.label}
                        </label>
                        {field.multiline ? (
                          <textarea
                            rows={3}
                            title={field.label}
                            value={settings[field.key] ?? ''}
                            onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        ) : (
                          <input
                            type="text"
                            title={field.label}
                            value={settings[field.key] ?? ''}
                            onChange={e => setSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                          />
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-5 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm"
                    >
                      Save Region Copy
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Empty fields fall back to the built-in default translations. Only non-empty values override the defaults.
        Changes take effect within 5 minutes (cached).
      </p>
    </div>
  )
}
