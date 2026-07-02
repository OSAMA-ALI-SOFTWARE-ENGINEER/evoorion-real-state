'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getLeadFunnel, getLeadsOverTime, getPropertyPerformance,
  getAgentLeaderboard, getLeadsBySource, getRegions,
} from '@/lib/api'
import type { Region } from '@/types'
import { CustomSelect } from '@/components/ui/CustomSelect'

const GOLD   = '#C9A84C'
const STATUS_COLORS: Record<string, string> = {
  new:        '#6366F1',
  contacted:  '#3B82F6',
  qualified:  '#F59E0B',
  closed:     '#10B981',
  lost:       '#EF4444',
}
const SOURCE_COLORS = ['#C9A84C','#6366F1','#3B82F6','#10B981','#F59E0B','#EF4444']

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function fmtPrice(p: string | number) {
  const n = Number(p)
  if (n >= 1_000_000) return `AED ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `AED ${(n / 1_000).toFixed(0)}K`
  return `AED ${n.toLocaleString()}`
}

function Sparkline({ data }: { data: { date: string; total: number }[] }) {
  if (!data.length) return null
  const W = 900; const H = 160; const PAD = 10
  const max = Math.max(...data.map(d => d.total), 1)
  const xs = data.map((_, i) => PAD + (i / (data.length - 1 || 1)) * (W - PAD * 2))
  const ys = data.map(d => H - PAD - ((d.total / max) * (H - PAD * 2)))
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const fillPts = `${PAD},${H - PAD} ${pts} ${W - PAD},${H - PAD}`
  const step = Math.max(1, Math.floor(data.length / 6))
  const labels = data.filter((_, i) => i % step === 0 || i === data.length - 1)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full" style={{ minWidth: 400 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.3" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fillPts} fill="url(#sparkGrad)" />
        <polyline points={pts} fill="none" stroke={GOLD} strokeWidth="2" strokeLinejoin="round" />
        {xs.map((x, i) => <circle key={i} cx={x} cy={ys[i]} r="3" fill={GOLD} />)}
        {labels.map((d, i) => {
          const idx = data.indexOf(d)
          return (
            <text key={i} x={xs[idx]} y={H + 20} textAnchor="middle" fontSize="11" fill="#94A3B8">
              {fmtDate(d.date)}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function DonutChart({ data }: { data: { source: string; total: number }[] }) {
  const total = data.reduce((s, d) => s + d.total, 0) || 1
  const R = 60; const CX = 80; const CY = 80
  let angle = -Math.PI / 2
  const slices = data.map((d, i) => {
    const sweep = (d.total / total) * 2 * Math.PI
    const x1 = CX + R * Math.cos(angle)
    const y1 = CY + R * Math.sin(angle)
    angle += sweep
    const x2 = CX + R * Math.cos(angle)
    const y2 = CY + R * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    return { d: `M${CX},${CY} L${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} Z`, color: SOURCE_COLORS[i % SOURCE_COLORS.length], ...d }
  })

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <svg viewBox="0 0 160 160" className="w-32 h-32 shrink-0">
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
        <circle cx={CX} cy={CY} r={R * 0.55} className="fill-white dark:fill-slate-800" />
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill={GOLD}>{total}</text>
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-sm text-slate-700 dark:text-slate-200 capitalize">{s.source}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto pl-4">{s.total} ({Math.round((s.total / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

type Tab = 'funnel' | 'over-time' | 'properties' | 'leaderboard' | 'sources'

const TABS: { key: Tab; label: string }[] = [
  { key: 'funnel',      label: 'Lead Funnel' },
  { key: 'over-time',   label: 'Leads over Time' },
  { key: 'properties',  label: 'Property Performance' },
  { key: 'leaderboard', label: 'Agent Leaderboard' },
  { key: 'sources',     label: 'Leads by Source' },
]

const card = 'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700'

type FunnelData = { funnel: { status: string; count: number }[]; total: number; conversion_rate: number }
type PropRow    = { id: number; title: string; slug: string; area: string | null; price: string; views: number; leads: number; status: string; is_featured: boolean }
type AgentRow   = { id: number; name: string; leads_total: number; leads_closed: number; leads_new: number; close_rate: number }

export default function ReportsPage() {
  const [tab,  setTab]  = useState<Tab>('funnel')
  const [days, setDays] = useState(30)

  const [regions,    setRegions]    = useState<Region[]>([])
  const [regionCode, setRegionCode] = useState('')

  const [funnel,    setFunnel]    = useState<FunnelData | null>(null)
  const [funnelL,   setFunnelL]   = useState(true)
  const [timeline,  setTimeline]  = useState<{ date: string; total: number }[]>([])
  const [timelineL, setTimelineL] = useState(true)
  const [props,     setProps]     = useState<PropRow[]>([])
  const [propsL,    setPropsL]    = useState(true)
  const [board,     setBoard]     = useState<AgentRow[]>([])
  const [boardL,    setBoardL]    = useState(true)
  const [sources,   setSources]   = useState<{ source: string; total: number }[]>([])
  const [sourcesL,  setSourcesL]  = useState(true)

  // Load regions once on mount
  useEffect(() => {
    getRegions().then(r => setRegions(r.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    setFunnelL(true)
    getLeadFunnel(regionCode || undefined).then(res => setFunnel(res.data)).finally(() => setFunnelL(false))
  }, [regionCode])

  useEffect(() => {
    setTimelineL(true)
    getLeadsOverTime(days, regionCode || undefined).then(res => setTimeline(res.data)).finally(() => setTimelineL(false))
  }, [days, regionCode])

  useEffect(() => {
    setPropsL(true)
    getPropertyPerformance(regionCode || undefined).then(res => setProps(res.data)).finally(() => setPropsL(false))
  }, [regionCode])

  useEffect(() => {
    setBoardL(true)
    getAgentLeaderboard(regionCode || undefined).then(res => setBoard(res.data)).finally(() => setBoardL(false))
  }, [regionCode])

  useEffect(() => {
    setSourcesL(true)
    getLeadsBySource(regionCode || undefined).then(res => setSources(res.data)).finally(() => setSourcesL(false))
  }, [regionCode])

  const regionOptions = [
    { value: '', label: 'All Regions' },
    ...regions.filter(r => r.is_active).map(r => ({ value: r.code, label: `${r.flag ?? ''} ${r.name}`.trim() })),
  ]

  const spinner = (
    <div className="py-16 flex justify-center">
      <div className="w-7 h-7 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Region filter + Tabs header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <CustomSelect
          value={regionCode}
          onChange={v => setRegionCode(v)}
          options={regionOptions}
          placeholder="All Regions"
          className="w-44"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={[
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
              tab === t.key
                ? 'border-[#C9A84C] text-[#C9A84C]'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Lead Funnel ── */}
      {tab === 'funnel' && (
        <div className={`${card} p-6 space-y-6`}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Lead Pipeline Funnel</h2>
            {funnel && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Conversion rate: <strong className="text-slate-700 dark:text-slate-200">{funnel.conversion_rate}%</strong>
              </span>
            )}
          </div>
          {funnelL ? spinner : !funnel ? <p className="text-slate-400 text-sm">No data.</p> : (
            <div className="space-y-3">
              {funnel.funnel.map(({ status, count }) => {
                const pct = funnel.total > 0 ? (count / funnel.total) * 100 : 0
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-slate-700 dark:text-slate-200 font-medium">{status}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count} leads</span>
                    </div>
                    <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg transition-all duration-500 flex items-center pl-3 text-xs font-semibold text-white"
                        style={{ width: `${Math.max(pct, 2)}%`, background: STATUS_COLORS[status] }}
                      >
                        {pct >= 10 && `${pct.toFixed(0)}%`}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Leads over Time ── */}
      {tab === 'over-time' && (
        <div className={`${card} p-6 space-y-4`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Leads over Time</h2>
            <div className="flex gap-2">
              {[7, 14, 30, 60, 90].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={[
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-colors',
                    days === d
                      ? 'bg-[#C9A84C] text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600',
                  ].join(' ')}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {timelineL ? spinner : <Sparkline data={timeline} />}
        </div>
      )}

      {/* ── Property Performance ── */}
      {tab === 'properties' && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Top 20 Properties by Views</h2>
          </div>
          {propsL ? spinner : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Area</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Views</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Leads</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {props.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">No data.</td></tr>
                  ) : props.map((p, i) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3.5">
                        <Link href={`/properties/${p.slug}`} className="font-medium text-slate-800 dark:text-slate-100 hover:text-[#C9A84C] transition-colors line-clamp-1">
                          {p.title}
                        </Link>
                        {p.is_featured && (
                          <span className="inline-block mt-0.5 text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold">Featured</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 text-xs">{p.area ?? '—'}</td>
                      <td className="px-4 py-3.5 text-slate-700 dark:text-slate-300 text-xs">{fmtPrice(p.price)}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-800 dark:text-slate-100">{p.views.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right text-slate-600 dark:text-slate-300">{p.leads}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          p.status === 'available' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : p.status === 'sold'    ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>{p.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Agent Leaderboard ── */}
      {tab === 'leaderboard' && (
        <div className={`${card} overflow-hidden`}>
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Agent Leaderboard</h2>
          </div>
          {boardL ? spinner : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {board.map((a, i) => (
                <div key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{a.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#C9A84C] transition-all" style={{ width: `${a.close_rate}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{a.close_rate}% close rate</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{a.leads_closed} closed</p>
                    <p className="text-xs text-slate-400">{a.leads_total} total</p>
                  </div>
                </div>
              ))}
              {board.length === 0 && <p className="px-6 py-8 text-center text-slate-400 text-sm">No agents yet.</p>}
            </div>
          )}
        </div>
      )}

      {/* ── Leads by Source ── */}
      {tab === 'sources' && (
        <div className={`${card} p-6`}>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-6">Leads by Source</h2>
          {sourcesL ? spinner : sources.length === 0 ? (
            <p className="text-slate-400 text-sm">No data.</p>
          ) : (
            <DonutChart data={sources} />
          )}
        </div>
      )}
    </div>
  )
}
