'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  IconActivity,
  IconBarChart,
  IconBell,
  IconBriefcase,
  IconBuilding,
  IconDashboard,
  IconFileText,
  IconLayers,
  IconLogOut,
  IconMapPin,
  IconSettings,
  IconTag,
  IconUser,
  IconUsers,
} from '@/components/ui/icons'

interface NavItem {
  label:     string
  href:      string
  icon:      React.ReactNode
  roles?:    string[]
}

const NAV: Array<{ group?: string; items: NavItem[] }> = [
  {
    items: [
      { label: 'Dashboard',   href: '/dashboard',  icon: <IconDashboard /> },
      { label: 'Properties',  href: '/properties', icon: <IconBuilding /> },
      { label: 'Leads',       href: '/leads',      icon: <IconUsers /> },
    ],
  },
  {
    group: 'Master Data',
    items: [
      { label: 'Areas',            href: '/areas',            icon: <IconMapPin />,  roles: ['manager', 'super_admin'] },
      { label: 'Developers',       href: '/developers',       icon: <IconLayers />,  roles: ['manager', 'super_admin'] },
      { label: 'Operation Types',  href: '/operation-types',  icon: <IconTag />,     roles: ['manager', 'super_admin'] },
    ],
  },
  {
    group: 'People',
    items: [
      { label: 'Agencies & Agents', href: '/agencies', icon: <IconBriefcase /> },
      { label: 'Users',             href: '/users',    icon: <IconUser />,  roles: ['super_admin'] },
    ],
  },
  {
    group: 'Insights',
    items: [
      { label: 'Reports',        href: '/reports',        icon: <IconBarChart /> },
      { label: 'Notifications',  href: '/notifications',  icon: <IconBell /> },
      { label: 'Activity Logs',  href: '/activity-logs',  icon: <IconActivity />, roles: ['manager', 'super_admin'] },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Blog',     href: '/blog',     icon: <IconFileText />,  roles: ['manager', 'super_admin'] },
      { label: 'Settings', href: '/settings', icon: <IconSettings />, roles: ['super_admin'] },
    ],
  },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const canSee = (item: NavItem) => {
    if (!item.roles) return true
    if (!user) return false
    return item.roles.includes(user.role)
  }

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  return (
    <aside className="flex flex-col h-full bg-[#0F172A] w-64 shrink-0">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-white/5 shrink-0">
        <span className="text-xl font-bold tracking-wider text-white">
          EV<span className="text-[#C9A84C]">OO</span>RION
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV.map((section, si) => {
          const visibleItems = section.items.filter(canSee)
          if (!visibleItems.length) return null
          return (
            <div key={si}>
              {section.group && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {section.group}
                </p>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map(item => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={[
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                          active
                            ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-medium'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                        ].join(' ')}
                      >
                        <span className={active ? 'text-[#C9A84C]' : 'text-slate-500'}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="shrink-0 border-t border-white/5 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center shrink-0">
            <span className="text-[#C9A84C] text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors shrink-0"
            aria-label="Sign out"
          >
            <IconLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
