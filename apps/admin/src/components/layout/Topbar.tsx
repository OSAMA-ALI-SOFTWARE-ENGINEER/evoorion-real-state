'use client'

import { usePathname } from 'next/navigation'
import { IconMenu } from '@/components/ui/icons'

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
}

function getTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Prefix match for nested routes
  const prefix = Object.keys(PAGE_TITLES).find(
    k => k !== '/dashboard' && pathname.startsWith(k),
  )
  return prefix ? PAGE_TITLES[prefix] : 'Admin'
}

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname()
  const title    = getTitle(pathname)

  return (
    <header className="h-16 flex items-center gap-4 px-6 bg-white border-b border-slate-200 shrink-0">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
        aria-label="Open menu"
      >
        <IconMenu size={20} />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-slate-800">{title}</h1>
    </header>
  )
}
