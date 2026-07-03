import type { PropertyStatus, PropertyType, LeadStatus, UserRole } from '@/types'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'slate' | 'gold'

const VARIANTS: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger:  'bg-red-50 text-red-600 border border-red-200',
  info:    'bg-blue-50 text-blue-700 border border-blue-200',
  purple:  'bg-purple-50 text-purple-700 border border-purple-200',
  orange:  'bg-orange-50 text-orange-700 border border-orange-200',
  slate:   'bg-slate-100 text-slate-600 border border-slate-200',
  gold:    'bg-[#C9A84C]/10 text-[#9A7A2E] border border-[#C9A84C]/30',
}

export function Badge({ variant, label, className = '' }: {
  variant: BadgeVariant
  label: string
  className?: string
}) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${VARIANTS[variant]} ${className}`}>
      {label}
    </span>
  )
}

// ── Typed badge helpers ───────────────────────────────────────────────────────

const STATUS_MAP: Record<PropertyStatus, { variant: BadgeVariant; label: string }> = {
  available: { variant: 'success', label: 'Available' },
  sold:      { variant: 'danger',  label: 'Sold' },
  rented:    { variant: 'info',    label: 'Rented' },
}

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const { variant, label } = STATUS_MAP[status] ?? { variant: 'slate', label: status }
  return <Badge variant={variant} label={label} />
}

const TYPE_MAP: Record<PropertyType, { variant: BadgeVariant; label: string }> = {
  villa:      { variant: 'orange', label: 'Villa' },
  apartment:  { variant: 'info',   label: 'Apartment' },
  penthouse:  { variant: 'purple', label: 'Penthouse' },
  townhouse:  { variant: 'gold',   label: 'Townhouse' },
  commercial: { variant: 'slate',  label: 'Commercial' },
}

export function PropertyTypeBadge({ type }: { type: PropertyType }) {
  const { variant, label } = TYPE_MAP[type] ?? { variant: 'slate', label: type }
  return <Badge variant={variant} label={label} />
}

const LEAD_STATUS_MAP: Record<LeadStatus, { variant: BadgeVariant; label: string }> = {
  new:       { variant: 'info',    label: 'New' },
  contacted: { variant: 'warning', label: 'Contacted' },
  qualified: { variant: 'purple',  label: 'Qualified' },
  closed:    { variant: 'success', label: 'Closed' },
  lost:      { variant: 'danger',  label: 'Lost' },
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { variant, label } = LEAD_STATUS_MAP[status] ?? { variant: 'slate', label: status }
  return <Badge variant={variant} label={label} />
}

const ROLE_MAP: Record<UserRole, { variant: BadgeVariant; label: string }> = {
  super_admin: { variant: 'gold',    label: 'Super Admin' },
  manager:     { variant: 'purple',  label: 'Manager' },
  agent:       { variant: 'info',    label: 'Agent' },
  user:        { variant: 'success', label: 'Website User' },
}

export function RoleBadge({ role }: { role: UserRole }) {
  const { variant, label } = ROLE_MAP[role] ?? { variant: 'slate', label: role }
  return <Badge variant={variant} label={label} />
}
