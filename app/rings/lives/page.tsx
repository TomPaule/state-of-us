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
import ShareButton from '@/components/ui/ShareButton'
import ContactRepModal from '@/components/ui/ContactRepModal'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'


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

function TrustBadge({ grade, explanation, howToUse, checklist }: {
  grade: string
  explanation: string
  howToUse?: string
  checklist?: any
}) {
  const [show, setShow] = useState(false)

  React.useEffect(() => {
    if (show) { // or `open` for SubsectionBlock
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [show]) // or [open]

  const gradeColors: Record<string, string> = {
    A: 'bg-green-50 text-green-700 border-green-200',
    B: 'bg-blue-50 text-blue-700 border-blue-200',
    C: 'bg-amber-50 text-amber-700 border-amber-200',
    D: 'bg-red-50 text-red-700 border-red-200',
    F: 'bg-red-100 text-red-800 border-red-300',
  }

  const gradeGuidance: Record<string, string> = {
    A: 'Strong foundation — this finding is well-established.',
    B: 'Good evidence — minor limitations noted. Appropriate to cite with context.',
    C: 'Preliminary — treat as one data point, not settled science. Seek corroboration.',
    D: 'Weak evidence — significant limitations. Do not use to form strong conclusions.',
    F: 'Unreliable — do not use to inform your opinion on this topic.',
  }

  const criteria = [
    {
      group: 'Critical',
      items: [
        { label: 'Peer reviewed', value: checklist?.peerReviewed, description: 'Evaluated by independent experts before publication' },
        { label: 'Independently replicated', value: checklist?.replicated, description: 'Findings confirmed by separate research teams' },
        { label: 'Large sample size', value: checklist?.largeSampleSize, description: checklist?.sampleSizeDetail ?? 'Sufficient participants to detect real effects' },
        { label: 'No conflicts of interest', value: checklist?.noConflictsOfInterest, description: checklist?.conflictsDetail ?? 'No financial relationships that could bias results' },
        { label: 'Causal evidence (RCT/natural experiment)', value: checklist?.causalEvidence, description: 'Establishes cause and effect, not just correlation' },
      ]
    },
    {
      group: 'Important',
      items: [
        { label: 'Systematic review or meta-analysis', value: checklist?.systematicReview, description: 'Synthesizes findings across multiple studies' },
        { label: 'Recent data', value: checklist?.recentData, description: checklist?.recencyDetail ?? 'Data collected recently enough to be relevant' },
        { label: 'Generalizable population', value: checklist?.generalizablePopulation, description: checklist?.populationDetail ?? 'Study population reflects who the finding applies to' },
        { label: 'Effect size reported', value: checklist?.effectSizeReported, description: 'Reports practical magnitude, not just statistical significance' },
        { label: 'Funding source disclosed', value: checklist?.fundingDisclosed, description: checklist?.fundingDetail ?? 'Who paid for the research is transparently stated' },
      ]
    },
    {
      group: 'Additional',
      items: [
        { label: 'Government or institutional source', value: checklist?.governmentSource, description: 'Collected by a public institution with no commercial interest' },
        { label: 'Longitudinal data', value: checklist?.longitudinal, description: 'Tracks the same population over time' },
        { label: 'Pre-registered study design', value: checklist?.preRegistered, description: 'Hypothesis registered before data collection — prevents p-hacking' },
        { label: 'Open data available', value: checklist?.openData, description: 'Raw data publicly available for independent verification' },
      ]
    }
  ]

  const criticalPassing = criteria[0].items.filter(i => i.value === true).length
  const criticalTotal = criteria[0].items.length

  const badgeContent = (
    <>
      {/* Header */}
      <div className={clsx('px-4 py-3 flex items-center justify-between', gradeColors[grade])}>
        <div>
          <div className="font-bold text-sm">Grade {grade}</div>
          <div className="opacity-80 text-xs">{gradeGuidance[grade]}</div>
        </div>
        <div className="text-right opacity-70 text-xs whitespace-nowrap">
          {criticalPassing}/{criticalTotal} critical criteria met
        </div>
      </div>

      {/* Checklist */}
      <div className="px-4 py-3 border-b border-stone-100">
        <div className="font-semibold text-stone-700 mb-3 uppercase tracking-widest text-xs">
          Evidence quality checklist
        </div>
        {criteria.map((group, gi) => (
          <div key={gi} className="mb-3">
            <div className="text-xs text-stone-400 uppercase tracking-widest mb-2">
              {group.group}
            </div>
            <div className="flex flex-col gap-1.5">
              {group.items.map((item, ii) => (
                <div key={ii} className="flex items-start gap-2">
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <span className="text-stone-300 text-xs">{gi * 5 + ii + 1}.</span>
                    <span className={clsx('font-bold text-sm',
                      item.value === true ? 'text-green-600' :
                      item.value === false ? 'text-red-500' :
                      'text-stone-300'
                    )}>
                      {item.value === true ? '✓' : item.value === false ? '✗' : '·'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className={clsx('font-medium text-xs',
                      item.value === true ? 'text-stone-800' :
                      item.value === false ? 'text-stone-500' :
                      'text-stone-400'
                    )}>
                      {item.label}
                    </span>
                    <span className="text-stone-400 text-xs"> — {item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Why this grade */}
      <div className="px-4 py-3 border-b border-stone-100">
        <div className="font-semibold text-stone-700 mb-1 text-xs">Why this grade:</div>
        <p className="text-stone-600 leading-relaxed text-xs">{explanation}</p>
      </div>

      {/* How to use */}
      <div className="px-4 py-3 bg-stone-50">
        <div className="font-semibold text-stone-700 mb-1 text-xs">How to use this finding:</div>
        <p className="text-stone-600 leading-relaxed text-xs">
          {howToUse ?? gradeGuidance[grade]}
        </p>
      </div>
    </>
  )

  return (
    <div className="inline-block">
      <button
        onClick={e => { e.stopPropagation(); setShow(s => !s) }}
        className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium', gradeColors[grade])}
      >
        Data Quality: {grade}
        <span className={clsx('transition-transform duration-200 inline-block', show && 'rotate-180')}>▾</span>
      </button>

      {show && (
        <>
          {/* Mobile — full screen drawer */}
          <div className="sm:hidden fixed inset-0 z-[200] bg-white overflow-y-auto overscroll-none">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
              <div className="font-semibold text-stone-900 text-sm">Data Quality: Grade {grade}</div>
              <button
                onClick={e => { e.stopPropagation(); setShow(false) }}
                className="text-stone-400 hover:text-stone-700 text-lg"
              >
                ✕
              </button>
            </div>
            {badgeContent}
          </div>

          {/* Desktop — inline dropdown */}
          <div className="hidden sm:block mt-1 rounded-xl border border-stone-200 bg-white text-xs leading-relaxed shadow-sm overflow-hidden">
            {badgeContent}
          </div>
        </>
      )}
    </div>
  )
}

// ── Bill status bar ───────────────────────────────────────────────────────────

function BillStatusBar({ legislation, ringId, categoryId, actionId }: {
  legislation: NonNullable<Action['legislation']>
  ringId: string
  categoryId: string
  actionId: string
}) {
  const [showModal, setShowModal] = useState(false)
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

  const defaultMessage = `Dear Representative,

My name is [Your Name] and I am a constituent writing to urge you to support ${legislation.billName} (${legislation.billNumber}).

${legislation.summary}

This legislation directly addresses one of the most preventable causes of harm in our country. Peer nations that have implemented similar policies have demonstrated measurably better outcomes for their citizens.

I am asking you to co-sponsor and support this bill. Your constituents are counting on you to take action on issues that directly affect our health and wellbeing.

Thank you for your service and your consideration.

Sincerely,
[Your Name]
[Your City, State]`

  return (
    <>
      {showModal && (
        <ContactRepModal
          billName={legislation.billName}
          billNumber={legislation.billNumber}
          ringId={ringId}
          categoryId={categoryId}
          actionId={actionId}
          defaultMessage={defaultMessage}
          onClose={() => setShowModal(false)}
        />
      )}

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

            {/* Contact rep button */}
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              Contact your representative about this bill
            </button>
          </>
        )}
      </div>
    </>
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
    </div>
  )
}
// ── Driver card ───────────────────────────────────────────────────────────────

function DriverActionCard({ action, isLocked }: { action: any; isLocked: boolean }) {
  const tierStyles: Record<string, string> = {
    personal: 'border-blue-100 bg-blue-50/30',
    local:    'border-green-100 bg-green-50/30',
    state:    'border-purple-100 bg-purple-50/30',
    national: 'border-amber-100 bg-amber-50/30',
  }
  const tierButtons: Record<string, string> = {
    personal: 'bg-blue-600 hover:bg-blue-700 text-white',
    local:    'bg-green-600 hover:bg-green-700 text-white',
    state:    'bg-purple-600 hover:bg-purple-700 text-white',
    national: 'bg-amber-600 hover:bg-amber-700 text-white',
  }

  if (isLocked) {
    return (
      <div className="border border-dashed border-stone-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-stone-300">🔒</span>
        <div className="flex-1">
          <div className="text-xs font-medium text-stone-400">{action.text}</div>
          <div className="text-xs text-stone-300 mt-0.5">
            {action.tier === 'local' ? 'Local opportunities — upgrade to Community tier' : 'State-specific actions — upgrade to Civic tier'}
          </div>
        </div>
        <TierPill tier={action.tier} />
      </div>
    )
  }

  return (
    <div className={clsx('border rounded-lg p-3 transition-all', tierStyles[action.tier])}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="text-xs font-semibold text-stone-700">{action.text}</div>
        <TierPill tier={action.tier} />
      </div>

      {action.whyItMatters && (
        <div className="mb-2">
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1">
            Why this matters for this specific driver
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">{action.whyItMatters}</p>
        </div>
      )}

      {action.consequence && (
        <div className="mb-2 px-2.5 py-2 bg-white border border-stone-100 rounded-lg">
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-0.5">
            If enough people do this
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">{action.consequence}</p>
        </div>
      )}

      {action.timeEstimate && (
        <div className="text-xs text-stone-400 font-mono mb-2">⏱ {action.timeEstimate}</div>
      )}

      {action.legislation && (
        <BillStatusBar
          legislation={action.legislation}
          ringId="lives"
          categoryId="cardiovascular"
          actionId={action.tier}
        />
      )}

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {action.startHere && (
          <a href={action.startHere} target="_blank" rel="noopener noreferrer" className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors', tierButtons[action.tier])}>
            {action.startHereLabel ?? 'Start here'}
          </a>
        )}
        {!action.startHere && action.tier === 'personal' && (
          <button className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors', tierButtons[action.tier])}>
            I'll do this
          </button>
        )}
        {!action.startHere && action.tier === 'national' && (
          <button className={clsx('text-xs px-3 py-1.5 rounded-lg font-medium transition-colors', tierButtons[action.tier])}>
            Contact your rep
          </button>
        )}
      </div>
    </div>
  )
}

function HistoricalPrecedentBlock({ precedent, color }: { precedent: any; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-green-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2.5 bg-green-50 hover:bg-green-100 transition-colors flex items-center justify-between gap-2"
      >
        <div>
          <div className="text-xs font-semibold text-green-800">{precedent.title}</div>
          <div className="text-xs text-green-600">{precedent.year}</div>
        </div>
        <span className={clsx('text-green-500 shrink-0 transition-transform duration-200', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <div className="p-3 bg-white border-t border-green-100">
          <p className="text-xs text-stone-700 leading-relaxed mb-2">{precedent.description}</p>
          <div className="px-3 py-2 bg-green-50 rounded-lg mb-2">
            <div className="text-xs font-medium text-green-700 mb-0.5">Result</div>
            <p className="text-xs text-green-800 leading-relaxed">{precedent.result}</p>
          </div>
          <div className="px-3 py-2 bg-stone-50 rounded-lg mb-2">
            <div className="text-xs font-medium text-stone-500 mb-0.5">Why this matters here</div>
            <p className="text-xs text-stone-600 leading-relaxed">{precedent.relevance}</p>
          </div>
          {precedent.chart && precedent.chartLabel && (
            <TrendChart data={precedent.chart} label={precedent.chartLabel} color="#16A34A" height={100} showTarget={false} />
          )}
        </div>
      )}
    </div>
  )
}

function PolicyWatchEntryBlock({ entry }: { entry: any }) {
  const [open, setOpen] = useState(false)
  const dirColors: Record<string, string> = {
    toward: 'bg-green-50 border-green-200 text-green-800',
    away:   'bg-red-50 border-red-200 text-red-800',
    mixed:  'bg-amber-50 border-amber-200 text-amber-800',
  }
  const dirIcons: Record<string, string> = {
    toward: '↑', away: '↓', mixed: '⟷',
  }
  return (
    <div className={clsx('border rounded-lg overflow-hidden', dirColors[entry.direction])}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2.5 hover:opacity-80 transition-opacity flex items-center justify-between gap-2"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{dirIcons[entry.direction]}</span>
          <div>
            <div className="text-xs font-semibold">{entry.title}</div>
            <div className="text-xs opacity-70">{entry.administration} · {entry.date}</div>
          </div>
        </div>
        <span className={clsx('shrink-0 transition-transform duration-200 opacity-60', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-current border-opacity-20 bg-white">
          {/* Concern */}
          <div className="mt-3">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
              The concern this addresses
            </div>
            <ul className="space-y-1.5">
              {entry.concern.split('. ').filter((s: string) => s.trim().length > 10).map((sentence: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                  <span className="text-stone-300 shrink-0 mt-0.5 font-bold">→</span>
                  <span>{sentence.trim().replace(/\.$/, '')}.</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Data points */}
          {entry.dataPoints && entry.dataPoints.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">What the data says</div>
              <div className="flex flex-col gap-2">
                {entry.dataPoints.map((dp: any, i: number) => (
                  <div key={i} className="px-3 py-2 bg-stone-50 rounded-lg">
                    <div className="text-xs font-medium text-stone-700 mb-0.5 italic">"{dp.claim}"</div>
                    <div className="text-xs text-stone-600 leading-relaxed mb-1">{dp.finding}</div>
                    <div className="flex items-center gap-2">
                      <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium', dp.contested ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700')}>
                        {dp.contested ? 'Contested' : 'Not contested'}
                      </span>
                      <span className="text-xs text-stone-400">{dp.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ring impact + Trade-offs combined */}
          <div className="mt-3 bg-stone-900 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-800">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-stone-300 uppercase tracking-widest">
                  Impact on vital signs
                </div>
                <span className={clsx('text-xs px-2 py-0.5 rounded font-bold',
                  entry.evidenceQuality === 'A' ? 'bg-green-900 text-green-300' :
                  entry.evidenceQuality === 'B' ? 'bg-blue-900 text-blue-300' :
                  'bg-amber-900 text-amber-300'
                )}>
                  Evidence: {entry.evidenceQuality}
                </span>
              </div>
              {entry.ringImpact.split('. ').filter((s: string) => s.trim().length > 5).map((sentence: string, i: number) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className={clsx('text-xs font-bold shrink-0 mt-0.5',
                    sentence.toLowerCase().includes('toward') ? 'text-green-400' :
                    sentence.toLowerCase().includes('away') ? 'text-red-400' :
                    'text-stone-400'
                  )}>
                    {sentence.toLowerCase().includes('toward') ? '↑' :
                     sentence.toLowerCase().includes('away') ? '↓' : '·'}
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {sentence.trim().replace(/\.$/, '')}.
                  </p>
                </div>
              ))}
            </div>
            {entry.tradeOffs && entry.tradeOffs.length > 0 && (
              <div className="px-4 py-3">
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                  Trade-offs — evaluate with your own values
                </div>
                <div className="flex flex-col gap-2">
                  {entry.tradeOffs.map((t: any, i: number) => (
                    <div key={i} className="px-3 py-2 bg-stone-800 rounded-lg">
                      <div className="text-xs font-medium text-stone-300 mb-0.5">
                        If you prioritize {t.ifYouPrioritize}:
                      </div>
                      <p className="text-xs text-stone-400 leading-relaxed">{t.assessment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-stone-400">Source: {entry.source}</div>
        </div>
      )}
    </div>
  )
}
function EvidenceDropdown({ items, label, color }: { items: any[]; label: string; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
      >
        <span className={clsx('transition-transform duration-200', open && 'rotate-180')}>▾</span>
        {label} ({items.length} {items.length === 1 ? 'source' : 'sources'})
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {items.map((ev: any) => (
            <div key={ev.id} className="px-2 py-2 sm:px-3 sm:py-2.5 bg-white border border-stone-100 rounded-lg">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-xs font-medium text-stone-700">{ev.claim}</div>
                <TrustBadge grade={ev.grade} explanation={ev.gradeExplanation} />
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mb-1">{ev.finding}</p>
              <div className="text-xs text-stone-400">
                {ev.sourceUrl ? (
                  <a href={ev.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-600 transition-colors">
                    {ev.source}
                  </a>
                ) : ev.source}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OptionCard({ option }: { option: any }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={clsx(
      'border rounded-xl overflow-hidden',
      option.isOptimal ? 'border-green-300 bg-green-50/30' : 'border-stone-200 bg-white'
    )}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 hover:bg-stone-50/50 transition-colors flex items-center gap-3"
      >
        {option.isOptimal && (
          <span className="text-xs font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded-full shrink-0">
            ★ Optimal
          </span>
        )}
        <div className="flex-1 text-xs font-semibold text-stone-800">{option.label}</div>
        <span className={clsx('text-stone-400 shrink-0 transition-transform duration-200', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <div className="px-1 pb-2 sm:px-4 sm:pb-4 border-t border-stone-100">
          {/* Pros */}
          {option.pros && option.pros.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-2">
                Pros
              </div>
              <div className="flex flex-col gap-2">
                {option.pros.map((pro: any, i: number) => (
                  <div key={i} className="px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-xs font-medium text-green-800">{pro.label}</div>
                      <TrustBadge grade={pro.grade} explanation={pro.gradeExplanation ?? pro.source} />
                    </div>
                    <p className="text-xs text-green-700 leading-relaxed mb-1">{pro.explanation}</p>
                    <div className="text-xs text-green-600 italic">
                      {pro.sourceUrl ? (
                        <a href={pro.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-green-800 transition-colors">
                          {pro.source}
                        </a>
                      ) : pro.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Cons */}
          {option.cons && option.cons.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-2">
                Cons
              </div>
              <div className="flex flex-col gap-2">
                {option.cons.map((con: any, i: number) => (
                  <div key={i} className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-xs font-medium text-red-800">{con.label}</div>
                      <TrustBadge grade={con.grade} explanation={con.gradeExplanation ?? con.source} />
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed mb-1">{con.explanation}</p>
                    <div className="text-xs text-red-600 italic">
                      {con.sourceUrl ? (
                        <a href={con.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-red-800 transition-colors">
                          {con.source}
                        </a>
                      ) : con.source}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WhereThingsStandCard({ entry }: { entry: any }) {
  const [open, setOpen] = useState(false)
  const branchLabels: Record<string, string> = {
    personal: 'Personal',
    local: 'Local',
    state: 'State',
    national_legislative: 'Legislative',
    national_judicial: 'Judicial',
    national_executive: 'Executive',
    private: 'Private sector',
  }
  const branchColors: Record<string, string> = {
    personal: 'bg-blue-50 text-blue-700 border-blue-200',
    local: 'bg-green-50 text-green-700 border-green-200',
    state: 'bg-purple-50 text-purple-700 border-purple-200',
    national_legislative: 'bg-amber-50 text-amber-700 border-amber-200',
    national_judicial: 'bg-orange-50 text-orange-700 border-orange-200',
    national_executive: 'bg-red-50 text-red-700 border-red-200',
    private: 'bg-stone-100 text-stone-700 border-stone-200',
  }
  const dirIcons: Record<string, string> = {
    toward: '↑', away: '↓', mixed: '⟷',
  }
  const dirColors: Record<string, string> = {
    toward: 'text-green-600', away: 'text-red-600', mixed: 'text-amber-600',
  }

  if (entry.locked) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 border border-dashed border-stone-200 rounded-xl">
        <span className="text-stone-300 shrink-0">🔒</span>
        <div className="flex-1">
          <div className="text-xs font-medium text-stone-400">{entry.title}</div>
          <div className="text-xs text-stone-300">
            {entry.lockedTier === 'civic' ? 'Upgrade to Civic tier' : 'Upgrade to Community tier'}
          </div>
        </div>
        <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', branchColors[entry.branch])}>
          {branchLabels[entry.branch]}
        </span>
      </div>
    )
  }

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 mt-0.5', branchColors[entry.branch])}>
            {branchLabels[entry.branch]}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <div className="text-xs font-semibold text-stone-800">{entry.title}</div>
              {entry.direction && (
                <span className={clsx('text-xs font-bold', dirColors[entry.direction])}>
                  {dirIcons[entry.direction]}
                </span>
              )}
            </div>
            {entry.status && (
              <div className="text-xs text-stone-400">{entry.status}</div>
            )}
          </div>
          <span className={clsx('text-stone-400 shrink-0 transition-transform duration-200', open && 'rotate-180')}>▾</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100 px-2 py-3 sm:px-4 sm:py-4">
          <p className="text-xs text-stone-600 leading-relaxed mb-3">{entry.description}</p>

          {/* Bill lifecycle */}
          {entry.billName && (
            <div className="mb-3 px-3 py-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="text-xs font-semibold text-blue-900 mb-0.5">
                {entry.billName} · {entry.billNumber}
              </div>
              {entry.billStageCount !== undefined && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(entry.billStageCount / entry.billStageTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-700 font-medium shrink-0">
                      {entry.billStageCount}/{entry.billStageTotal}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600">{entry.billStageLabel}</div>
                </div>
              )}
            </div>
          )}

          {/* Senator context */}
          {entry.senatorContext && entry.senatorContext.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                Your senators
              </div>
              <div className="flex flex-col gap-2">
                {entry.senatorContext.map((sen: any, i: number) => (
                  <div key={i} className="px-3 py-2 bg-stone-50 rounded-lg">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="text-xs font-semibold text-stone-800">{sen.name}</div>
                      <span className={clsx('text-xs px-1.5 py-0.5 rounded font-medium',
                        sen.position === 'supporting' ? 'bg-green-50 text-green-700' :
                        sen.position === 'opposing' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      )}>
                        {sen.position === 'supporting' ? 'Supporting' :
                         sen.position === 'opposing' ? 'Opposing' :
                         sen.position === 'not_cosponsored' ? 'Not co-sponsored' :
                         'Undecided'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500">{sen.persuadability}</div>
                    {sen.pacDonations && (
                      <div className="text-xs text-stone-400 mt-0.5">
                        Pharma PAC donations: {sen.pacDonations}
                      </div>
                    )}
                    {sen.nextElection && (
                      <div className="text-xs text-stone-400">
                        Next election: {sen.nextElection}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {entry.actions && entry.actions.length > 0 && (
            <div className="flex flex-col gap-2">
              {entry.actions.map((action: any, i: number) => {
                if (action.type === 'contact' || action.type === 'external') {
                  return (
                    <a key={i} href={action.url ?? '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-700 transition-colors">
                      {action.label}
                    </a>
                  )
                }
                if (action.type === 'petition') {
                  return (
                    <a key={i} href={action.url ?? '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition-colors">
                      {action.label}
                    </a>
                  )
                }
                if (action.type === 'download') {
                  return (
                    <button
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      ↓ {action.label}
                    </button>
                  )
                }
                if (action.type === 'quiz') {
                  return (
                    <a key={i} href={action.url ?? '#'} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                      {action.label}
                    </a>
                  )
                }
                return (
                  <button
                    key={i}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-50 transition-colors"
                  >
                    {action.label}
                  </button>
                )
              })}
            </div>
          )}

          {entry.lastUpdated && (
            <div className="mt-3 text-xs text-stone-400">
              Last updated: {entry.lastUpdated}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
function PublicTierGroup({ label, color, entries }: { label: string; color: string; entries: any[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-stone-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2 bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-between gap-2"
      >
        <div className={clsx('text-xs font-semibold uppercase tracking-widest', color)}>
          {label}
        </div>
        <span className={clsx('text-stone-400 text-xs transition-transform duration-200', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <div className="p-2 flex flex-col gap-2">
          {entries.map((entry: any) => (
            <WhereThingsStandCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

function NationalGroup({ entries }: { entries: any[] }) {
  const [open, setOpen] = useState(false)
  const legislative = entries.filter((e: any) => e.branch === 'national_legislative')
  const judicial = entries.filter((e: any) => e.branch === 'national_judicial')
  const executive = entries.filter((e: any) => e.branch === 'national_executive')

  return (
    <div className="border border-stone-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 py-2 bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-between gap-2"
      >
        <div className="text-xs font-semibold text-amber-700 uppercase tracking-widest">
          National
        </div>
        <span className={clsx('text-stone-400 text-xs transition-transform duration-200', open && 'rotate-180')}>▾</span>
      </button>
      {open && (
        <div className="p-2 flex flex-col gap-3">

          {legislative.length > 0 && (
            <div>
              <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1.5 px-1">
                Legislative
              </div>
              <div className="flex flex-col gap-2">
                {legislative.map((entry: any) => (
                  <WhereThingsStandCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {judicial.length > 0 && (
            <div>
              <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1.5 px-1">
                Judicial
              </div>
              <div className="flex flex-col gap-2">
                {judicial.map((entry: any) => (
                  <WhereThingsStandCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}

          {executive.length > 0 && (
            <div>
              <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-1.5 px-1">
                Executive
              </div>
              <div className="flex flex-col gap-2">
                {executive.map((entry: any) => (
                  <WhereThingsStandCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
function SubsectionBlock({ subsection, ringColor }: { subsection: any; ringColor: string }) {
  const [open, setOpen] = useState(false)
 React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const hasNewArchitecture = subsection.issueClaim || subsection.solutionClaim ||
    subsection.options || subsection.whereThingsStand

  const content = hasNewArchitecture ? (
    <div className="flex flex-col gap-6">
      {/* Problem */}
      {subsection.issueClaim && (
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Problem</div>
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-sm font-medium text-red-900 leading-relaxed">{subsection.issueClaim}</p>
            {subsection.issueEvidence && subsection.issueEvidence.length > 0 && (
              <EvidenceDropdown items={subsection.issueEvidence} label="Problem evidence" color="red" />
            )}
          </div>
        </div>
      )}

      {/* Solution */}
      {subsection.solutionClaim && (
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Solution</div>
          <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
            <p className="text-sm font-medium text-green-900 leading-relaxed">{subsection.solutionClaim}</p>
            {subsection.solutionEvidence && subsection.solutionEvidence.length > 0 && (
              <EvidenceDropdown items={subsection.solutionEvidence} label="Solution evidence" color="green" />
            )}
          </div>
        </div>
      )}

      {/* Options */}
      {subsection.options && subsection.options.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            Options — ranked by evidence
          </div>
          <div className="flex flex-col gap-2">
            {subsection.options
              .sort((a: any, b: any) => (b.isOptimal ? 1 : 0) - (a.isOptimal ? 1 : 0))
              .map((option: any) => (
                <OptionCard key={option.id} option={option} />
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {subsection.whereThingsStand && subsection.whereThingsStand.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">Actions</div>
          <div className="flex flex-col gap-4">
            {/* Personal */}
            {subsection.whereThingsStand.filter((e: any) => e.branch === 'personal').length > 0 && (
              <div>
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />Personal
                </div>
                <div className="flex flex-col gap-2">
                  {subsection.whereThingsStand.filter((e: any) => e.branch === 'personal').map((entry: any) => (
                    <WhereThingsStandCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
            {/* Public */}
            {subsection.whereThingsStand.filter((e: any) =>
              ['local', 'state', 'national_legislative', 'national_judicial', 'national_executive'].includes(e.branch)
            ).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />Public sector
                </div>
                <div className="flex flex-col gap-3">
                  {subsection.whereThingsStand.filter((e: any) => e.branch === 'local').length > 0 && (
                    <PublicTierGroup label="Local" color="text-green-700" entries={subsection.whereThingsStand.filter((e: any) => e.branch === 'local')} />
                  )}
                  {subsection.whereThingsStand.filter((e: any) => e.branch === 'state').length > 0 && (
                    <PublicTierGroup label="State" color="text-purple-700" entries={subsection.whereThingsStand.filter((e: any) => e.branch === 'state')} />
                  )}
                  {subsection.whereThingsStand.filter((e: any) =>
                    ['national_legislative', 'national_judicial', 'national_executive'].includes(e.branch)
                  ).length > 0 && (
                    <NationalGroup entries={subsection.whereThingsStand.filter((e: any) =>
                      ['national_legislative', 'national_judicial', 'national_executive'].includes(e.branch)
                    )} />
                  )}
                </div>
              </div>
            )}
            {/* Private */}
            {subsection.whereThingsStand.filter((e: any) => e.branch === 'private').length > 0 && (
              <div>
                <div className="text-xs font-semibold text-stone-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-stone-400" />Private sector
                </div>
                <div className="flex flex-col gap-2">
                  {subsection.whereThingsStand.filter((e: any) => e.branch === 'private').map((entry: any) => (
                    <WhereThingsStandCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  ) : (
    /* Legacy architecture */
    <div>
      {subsection.bullets && subsection.bullets.length > 0 && (
        <div className="pt-3 pb-2">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">The evidence</div>
          <ul className="space-y-3">
            {subsection.bullets.map((bullet: any, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-stone-300 shrink-0 mt-0.5 font-bold text-xs">→</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-600 leading-relaxed mb-1">{bullet.text}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-stone-400 italic break-all">
                      {bullet.sourceUrl ? (
                        <a href={bullet.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-600 transition-colors">
                          {bullet.source}
                        </a>
                      ) : bullet.source}
                    </span>
                    {bullet.sourceGrade && (
                      <TrustBadge grade={bullet.sourceGrade} explanation={bullet.sourceGradeExplanation ?? ''} />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {subsection.historicalPrecedents && subsection.historicalPrecedents.length > 0 && (
        <div className="pb-3">
          <div className="flex items-center gap-2 my-3">
            <div className="h-px flex-1 bg-green-100" />
            <div className="text-xs font-semibold text-green-700 uppercase tracking-widest px-2">What's worked historically</div>
            <div className="h-px flex-1 bg-green-100" />
          </div>
          <div className="flex flex-col gap-2">
            {subsection.historicalPrecedents.map((p: any, i: number) => (
              <HistoricalPrecedentBlock key={i} precedent={p} color={ringColor} />
            ))}
          </div>
        </div>
      )}
      {subsection.policyWatch && (
        <div className="pb-3">
          <div className="flex items-center gap-2 my-3">
            <div className="h-px flex-1 bg-blue-100" />
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-widest px-2">Policy watch</div>
            <div className="h-px flex-1 bg-blue-100" />
          </div>
          {subsection.policyWatch.federal && subsection.policyWatch.federal.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Federal</div>
              <div className="flex flex-col gap-2">
                {subsection.policyWatch.federal.map((entry: any) => (
                  <PolicyWatchEntryBlock key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
          {subsection.policyWatch.stateTeaser && (
            <div className="mb-2 flex items-center gap-3 px-3 py-2.5 bg-stone-50 border border-dashed border-stone-200 rounded-lg">
              <span className="text-stone-300 shrink-0">🔒</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-stone-400">State policy watch</div>
                <div className="text-xs text-stone-300">{subsection.policyWatch.stateTeaser}</div>
              </div>
              <span className="text-xs text-stone-300 shrink-0">Civic tier</span>
            </div>
          )}
          {subsection.policyWatch.localTeaser && (
            <div className="flex items-center gap-3 px-3 py-2.5 bg-stone-50 border border-dashed border-stone-200 rounded-lg">
              <span className="text-stone-300 shrink-0">🔒</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-stone-400">Local policy watch</div>
                <div className="text-xs text-stone-300">{subsection.policyWatch.localTeaser}</div>
              </div>
              <span className="text-xs text-stone-300 shrink-0">Community tier</span>
            </div>
          )}
        </div>
      )}
      {!subsection.contextOnly && subsection.actions && subsection.actions.length > 0 && (
        <div className="pb-3">
          <div className="flex items-center gap-2 my-3">
            <div className="h-px flex-1 bg-stone-200" />
            <div className="text-xs font-semibold text-stone-900 uppercase tracking-widest px-2">What you can do</div>
            <div className="h-px flex-1 bg-stone-200" />
          </div>
          <div className="flex flex-col gap-2">
            {['personal', 'local', 'state', 'national'].map(tier => {
              const tierActions = subsection.actions.filter((a: any) => a.tier === tier)
              if (tierActions.length === 0) return null
              const isLocked = tier === 'local' || tier === 'state'
              const tierColors: Record<string, string> = {
                personal: 'text-blue-700', local: 'text-green-700',
                state: 'text-purple-700', national: 'text-amber-700',
              }
              const tierLabels: Record<string, string> = {
                personal: 'Personal', local: 'Local', state: 'State', national: 'National',
              }
              return (
                <div key={tier}>
                  <div className={clsx('text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1.5', tierColors[tier])}>
                    {isLocked && <span>🔒</span>}{tierLabels[tier]}
                  </div>
                  <div className="flex flex-col gap-2">
                    {tierActions.map((a: any, i: number) => (
                      <DriverActionCard key={i} action={a} isLocked={isLocked} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {subsection.contextOnly && (
        <p className="text-xs text-stone-400 italic pb-3">
          This section provides context for understanding the structural driver. Actions are included in other subsections above.
        </p>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile — full screen drawer */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen(true)}
          className="w-full text-left px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between gap-2"
        >
          <div>
            <div className="text-xs font-semibold text-stone-800">{subsection.label}</div>
            {subsection.lastUpdated && (
              <div className="text-xs text-stone-400 mt-0.5">Updated {subsection.lastUpdated}</div>
            )}
          </div>
          <span className="text-stone-400 shrink-0 text-sm">→</span>
        </button>

        {open && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto overscroll-none">
            <div className="sticky top-0 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-stone-900 leading-snug">{subsection.label}</div>
              <button
                onClick={() => setOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-light shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="px-4 py-4">
              {content}
            </div>
          </div>
        )}
      </div>

      {/* Desktop — inline expand */}
      <div className="hidden sm:block border border-stone-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full text-left px-3 py-2.5 bg-stone-50 hover:bg-stone-100 transition-colors flex items-center justify-between gap-2"
        >
          <div>
            <div className="text-xs font-semibold text-stone-800">{subsection.label}</div>
            {subsection.lastUpdated && (
              <div className="text-xs text-stone-400 mt-0.5">Updated {subsection.lastUpdated}</div>
            )}
          </div>
          <span className={clsx('text-stone-400 shrink-0 transition-transform duration-200', open && 'rotate-180')}>▾</span>
        </button>
        {open && (
          <div className="border-t border-stone-100 px-4 py-4">
            {content}
          </div>
        )}
      </div>
    </>
  )
}

function DriverCard({ driver }: { driver: NonNullable<DataPoint['drivers']>[0] }) {
  const [open, setOpen] = useState(false)
  const ringColor = '#E24B4A' // Lives Lost color — passed down in real impl

  // New subsection-based architecture
  if (driver.subsections && driver.subsections.length > 0) {
    return (
      <div className="border border-stone-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex items-center justify-between gap-2"
        >
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-stone-800">{driver.label}</div>
            <div className="text-xs text-stone-500 mt-0.5 leading-relaxed">{driver.stat}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ShareButton
              contentType="driver"
              contentId={driver.id}
              ringId="lives"
              title={driver.label}
              stat={driver.stat}
              size="sm"
            />
            <span className={clsx('text-stone-400 transition-transform duration-200', open && 'rotate-180')}>▾</span>
          </div>
        </button>

        {open && (
          <div className="border-t border-stone-100 px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col gap-3">
              {driver.subsections.map((subsection: any) => (
                <SubsectionBlock
                  key={subsection.id}
                  subsection={subsection}
                  ringColor={ringColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Legacy architecture — for drivers not yet migrated
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
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Why this exists</div>
          <ul className="space-y-2 mb-4">
            {(driver.whyBullets ?? (driver.why ?? '').split('. ').filter((s: string) => s.trim().length > 10)).map((sentence: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                <span className="text-stone-300 shrink-0 mt-0.5 font-bold">→</span>
                <span>{driver.whyBullets ? sentence : sentence.trim().replace(/\.$/, '') + '.'}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t-2 border-stone-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-stone-200" />
              <div className="text-xs font-semibold text-stone-900 uppercase tracking-widest px-2">
                What you can do about this
              </div>
              <div className="h-px flex-1 bg-stone-200" />
            </div>
            <div className="flex flex-col gap-2">
              {(driver.actions ?? []).map((a: any, i: number) => (
                <DriverActionCard
                  key={i}
                  action={a}
                  isLocked={a.tier === 'local' || a.tier === 'state'}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Data point card ───────────────────────────────────────────────────────────

function DataPointCard({ dp, ringColor }: { dp: DataPoint; ringColor: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-stone-200 rounded-xl bg-white overflow-hidden">

      {/* Header — always visible, click to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left p-3 sm:p-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          {dp.impactWeight && <ImpactWeightBadge weight={dp.impactWeight} />}
          <div className="flex items-center gap-2 shrink-0">
            <ShareButton
              contentType="data_point"
              contentId={dp.id}
              ringId="lives"
              title={dp.label}
              stat={dp.note}
              why={dp.whyBullets?.[0] ?? dp.why}
              size="sm"
            />
            <span className={clsx('text-stone-400 transition-transform duration-200', open && 'rotate-180')}>▾</span>
          </div>
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
      </button>

      {/* Expandable content */}
      {open && (
        <div className="border-t border-stone-100">
          {/* The problem — mechanism as bullets */}
          {(dp.mechanismBullets || dp.mechanism) && (
            <div className="px-2 sm:px-4 pt-3 sm:pt-4 pb-2">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                The mechanism — how this causes death
              </div>
              <ul className="space-y-2">
                {dp.mechanismBullets
                ? dp.mechanismBullets.map((bullet, i) => {
                    const boldMatch = bullet.match(/^\*\*(.+?):\*\*\s*(.+)$/)
                    return (
                      <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                        <span className="text-red-300 shrink-0 mt-0.5 font-bold">→</span>
                        <span>
                          {boldMatch ? (
                            <><span className="font-semibold text-stone-800">{boldMatch[1]}:</span> {boldMatch[2]}</>
                          ) : bullet}
                        </span>
                      </li>
                    )
                  })
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

          {/* Why the US gap */}
          {dp.whyBullets && (
            <div className="px-2 sm:px-4 pt-4 sm:pt-6 pb-2 border-t border-stone-100 mt-2">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                Why the US is worse than peer nations
              </div>
              <ul className="space-y-2">
                {dp.whyBullets.map((bullet, i) => {
                const boldMatch = bullet.match(/^\*\*(.+?):\*\*\s*(.+)$/)
                return (
                  <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed">
                    <span className="text-stone-300 shrink-0 mt-0.5 font-bold">→</span>
                    <span>
                      {boldMatch ? (
                        <><span className="font-semibold text-stone-800">{boldMatch[1]}:</span> {boldMatch[2]}</>
                      ) : bullet}
                    </span>
                  </li>
                )
              })}
              </ul>
            </div>
          )}

          {/* Chart */}
          <div className="px-4 pb-3 pt-6 border-t border-stone-100 mt-2">
            <TrendChart data={dp.chart} label={dp.chartLabel} color={ringColor} height={110} showTarget={false} />
          </div>

          {/* Source + data quality */}
          <div className="mx-2 sm:mx-4 mb-3 px-2 sm:px-3 py-2 sm:py-2.5 bg-stone-50 border border-stone-100 rounded-lg">
            <div className="text-xs text-stone-400 mb-1.5">
              <span className="font-medium text-stone-500">Source:</span>{' '}
              {dp.sourceUrl ? (
                <a href={dp.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-700 transition-colors">
                  {dp.source}
                </a>
              ) : dp.source}
            </div>
            {dp.nextDataRelease && (
              <div className="text-xs text-stone-400 mb-2">
                <span className="font-medium text-stone-500">Next release:</span> {dp.nextDataRelease}
              </div>
            )}
            {dp.trust && (
              <div className="border-t border-stone-200 pt-2 mt-1">
                <div className="flex items-center gap-2 mb-1">
                  <TrustBadge
                    grade={dp.trust.grade}
                    explanation={dp.trust.explanation}
                    howToUse={dp.trust.howToUse}
                    checklist={dp.trust.checklist}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Structural drivers */}
          {dp.drivers && dp.drivers.length > 0 && (
            <div className="px-2 sm:px-4 pb-3 sm:pb-4">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                What keeps this stuck — structural drivers and solutions
              </div>
              <div className="flex flex-col gap-2">
                {dp.drivers.map(driver => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}
              </div>
            </div>
          )}
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
      {action.ringImpact && (
        <div className="mb-3 px-3 py-2.5 bg-stone-900 rounded-lg text-white">
          <div className="text-xs font-semibold uppercase tracking-widest mb-1 text-stone-400">
            Impact on the Lives Lost ring if this passes
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-green-400">+{action.ringImpact.pointsIfSuccessful} pts</span>
            <span className="text-xs text-stone-400">{action.ringImpact.timeframe}</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">{action.ringImpact.explanation}</p>
          {action.ringImpact.livesAffected && (
            <div className="mt-1.5 text-xs font-medium text-green-400">{action.ringImpact.livesAffected}</div>
          )}
        </div>
      )}

      {action.legislation && (
        <BillStatusBar
          legislation={action.legislation}
          ringId="lives"
          categoryId="cardiovascular"
          actionId={action.id}
        />
      )}

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
function FrontierResearchCard({ research }: { research: any }) {
  const [open, setOpen] = useState(false)

  const stageLabels: Record<string, string> = {
    preclinical:  'Preclinical',
    phase1:       'Phase 1 trials',
    phase2:       'Phase 2 trials',
    phase3:       'Phase 3 trials',
    fda_review:   'FDA review',
    approved:     'FDA approved',
  }

  const stageColors: Record<string, string> = {
    preclinical:  'bg-stone-100 text-stone-600',
    phase1:       'bg-blue-50 text-blue-700',
    phase2:       'bg-blue-100 text-blue-800',
    phase3:       'bg-purple-50 text-purple-700',
    fda_review:   'bg-amber-50 text-amber-700',
    approved:     'bg-green-50 text-green-700',
  }

  const fundingTrendColors: Record<string, string> = {
    increasing:  'text-green-600',
    stable:      'text-stone-500',
    decreasing:  'text-amber-600',
    cut:         'text-red-600',
  }

  const fundingTrendLabels: Record<string, string> = {
    increasing:  '↑ Increasing',
    stable:      '→ Stable',
    decreasing:  '↓ Decreasing',
    cut:         '✗ Cut proposed',
  }

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', stageColors[research.currentStage])}>
                {stageLabels[research.currentStage]}
              </span>
              <span className={clsx('text-xs font-medium', fundingTrendColors[research.govFunding.trend])}>
                {fundingTrendLabels[research.govFunding.trend]}
              </span>
            </div>
            <div className="text-sm font-semibold text-stone-900 mb-0.5">{research.title}</div>
            <div className="text-xs text-stone-500 leading-relaxed">{research.description}</div>
          </div>
          <span className={clsx('text-stone-400 shrink-0 transition-transform duration-200 mt-1', open && 'rotate-180')}>▾</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100">
          {/* Mechanism */}
          <div className="px-2 sm:px-4 pt-3 sm:pt-4 pb-3">
            <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
              How it works
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">{research.mechanism}</p>
          </div>

          {/* Timeline + funding */}
          <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="px-3 py-2.5 bg-stone-50 rounded-lg">
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
                Time to clinic
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">{research.timeToClinic}</p>
            </div>
            <div className={clsx(
              'px-3 py-2.5 rounded-lg',
              research.govFunding.trend === 'cut' ? 'bg-red-50 border border-red-100' :
              research.govFunding.trend === 'decreasing' ? 'bg-amber-50 border border-amber-100' :
              'bg-stone-50'
            )}>
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1">
                Government funding
              </div>
              <div className="text-xs font-semibold text-stone-700 mb-0.5">
                {research.govFunding.amount} · {research.govFunding.agency}
              </div>
              <div className={clsx('text-xs font-medium mb-1', fundingTrendColors[research.govFunding.trend])}>
                {fundingTrendLabels[research.govFunding.trend]}
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">{research.govFunding.note}</p>
            </div>
          </div>

          {/* Actions */}
          {research.actions && research.actions.length > 0 && (
            <div className="px-2 sm:px-4 pb-3 sm:pb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-stone-200" />
                <div className="text-xs font-semibold text-stone-900 uppercase tracking-widest px-2">
                  How you can help advance this
                </div>
                <div className="h-px flex-1 bg-stone-200" />
              </div>
              <div className="flex flex-col gap-2">
                {research.actions.map((action: any, i: number) => (
                  <div key={i} className={clsx(
                    'border rounded-lg p-3',
                    action.tier === 'personal'  ? 'border-blue-100 bg-blue-50/30' :
                    action.tier === 'national'  ? 'border-amber-100 bg-amber-50/30' :
                    action.tier === 'state'     ? 'border-purple-100 bg-purple-50/30' :
                    'border-green-100 bg-green-50/30'
                  )}>
                    <div className="flex items-start gap-2 mb-2">
                      <TierPill tier={action.tier} />
                      <div className="text-xs font-medium text-stone-800 flex-1">{action.text}</div>
                    </div>
                    {action.whyItMatters && (
                      <p className="text-xs text-stone-500 leading-relaxed mb-2">{action.whyItMatters}</p>
                    )}
                    {action.consequence && (
                      <div className="text-xs text-green-700 bg-green-50 px-2.5 py-1.5 rounded-lg mb-2 leading-relaxed">
                        {action.consequence}
                      </div>
                    )}
                    {action.startHere && (
                      <a href={action.startHere} target="_blank" rel="noopener noreferrer" className={clsx('inline-flex text-xs px-3 py-1.5 rounded-lg font-medium transition-colors', action.tier === 'personal' ? 'bg-blue-600 text-white hover:bg-blue-700' : action.tier === 'national' ? 'bg-amber-600 text-white hover:bg-amber-700' : action.tier === 'state' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-green-600 text-white hover:bg-green-700')}>
                        {action.startHereLabel ?? 'Learn more'}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
function CollapsibleSection({
  title,
  subtitle,
  defaultOpen,
  dark,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen: boolean
  dark: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'w-full text-left p-3 rounded-lg flex items-center justify-between gap-2 transition-colors',
          dark ? 'bg-stone-900 hover:bg-stone-800' : 'bg-stone-50 hover:bg-stone-100 border border-stone-200'
        )}
      >
        <div>
          <div className={clsx('text-xs font-semibold', dark ? 'text-white' : 'text-stone-700')}>
            {title}
          </div>
          {subtitle && (
            <div className={clsx('text-xs mt-0.5 leading-relaxed', dark ? 'text-stone-400' : 'text-stone-500')}>
              {subtitle}
            </div>
          )}
        </div>
        <span className={clsx(
          'shrink-0 transition-transform duration-200 text-sm',
          open && 'rotate-180',
          dark ? 'text-stone-400' : 'text-stone-400'
        )}>▾</span>
      </button>
      {open && (
        <div className="mt-3">
          {children}
        </div>
      )}
    </div>
  )
}
// ── Category accordion ────────────────────────────────────────────────────────

function CategoryAccordion({ cat, ringColor }: { cat: Category; ringColor: string }) {
  const [open, setOpen] = useState(false)


  return (
    <div className="w-full border-y sm:border border-stone-200 sm:rounded-xl bg-white sm:shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-3 sm:px-5 py-3 sm:py-4 hover:bg-stone-50 transition-colors"
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

          <div className="p-2 sm:p-5">
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
                          <span className="font-medium text-stone-500">Next release:</span> January 2027 — CDC WONDER annual mortality update
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-stone-200 mt-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-50 text-green-700">Data Quality: A</span>
                          <span className="text-xs text-stone-400">Official death certificate registry — highest confidence</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <TrendChart data={cat.chart} label={cat.chartLabel} color={ringColor} height={160} showTarget={false} />
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
                      showTarget={false}
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

                {/* Data points — collapsible */}
                <CollapsibleSection
                  title="Drivers of preventable death"
                  subtitle="The factors below contribute to preventable cardiovascular deaths. Click any to see the mechanism, evidence, and what you can do."
                  defaultOpen={false}
                  dark={false}
                >
                  <div className="flex flex-col gap-4">
                    {cat.dataPoints.map(dp => (
                      <DataPointCard key={dp.id} dp={dp} ringColor={ringColor} />
                    ))}
                  </div>
                </CollapsibleSection>
                {/* Frontier research */}
                {cat.frontierResearch && cat.frontierResearch.length > 0 && (
                  <CollapsibleSection
                    title="What science is building toward"
                    subtitle="~500,000 cardiovascular deaths per year are not yet preventable. Here's what's on the horizon and how you can accelerate it."
                    defaultOpen={false}
                    dark={false}
                  >
                    <div className="flex flex-col gap-3">
                      {cat.frontierResearch.map((research: any) => (
                        <FrontierResearchCard key={research.id} research={research} />
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
              </div>
            
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
    <div className="w-full max-w-5xl mx-auto px-0 sm:px-6 py-6 sm:py-10">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-8 px-3 sm:px-0">
        <Link href="/" className="hover:text-stone-700 transition-colors">Vital Signs</Link>
        <span>/</span>
        <span className="text-stone-900">Ring {ring.order} — {ring.name}</span>
      </div>

      {/* Ring header */}
      <div className="flex items-start gap-4 sm:gap-6 mb-6 flex-wrap px-3 sm:px-0">
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
                Grade {scoreToGrade(ring.score)} · Score {ring.score}/100 · Calculated from 7 leading causes of death, each weighted by contribution to total mortality
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
      <div className="mb-4 px-3 sm:px-0">
        <h2 className="font-display text-xl font-medium text-stone-900 mb-1">
          Leading causes of death
        </h2>
        <p className="text-sm text-stone-500">
          Ordered by total annual deaths. Click any cause to explore the data, drivers, and actions.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:gap-4">
        {ring.categories.map((cat, i) => (
          <div key={cat.id} className="flex gap-3 items-start">
            <div
              className="hidden sm:flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold shrink-0 mt-1"
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