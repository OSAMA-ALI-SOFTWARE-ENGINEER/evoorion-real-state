'use client'

import { useEffect, useState } from 'react'
import { getDashboardStats, getAgentPerformance } from '@/lib/api'
import type { AgentPerformance, DashboardStats } from '@/types'
import {
  IconBuilding,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconBriefcase,
} from '@/components/ui/icons'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString()
}

function pct(a: number, b: number): number {
  if (!b) return 0
  return Math.round(((a - b) / b) * 100)
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  sub?: string
  trend?: number
  icon: React.ReactNode
  iconBg: string
}

function StatCard({ title, value, sub, trend, icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 mb-0.5">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {sub && <span className="text-xs text-slate-400">{sub}</span>}
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
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{label}</h3>
      <div className="space-y-3">
        {entries.map(([key, count]) => {
          const color = STATUS_COLORS[key] ?? 'bg-slate-400'
          const name  = label.includes('Status')
            ? (STATUS_LABELS[key] ?? key)
            : (SOURCE_LABELS[key] ?? key)
          const pctVal = total ? Math.round((count / total) * 100) : 0
          return (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 capitalize">{name}</span>
                <span className="font-medium text-slate-700">{count} <span className="text-slate-400">({pctVal}%)</span></span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{ width: `${pctVal}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AgentTable({ agents }: { agents: AgentPerformance[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700">Agent Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Agent</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Properties</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Leads</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Closed</th>
              <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Close Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-sm">
                  No agents yet
                </td>
              </tr>
            )}
            {agents.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3.5">
                  <div>
                    <p className="font-medium text-slate-800">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-slate-600">{a.properties}</td>
                <td className="px-4 py-3.5 text-right text-slate-600">{a.leads_total}</td>
                <td className="px-4 py-3.5 text-right text-slate-600">{a.leads_closed}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                    a.close_rate >= 30
                      ? 'bg-emerald-50 text-emerald-700'
                      : a.close_rate >= 15
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-slate-100 text-slate-600',
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

// ── Page ──────────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse">
      <div className="flex gap-4">
        <div className="w-11 h-11 rounded-lg bg-slate-100 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 rounded w-24" />
          <div className="h-7 bg-slate-100 rounded w-16" />
          <div className="h-2.5 bg-slate-100 rounded w-32" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState<DashboardStats | null>(null)
  const [agents,  setAgents]  = useState<AgentPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    Promise.all([getDashboardStats(), getAgentPerformance()])
      .then(([s, a]) => {
        setStats(s.data)
        setAgents(a.data)
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

  const monthTrend = stats ? pct(stats.leads.this_month, stats.leads.last_month) : 0

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : stats ? (
          <>
            <StatCard
              title="Total Leads"
              value={fmt(stats.leads.total)}
              sub={`${stats.leads.unassigned} unassigned`}
              icon={<IconUsers size={20} className="text-blue-600" />}
              iconBg="bg-blue-50"
            />
            <StatCard
              title="Leads This Month"
              value={fmt(stats.leads.this_month)}
              sub={`${fmt(stats.leads.last_month)} last month`}
              trend={monthTrend}
              icon={<IconTrendingUp size={20} className="text-emerald-600" />}
              iconBg="bg-emerald-50"
            />
            <StatCard
              title="Properties"
              value={fmt(stats.properties.total)}
              sub={`${stats.properties.available} available · ${stats.properties.featured} featured`}
              icon={<IconBuilding size={20} className="text-purple-600" />}
              iconBg="bg-purple-50"
            />
            <StatCard
              title="Agents"
              value={fmt(stats.agents.active)}
              sub={`of ${stats.agents.total} total`}
              icon={<IconBriefcase size={20} className="text-amber-600" />}
              iconBg="bg-amber-50"
            />
          </>
        ) : null}
      </div>

      {/* Lead breakdowns */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="bg-white rounded-xl border border-slate-200 h-52" />
          <div className="bg-white rounded-xl border border-slate-200 h-52" />
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LeadBreakdown label="Leads by Status" data={stats.leads.by_status} />
          <LeadBreakdown label="Leads by Source" data={stats.leads.by_source} />
        </div>
      ) : null}

      {/* Agent performance */}
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200 h-48 animate-pulse" />
      ) : (
        <AgentTable agents={agents} />
      )}
    </div>
  )
}
