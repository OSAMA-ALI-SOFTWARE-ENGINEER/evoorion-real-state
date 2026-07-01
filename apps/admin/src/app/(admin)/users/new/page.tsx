'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createUser, getRegions } from '@/lib/api'
import type { Region } from '@/types'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { useAuth } from '@/context/AuthContext'
import { IconShield } from '@/components/ui/icons'

const ROLE_OPTIONS = [
  { value: 'agent',       label: 'Agent' },
  { value: 'manager',     label: 'Manager' },
  { value: 'super_admin', label: 'Super Admin' },
]

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400'
const lbl = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5'

export default function NewUserPage() {
  const router        = useRouter()
  const { user: me }  = useAuth()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [role,     setRole]     = useState('agent')
  const [active,   setActive]   = useState(true)
  const [error,    setError]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [regions,  setRegions]  = useState<Region[]>([])
  const [regionId, setRegionId] = useState<string>('')

  useEffect(() => {
    getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
  }, [])

  if (me?.role !== 'super_admin') {
    return (
      <div className="py-24 text-center">
        <IconShield size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Super admin access required.</p>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    setSaving(true)
    try {
      await createUser({ name, email, password, password_confirmation: confirm, role, is_active: active, region_id: regionId ? Number(regionId) : null })
      router.push('/users')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => router.push('/users')}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm transition-colors">
          ← Users
        </button>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100">New User</h1>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={lbl}>Name <span className="text-red-400 normal-case">*</span></label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name" className={inp} />
          </div>

          <div>
            <label className={lbl}>Email <span className="text-red-400 normal-case">*</span></label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com" className={inp} />
          </div>

          <div>
            <label className={lbl}>Role <span className="text-red-400 normal-case">*</span></label>
            <CustomSelect value={role} onChange={setRole} options={ROLE_OPTIONS} />
          </div>

          <div>
            <label htmlFor="new-user-region" className={lbl}>Region</label>
            <select
              id="new-user-region"
              value={regionId}
              onChange={e => setRegionId(e.target.value)}
              className={inp}
            >
              <option value="">No region (global)</option>
              {regions.filter(r => r.is_active).map(r => (
                <option key={r.id} value={String(r.id)}>{r.flag} {r.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Password <span className="text-red-400 normal-case">*</span></label>
              <input type="password" required minLength={8} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" className={inp} />
            </div>
            <div>
              <label className={lbl}>Confirm Password <span className="text-red-400 normal-case">*</span></label>
              <input type="password" required minLength={8} value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password" className={inp} />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
            <input type="checkbox" id="is_active" checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 accent-[#C9A84C]" />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Active account (can log in immediately)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.push('/users')}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
              {saving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
