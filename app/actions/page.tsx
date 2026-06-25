'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { getRingById } from '@/lib/data/rings'
import { ALL_RINGS } from '@/lib/data/rings'
import { scoreToGrade } from '@/lib/types'

type TierFilter = 'all' | 'personal' | 'local' | 'state' | 'national'

const LIVES_LOST_ACTIONS = [
  // Cardiovascular — Personal
  {
    id: 'cv-a1', tier: 'personal', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Know your numbers: blood pressure, cholesterol, blood sugar',
    detail: 'Get a baseline check at any pharmacy or clinic. No insurance needed for a basic blood pressure check. These three metrics predict 80% of cardiovascular risk — all modifiable.',
    timeEstimate: '30 min', difficulty: 'low',
    evidenceBase: 'Patients who know their blood pressure are 3x more likely to take corrective action. Source: American Heart Association.',
    livesSaved: 'If all high-risk adults got annual screenings, ~20,000 cardiovascular deaths could be prevented annually.',
  },
  {
    id: 'cv-a2', tier: 'personal', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Shift toward a whole-food, plant-forward diet',
    detail: 'Replacing ultra-processed food with whole foods even partially has measurable cardiovascular benefit within weeks. You do not need to be perfect — consistent improvement matters more.',
    timeEstimate: 'Ongoing', difficulty: 'medium',
    evidenceBase: 'PREDIMED trial found Mediterranean diet reduced cardiovascular events by 30%. Source: NEJM 2013.',
    livesSaved: 'Widespread adoption could prevent ~48,000 cardiovascular deaths annually. Source: JAMA Internal Medicine.',
  },
  {
    id: 'cv-a3', tier: 'personal', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Get 150 minutes of moderate aerobic exercise per week',
    detail: '30 minutes five days a week — or 22 minutes daily. Brisk walking counts. Meeting exercise guidelines reduces cardiovascular mortality risk by 35%.',
    timeEstimate: '30 min/day', difficulty: 'medium',
    evidenceBase: 'Meeting physical activity guidelines reduces cardiovascular mortality risk by 35%. Source: Lancet.',
    livesSaved: 'If physical inactivity rates matched peer nations, ~25,000 cardiovascular deaths could be prevented annually.',
  },
  // Cardiovascular — Local
  {
    id: 'cv-a4', tier: 'local', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Advocate for healthy food access in your zip code',
    detail: 'Attend local planning meetings. Support community gardens, farmers markets, and zoning for grocery stores in food deserts.',
    timeEstimate: '2 hrs/month', difficulty: 'medium',
    evidenceBase: 'Communities with farmers markets show measurably higher fruit and vegetable consumption. Source: USDA.',
    locked: true,
  },
  {
    id: 'cv-a5', tier: 'local', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Support community health worker programs in your area',
    detail: 'Community health workers are among the most cost-effective cardiovascular disease prevention interventions that exist.',
    timeEstimate: 'Donate or volunteer', difficulty: 'low',
    evidenceBase: 'CHW programs reduce cardiovascular hospitalizations by 20-30%. Source: American Journal of Public Health.',
    locked: true,
  },
  // Cardiovascular — State
  {
    id: 'cv-a6', tier: 'state', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Contact your Georgia state representative about Medicaid expansion',
    detail: 'Georgia is one of the few remaining states that has not fully expanded Medicaid. Expansion would cover 500,000+ uninsured Georgians — many with cardiovascular conditions.',
    timeEstimate: '10 min', difficulty: 'low',
    locked: true,
  },
  {
    id: 'cv-a7', tier: 'state', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Support Georgia preventive care coverage legislation',
    detail: 'State-level preventive care mandates can extend coverage beyond federal requirements.',
    timeEstimate: '10 min', difficulty: 'low',
    locked: true,
  },
  // Cardiovascular — National
  {
    id: 'cv-a8', tier: 'national', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Advocate for universal preventive care coverage',
    detail: 'Preventive screenings and medications that prevent heart attacks cost a fraction of treating them.',
    timeEstimate: '10 min', difficulty: 'low',
    evidenceBase: 'Every $1 spent on preventive cardiovascular care saves $5.60 in treatment costs. Source: Trust for America\'s Health.',
    livesSaved: 'Universal preventive care could prevent ~100,000 cardiovascular deaths annually.',
    billName: 'Preventive Health Savings Act',
    billNumber: 'S. 2952',
    billStatus: 'In committee — 8 of 20 committee members committed',
    billUrl: 'https://www.congress.gov',
  },
  {
    id: 'cv-a9', tier: 'national', ringId: 'lives', category: 'Cardiovascular disease',
    text: 'Push to redirect agricultural subsidies toward fruits and vegetables',
    detail: 'The Farm Bill is renegotiated every 5 years — the single highest-leverage food policy change available. Next cycle: 2028.',
    timeEstimate: '10 min', difficulty: 'low',
    evidenceBase: 'Redirecting 10% of commodity subsidies to produce would increase fruit/vegetable consumption by 6.9% nationally. Source: PLOS Medicine.',
    livesSaved: 'Could prevent ~30,000 cardiovascular deaths annually through improved diet quality.',
    billName: 'Healthy Food Policy Act',
    billNumber: 'HR 4107',
    billStatus: 'Introduced — 31 of 218 House co-sponsors',
    billUrl: 'https://www.congress.gov',
  },
]

const TIER_CONFIG = {
  personal: { label: 'Personal', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400', button: 'bg-blue-600 hover:bg-blue-700 text-white' },
  local:    { label: 'Local',    color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-400', button: 'bg-green-600 hover:bg-green-700 text-white' },
  state:    { label: 'State',    color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400', button: 'bg-purple-600 hover:bg-purple-700 text-white' },
  national: { label: 'National', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400', button: 'bg-amber-600 hover:bg-amber-700 text-white' },
}

function ActionCard({ action }: { action: any }) {
  const [done, setDone] = useState(false)
  const tier = TIER_CONFIG[action.tier as keyof typeof TIER_CONFIG]
  const ring = ALL_RINGS.find(r => r.id === action.ringId)

  return (
    <div className={clsx(
      'border rounded-xl p-4 transition-all',
      action.locked ? 'border-stone-200 bg-stone-50 opacity-60' : 'border-stone-200 bg-white hover:border-stone-300'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border', tier.color)}>
            {tier.label}
          </span>
          {ring && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: ring.color + '15', color: ring.color }}
            >
              {ring.name}
            </span>
          )}
          {action.locked && (
            <span className="text-xs text-stone-400">🔒 {action.tier === 'local' ? 'Community tier' : 'Civic tier'}</span>
          )}
        </div>
        <div className="text-xs text-stone-400 font-mono shrink-0">{action.category}</div>
      </div>

      <div className="text-sm font-medium text-stone-900 mb-1">{action.text}</div>
      <div className="text-xs text-stone-500 leading-relaxed mb-3">{action.detail}</div>

      {/* Meta */}
      {(action.timeEstimate || action.difficulty) && (
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {action.timeEstimate && (
            <span className="text-xs text-stone-400 font-mono">⏱ {action.timeEstimate}</span>
          )}
          {action.difficulty && (
            <span className={clsx('text-xs px-2 py-0.5 rounded font-medium',
              action.difficulty === 'low' ? 'bg-green-50 text-green-700' :
              action.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' :
              'bg-red-50 text-red-700'
            )}>
              {action.difficulty === 'low' ? 'Easy to start' : action.difficulty === 'medium' ? 'Some effort' : 'Heavy lift'}
            </span>
          )}
        </div>
      )}

      {/* Evidence */}
      {action.evidenceBase && (
        <div className="mb-3 text-xs text-stone-500 leading-relaxed">
          <span className="font-medium text-stone-600">Why it works: </span>
          {action.evidenceBase}
        </div>
      )}

      {/* Lives saved */}
      {action.livesSaved && (
        <div className="mb-3 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
          <div className="text-xs font-semibold text-green-700 uppercase tracking-widest mb-0.5">Estimated impact</div>
          <p className="text-xs text-green-800 leading-relaxed">{action.livesSaved}</p>
        </div>
      )}

      {/* Bill */}
      {action.billName && (
        <div className="mb-3 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg">
          <div className="text-xs font-semibold text-blue-900 mb-0.5">{action.billName} · {action.billNumber}</div>
          <div className="text-xs text-blue-700 mb-2">{action.billStatus}</div>
          <a href={action.billUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline hover:text-blue-800">View bill</a>
        </div>
      )}

      {/* Buttons */}
      {!action.locked && (
        <div className="flex items-center gap-2 flex-wrap">
          {action.tier === 'personal' && (
            <button
              onClick={() => setDone(d => !d)}
              className={clsx('text-xs px-4 py-2 rounded-lg font-medium transition-colors',
                done ? 'bg-green-100 text-green-700 border border-green-200' : tier.button
              )}
            >
              {done ? '✓ Added to civic record' : "I'll do this"}
            </button>
          )}
          {action.tier === 'national' && action.billUrl && (
            <a href={action.billUrl} target="_blank" rel="noopener noreferrer" className={clsx('text-xs px-4 py-2 rounded-lg font-medium transition-colors', tier.button)}>
              View bill
            </a>
          )}
          {action.tier === 'national' && (
            <button className="text-xs px-4 py-2 rounded-lg font-medium border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors">
              Contact your rep
            </button>
          )}
        </div>
      )}

      {action.locked && (
        <div className="flex items-center gap-2">
          <button className="text-xs px-4 py-2 rounded-lg font-medium border border-stone-200 text-stone-400 cursor-not-allowed">
            {action.tier === 'local' ? 'Upgrade to Community tier' : 'Upgrade to Civic tier'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ActionsPage() {
  const [tierFilter, setTierFilter] = useState<TierFilter>('all')
  const ring = getRingById('lives')

  const filtered = LIVES_LOST_ACTIONS.filter(a =>
    tierFilter === 'all' || a.tier === tierFilter
  )

  const tiers: TierFilter[] = ['all', 'personal', 'local', 'state', 'national']

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-700 transition-colors">Vital Signs</Link>
        <span>/</span>
        <span className="text-stone-900">Actions</span>
      </div>

      <div className="max-w-2xl mb-10">
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Action catalog</div>
        <h1 className="font-display text-4xl font-medium text-stone-900 mb-4 leading-tight">
          Here's what actually moves the needle.
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Every action is tied to a specific data point, tagged by tier and difficulty, 
          and backed by evidence. Personal and National actions are free. 
          Local and State actions require a subscription — they include your specific 
          representatives, local organizations, and opportunities near you.
        </p>
      </div>

      {/* Ring filter — just Lives Lost for now */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border border-stone-200 bg-white">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: ring?.color + '15', color: ring?.color }}
        >
          {ring && scoreToGrade(ring.score)}
        </div>
        <div>
          <div className="text-sm font-medium text-stone-900">Lives Lost</div>
          <div className="text-xs text-stone-400">Showing all actions for this ring · More rings coming soon</div>
        </div>
      </div>

      {/* Tier filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {tiers.map(t => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              tierFilter === t
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-stone-200 text-stone-500 hover:border-stone-400'
            )}
          >
            {t === 'all' ? 'All tiers' : TIER_CONFIG[t as keyof typeof TIER_CONFIG].label}
            {(t === 'local' || t === 'state') && ' 🔒'}
          </button>
        ))}
      </div>

      <div className="text-sm text-stone-400 mb-6">
        Showing {filtered.length} of {LIVES_LOST_ACTIONS.length} actions
      </div>

      <div className="flex flex-col gap-4">
        {filtered.map(action => (
          <ActionCard key={action.id} action={action} />
        ))}
      </div>

      {/* Paywall CTA */}
      <div className="mt-12 p-6 bg-stone-900 rounded-2xl text-white">
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Coming soon</div>
        <h2 className="font-display text-2xl font-medium mb-3">Local and state actions near you</h2>
        <p className="text-stone-300 text-sm leading-relaxed mb-4">
          Upgrade to see your specific state legislators and their positions on these bills, 
          local organizations working on these issues within 10 miles of you, 
          upcoming city council meetings relevant to these drivers, 
          and your state's specific policy landscape.
        </p>
        <button className="px-5 py-2.5 bg-white text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors">
          Join the waitlist
        </button>
      </div>
    </div>
  )
}