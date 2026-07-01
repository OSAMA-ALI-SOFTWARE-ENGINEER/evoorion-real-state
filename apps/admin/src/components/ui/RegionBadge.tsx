import type { Region } from '@/types'

interface RegionBadgeProps {
  region?: Region | null
  className?: string
}

export function RegionBadge({ region, className = '' }: RegionBadgeProps) {
  if (!region) return null
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 ${className}`}>
      {region.flag && <span>{region.flag}</span>}
      <span>{region.name}</span>
    </span>
  )
}
