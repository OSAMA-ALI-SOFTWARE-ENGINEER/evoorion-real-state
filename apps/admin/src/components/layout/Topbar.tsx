'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { getUnreadCount, getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api'
import type { Notification } from '@/types'
import { IconBell, IconMenu } from '@/components/ui/icons'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/properties':      'Properties',
  '/leads':           'Leads',
  '/areas':           'Areas',
  '/developers':      'Developers',
  '/operation-types': 'Operation Types',
  '/agencies':        'Agencies & Agents',
  '/users':           'Users',
  '/reports':         'Reports',
  '/notifications':   'Notifications',
  '/activity-logs':   'Activity Logs',
  '/blog':            'Blog',
  '/settings':        'Settings',
}

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const prefix = Object.keys(PAGE_TITLES).find(
    k => k !== '/dashboard' && pathname.startsWith(k),
  )
  return prefix ? PAGE_TITLES[prefix] : 'Admin'
}

function fmtNotifTime(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function NotifPanel({ onClose }: { onClose: () => void }) {
  const [notifs,   setNotifs]   = useState<Notification[]>([])
  const [loading,  setLoading]  = useState(true)
  const [marking,  setMarking]  = useState(false)

  useEffect(() => {
    getNotifications()
      .then(res => setNotifs(res.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function markRead(id: string) {
    await markNotificationRead(id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
  }

  async function markAll() {
    setMarking(true)
    try {
      await markAllNotificationsRead()
      setNotifs(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
    } finally { setMarking(false) }
  }

  const unread = notifs.filter(n => !n.read_at).length

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <p className="text-sm font-semibold text-slate-800">
          Notifications {unread > 0 && <span className="text-[#C9A84C]">({unread})</span>}
        </p>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            disabled={marking}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
        {loading ? (
          <div className="py-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifs.length === 0 ? (
          <p className="px-4 py-6 text-center text-slate-400 text-sm">No notifications.</p>
        ) : notifs.map(n => {
          const isUnread = !n.read_at
          const data = n.data as Record<string, string>
          return (
            <div
              key={n.id}
              onClick={() => { if (isUnread) markRead(n.id) }}
              className={`px-4 py-3 cursor-pointer transition-colors ${isUnread ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-start gap-2">
                {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0" />}
                <div className={isUnread ? '' : 'pl-3.5'}>
                  <p className="text-sm text-slate-800 font-medium leading-snug">
                    {data.message ?? n.type.split('\\').pop()}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{fmtNotifTime(n.created_at)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const title    = getTitle(pathname)

  const [open,      setOpen]      = useState(false)
  const [unread,    setUnread]    = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchUnread = useCallback(() => {
    getUnreadCount()
      .then(res => setUnread((res.data as { count: number }).count ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchUnread()
    const id = setInterval(fetchUnread, 60_000)
    return () => clearInterval(id)
  }, [fetchUnread])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-16 flex items-center gap-4 px-6 bg-white border-b border-slate-200 shrink-0">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
        aria-label="Open menu"
      >
        <IconMenu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-slate-800 flex-1">{title}</h1>

      {/* Notification bell */}
      <div ref={panelRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Notifications"
        >
          <IconBell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C9A84C] text-slate-900 text-[10px] font-bold flex items-center justify-center leading-none">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        {open && <NotifPanel onClose={() => setOpen(false)} />}
      </div>
    </header>
  )
}
