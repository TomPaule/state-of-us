'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { POLICY_ACTIONS } from '@/lib/data/policy-actions'
import { getAllPolicyWatchEntries } from '@/lib/data/policy-watch-index'
import type { PolicyDirection } from '@/lib/types'

type DirectionFilter = 'all' | PolicyDirection
type SourceFilter = 'all' | 'enacted' | 'driver'

const DIRECTION_COLORS: Record<PolicyDirection, string> = {
  toward: 'text-green-800 bg-green-50 border-green-200',
  away:   'text-red-800 bg-red-50 border-red-200',
  mixed:  'text-stone-600 bg-stone-100 border-stone-200',
}

const DIRECTION_ICONS: Record<PolicyDirection, string> = {
  toward: '↑', away: '↓', mixed: '⟷',
}

const DIRECTION_LABELS: Record<PolicyDirection, string> = {
  toward: 'Toward goals',
  away:   'Away from goals',
  mixed:  'Mixed effect',
}

function EvidenceQualityBadge({ grade }: { grade: string }) {
  const colors: Record<string, string> = {
    A: 'bg-green-50 text-green-700',
    B: 'bg-blue-50 text-blue-700',
    C: 'bg-amber-50 text-amber-700',
    D: 'bg-red-50 text-red-700',
  }
  return (
    <span className={clsx('text-xs font-bold px-2 py-0.5 rounded', colors[grade] ?? colors.C)}>
      Evidence: {grade}
    </span>
  )
}

function PolicyWatchCard({ entry }: { entry: any }) {
  const [open, setOpen] = useState(false)
  const direction = entry.direction as PolicyDirection
  const dirStyle = DIRECTION_COLORS[direction]

  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 border', dirStyle)}>
            {DIRECTION_ICONS[direction]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-stone-900 mb-1 leading-snug">{entry.title}</div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs text-stone-400">{entry.date}</span>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs font-medium">{entry.administration}</span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: entry.ringColor + '15', color: entry.ringColor }}
              >
                {entry.ringName}
              </span>
            </div>
            <div className="text-xs text-stone-400 leading-relaxed">
              {entry.categoryName} → {entry.driverLabel} → {entry.subsectionLabel}
            </div>
          </div>
          <div className={clsx('text-stone-400 transition-transform duration-200 shrink-0', open && 'rotate-180')}>▾</div>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100">
          {/* Concern */}
          <div className="px-5 py-4 border-b border-stone-50">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              The concern this addresses
            </div>
            <p className="text-sm text-stone-600 leading-relaxed">{entry.concern}</p>
          </div>

          {/* Data points */}
          {entry.dataPoints && entry.dataPoints.length > 0 && (
            <div className="px-5 py-4 border-b border-stone-50">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
                What the data says
              </div>
              <div className="flex flex-col gap-3">
                {entry.dataPoints.map((dp: any, i: number) => (
                  <div key={i} className="px-3 py-2.5 bg-stone-50 rounded-lg">
                    <div className="text-xs font-medium text-stone-700 italic mb-1">"{dp.claim}"</div>
                    <div className="text-xs text-stone-600 leading-relaxed mb-1.5">{dp.finding}</div>
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium',
                        dp.contested ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
                      )}>
                        {dp.contested ? 'Contested' : 'Not contested'}
                      </span>
                      <span className="text-xs text-stone-400">{dp.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ring impact */}
          <div className="px-5 py-4 border-b border-stone-50">
            <div className="px-4 py-3 bg-stone-900 rounded-lg">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
                Ring impact
              </div>
              <p className="text-xs text-stone-300 leading-relaxed mb-2">{entry.ringImpact}</p>
              <EvidenceQualityBadge grade={entry.evidenceQuality} />
            </div>
          </div>

          {/* Trade-offs */}
          {entry.tradeOffs && entry.tradeOffs.length > 0 && (
            <div className="px-5 py-4 border-b border-stone-50">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
                Trade-offs — evaluate with your own values
              </div>
              <div className="flex flex-col gap-2">
                {entry.tradeOffs.map((t: any, i: number) => (
                  <div key={i} className="px-3 py-2.5 bg-stone-50 rounded-lg">
                    <div className="text-xs font-medium text-stone-700 mb-1">
                      If you prioritize {t.ifYouPrioritize}:
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{t.assessment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source + context link */}
          <div className="px-5 py-3 bg-stone-50 flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs text-stone-400">Source: {entry.source}</div>
            <Link
              href="/rings/lives"
              className="text-xs text-stone-500 hover:text-stone-900 underline transition-colors"
            >
              See in context on Lives Lost ring
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function LegacyPolicyCard({ action }: { action: any }) {
  const [open, setOpen] = useState(false)
  const direction = action.overallDirection as PolicyDirection
  const dirStyle = DIRECTION_COLORS[direction]

  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 border', dirStyle)}>
            {DIRECTION_ICONS[direction]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-stone-900 mb-1">{action.title}</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-400">{action.date}</span>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs">{action.administration}</span>
            </div>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">{action.description}</p>
          </div>
          <div className={clsx('text-stone-400 transition-transform duration-200 shrink-0', open && 'rotate-180')}>▾</div>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100">
          {action.ringImpacts.map((impact: any) => (
            <div key={impact.ringId} className="px-5 py-4 border-b border-stone-50 last:border-0">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="text-sm font-semibold text-stone-900 capitalize">{impact.ringId} ring</div>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium border', DIRECTION_COLORS[impact.verdict as PolicyDirection])}>
                  {DIRECTION_ICONS[impact.verdict as PolicyDirection]} {DIRECTION_LABELS[impact.verdict as PolicyDirection]}
                </span>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-2">{impact.explanation}</p>
              <div className="flex flex-col gap-1">
                {impact.evidence.map((ev: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-stone-500">
                    <span className={ev.type === 'good' ? 'text-green-600 font-bold' : ev.type === 'bad' ? 'text-red-500 font-bold' : 'text-stone-400'}>
                      {ev.type === 'good' ? '✓' : ev.type === 'bad' ? '✗' : '·'}
                    </span>
                    <span>{ev.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="px-5 py-3 bg-stone-50">
            <div className="text-xs text-stone-400">Source: {action.source}</div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackerPage() {
  const [dirFilter, setDirFilter] = useState<DirectionFilter>('all')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')

  const policyWatchEntries = getAllPolicyWatchEntries()

  const allEntries = [
    ...policyWatchEntries.map(e => ({ ...e, _type: 'driver' as const })),
    ...POLICY_ACTIONS.map(a => ({ ...a, _type: 'enacted' as const, direction: a.overallDirection })),
  ]

  const filtered = allEntries.filter(e => {
    const dirOk = dirFilter === 'all' || e.direction === dirFilter
    const srcOk = sourceFilter === 'all' || e._type === sourceFilter
    return dirOk && srcOk
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="max-w-2xl mb-10">
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Policy Tracker</div>
        <h1 className="font-display text-4xl font-medium text-stone-900 mb-4 leading-tight">
          Every policy action. Assessed against the goals.
        </h1>
        <p className="text-stone-600 leading-relaxed mb-4">
          Government policy actions and structural drivers are evaluated against the 12 ring metrics 
          based on peer-reviewed research, official data, and documented evidence — not editorial opinion 
          or political framing. The same framework applies to every administration.
        </p>
        <div className="text-sm font-medium text-stone-700 bg-stone-100 rounded-lg px-4 py-3">
          This is not a scorecard of politicians — it is a scorecard of policies and structural conditions 
          against universal goals. Actions from all administrations are assessed equally.
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-6 flex-wrap mb-8">
        <div>
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Direction</div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'toward', 'away', 'mixed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDirFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  dirFilter === f
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                )}
              >
                {f === 'all' ? 'All' : f === 'toward' ? '↑ Toward' : f === 'away' ? '↓ Away' : '⟷ Mixed'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Source</div>
          <div className="flex gap-2">
            {(['all', 'enacted', 'driver'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSourceFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  sourceFilter === f
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400'
                )}
              >
                {f === 'all' ? 'All sources' : f === 'enacted' ? 'Enacted policy' : 'Structural drivers'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm text-stone-400 mb-6">
        Showing {filtered.length} of {allEntries.length} policy assessments
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map((entry: any) => (
          entry._type === 'driver'
            ? <PolicyWatchCard key={entry.id} entry={entry} />
            : <LegacyPolicyCard key={entry.id} action={entry} />
        ))}
      </div>

      <div className="border border-stone-200 rounded-xl bg-stone-50 p-6 mt-12">
        <h2 className="font-display text-lg font-medium text-stone-900 mb-2">How assessments work</h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          Each assessment includes the underlying concern the policy addresses, what the data says 
          about that concern (with contested vs uncontested clearly labeled), the ring impact with 
          evidence quality grade, and explicit trade-offs so you can evaluate with your own values. 
          Every claim has a source. No editorial position is taken on which trade-off is correct.
        </p>
      </div>
    </div>
  )
}