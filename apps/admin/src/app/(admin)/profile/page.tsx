'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { useTheme, type Theme } from '@/context/ThemeContext'
import { updateProfile, changePassword } from '@/lib/api'
import { IconUser, IconKey, IconSliders, IconSun, IconMoon, IconMonitor, IconCheck } from '@/components/ui/icons'

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'
const btn = 'px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm disabled:opacity-50 transition-colors'

// ── Profile info section ──────────────────────────────────────────────────────

function ProfileSection() {
  const { user, setSession, token } = useAuth()
  const [name,   setName]   = useState(user?.name ?? '')
  const [email,  setEmail]  = useState(user?.email ?? '')
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState('')

  useEffect(() => {
    setName(user?.name ?? '')
    setEmail(user?.email ?? '')
  }, [user])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      const res = await updateProfile({ name, email })
      if (res.data && token) {
        setSession(token, res.data)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally { setSaving(false) }
  }

  const initials = (user?.name ?? 'A').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <Section title="Profile Information" icon={<IconUser size={16} />}>
      <div className="flex items-center gap-4 mb-6">
        {user?.avatar_url ? (
          <Image src={user.avatar_url} alt={user.name} width={64} height={64} className="rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#C9A84C]/20 border-2 border-[#C9A84C]/30 flex items-center justify-center text-[#C9A84C] text-xl font-bold">
            {initials}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label htmlFor="prof-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
          <input id="prof-name" type="text" required value={name} onChange={e => setName(e.target.value)} className={inp} />
        </div>
        <div>
          <label htmlFor="prof-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
          <input id="prof-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inp} />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className={btn}>{saving ? 'Saving…' : 'Save Changes'}</button>
          {saved && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><IconCheck size={14} /> Saved</span>}
        </div>
      </form>
    </Section>
  )
}

// ── Password section ──────────────────────────────────────────────────────────

function PasswordSection() {
  const [current, setCurrent] = useState('')
  const [next,    setNext]    = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (next !== confirm) { setError('Passwords do not match'); return }
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      await changePassword({ current_password: current, new_password: next, new_password_confirmation: confirm })
      setSaved(true)
      setCurrent(''); setNext(''); setConfirm('')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Change failed')
    } finally { setSaving(false) }
  }

  return (
    <Section title="Change Password" icon={<IconKey size={16} />}>
      <form onSubmit={save} className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div>
          <label htmlFor="pw-current" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
          <input id="pw-current" type="password" required value={current} onChange={e => setCurrent(e.target.value)} className={inp} autoComplete="current-password" />
        </div>
        <div>
          <label htmlFor="pw-new" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">New Password <span className="text-slate-400 font-normal">(min. 8 chars)</span></label>
          <input id="pw-new" type="password" required minLength={8} value={next} onChange={e => setNext(e.target.value)} className={inp} autoComplete="new-password" />
        </div>
        <div>
          <label htmlFor="pw-confirm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
          <input id="pw-confirm" type="password" required minLength={8} value={confirm} onChange={e => setConfirm(e.target.value)} className={inp} autoComplete="new-password" />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className={btn}>{saving ? 'Saving…' : 'Change Password'}</button>
          {saved && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><IconCheck size={14} /> Password changed</span>}
        </div>
      </form>
    </Section>
  )
}

// ── Preferences section ───────────────────────────────────────────────────────

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: 'light',  label: 'Light',  icon: <IconSun size={18} />,     desc: 'Always use light theme' },
  { value: 'dark',   label: 'Dark',   icon: <IconMoon size={18} />,    desc: 'Always use dark theme' },
  { value: 'system', label: 'System', icon: <IconMonitor size={18} />, desc: 'Follow your OS setting' },
]

function PreferencesSection() {
  const { theme, setTheme } = useTheme()
  const [notifLeads,      setNotifLeads]      = useState(() => localStorage.getItem('pref_notif_leads') !== 'false')
  const [notifAssignment, setNotifAssignment] = useState(() => localStorage.getItem('pref_notif_assignment') !== 'false')
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function savePrefs() {
    localStorage.setItem('pref_notif_leads', String(notifLeads))
    localStorage.setItem('pref_notif_assignment', String(notifAssignment))
    setSaved(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Section title="Preferences" icon={<IconSliders size={16} />}>
      <div className="space-y-6">
        {/* Theme */}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Appearance</p>
          <div className="grid grid-cols-3 gap-3">
            {THEME_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setTheme(o.value)}
                className={[
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                  theme === o.value
                    ? 'border-[#C9A84C] bg-amber-50 dark:bg-amber-900/20 text-[#C9A84C]'
                    : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500',
                ].join(' ')}
              >
                {o.icon}
                <span className="text-xs font-semibold">{o.label}</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{o.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Notification Preferences</p>
          <div className="space-y-3">
            {[
              { label: 'New lead assigned to me', desc: 'Get notified when a lead is assigned to you', value: notifLeads, set: setNotifLeads },
              { label: 'Lead status changes', desc: 'Notify when a lead you own changes status', value: notifAssignment, set: setNotifAssignment },
            ].map(pref => (
              <label key={pref.label} className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={pref.value}
                    onChange={e => pref.set(e.target.checked)}
                  />
                  <div className="w-10 h-5 bg-slate-200 dark:bg-slate-600 rounded-full peer-checked:bg-[#C9A84C] transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{pref.label}</p>
                  <p className="text-xs text-slate-400">{pref.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={savePrefs} className={btn}>Save Preferences</button>
          {saved && <span className="text-emerald-600 text-sm font-medium flex items-center gap-1"><IconCheck size={14} /> Saved</span>}
        </div>
      </div>
    </Section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <ProfileSection />
      <PasswordSection />
      <PreferencesSection />
    </div>
  )
}
