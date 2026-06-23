import React from 'react'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { ALL_RINGS } from '@/lib/data/rings'

async function getShare(token: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data, error } = await supabaseAdmin
    .from('shares')
    .select('*')
    .eq('share_token', token)
    .maybeSingle()

  if (data) {
    await supabaseAdmin.rpc('increment_share_clicks', { share_token: token })
  }

  return { data, error: error?.message ?? null }
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const { data: share, error } = await getShare(token)

  if (!share) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h1 className="font-display text-2xl font-medium text-stone-900 mb-2">Link not found</h1>
          <p className="text-stone-500 mb-6">This share link may have expired or been removed.</p>
          <Link href="/" className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors">
            Explore The State of Us
          </Link>
        </div>
      </div>
    )
  }

  const ring = ALL_RINGS.find(r => r.id === share.metadata?.ringId)
  const ringColor = ring?.color ?? '#1C1917'
  const ringName = ring?.name ?? 'The State of Us'

  const contentTypeLabels: Record<string, string> = {
    data_point: 'Data point',
    driver:     'Structural driver',
    action:     'Civic action',
    ring:       'Vital sign',
    category:   'Leading cause',
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">

        {/* Platform badge */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-display text-lg font-medium text-stone-900">The State of Us</span>
            <span className="text-xs font-mono text-stone-400">Societal Health Index</span>
          </Link>
        </div>

        {/* Share card */}
        <div
          className="bg-white rounded-2xl border-2 shadow-lg overflow-hidden mb-6"
          style={{ borderColor: ringColor }}
        >
          {/* Color bar */}
          <div className="h-2" style={{ background: ringColor }} />

          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: ringColor + '15', color: ringColor }}
              >
                {ringName}
              </span>
              <span className="text-xs text-stone-400">
                {contentTypeLabels[share.content_type] ?? 'Content'}
              </span>
            </div>

            <h1 className="font-display text-2xl font-medium text-stone-900 mb-3 leading-tight">
              {share.metadata?.title}
            </h1>

            {share.metadata?.stat && (
              <div
                className="text-lg font-semibold mb-3"
                style={{ color: ringColor }}
              >
                {share.metadata.stat}
              </div>
            )}

            {share.metadata?.why && (
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                {share.metadata.why}
              </p>
            )}

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <div className="text-xs text-stone-400">
                {share.click_count + 1 === 1 ? '1 person has seen this' : `${share.click_count + 1} people have seen this`}
              </div>
              <div className="text-xs text-stone-400">
                Shared via The State of Us
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-sm text-stone-600 mb-4">
            This is one data point from a platform tracking 12 vital signs of societal health.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/rings/lives"
              className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Explore Lives Lost
            </Link>
            <Link
              href="/"
              className="px-5 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
            >
              See all vital signs
            </Link>
          </div>
          <p className="text-xs text-stone-400 mt-4">
            Sign in to build your civic record and track your impact
          </p>
        </div>
      </div>
    </div>
  )
}