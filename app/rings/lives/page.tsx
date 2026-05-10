'use client'
import { useState } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { getRingById } from '@/lib/data/rings'
import type { Category, DataPoint, Action } from '@/lib/types'
import RingArc from '@/components/ui/RingArc'
import StatusBadge from '@/components/ui/StatusBadge'
import TrendChart from '@/components/charts/TrendChart'

type CategoryTab = 'data' | 'broken' | 'actions' | 'solutions' | 'news'

function TrendArrow({ trend, trendIsGood }: { trend: DataPoint['trend']; trendIsGood: boolean }) {
  const good = (trend === 'up' && trendIsGood) || (trend === 'down' && !trendIsGood)
  const bad  = (trend === 'up' && !trendIsGood) || (trend === 'down' && trendIsGood)
  return (
    <span className={clsx('text-sm font-medium', good ? 'text-green-600' : bad ? 'text-red-500' : 'text-stone-400')}>
      {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
    </span>
  )
}

function TierPill({ tier }: { tier: Action['tier'] }) {
  const styles = {
    personal:  'bg-blue-50 text-blue-700',
    community: 'bg-green-50 text-green-700',
    systemic:  'bg-amber-50 text-amber-700',
  }
  const labels = { personal: 'Personal', community: 'Community', systemic: 'Systemic' }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0', styles[tier])}>
      {labels[tier]}
    </span>
  )
}

function ProximityBadge({ proximity }: { proximity: 'close' | 'medium' | 'far' }) {
  const styles = { close: 'bg-green-50 text-green-700', medium: 'bg-amber-50 text-amber-700', far: 'bg-red-50 text-red-700' }
  const labels = { close: 'Close', medium: 'Medium term', far: 'Long term' }
  return <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', styles[proximity])}>{labels[proximity]}</span>
}

function DataPointCard({ dp, ringColor }: { dp: DataPoint; ringColor: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={clsx('border rounded-lg transition-all', open ? 'border-stone-300 shadow-card' : 'border-stone-200')}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-3 hover:bg-stone-50 rounded-lg transition-colors"
      >
        <div className="text-xs text-stone-400 mb-1">{dp.label}</div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-base font-semibold text-stone-900">{dp.value}</div>
          <TrendArrow trend={dp.trend} trendIsGood={dp.trendIsGood} />
        </div>
        <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{dp.note}</div>
      </button>
      {open && (
        <div className="px-3 pb-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-lg p-3 mt-3 mb-4">
            <div className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-1.5">
              Why this matters to the north star
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">{dp.why}</p>
          </div>
          <TrendChart data={dp.chart} label={dp.chartLabel} color={ringColor} height={120} />
          <div className="mt-2 text-xs text-stone-400">Source: {dp.source}</div>
        </div>
      )}
    </div>
  )
}

function CategoryAccordion({ cat, ringColor }: { cat: Category; ringColor: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<CategoryTab>('data')

  const tabs: Array<{ id: CategoryTab; label: string }> = [
    { id: 'data',      label: 'Data & trends' },
    { id: 'broken',    label: 'What keeps this broken' },
    { id: 'actions',   label: 'Actions' },
    { id: 'solutions', label: 'Proximity to solutions' },
    { id: 'news',      label: 'Recent developments' },
  ]

  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-stone-900 mb-1">{cat.name}</div>
            <div className="text-xs text-stone-500 mb-2">{cat.driver}</div>
            {cat.totalDeaths && (
              <div className="flex gap-6 flex-wrap mb-2">
                <div>
                  <div className="text-2xs text-stone-400 uppercase tracking-widest">Total deaths/yr</div>
                  <div className="text-sm font-semibold text-stone-900">{cat.totalDeaths}</div>
                </div>
                <div>
                  <div className="text-2xs text-stone-400 uppercase tracking-widest">Preventable</div>
                  <div className="text-sm font-semibold" style={{ color: ringColor }}>{cat.preventable}</div>
                </div>
                <div>
                  <div className="text-2xs text-stone-400 uppercase tracking-widest">Peer nations</div>
                  <div className="text-sm font-semibold text-green-700">{cat.peerNations}</div>
                </div>
              </div>
            )}
            <div className="h-0.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${cat.progressPct}%`, background: ringColor }} />
            </div>
          </div>
          <div className={clsx('text-stone-400 transition-transform duration-200 shrink-0', open && 'rotate-180')}>▾</div>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100">
          <div className="flex border-b border-stone-100 overflow-x-auto bg-stone-50">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                  tab === t.id
                    ? 'border-stone-900 text-stone-900 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === 'data' && (
              <div>
                <div className="bg-stone-50 border-l-4 rounded-r-lg p-4 mb-5" style={{ borderLeftColor: ringColor }}>
                  <p className="text-sm text-stone-700 leading-relaxed">{cat.why}</p>
                </div>
                <div className="mb-6">
                  <TrendChart data={cat.chart} label={cat.chartLabel} color={ringColor} height={160} />
                </div>
                <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
                  Data points — click any to see its individual chart and explanation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.dataPoints.map(dp => (
                    <DataPointCard key={dp.id} dp={dp} ringColor={ringColor} />
                  ))}
                </div>
              </div>
            )}

            {tab === 'broken' && (
              <div>
                <div className="flex gap-4 mb-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span className="w-3 h-3 rounded-sm" style={{ background: '#E24B4A40', border: '2px solid #E24B4A' }} />
                    Market failure
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span className="w-3 h-3 rounded-sm" style={{ background: '#534AB740', border: '2px solid #534AB7' }} />
                    Government failure
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {cat.incentives.map((inc, i) => (
                    <div
                      key={i}
                      className="border-l-4 rounded-r-lg p-4 bg-stone-50"
                      style={{ borderLeftColor: inc.type === 'market' ? '#E24B4A' : '#534AB7' }}
                    >
                      <div
                        className="text-xs font-semibold uppercase tracking-widest mb-1.5"
                        style={{ color: inc.type === 'market' ? '#A32D2D' : '#3C3489' }}
                      >
                        {inc.type === 'market' ? 'Market failure' : 'Government failure'} — {inc.who}
                      </div>
                      <p className="text-sm text-stone-700 leading-relaxed">{inc.what}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'actions' && (
              <div className="flex flex-col divide-y divide-stone-100">
                {cat.actions.map(action => (
                  <div key={action.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <TierPill tier={action.tier} />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-900 mb-0.5">{action.text}</div>
                      <div className="text-xs text-stone-500 leading-relaxed">{action.detail}</div>
                      {action.timeEstimate && (
                        <div className="text-xs text-stone-400 mt-1 font-mono">⏱ {action.timeEstimate}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'solutions' && (
              <div>
                <p className="text-sm text-stone-600 mb-4 leading-relaxed">
                  How close are we to meaningful solutions? What would it take — and what can you do to help?
                </p>
                <div className="flex flex-col gap-4">
                  {cat.solutions.map((sol, i) => (
                    <div key={i} className="border border-stone-200 rounded-xl p-4 bg-stone-50">
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <div className="text-sm font-semibold text-stone-900">{sol.name}</div>
                        <ProximityBadge proximity={sol.proximity} />
                      </div>
                      <p className="text-sm text-stone-600 leading-relaxed mb-3">{sol.description}</p>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${sol.progress}%`, background: sol.progressColor }} />
                        </div>
                        <span className="text-xs text-stone-400 font-mono shrink-0">{sol.progress}% ready</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sol.actions.map((a, j) => (
                          <button key={j} className="text-xs px-3 py-1 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-100 transition-colors">
                            {a} ↗
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'news' && (
              <div>
                <div className="flex flex-col gap-3 mb-4">
                  {cat.news.map((item, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
                      <div className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">{item.source}</div>
                      <div className="text-sm font-medium text-stone-900 mb-1 leading-snug">{item.title}</div>
                      <div className="text-xs text-stone-600 leading-relaxed">{item.description}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-stone-400 italic px-1">
                  Recent developments pull from primary government, research, and institutional sources — not news outlets.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function LivesLostPage() {
  const ring = getRingById('lives')!

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-700 transition-colors">Vital Signs</Link>
        <span>/</span>
        <span className="text-stone-900">Ring {ring.order} — {ring.name}</span>
      </div>

      <div className="flex items-start gap-6 mb-8 flex-wrap">
        <RingArc score={ring.score} color={ring.color} bgColor={ring.bgColor} size={72} strokeWidth={5} />
        <div className="flex-1 min-w-64">
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Ring {ring.order} of 12 · Survival cluster</div>
          <h1 className="font-display text-3xl font-medium text-stone-900 mb-1">{ring.name}</h1>
          <div className="text-2xl font-semibold mb-0.5" style={{ color: ring.color }}>{ring.humanMetric}</div>
          <div className="text-stone-500 text-sm mb-3">{ring.humanMetricLabel}</div>
          <p className="text-stone-600 text-sm leading-relaxed mb-3">{ring.tagline}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={ring.status} />
            <span className="text-xs text-stone-400 font-mono">Score: {ring.score} / 100</span>
            <span className="text-xs text-stone-400">{ring.updateCadence}</span>
          </div>
        </div>
      </div>

      <div className="border border-stone-200 rounded-xl bg-white shadow-card p-5 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center text-xs font-medium text-stone-600 shrink-0 mt-0.5">ℹ</div>
          <div>
            <div className="text-sm font-medium text-stone-900 mb-1">Why you can trust this data — and where its limits are</div>
            <p className="text-xs text-stone-600 leading-relaxed mb-3">{ring.trustStatement}</p>
            <div className="flex flex-wrap gap-2">
              {ring.trustSources.map(src => (
                <div key={src.name} className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-100 rounded-full">
                  <span className="text-green-600 text-xs font-medium">✓</span>
                  <span className="text-xs text-stone-600">{src.name}</span>
                  <span className="text-xs text-stone-400">— {src.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {ring.summaryStats.map((stat, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl p-4 shadow-card">
            <div className="text-xs text-stone-500 leading-snug mb-1">{stat.label}</div>
            <div className={clsx('text-xl font-semibold mb-0.5', stat.value.includes('↑') ? 'text-red-500' : 'text-stone-900')}>
              {stat.value}
            </div>
            <div className="text-xs text-stone-400 leading-relaxed">{stat.note}</div>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-5 mb-8 flex items-center gap-4"
        style={{ background: ring.color + '10', border: `1px solid ${ring.color}30` }}
      >
        <div className="text-2xl shrink-0">🎯</div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: ring.color }}>North star</div>
          <div className="font-display text-lg font-medium text-stone-900">{ring.northStar}</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-display text-xl font-medium text-stone-900 mb-1">Leading causes of preventable death</h2>
        <p className="text-sm text-stone-500">Ordered by total annual deaths. Click any category to explore.</p>
      </div>

      <div className="flex flex-col gap-4">
        {ring.categories.map((cat, i) => (
          <div key={cat.id} className="flex gap-3 items-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1"
              style={{ background: ring.color + '15', color: ring.color }}
            >
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <CategoryAccordion cat={cat} ringColor={ring.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-12 pt-8 border-t border-stone-200">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">← All vital signs</Link>
        <Link href="/rings/disease" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">Next: Disease Burden →</Link>
      </div>
    </div>
  )
}