'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import {
  IconActivity,
  IconBarChart,
  IconBell,
  IconBriefcase,
  IconBuilding,
  IconCoin,
  IconDashboard,
  IconFileText,
  IconGlobe,
  IconLayers,
  IconLogOut,
  IconMapPin,
  IconImage,
  IconSettings,
  IconSliders,
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
      { label: 'Currencies',       href: '/currencies',       icon: <IconCoin />,    roles: ['manager', 'super_admin'] },
      { label: 'Languages',        href: '/languages',        icon: <IconGlobe />,   roles: ['manager', 'super_admin'] },
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
      { label: 'Media',    href: '/media',    icon: <IconImage />,     roles: ['manager', 'super_admin'] },
      { label: 'CMS',      href: '/cms',      icon: <IconSliders />,   roles: ['super_admin'] },
      { label: 'Settings', href: '/settings', icon: <IconSettings />, roles: ['super_admin'] },
    ],
  },
  {
    group: 'Account',
    items: [
      { label: 'My Profile', href: '/profile', icon: <IconUser /> },
    ],
  },
]

interface SidebarProps {
  onClose?:   () => void
  collapsed?: boolean
}

export function Sidebar({ onClose, collapsed = false }: SidebarProps) {
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
    <aside className={`flex flex-col h-full bg-[#0F172A] shrink-0 overflow-hidden transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center h-16 border-b border-white/5 shrink-0 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        {collapsed ? (
          <div className="relative w-8 h-8">
            <Image src="/logos/logomark.png" alt="EVOORION" fill className="object-contain" sizes="32px" />
          </div>
        ) : (
          <div className="relative h-8 w-36">
            <Image src="/logos/primary-logo.png" alt="EVOORION" fill className="object-contain object-left" sizes="144px" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {NAV.map((section, si) => {
          const visibleItems = section.items.filter(canSee)
          if (!visibleItems.length) return null
          return (
            <div key={si}>
              {section.group && !collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {section.group}
                </p>
              )}
              {section.group && collapsed && (
                <div className="mx-2 mb-1.5 h-px bg-white/5" />
              )}
              <ul className="space-y-0.5">
                {visibleItems.map(item => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        title={collapsed ? item.label : undefined}
                        className={[
                          'flex items-center rounded-lg text-sm transition-colors',
                          collapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2',
                          active
                            ? 'bg-[#C9A84C]/15 text-[#C9A84C] font-medium'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
                        ].join(' ')}
                      >
                        <span className={`shrink-0 ${active ? 'text-[#C9A84C]' : 'text-slate-500'}`}>
                          {item.icon}
                        </span>
                        {!collapsed && item.label}
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
      <div className="shrink-0 border-t border-white/5 p-2">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 flex items-center justify-center">
              <span className="text-[#C9A84C] text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase() ?? 'A'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
              aria-label="Sign out"
            >
              <IconLogOut size={15} />
            </button>
          </div>
        ) : (
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
        )}
      </div>
    </aside>
  )
}
