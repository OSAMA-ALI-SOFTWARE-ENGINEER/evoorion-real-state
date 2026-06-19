'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getUnreadCount, getNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api'
import type { Notification } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { useTheme, type Theme } from '@/context/ThemeContext'
import {
  IconBell,
  IconMenu,
  IconPanelLeft,
  IconPanelLeftOpen,
  IconSun,
  IconMoon,
  IconMonitor,
  IconLogOut,
  IconSettings,
  IconUser,
} from '@/components/ui/icons'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':       'Dashboard',
  '/properties':      'Properties',
  '/leads':           'Leads',
  '/areas':           'Areas',
  '/developers':      'Developers',
  '/operation-types': 'Operation Types',
  '/currencies':      'Currencies',
  '/languages':       'Languages',
  '/agencies':        'Agencies & Agents',
  '/users':           'Users',
  '/reports':         'Reports',
  '/notifications':   'Notifications',
  '/activity-logs':   'Activity Logs',
  '/blog':            'Blog',
  '/media':           'Media Library',
  '/cms':             'CMS',
  '/settings':        'Settings',
  '/profile':         'My Profile',
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
  const [notifs,  setNotifs]  = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

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
    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
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

      <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700">
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
              className={`px-4 py-3 cursor-pointer transition-colors ${isUnread ? 'bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}
            >
              <div className="flex items-start gap-2">
                {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C] mt-1.5 shrink-0" />}
                <div className={isUnread ? '' : 'pl-3.5'}>
                  <p className="text-sm text-slate-800 dark:text-slate-100 font-medium leading-snug">
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

// ── Theme toggle ──────────────────────────────────────────────────────────────

const THEME_OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light',  icon: <IconSun size={14} />,     label: 'Light'  },
  { value: 'dark',   icon: <IconMoon size={14} />,    label: 'Dark'   },
  { value: 'system', icon: <IconMonitor size={14} />, label: 'System' },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen]     = useState(false)
  const ref                 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = THEME_OPTIONS.find(o => o.value === theme) ?? THEME_OPTIONS[2]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {current.icon}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden py-1">
          {THEME_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { setTheme(o.value); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                theme === o.value
                  ? 'text-[#C9A84C] bg-amber-50 dark:bg-amber-900/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <span className={theme === o.value ? 'text-[#C9A84C]' : ''}>{o.icon}</span>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── User menu ─────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen]  = useState(false)
  const ref              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        aria-label="User menu"
      >
        {user.avatar_url ? (
          <Image src={user.avatar_url} alt={user.name} width={28} height={28} className="rounded-full object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/40 flex items-center justify-center text-[#C9A84C] text-xs font-semibold">
            {initials}
          </div>
        )}
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[120px]">{user.name}</p>
          <p className="text-[10px] text-slate-400 capitalize leading-tight">{user.role.replace('_', ' ')}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <div className="p-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <IconUser size={15} />
              My Profile
            </Link>
            {user.role === 'super_admin' && (
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <IconSettings size={15} />
                Settings
              </Link>
            )}
            <button
              type="button"
              onClick={async () => { setOpen(false); await logout() }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <IconLogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Topbar ────────────────────────────────────────────────────────────────────

interface TopbarProps {
  onMenuClick:       () => void
  onCollapseClick?:  () => void
  sidebarCollapsed?: boolean
}

export function Topbar({ onMenuClick, onCollapseClick, sidebarCollapsed }: TopbarProps) {
  const pathname = usePathname()
  const title    = getTitle(pathname)

  const [open,   setOpen]   = useState(false)
  const [unread, setUnread] = useState(0)
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
    <header className="h-16 flex items-center gap-3 px-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
      {/* Mobile menu */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        aria-label="Open menu"
      >
        <IconMenu size={20} />
      </button>

      {/* Desktop sidebar collapse toggle */}
      {onCollapseClick && (
        <button
          type="button"
          onClick={onCollapseClick}
          className="hidden lg:flex p-2 -ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <IconPanelLeftOpen size={20} /> : <IconPanelLeft size={20} />}
        </button>
      )}

      {/* Page title */}
      <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 flex-1">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <div ref={panelRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  )
}
