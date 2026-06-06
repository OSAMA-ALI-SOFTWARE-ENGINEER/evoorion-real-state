'use client'

import { useCallback, useEffect, useState } from 'react'
import { getUsers, updateUser, deleteUser, restoreUser } from '@/lib/api'
import type { AdminUser, UserRole } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useAuth } from '@/context/AuthContext'

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  manager:     'Manager',
  agent:       'Agent',
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-50 text-purple-700',
  manager:     'bg-blue-50 text-blue-700',
  agent:       'bg-slate-100 text-slate-700',
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface EditModalProps {
  user: AdminUser
  onSave: (data: { role: UserRole; is_active: boolean }) => Promise<void>
  onClose: () => void
}

function EditModal({ user, onSave, onClose }: EditModalProps) {
  const [role,     setRole]     = useState<UserRole>(user.role)
  const [active,   setActive]   = useState(user.is_active)
  const [error,    setError]    = useState('')
  const [saving,   setSaving]   = useState(false)

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

  const inp = 'w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] bg-white'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">{user.name}</h3>
        <p className="text-slate-400 text-xs mb-5">{user.email}</p>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className={inp}>
              <option value="agent">Agent</option>
              <option value="manager">Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="w-4 h-4 accent-[#C9A84C]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Active account</label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
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
  const [users,     setUsers]     = useState<AdminUser[]>([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editing,   setEditing]   = useState<AdminUser | null>(null)
  const [toDelete,  setToDelete]  = useState<AdminUser | null>(null)
  const [toRestore, setToRestore] = useState<AdminUser | null>(null)
  const [acting,    setActing]    = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    const params: { search?: string; role?: string } = {}
    if (search)     params.search = search
    if (roleFilter) params.role   = roleFilter
    getUsers(params)
      .then(res => setUsers(res.data ?? []))
      .finally(() => setLoading(false))
  }, [search, roleFilter])

  useEffect(load, [load])

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
        <p className="text-slate-400">Super admin access required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:outline-none focus:border-[#C9A84C]"
        />
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#C9A84C] bg-white"
        >
          <option value="">All roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="manager">Manager</option>
          <option value="agent">Agent</option>
        </select>
        <span className="text-slate-400 text-sm ml-auto">{users.length} user{users.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Joined</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-5 py-3.5"><div className="h-3.5 bg-slate-100 rounded w-28" /></td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No users found.</td></tr>
            ) : users.map(u => {
              const isDeleted = !!u.deleted_at
              const isSelf    = u.id === me?.id
              return (
                <tr key={u.id} className={`hover:bg-slate-50 ${isDeleted ? 'opacity-60' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${ROLE_COLORS[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      isDeleted ? 'bg-red-50 text-red-600'
                      : u.is_active ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                    }`}>
                      {isDeleted ? 'Deleted' : u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{fmt(u.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      {!isDeleted && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditing(u)}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Edit
                          </button>
                          {!isSelf && (
                            <>
                              <span className="text-slate-200">|</span>
                              <button
                                type="button"
                                onClick={() => setToDelete(u)}
                                className="text-xs text-red-500 hover:text-red-600 font-medium"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {isDeleted && (
                        <button
                          type="button"
                          onClick={() => setToRestore(u)}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Restore
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
          title="Delete user"
          message={`Delete "${toDelete.name}"? They will be soft-deleted and lose access.`}
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
        />
      )}
    </div>
  )
}
