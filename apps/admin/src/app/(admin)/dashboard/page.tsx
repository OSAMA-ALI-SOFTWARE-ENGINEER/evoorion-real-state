'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats, getAgentPerformance, getAdminProperties, getAdminBlogPosts, getRegionBreakdown } from '@/lib/api'
import type { AgentPerformance, BlogPost, DashboardStats, Property, RegionBreakdown } from '@/types'
import {
  IconBuilding,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconBriefcase,
  IconPercent,
  IconCheck,
  IconFileText,
  IconImage,
} from '@/components/ui/icons'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString() }

function pct(a: number, b: number): number {
  if (!b) return 0
  return Math.round(((a - b) / b) * 100)
}

function rate(num: number, den: number): number {
  if (!den) return 0
  return Math.round((num / den) * 100)
}

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  trend?: number
  icon: React.ReactNode
  iconBg: string
  highlight?: boolean
}

function StatCard({ title, value, sub, trend, icon, iconBg, highlight }: StatCardProps) {
  return (
    <div className={`rounded-xl p-5 border flex items-start gap-4 ${highlight ? 'bg-[#C9A84C]/5 border-[#C9A84C]/20 dark:bg-amber-900/10' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {sub && <span className="text-xs text-slate-400 dark:text-slate-500">{sub}</span>}
          {trend !== undefined && trend !== 0 && (
            <span className={`flex items-center gap-0.5 text-xs font-medium ${trend > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend > 0 ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Lead breakdown bar chart ──────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new:        'bg-blue-500',
  contacted:  'bg-yellow-500',
  qualified:  'bg-purple-500',
  closed:     'bg-emerald-500',
  lost:       'bg-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  new:        'New',
  contacted:  'Contacted',
  qualified:  'Qualified',
  closed:     'Closed',
  lost:       'Lost',
}

const SOURCE_LABELS: Record<string, string> = {
  website:   'Website',
  instagram: 'Instagram',
  facebook:  'Facebook',
  whatsapp:  'WhatsApp',
  referral:  'Referral',
  other:     'Other',
}

function LeadBreakdown({ label, data }: { label: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, n) => s + n, 0)
  if (!total) return null

  const entries = Object.entries(data).sort(([, a], [, b]) => b - a)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">{label}</h3>
      <div className="space-y-3">
        {entries.map(([key, count]) => {
          const color  = STATUS_COLORS[key] ?? 'bg-slate-400'
          const name   = label.includes('Status') ? (STATUS_LABELS[key] ?? key) : (SOURCE_LABELS[key] ?? key)
          const pctVal = total ? Math.round((count / total) * 100) : 0
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-300 capitalize">{name}</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {count} <span className="text-slate-400">({pctVal}%)</span>
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pctVal}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Funnel mini chart ─────────────────────────────────────────────────────────

function FunnelCard({ stats }: { stats: DashboardStats }) {
  const total     = stats.leads.total
  const contacted = (stats.leads.by_status.contacted ?? 0) + (stats.leads.by_status.qualified ?? 0) + (stats.leads.by_status.closed ?? 0)
  const qualified = (stats.leads.by_status.qualified ?? 0) + (stats.leads.by_status.closed ?? 0)
  const closed    = stats.leads.by_status.closed ?? 0

  const stages = [
    { label: 'Total Leads', count: total,     color: 'bg-blue-500',    w: 100 },
    { label: 'Contacted',   count: contacted,  color: 'bg-purple-500',  w: total ? Math.round((contacted / total) * 100) : 0 },
    { label: 'Qualified',   count: qualified,  color: 'bg-amber-500',   w: total ? Math.round((qualified / total) * 100) : 0 },
    { label: 'Closed',      count: closed,     color: 'bg-emerald-500', w: total ? Math.round((closed / total) * 100) : 0 },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Conversion Funnel</h3>
      <div className="space-y-3">
        {stages.map(s => (
          <div key={s.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{fmt(s.count)}</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.color} transition-all duration-500`} style={{ width: `${s.w}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Agent table ───────────────────────────────────────────────────────────────

function AgentTable({ agents }: { agents: AgentPerformance[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Agent Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-700/50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Agent</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Properties</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Total Leads</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Closed</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Close Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">No agents yet</td>
              </tr>
            )}
            {agents.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">{a.properties}</td>
                <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">{a.leads_total}</td>
                <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">{a.leads_closed}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                    a.close_rate >= 30 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : a.close_rate >= 15 ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                  ].join(' ')}>
                    {a.close_rate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 animate-pulse">
      <div className="flex gap-4">
        <div className="w-11 h-11 rounded-lg bg-slate-100 dark:bg-slate-700 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded w-24" />
          <div className="h-7 bg-slate-100 dark:bg-slate-700 rounded w-16" />
          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
    </div>
  )
}

// ── Recent properties mini list ───────────────────────────────────────────────

function RecentProperties({ items }: { items: Property[] }) {
  if (!items.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <IconBuilding size={15} className="text-purple-500" /> Recent Properties
        </h3>
        <Link href="/properties" className="text-xs text-[#C9A84C] hover:underline font-medium">View all</Link>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {items.map(p => {
          const img = p.images?.find(i => i.is_primary)?.url ?? p.images?.[0]?.url ?? null
          return (
            <li key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
                {img
                  ? <img src={img} alt={p.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><IconImage size={16} className="text-slate-300 dark:text-slate-600" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{p.title}</p>
                <p className="text-xs text-slate-400">{p.area?.name ?? p.type} · AED {Number(p.price).toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'available' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                {p.status}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ── Recent blog posts mini list ───────────────────────────────────────────────

function RecentBlogPosts({ items }: { items: BlogPost[] }) {
  if (!items.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <IconFileText size={15} className="text-blue-500" /> Recent Blog Posts
        </h3>
        <Link href="/blog" className="text-xs text-[#C9A84C] hover:underline font-medium">View all</Link>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {items.map(post => (
          <li key={post.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0">
              {post.featured_image_url
                ? <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><IconFileText size={16} className="text-slate-300 dark:text-slate-600" /></div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{post.title}</p>
              <p className="text-xs text-slate-400">{post.author?.name ?? 'Unknown'} · {new Date(post.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
              {post.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Region breakdown panel ────────────────────────────────────────────────────

function RegionBreakdownPanel({ data }: { data: RegionBreakdown[] }) {
  if (!data.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4">Content by Region</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {data.map(item => (
          <div key={item.region.code} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
            {item.region.flag && <div className="text-2xl mb-1">{item.region.flag}</div>}
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">{item.region.name}</p>
            <div className="space-y-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.properties_count}</span> properties
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">{item.leads_count}</span> leads
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats,           setStats]           = useState<DashboardStats | null>(null)
  const [agents,          setAgents]          = useState<AgentPerformance[]>([])
  const [properties,      setProperties]      = useState<Property[]>([])
  const [blogPosts,       setBlogPosts]       = useState<BlogPost[]>([])
  const [regionBreakdown, setRegionBreakdown] = useState<RegionBreakdown[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getAgentPerformance(),
      getAdminProperties({ per_page: 5, status: 'available' }),
      getAdminBlogPosts({ per_page: 5 }),
      getRegionBreakdown(),
    ])
      .then(([s, a, p, b, rb]) => {
        setStats(s.data)
        setAgents(a.data)
        setProperties(p.data ?? [])
        setBlogPosts(b.data ?? [])
        setRegionBreakdown(rb.data ?? [])
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-1">Failed to load dashboard</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  // Derived metrics
  const monthTrend    = stats ? pct(stats.leads.this_month, stats.leads.last_month) : 0
  const conversionRate = stats ? rate(stats.leads.by_status.closed ?? 0, stats.leads.total) : 0
  const responseRate   = stats ? rate(
    (stats.leads.by_status.contacted ?? 0) + (stats.leads.by_status.qualified ?? 0) + (stats.leads.by_status.closed ?? 0),
    stats.leads.total,
  ) : 0

  return (
    <div className="space-y-6 w-full">

      {/* Primary stat cards — 3 col on lg, 6 on xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard
              title="Total Leads"
              value={fmt(stats.leads.total)}
              sub={`${stats.leads.unassigned} unassigned`}
              icon={<IconUsers size={20} className="text-blue-600" />}
              iconBg="bg-blue-50 dark:bg-blue-900/30"
            />
            <StatCard
              title="Leads This Month"
              value={fmt(stats.leads.this_month)}
              sub={`${fmt(stats.leads.last_month)} last month`}
              trend={monthTrend}
              icon={<IconTrendingUp size={20} className="text-emerald-600" />}
              iconBg="bg-emerald-50 dark:bg-emerald-900/30"
            />
            <StatCard
              title="Properties"
              value={fmt(stats.properties.total)}
              sub={`${stats.properties.available} available · ${stats.properties.featured} featured`}
              icon={<IconBuilding size={20} className="text-purple-600" />}
              iconBg="bg-purple-50 dark:bg-purple-900/30"
            />
            <StatCard
              title="Active Agents"
              value={fmt(stats.agents.active)}
              sub={`of ${stats.agents.total} total`}
              icon={<IconBriefcase size={20} className="text-amber-600" />}
              iconBg="bg-amber-50 dark:bg-amber-900/30"
            />
            <StatCard
              title="Conversion Rate"
              value={`${conversionRate}%`}
              sub="Leads closed / total leads"
              highlight
              icon={<IconCheck size={20} className="text-[#C9A84C]" />}
              iconBg="bg-[#C9A84C]/10"
            />
            <StatCard
              title="Response Rate"
              value={`${responseRate}%`}
              sub="Leads contacted or beyond"
              highlight
              icon={<IconPercent size={20} className="text-[#C9A84C]" />}
              iconBg="bg-[#C9A84C]/10"
            />
          </>
        ) : null}
      </div>

      {/* Lead breakdowns + funnel */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-52" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LeadBreakdown label="Leads by Status" data={stats.leads.by_status} />
          <LeadBreakdown label="Leads by Source" data={stats.leads.by_source} />
          <FunnelCard stats={stats} />
        </div>
      ) : null}

      {/* Region breakdown */}
      {!loading && <RegionBreakdownPanel data={regionBreakdown} />}

      {/* Recent properties + recent blog posts */}
      {!loading && (properties.length > 0 || blogPosts.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentProperties items={properties} />
          <RecentBlogPosts items={blogPosts} />
        </div>
      )}

      {/* Agent performance */}
      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 h-48 animate-pulse" />
      ) : (
        <AgentTable agents={agents} />
      )}
    </div>
  )
}
