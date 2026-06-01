'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { clsx } from 'clsx'

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

export default function RecordPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [actions, setActions] = useState<CivicAction[]>([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-sm text-stone-400">Loading your civic record...</div>
      </div>
    )
  }

  const ringCounts = actions.reduce((acc, a) => {
    acc[a.ring_id] = (acc[a.ring_id] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const verifiedCount = actions.filter(a => a.verified).length

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-700 transition-colors">Vital Signs</Link>
        <span>/</span>
        <span className="text-stone-900">Civic Record</span>
      </div>

      <div className="mb-8">
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-2">Your civic record</div>
        <h1 className="font-display text-3xl font-medium text-stone-900 mb-1">
          {user?.email?.split('@')[0]}
        </h1>
        <p className="text-stone-500 text-sm">{user?.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 border border-stone-200 rounded-xl mb-8 bg-white overflow-hidden">
        <div className="px-5 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Total actions</div>
          <div className="text-2xl font-semibold text-stone-900">{actions.length}</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Verified</div>
          <div className="text-2xl font-semibold text-green-600">{verifiedCount}</div>
        </div>
        <div className="px-5 py-4">
          <div className="text-xs text-stone-400 uppercase tracking-widest font-mono mb-1">Rings engaged</div>
          <div className="text-2xl font-semibold text-stone-900">{Object.keys(ringCounts).length}</div>
        </div>
      </div>

      {/* Action timeline */}
      {actions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-stone-200 rounded-xl">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="font-display text-xl font-medium text-stone-900 mb-2">
            Your civic record is empty
          </h2>
          <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
            Start by exploring a ring and taking an action. Every contact with your representative, every share, every petition signature gets recorded here.
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
            Recent activity
          </div>
          <div className="flex flex-col gap-3">
            {actions.map(action => (
              <div key={action.id} className="flex items-start gap-4 p-4 border border-stone-200 rounded-xl bg-white">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0',
                  action.verified ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                )}>
                  {action.verified ? '✓' : '·'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-stone-900 capitalize">
                    {action.action_type.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    Ring: {action.ring_id} · {new Date(action.created_at).toLocaleDateString()}
                  </div>
                  {action.verified && (
                    <div className="text-xs text-green-600 mt-0.5 font-medium">Verified action</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}