'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { getUsers, updateUser, deleteUser, restoreUser } from '@/lib/api'
import type { AdminUser, UserRole } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { useAuth } from '@/context/AuthContext'
import { IconSearch, IconPencil, IconTrash, IconRotateCcw, IconUser, IconUsers, IconShield } from '@/components/ui/icons'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  manager:     'Manager',
  agent:       'Agent',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  manager:     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  agent:       'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100'

const ROLE_OPTIONS = [
  { value: '',            label: 'All roles',   icon: <IconUsers size={14} /> },
  { value: 'super_admin', label: 'Super Admin', icon: <IconShield size={14} /> },
  { value: 'manager',     label: 'Manager',     icon: <IconUser size={14} /> },
  { value: 'agent',       label: 'Agent',       icon: <IconUser size={14} /> },
]

const STATUS_OPTIONS = [
  { value: '',       label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted', label: 'Deleted' },
]

interface EditModalProps {
  user: AdminUser
  onSave: (data: { role: UserRole; is_active: boolean }) => Promise<void>
  onClose: () => void
}

function EditModal({ user, onSave, onClose }: EditModalProps) {
  const [role,   setRole]   = useState<UserRole>(user.role)
  const [active, setActive] = useState(user.is_active)
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const ROLE_SELECT_OPTIONS = [
    { value: 'agent',       label: 'Agent',      icon: <IconUser size={14} /> },
    { value: 'manager',     label: 'Manager',    icon: <IconUser size={14} /> },
    { value: 'super_admin', label: 'Super Admin', icon: <IconShield size={14} /> },
  ]

  async function submit() {
    setError('')
    setSaving(true)
    try {
      await onSave({ role, is_active: active })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">{user.name}</h3>
        <p className="text-slate-400 text-xs mb-5">{user.email}</p>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Role</label>
            <CustomSelect
              value={role}
              onChange={v => setRole(v as UserRole)}
              options={ROLE_SELECT_OPTIONS}
            />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
            <input
              type="checkbox"
              id="is_active"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 accent-[#C9A84C]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700 dark:text-slate-200">Active account</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={saving} className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 text-sm font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { user: me } = useAuth()
  const [users,       setUsers]       = useState<AdminUser[]>([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('')
  const [statusFilter,setStatusFilter]= useState('')
  const [editing,     setEditing]     = useState<AdminUser | null>(null)
  const [toDelete,    setToDelete]    = useState<AdminUser | null>(null)
  const [toRestore,   setToRestore]   = useState<AdminUser | null>(null)
  const [acting,      setActing]      = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params: Record<string, string> = {}
    if (search)     params.search = search
    if (roleFilter) params.role   = roleFilter
    getUsers(params)
      .then(res => setUsers(res.data ?? []))
      .finally(() => setLoading(false))
  }, [search, roleFilter])

  useEffect(load, [load])

  const filtered = users.filter(u => {
    if (statusFilter === 'active')   return !u.deleted_at && u.is_active
    if (statusFilter === 'inactive') return !u.deleted_at && !u.is_active
    if (statusFilter === 'deleted')  return !!u.deleted_at
    return true
  })

  async function handleSave(data: { role: UserRole; is_active: boolean }) {
    if (!editing) return
    await updateUser(editing.id, data)
    load()
  }

  async function confirmDelete() {
    if (!toDelete) return
    setActing(true)
    try { await deleteUser(toDelete.id); setToDelete(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Deactivate failed') }
    finally { setActing(false) }
  }

  async function confirmRestore() {
    if (!toRestore) return
    setActing(true)
    try { await restoreUser(toRestore.id); setToRestore(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Restore failed') }
    finally { setActing(false) }
  }

  if (me?.role !== 'super_admin') {
    return (
      <div className="py-24 text-center">
        <IconShield size={36} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">Super admin access required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        <Link href="/users/new"
          className="px-4 py-2 rounded-lg bg-[#C9A84C] hover:bg-[#D4B668] text-slate-900 font-semibold text-sm">
          + New User
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm w-64 focus:outline-none focus:border-[#C9A84C] bg-white dark:bg-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <div className="w-44">
          <CustomSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} placeholder="All roles" />
        </div>
        <div className="w-44">
          <CustomSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} placeholder="All statuses" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 dark:bg-slate-700 rounded w-28" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No users found.</td></tr>
            ) : filtered.map(u => {
              const isDeleted = !!u.deleted_at
              const isSelf    = u.id === me?.id
              return (
                <tr key={u.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isDeleted ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#C9A84C]/15 dark:bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                        <span className="text-[#C9A84C] text-xs font-bold">{u.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-100">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isDeleted ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : u.is_active ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {isDeleted ? 'Deleted' : u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{fmt(u.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      {!isDeleted && (
                        <button
                          type="button"
                          onClick={() => setEditing(u)}
                          title="Edit user"
                          className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <IconPencil size={14} />
                        </button>
                      )}
                      {!isDeleted && !isSelf && (
                        <button
                          type="button"
                          onClick={() => setToDelete(u)}
                          title="Deactivate user"
                          className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                      {isDeleted && (
                        <button
                          type="button"
                          onClick={() => setToRestore(u)}
                          title="Restore user"
                          className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          <IconRotateCcw size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal user={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Deactivate user"
          message={`Deactivate "${toDelete.name}"? They will lose access to the admin panel.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
          loading={acting}
        />
      )}
      {toRestore && (
        <ConfirmModal
          title="Restore user"
          message={`Restore "${toRestore.name}" and re-enable their access?`}
          onConfirm={confirmRestore}
          onCancel={() => setToRestore(null)}
          loading={acting}
          danger={false}
        />
      )}
    </div>
  )
}
