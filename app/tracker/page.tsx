'use client'
import { useState } from 'react'
import { clsx } from 'clsx'
import { POLICY_ACTIONS } from '@/lib/data/policy-actions'
import { ALL_RINGS } from '@/lib/data/rings'
import type { PolicyAction, PolicyDirection } from '@/lib/types'
import { DIRECTION_COLORS, DIRECTION_ICONS } from '@/lib/types'

type DirectionFilter = 'all' | PolicyDirection
type AdminFilter = 'all' | 'Biden' | 'Trump'

function EvidenceIcon({ type }: { type: 'good' | 'bad' | 'neutral' }) {
  if (type === 'good') return <span className="text-green-600 font-bold shrink-0">✓</span>
  if (type === 'bad')  return <span className="text-red-500 font-bold shrink-0">✗</span>
  return <span className="text-stone-400 shrink-0">·</span>
}

function PolicyCard({ action }: { action: PolicyAction }) {
  const [open, setOpen] = useState(false)
  const dirStyle = DIRECTION_COLORS[action.overallDirection]
  const dirIcon  = DIRECTION_ICONS[action.overallDirection]

  return (
    <div className="border border-stone-200 rounded-xl bg-white shadow-card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-5 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0 mt-0.5', dirStyle)}>
            {dirIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-medium text-stone-900 mb-1 leading-snug">{action.title}</div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-xs text-stone-400">{action.date}</span>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs font-medium">{action.administration}</span>
            </div>
            <p className="text-sm text-stone-600 leading-relaxed mb-3">{action.description}</p>
            <div className="flex flex-wrap gap-2">
              {action.ringImpacts.map(impact => {
                const ring = ALL_RINGS.find(r => r.id === impact.ringId)
                if (!ring) return null
                return (
                  <span
                    key={impact.ringId}
                    className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', DIRECTION_COLORS[impact.verdict])}
                  >
                    {DIRECTION_ICONS[impact.verdict]} {ring.name}
                  </span>
                )
              })}
            </div>
          </div>
          <div className={clsx('text-stone-400 transition-transform duration-200 shrink-0', open && 'rotate-180')}>▾</div>
        </div>
      </button>

      {open && (
        <div className="border-t border-stone-100">
          <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
            <div className="text-xs text-stone-500 font-medium">Sources: {action.source}</div>
          </div>
          <div className="divide-y divide-stone-100">
            {action.ringImpacts.map(impact => {
              const ring = ALL_RINGS.find(r => r.id === impact.ringId)
              if (!ring) return null
              return (
                <div key={impact.ringId} className="px-5 py-5">
                  <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ring.color }} />
                      <span className="text-sm font-semibold text-stone-900">{ring.name}</span>
                    </div>
                    <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium', DIRECTION_COLORS[impact.verdict])}>
                      {DIRECTION_ICONS[impact.verdict]}{' '}
                      {impact.verdict === 'toward' ? 'Toward goals' : impact.verdict === 'away' ? 'Away from goals' : 'Mixed effect'}
                    </span>
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed mb-3">{impact.explanation}</p>
                  <div className="flex flex-col gap-2">
                    {impact.evidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-stone-600">
                        <EvidenceIcon type={ev.type} />
                        <span>{ev.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackerPage() {
  const [dirFilter, setDirFilter] = useState<DirectionFilter>('all')
  const [adminFilter, setAdminFilter] = useState<AdminFilter>('all')

  const filtered = POLICY_ACTIONS.filter(a => {
    const dirOk   = dirFilter === 'all' || a.overallDirection === dirFilter
    const adminOk = adminFilter === 'all' || a.administration.includes(adminFilter)
    return dirOk && adminOk
  })

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="max-w-2xl mb-10">
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Policy Action Tracker</div>
        <h1 className="font-display text-4xl font-medium text-stone-900 mb-4 leading-tight">
          Every action. Assessed against the goals.
        </h1>
        <p className="text-stone-600 leading-relaxed mb-4">
          Government policy actions are evaluated ring by ring based on peer-reviewed research,
          CBO scores, and official data — not editorial opinion or political framing. An action
          can move toward goals on one ring and away from goals on another simultaneously.
          That nuance is the point.
        </p>
        <div className="text-sm font-medium text-stone-700 bg-stone-100 rounded-lg px-4 py-3">
          This is not a scorecard of politicians — it is a scorecard of policies against universal goals.
          Actions from all administrations are tracked.
        </div>
      </div>

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
                    : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
                )}
              >
                {f === 'all' ? 'All actions' : f === 'toward' ? '↑ Toward goals' : f === 'away' ? '↓ Away from goals' : '⟷ Mixed'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Administration</div>
          <div className="flex gap-2">
            {(['all', 'Biden', 'Trump'] as const).map(f => (
              <button
                key={f}
                onClick={() => setAdminFilter(f)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  adminFilter === f
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-700'
                )}
              >
                {f === 'all' ? 'All administrations' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="text-sm text-stone-400 mb-6">
        Showing {filtered.length} of {POLICY_ACTIONS.length} policy actions
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">No actions match these filters.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(action => (
            <PolicyCard key={action.id} action={action} />
          ))}
        </div>
      )}

      <div className="border border-stone-200 rounded-xl bg-stone-50 p-6 mt-12">
        <h2 className="font-display text-lg font-medium text-stone-900 mb-2">How assessments work</h2>
        <p className="text-sm text-stone-600 leading-relaxed">
          Each policy action is evaluated ring by ring based on peer-reviewed research, CBO scores,
          and official data. The same action can move toward goals on one ring and away from goals
          on another simultaneously. Every assessment includes the evidence behind the verdict so
          you can evaluate it yourself.
        </p>
      </div>
    </div>
  )
}