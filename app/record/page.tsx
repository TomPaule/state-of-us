'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import { ALL_RINGS } from '@/lib/data/rings'
import { scoreToGrade } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface CivicAction {
  id: string
  action_id: string
  ring_id: string
  category_id: string
  action_type: string
  verified: boolean
  created_at: string
  metadata: Record<string, any>
}

function civicGrade(actions: CivicAction[]): string {
  if (actions.length === 0) return '—'
  const verified = actions.filter(a => a.verified).length
  const rings = new Set(actions.map(a => a.ring_id)).size
  const score = Math.min(100, (verified * 10) + (rings * 5))
  return scoreToGrade(score)
}

function actionLabel(action: CivicAction): string {
  const labels: Record<string, string> = {
    contact_rep: 'Contacted a representative',
    share: 'Shared content',
    quiz: 'Completed a quiz',
    petition: 'Signed a petition',
    personal: 'Committed to a personal action',
  }
  return labels[action.action_type] ?? 'Took an action'
}

function actionDetail(action: CivicAction): string {
  if (action.action_type === 'contact_rep' && action.metadata?.billName) {
    return `About ${action.metadata.billName} (${action.metadata.billNumber})`
  }
  if (action.metadata?.ringId) {
    const ring = ALL_RINGS.find(r => r.id === action.metadata.ringId)
    return ring ? `Related to ${ring.name}` : ''
  }
  return ''
}

function ringColor(ringId: string): string {
  return ALL_RINGS.find(r => r.id === ringId)?.color ?? '#A8A29E'
}

function ringName(ringId: string): string {
  return ALL_RINGS.find(r => r.id === ringId)?.name ?? ringId
}

export default function RecordPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [actions, setActions] = useState<CivicAction[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/auth')
        return
      }
      setUser(session.user)

      const { data } = await supabase
        .from('civic_actions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      setActions(data ?? [])
      setLoading(false)
    })
  }, [router])

  async function handleShare() {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-sm text-stone-400">Loading your civic record...</div>
      </div>
    )
  }

  const verifiedCount = actions.filter(a => a.verified).length
  const ringCounts = actions.reduce((acc, a) => {
    acc[a.ring_id] = (acc[a.ring_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const grade = civicGrade(actions)
  const displayName = user?.email?.split('@')[0] ?? 'Civic member'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-700 transition-colors">Vital Signs</Link>
        <span>/</span>
        <span className="text-stone-900">Civic Record</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">Civic record</div>
          <h1 className="font-display text-3xl font-medium text-stone-900 mb-1">{displayName}</h1>
          <p className="text-stone-500 text-sm">{user?.email}</p>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50 transition-colors"
        >
          {copied ? '✓ Copied' : 'Share record'}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 divide-x divide-stone-200 border border-stone-200 rounded-xl mb-8 bg-white overflow-hidden shadow-card">
        <div className="px-4 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Civic grade</div>
          <div className="text-3xl font-bold mb-1" style={{ color: grade === 'F' ? '#E24B4A' : grade === 'D' ? '#BA7517' : '#1D9E75' }}>
            {grade}
          </div>
          <div className="text-xs text-stone-400 leading-snug">
            {grade === 'F' && `${5 - Math.min(actions.length, 5)} more actions to reach D`}
            {grade === 'D' && 'Keep going — reach C with 10 actions'}
            {grade === 'C' && 'Solid engagement — reach B with 20 actions'}
            {grade === 'B' && 'Strong civic record — reach A with 30 actions'}
            {grade === 'A' && 'Exceptional civic engagement'}
          </div>
        </div>
        <div className="px-4 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Actions</div>
          <div className="text-3xl font-bold text-stone-900">{actions.length}</div>
        </div>
        <div className="px-4 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Verified</div>
          <div className="text-3xl font-bold text-green-600">{verifiedCount}</div>
        </div>
        <div className="px-4 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Rings</div>
          <div className="text-3xl font-bold text-stone-900">{Object.keys(ringCounts).length}</div>
        </div>
      </div>

      {/* Rings of focus */}
      {Object.keys(ringCounts).length > 0 && (
        <div className="mb-8">
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">
            Rings of focus
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ringCounts).map(([ringId, count]) => (
              <div
                key={ringId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium"
                style={{
                  borderColor: ringColor(ringId) + '40',
                  background: ringColor(ringId) + '10',
                  color: ringColor(ringId),
                }}
              >
                <span>{ringName(ringId)}</span>
                <span className="opacity-60">{count} action{count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How grade is calculated */}
      <div className="mb-8 px-4 py-3 bg-stone-50 border border-stone-100 rounded-xl">
        <div className="text-xs font-medium text-stone-500 mb-1">How your civic grade is calculated</div>
        <p className="text-xs text-stone-400 leading-relaxed">
          Your grade reflects verified actions taken and the breadth of rings you've engaged with.
          Contacting representatives, sharing content, completing quizzes, and signing petitions
          all count. The more rings you engage across, the higher your grade.
          A = exceptional civic engagement · F = just getting started
        </p>
      </div>

      {/* Action timeline */}
      {actions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-200 rounded-xl">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="font-display text-xl font-medium text-stone-900 mb-2">
            Your civic record is empty
          </h2>
          <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Start by exploring a ring and taking an action. Every contact with your
            representative, every share, every petition signature gets recorded here.
          </p>
          <Link
            href="/rings/lives"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Start with Lives Lost
          </Link>
        </div>
      ) : (
        <div>
          <div className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-4">
            Activity timeline
          </div>
          <div className="flex flex-col gap-3">
            {actions.map(action => (
              <div
                key={action.id}
                className="flex items-start gap-4 p-4 border border-stone-200 rounded-xl bg-white hover:border-stone-300 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: ringColor(action.ring_id) + '15',
                    color: ringColor(action.ring_id),
                  }}
                >
                  {action.verified ? '✓' : '·'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-900">
                    {actionLabel(action)}
                  </div>
                  {actionDetail(action) && (
                    <div className="text-xs text-stone-500 mt-0.5">{actionDetail(action)}</div>
                  )}
                  {/* Impact context */}
                  {action.action_type === 'contact_rep' && action.metadata?.billNumber && (
                    <div className="mt-2 px-3 py-2 bg-green-50 border border-green-100 rounded-lg">
                      <div className="text-xs text-green-700 leading-relaxed">
                        <span className="font-medium">Your impact:</span> Representative contacts are one of the most effective ways to move legislation. 
                        {action.metadata.billNumber === 'S. 2952' && ' The Preventive Health Savings Act needs 20 committee members to advance — constituent pressure is what moves undecided members.'}
                        {action.metadata.billNumber === 'HR 4107' && ' The Healthy Food Policy Act needs 218 House co-sponsors to pass — every constituent contact makes a difference.'}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: ringColor(action.ring_id) + '15',
                        color: ringColor(action.ring_id),
                      }}
                    >
                      {ringName(action.ring_id)}
                    </span>
                    <span className="text-xs text-stone-400">
                      {new Date(action.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {action.verified && (
                      <span className="text-xs text-green-600 font-medium">Verified</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 pt-8 border-t border-stone-200 text-center">
        <p className="text-sm text-stone-500 mb-4">
          Every action you take gets logged here permanently.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
        >
          Explore vital signs
        </Link>
      </div>
    </div>
  )
}