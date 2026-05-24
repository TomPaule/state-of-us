'use client'
import { useState } from 'react'
import React from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { getRingById } from '@/lib/data/rings'
import { scoreToGrade } from '@/lib/types'
import type { Category, DataPoint, Action, ChartPoint, ActionTier } from '@/lib/types'
import RingArc from '@/components/ui/RingArc'
import StatusBadge from '@/components/ui/StatusBadge'
import TrendChart from '@/components/charts/TrendChart'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

type CategoryTab = 'data' | 'actions'

// ── Utility components ────────────────────────────────────────────────────────

function TrendArrow({ trend, trendIsGood }: { trend: DataPoint['trend']; trendIsGood: boolean }) {
  const good = (trend === 'up' && trendIsGood) || (trend === 'down' && !trendIsGood)
  const bad  = (trend === 'up' && !trendIsGood) || (trend === 'down' && trendIsGood)
  const label = good ? 'Improving' : bad ? 'Worsening' : 'Stable'
  const color = good ? 'text-green-600 bg-green-50' : bad ? 'text-red-600 bg-red-50' : 'text-purple-600 bg-purple-50'
  return (
    <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', color)}>
      {label}
    </span>
  )
}

function TierPill({ tier }: { tier: Action['tier'] }) {
  const styles: Record<string, string> = {
    personal: 'bg-blue-50 text-blue-700',
    local:    'bg-green-50 text-green-700',
    state:    'bg-purple-50 text-purple-700',
    national: 'bg-amber-50 text-amber-700',
  }
  const labels: Record<string, string> = {
    personal: 'Personal',
    local:    'Local',
    state:    'State',
    national: 'National',
  }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0', styles[tier])}>
      {labels[tier]}
    </span>
  )
}

function DifficultyPill({ difficulty }: { difficulty: string }) {
  const styles: Record<string, string> = {
    low:    'bg-green-50 text-green-700',
    medium: 'bg-amber-50 text-amber-700',
    high:   'bg-red-50 text-red-700',
  }
  const labels: Record<string, string> = {
    low: 'Easy to start', medium: 'Some effort', high: 'Heavy lift',
  }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', styles[difficulty])}>
      {labels[difficulty]}
    </span>
  )
}

function ImpactWeightBadge({ weight }: { weight: string }) {
  const styles: Record<string, string> = {
    primary:   'bg-red-50 text-red-700 border border-red-200',
    secondary: 'bg-amber-50 text-amber-700 border border-amber-200',
    supporting:'bg-stone-50 text-stone-600 border border-stone-200',
  }
  const labels: Record<string, string> = {
    primary:   'Primary driver',
    secondary: 'Contributing factor',
    supporting:'Supporting metric',
  }
  if (!weight) return null
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', styles[weight])}>
      {labels[weight]}
    </span>
  )
}

function TrustBadge({ grade, explanation }: { grade: string; explanation: string }) {
  const colors: Record<string, string> = {
    A: 'bg-green-50 text-green-700 border-green-200',
    B: 'bg-blue-50 text-blue-700 border-blue-200',
    C: 'bg-amber-50 text-amber-700 border-amber-200',
    D: 'bg-red-50 text-red-700 border-red-200',
  }
  const [show, setShow] = useState(false)
  return (
    <div className="relative inline-block">
      <button
        onClick={e => { e.stopPropagation(); setShow(s => !s) }}
        className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium', colors[grade])}
      >
        Data Quality: {grade}
      </button>
      {show && (
        <div className="absolute right-0 top-6 z-10 w-64 bg-white border border-stone-200 rounded-lg p-3 shadow-lg text-xs text-stone-600 leading-relaxed">
          <div className="font-medium text-stone-900 mb-1">Data quality: {grade}</div>
          {explanation}
          <div className="mt-2 pt-2 border-t border-stone-100 text-stone-400">
            A = official registry · B = peer-reviewed · C = estimated · D = contested
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bill status bar ───────────────────────────────────────────────────────────

function BillStatusBar({ legislation }: { legislation: NonNullable<Action['legislation']> }) {
  const statusSteps = ['introduced', 'in-committee', 'passed-house', 'passed-senate', 'signed']
  const currentStep = statusSteps.indexOf(legislation.status)
  const isDead = legislation.status === 'dead'
  const stepPct = Math.round((legislation.currentStepCount / legislation.currentStepTotal) * 100)
  const stepLabels: Record<string, string> = {
    'introduced':    'Intro',
    'in-committee':  'Committee',
    'passed-house':  'House',
    'passed-senate': 'Senate',
    'signed':        'Signed',
  }
  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-blue-900">{legislation.billName}</div>
          <div className="text-xs text-blue-600">{legislation.billNumber}</div>
        </div>
        <a href={legislation.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline shrink-0">View bill</a>
      </div>
      <p className="text-xs text-blue-700 leading-relaxed mb-3">{legislation.summary}</p>
      {isDead ? (
        <div className="text-xs text-red-600 font-medium">This bill did not pass</div>
      ) : (
        <>
          <div className="mb-1">
            <div className="text-xs text-blue-500 font-medium mb-1">Where is this bill?</div>
            <div className="flex gap-1 mb-1">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex-1">
                  <div className={clsx('h-1.5 rounded-full', i <= currentStep ? 'bg-blue-500' : 'bg-blue-100')} />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              {statusSteps.map((step, i) => (
                <div key={step} className={clsx('text-xs text-center flex-1', i === currentStep ? 'text-blue-700 font-semibold' : i < currentStep ? 'text-blue-400' : 'text-blue-200')}>
                  {stepLabels[step]}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-blue-500 font-medium mb-1">Progress in current step</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(stepPct, 100)}%` }} />
              </div>
              <span className="text-xs text-blue-700 font-medium shrink-0">
                {legislation.currentStepCount} of {legislation.currentStepTotal}
              </span>
            </div>
            <div className="text-xs text-blue-400 mt-1">{legislation.currentStepLabel} · Updated {legislation.lastUpdated}</div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Solved precedent ──────────────────────────────────────────────────────────

function SolvedPrecedentBlock({ precedent, color }: { precedent: NonNullable<DataPoint['solvedPrecedent']>; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-green-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-3 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-bold text-sm">✓</span>
          <div>
            <div className="text-xs font-semibold text-green-800">We solved something like this before</div>
            <div className="text-xs text-green-600">{precedent.title}</div>
          </div>
        </div>
        <span className={clsx('text-green-500 transition-transform duration-200', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <div className="p-3 bg-white border-t border-green-100">
          <p className="text-sm text-stone-700 leading-relaxed mb-3">{precedent.description}</p>
          <div className="flex gap-4 flex-wrap mb-3">
            <div>
              <div className="text-xs text-stone-400 uppercase tracking-widest">Outcome</div>
              <div className="text-xs font-medium text-green-700">{precedent.outcome}</div>
            </div>
            <div>
              <div className="text-xs text-stone-400 uppercase tracking-widest">Time taken</div>
              <div className="text-xs font-medium text-stone-700">{precedent.timeTaken}</div>
            </div>
          </div>
          {precedent.chart && precedent.chartLabel && (
            <TrendChart data={precedent.chart} label={precedent.chartLabel} color="#16A34A" height={100} showTarget={false} />
          )}
        </div>
      )}
    </div>
  )
}

// ── Total vs preventable chart ────────────────────────────────────────────────

function TotalVsPreventableChart({ totalData, preventableData, color, height }: {
  totalData: ChartPoint[]
  preventableData: ChartPoint[]
  color: string
  height: number
}) {
  const combined = totalData.map((d, i) => ({
    year: d.year,
    total: d.us,
    preventable: preventableData[i]?.us ?? 0,
    peer: d.peer,
  }))
  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={combined} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F4" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} tickCount={5} tickFormatter={(v) => Math.round(v).toString()} />
          <YAxis tick={{ fontSize: 10, fill: '#A8A29E' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => Math.round(v).toString()} />
          <Tooltip content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null
            return (
              <div style={{ background: 'white', border: '1px solid #E7E5E4', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{label}</div>
                {payload.map((p: any) => (
                  <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 2, background: p.color, display: 'inline-block' }} />
                    <span style={{ color: p.color }}>{p.name}:</span>
                    <span style={{ fontWeight: 500 }}>{Number(p.value).toFixed(0)}K</span>
                  </div>
                ))}
              </div>
            )
          }} />
          <Line type="monotone" dataKey="total" name="Total US deaths" stroke="#D6D3D1" strokeWidth={2} dot={false} strokeDasharray="4 2" />
          <Line type="monotone" dataKey="preventable" name="Preventable US deaths" stroke={color} strokeWidth={2.5} dot={false} />
                 </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs text-stone-400">
          <span className="inline-block w-4 h-0.5 rounded" style={{ background: '#D6D3D1' }} />
          Total US deaths
        </span>
        <span className="flex items-center gap-1.5 text-xs text-stone-400">
          <span className="inline-block w-4 h-0.5 rounded" style={{ background: color }} />
          Preventable US deaths
        </span>
      </div>
      <div className="mt-2 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg">
        <p className="text-xs text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-600">Peer nations:</span> Average of G7 plus comparable wealthy democracies (Australia, Netherlands, Sweden, Norway, Denmark), adjusted to deaths per 100,000 population for fair comparison across different country sizes.
          <span className="ml-1 font-medium text-stone-600">The gap between total and preventable deaths</span> represents mortality from genetic conditions, advanced age, and causes not yet addressable with current medicine.
        </p>
      </div>
    </div>
  )
}
// ── Driver card ───────────────────────────────────────────────────────────────

function DriverCard({ driver }: { driver: NonNullable<DataPoint['drivers']>[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2.5 hover:bg-stone-50 transition-colors flex items-center justify-between gap-2"
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-stone-700">{driver.label}</div>
          <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{driver.stat}</div>
        </div>
        <span className={clsx('text-stone-400 shrink-0 transition-transform duration-200 ml-2', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <div className="px-3 py-3 border-t border-stone-100 bg-stone-50">
          {/* Why it exists — bullets */}
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Why this exists</div>
          <ul className="space-y-1.5 mb-4">
            {driver.why.split('. ').filter(s => s.trim().length > 10).map((sentence, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                <span className="text-stone-300 shrink-0 mt-0.5">→</span>
                <span>{sentence.trim().replace(/\.$/, '')}.</span>
              </li>
            ))}
          </ul>
          {/* Actions */}
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">What you can do</div>
          <div className="flex flex-col gap-2">
            {driver.actions.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <TierPill tier={a.tier} />
                <span className="text-xs text-stone-600 leading-relaxed flex-1">{a.text}</span>
              <button className={clsx(
                  'text-xs px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors',
                  a.tier === 'personal' ? 'bg-blue-600 text-white hover:bg-blue-700' :
                  a.tier === 'local'    ? 'bg-green-600 text-white hover:bg-green-700' :
                  a.tier === 'state'    ? 'bg-purple-600 text-white hover:bg-purple-700' :
                  'bg-amber-600 text-white hover:bg-amber-700'
                )}>
                  {a.tier === 'personal' ? "I'll do this" :
                   a.tier === 'local'    ? 'Find local opportunities' :
                   a.tier === 'state'    ? 'Find your state rep' :
                   'Take action'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Data point card ───────────────────────────────────────────────────────────

function DataPointCard({ dp, ringColor }: { dp: DataPoint; ringColor: string }) {
  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">

      {/* Header — label is biggest */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex items-start justify-between gap-2 mb-1">
          {dp.impactWeight && <ImpactWeightBadge weight={dp.impactWeight} />}
        </div>
        <div className="text-base font-semibold text-stone-900 mb-0.5">{dp.label}</div>
        {dp.note && (
          <div className="text-sm font-medium mb-1" style={{ color: ringColor }}>{dp.note}</div>
        )}
        <div className="flex items-center gap-2">
          <div className="text-sm text-stone-500">{dp.value}</div>
          <span className="text-stone-300">·</span>
          <TrendArrow trend={dp.trend} trendIsGood={dp.trendIsGood} />
        </div>
      </div>

      {/* The problem — mechanism as bullets */}
      {(dp.mechanismBullets || dp.mechanism) && (
        <div className="px-4 pt-4 pb-2">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            The problem — how this causes death
          </div>
          <ul className="space-y-2">
            {dp.mechanismBullets
              ? dp.mechanismBullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                    <span className="text-red-300 shrink-0 mt-0.5 font-bold">→</span>
                    <span>{bullet}</span>
                  </li>
                ))
              : dp.mechanism!.split('. ').filter(s => s.trim().length > 10).map((sentence, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                    <span className="text-red-300 shrink-0 mt-0.5">→</span>
                    <span>{sentence.trim().replace(/\.$/, '')}.</span>
                  </li>
                ))
            }
          </ul>
        </div>
      )}

    
      {/* Why the US gap — only show if whyBullets exists, otherwise skip */}
      {dp.whyBullets && (
        <div className="px-4 pt-3 pb-2">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            Why the US is worse than peer nations
          </div>
          <ul className="space-y-2">
            {dp.whyBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                <span className="text-stone-300 shrink-0 mt-0.5 font-bold">→</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}


      {/* Chart */}
      <div className="px-4 pb-3 pt-2">
        <TrendChart data={dp.chart} label={dp.chartLabel} color={ringColor} height={110} />
      </div>
      {/* Source + data quality — always visible */}
      <div className="mx-4 mb-3 px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg">
        <div className="text-xs text-stone-400 mb-1.5">
          <span className="font-medium text-stone-500">Source:</span> {dp.source}
        </div>
        {dp.nextDataRelease && (
          <div className="text-xs text-stone-400 mb-2">
            <span className="font-medium text-stone-500">Next release:</span> {dp.nextDataRelease}
          </div>
        )}
        {dp.trust && (
          <div className="border-t border-stone-200 pt-2 mt-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={clsx(
                'text-xs font-bold px-2 py-0.5 rounded',
                dp.trust.grade === 'A' ? 'bg-green-50 text-green-700' :
                dp.trust.grade === 'B' ? 'bg-blue-50 text-blue-700' :
                dp.trust.grade === 'C' ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              )}>
                Data Quality: {dp.trust.grade}
              </span>
              <span className="text-xs text-stone-400">
                {dp.trust.grade === 'A' ? 'Official registry — highest confidence' :
                 dp.trust.grade === 'B' ? 'Peer-reviewed — high confidence' :
                 dp.trust.grade === 'C' ? 'Estimated — moderate confidence' :
                 'Contested — use with caution'}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">{dp.trust.explanation}</p>
          </div>
        )}
      </div>
      {/* Structural drivers — incentive note merged in */}
      {dp.drivers && dp.drivers.length > 0 && (
        <div className="px-4 pb-4">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            What keeps this stuck — structural drivers
          </div>
          <div className="flex flex-col gap-2">
            {dp.drivers.map(driver => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

// ── Action card ───────────────────────────────────────────────────────────────

function ActionCard({ action, tier }: { action: Action; tier: ActionTier }) {
  const [done, setDone] = useState(false)

  const tierStyles: Record<string, string> = {
    personal: 'border-blue-100 bg-blue-50/30',
    local:    'border-green-100 bg-green-50/30',
    state:    'border-purple-100 bg-purple-50/30',
    national: 'border-amber-100 bg-amber-50/30',
  }
  return (
    <div className={clsx('border rounded-xl p-4 transition-all', tierStyles[tier], done && 'opacity-60')}>
      <div className="text-sm font-medium text-stone-900 mb-1">{action.text}</div>
      <div className="text-xs text-stone-500 leading-relaxed mb-2">{action.detail}</div>

      <div className="flex items-center gap-2 flex-wrap mb-2">
        {action.timeEstimate && (
          <span className="text-xs text-stone-400 font-mono">⏱ {action.timeEstimate}</span>
        )}
        {action.difficulty && <DifficultyPill difficulty={action.difficulty} />}
      </div>

      {action.evidenceBase && (
        <div className="mb-2 text-xs text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-600">Why it works: </span>
          {action.evidenceBase}
        </div>
      )}

      {action.livesSaved && (
        <div className="mb-3 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
          <div className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-0.5">Estimated impact</div>
          <p className="text-xs text-green-800 leading-relaxed">{action.livesSaved}</p>
        </div>
      )}

      {action.legislation && <BillStatusBar legislation={action.legislation} />}

      <div className="flex items-center gap-2 flex-wrap mt-3">
        {tier === 'personal' && (
          <button
            onClick={() => setDone(d => !d)}
            className={clsx(
              'text-xs px-4 py-2 rounded-lg font-medium transition-colors',
              done ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            {done ? '✓ Added to civic record' : "I'll do this"}
          </button>
        )}
        {tier === 'local' && (
          <button className="text-xs px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
            Find local opportunities
          </button>
        )}
        {tier === 'state' && (
          <button className="text-xs px-4 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            Find your state rep
          </button>
        )}
        {tier === 'national' && action.legislation && (
          <a href={action.legislation.url} target="_blank" rel="noopener noreferrer" className="text-xs px-4 py-2 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors">
            View bill
          </a>
        )}
        {tier === 'national' && (
          <button className="text-xs px-4 py-2 rounded-lg font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
            Contact your rep
          </button>
        )}
      </div>
    </div>
  )
}

// ── Category accordion ────────────────────────────────────────────────────────

function CategoryAccordion({ cat, ringColor }: { cat: Category; ringColor: string }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<CategoryTab>('data')

  const tabs: Array<{ id: CategoryTab; label: string }> = [
    { id: 'data',    label: 'Data & trends' },
    { id: 'actions', label: 'Actions' },
  ]

  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-stone-900 mb-1">{cat.name}</div>
            {cat.driver && (
              <div className="text-xs text-stone-500 mb-2">
                <span className="font-medium text-stone-600">Causes: </span>{cat.driver}
              </div>
            )}
            {cat.totalDeaths && (
              <div className="flex gap-6 flex-wrap mb-2">
                <div>
                  <div className="text-2xs text-stone-400 uppercase tracking-widest">Total deaths/yr</div>
                  <div className="text-sm font-semibold text-stone-700">{cat.totalDeaths}</div>
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
          {/* Tabs */}
          <div className="flex border-b border-stone-100 bg-stone-50">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={clsx(
                  'px-5 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
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
            {/* DATA TAB */}
            {tab === 'data' && (
              <div>
                {/* Category why */}
                <div className="bg-stone-50 border-l-4 rounded-r-lg p-4 mb-5" style={{ borderLeftColor: ringColor }}>
                  <p className="text-sm text-stone-700 leading-relaxed">{cat.why}</p>
                </div>

              
                {/* Main chart */}
                {/* Main chart — US picture */}
                <div className="mb-4">
                  {cat.totalChart ? (
                    <div>
                      <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
                        The US picture — total vs preventable deaths
                      </div>
                      <div className="text-xs text-stone-400 mb-3">
                        The gap between total and preventable deaths represents mortality from genetic conditions, advanced age, and causes not yet addressable with current medicine.
                      </div>
                      <TotalVsPreventableChart
                        totalData={cat.totalChart}
                        preventableData={cat.chart}
                        color={ringColor}
                        height={180}
                      />
                      <div className="mt-2 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg">
                        <div className="text-xs text-stone-400 mb-1">
                          <span className="font-medium text-stone-500">Sources:</span> CDC WONDER (US mortality) · IHME Global Burden of Disease (preventable fractions)
                        </div>
                        <div className="text-xs text-stone-400 mb-1">
                          <span className="font-medium text-stone-500">Next release:</span> January 2026 — CDC WONDER annual mortality update
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-stone-200 mt-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-50 text-green-700">Data Quality: A</span>
                          <span className="text-xs text-stone-400">Official death certificate registry — highest confidence</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <TrendChart data={cat.chart} label={cat.chartLabel} color={ringColor} height={160} />
                  )}
                </div>

                {/* Peer comparison chart — rates per 100K */}
                {cat.peerRateChart && (
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
                      How we compare — death rate per 100,000 population
                    </div>
                    <div className="text-xs text-stone-400 mb-3">
                      Using rates instead of totals makes countries of different sizes directly comparable. A country of 10 million and a country of 330 million are both measured on the same scale.
                    </div>
                    <TrendChart
                      data={cat.peerRateChart}
                      label={cat.peerRateLabel ?? 'Death rate per 100,000 population'}
                      color={ringColor}
                      height={160}
                      showTarget={true}
                    />
                    <div className="mt-2 px-3 py-2 bg-stone-50 border border-stone-100 rounded-lg">
                      <div className="text-xs text-stone-400 mb-1">
                        <span className="font-medium text-stone-500">Sources:</span> WHO Global Health Observatory · OECD Health Statistics
                      </div>
                      <div className="text-xs text-stone-400 mb-1">
                        <span className="font-medium text-stone-500">Peer nations:</span> G7 plus Australia, Netherlands, Sweden, Norway, Denmark — adjusted to deaths per 100,000 population for fair comparison regardless of country size.
                      </div>
                      <div className="text-xs text-stone-400 mb-1">
                        <span className="font-medium text-stone-500">Next release:</span> June 2026 — WHO Global Health Observatory annual update
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-stone-200 mt-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Data Quality: B</span>
                        <span className="text-xs text-stone-400">Peer-reviewed international data — high confidence, some methodology variation across countries</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Data points section header */}
                <div className="mb-4 p-3 bg-stone-900 rounded-lg">
                  <div className="text-xs font-semibold text-white mb-0.5">
                    What drives this number — {cat.dataPoints.length} contributing factors
                  </div>
                  <div className="text-xs text-stone-400">
                    Each factor below contributes to the preventable deaths count. Click any to see the mechanism, data, structural drivers, and what you can do.
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {cat.dataPoints.map(dp => (
                    <DataPointCard key={dp.id} dp={dp} ringColor={ringColor} />
                  ))}
                </div>
              </div>
            )}

            {/* ACTIONS TAB */}
            {tab === 'actions' && (
              <div>
                {/* Solved precedent */}
                {cat.dataPoints.some(dp => dp.solvedPrecedent) && (
                  <div className="mb-6">
                    {cat.dataPoints.filter(dp => dp.solvedPrecedent).map(dp => (
                      dp.solvedPrecedent && (
                        <SolvedPrecedentBlock
                          key={dp.id}
                          precedent={dp.solvedPrecedent}
                          color={ringColor}
                        />
                      )
                    ))}
                  </div>
                )}

                {/* Personal */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    <div className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Personal — things you can do today</div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {cat.actions.filter(a => a.tier === 'personal').map(action => (
                      <ActionCard key={action.id} action={action} tier="personal" />
                    ))}
                  </div>
                </div>

                {/* Community */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <div className="text-xs font-semibold text-stone-500 uppercase tracking-widest">Local — organize and advocate in your community</div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {cat.actions.filter(a => a.tier === 'local').map(action => (
                      <ActionCard key={action.id} action={action} tier="local" />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                    <span className="text-stone-300 text-sm">🔒</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-stone-500">State and local policy actions</div>
                      <div className="text-xs text-stone-400">Your state legislators, local ballot initiatives, and city council votes relevant to this issue.</div>
                    </div>
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-400 cursor-not-allowed shrink-0">Coming soon</button>
                  </div>

                  {/* See all actions */}
                  <div className="mt-4 pt-4 border-t border-stone-100 text-center">
                    <p className="text-xs text-stone-400 mb-3">
                      More actions available — personal habits, community organizing, and legislative campaigns across all 12 rings.
                    </p>
                    <Link
                      href="/actions"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-700 transition-colors"
                    >
                      See all actions for Lives Lost
                    </Link>
                  </div>
                </div>

                {/* Systemic */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <div className="text-xs font-semibold text-stone-500 uppercase tracking-widest">National — federal policy and structural change</div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {cat.actions.filter(a => a.tier === 'national').map(action => (
                      <ActionCard key={action.id} action={action} tier="national" />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
                    <span className="text-stone-300 text-sm">🔒</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-stone-500">State and local policy actions</div>
                      <div className="text-xs text-stone-400">Your state legislators, local ballot initiatives, and city council votes relevant to this issue.</div>
                    </div>
                    <button className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-400 cursor-not-allowed shrink-0">Coming soon</button>
                  </div>

                  {/* See all actions */}
                  <div className="mt-4 pt-4 border-t border-stone-100 text-center">
                    <p className="text-xs text-stone-400 mb-3">
                      More actions available across all 12 rings — personal habits, community organizing, and legislative campaigns.
                    </p>
                    <Link
                      href="/actions"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-700 transition-colors"
                    >
                      See all actions for Lives Lost
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
// ── Main page ─────────────────────────────────────────────────────────────────

export default function LivesLostPage() {
  const ring = getRingById('lives')!

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-700 transition-colors">Vital Signs</Link>
        <span>/</span>
        <span className="text-stone-900">Ring {ring.order} — {ring.name}</span>
      </div>

      {/* Ring header */}
      <div className="flex items-start gap-6 mb-6 flex-wrap">
        <RingArc score={ring.score} color={ring.color} bgColor={ring.bgColor} size={72} strokeWidth={5} />
        <div className="flex-1 min-w-64">
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">
            Ring {ring.order} of 12 · Survival cluster
          </div>
          <h1 className="font-display text-3xl font-medium text-stone-900 mb-3">{ring.name}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={ring.status} />
            <div className="flex items-center gap-2">
              <span
                className="text-2xl font-bold px-3 py-1 rounded-lg"
                style={{ background: ring.color + '15', color: ring.color }}
              >
                {scoreToGrade(ring.score)}
              </span>
              <span className="text-xs text-stone-400 leading-relaxed">
                Grade {scoreToGrade(ring.score)} · Score {ring.score}/100 · Calculated from 7 leading causes of preventable death, each weighted by contribution to total mortality
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Total → Preventable → Trend → North star bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-200 border border-stone-200 rounded-xl mb-8 bg-white shadow-card overflow-hidden">
        <div className="px-5 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Total US deaths/yr</div>
          <div className="text-2xl font-semibold text-stone-500">~2.5M</div>
          <div className="text-xs text-stone-400 mt-0.5">All causes combined</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Preventable deaths/yr</div>
          <div className="text-2xl font-semibold" style={{ color: ring.color }}>~700K</div>
          <div className="text-xs text-stone-400 mt-0.5">Peer nations demonstrate we can prevent these</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Trend</div>
          <div className="text-2xl font-semibold text-red-500">Worsening</div>
          <div className="text-xs text-stone-400 mt-0.5">Life expectancy declined 3 of last 5 years</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">North star</div>
          <div className="text-2xl font-semibold text-green-600">Zero</div>
          <div className="text-xs text-stone-400 mt-0.5">Preventable deaths — the goal</div>
        </div>
      </div>

      {/* Tagline */}
      <div className="mb-8">
        <p className="text-stone-600 leading-relaxed">{ring.tagline}</p>
      </div>

      {/* Categories */}
      <div className="mb-4">
        <h2 className="font-display text-xl font-medium text-stone-900 mb-1">
          Leading causes of preventable death
        </h2>
        <p className="text-sm text-stone-500">
          Ordered by total annual deaths. Click any cause to explore the data, drivers, and actions.
        </p>
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

      {/* Footer nav */}
      <div className="flex justify-between mt-12 pt-8 border-t border-stone-200">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          All vital signs
        </Link>
        <Link href="/rings/disease" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          Next: Disease Burden
        </Link>
      </div>
    </div>
  )
}