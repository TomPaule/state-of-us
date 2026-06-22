'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface ShareButtonProps {
  contentType: 'data_point' | 'driver' | 'action' | 'ring' | 'category'
  contentId: string
  ringId: string
  title: string
  stat?: string
  why?: string
  size?: 'sm' | 'md'
}

export default function ShareButton({
  contentType,
  contentId,
  ringId,
  title,
  stat,
  why,
  size = 'sm',
}: ShareButtonProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState<number | null>(null)

  async function handleShare() {
    setLoading(true)

    const { data: { session } } = await supabase.auth.getSession()

    try {
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user?.id ?? null,
          contentType,
          contentId,
          ringId,
          title,
          stat,
          why,
        }),
      })

      const data = await res.json()

      if (data.url) {
        await navigator.clipboard.writeText(data.url)
        setCopied(true)
        setShareCount(0)
        setTimeout(() => setCopied(false), 3000)

        // Log to civic record if signed in
        if (session?.user?.id) {
          await supabase.from('civic_actions').insert({
            user_id: session.user.id,
            action_id: `share-${contentId}`,
            ring_id: ringId,
            category_id: contentType,
            action_type: 'share',
            verified: true,
            verification_method: 'share_created',
            metadata: { contentType, contentId, title, shareUrl: data.url },
          })
        }
      }
    } catch (err) {
      console.error('Share failed:', err)
    }

    setLoading(false)
  }

  if (size === 'sm') {
    return (
      <button
        onClick={handleShare}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 text-xs text-stone-500 hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-50"
      >
        {copied ? (
          <>
            <span className="text-green-600">✓</span>
            <span className="text-green-600">Link copied</span>
          </>
        ) : (
          <>
            <span>↗</span>
            <span>{loading ? 'Creating link...' : 'Share'}</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
    >
      {copied ? (
        <>
          <span className="text-green-600">✓</span>
          <span className="text-green-600">Link copied to clipboard</span>
        </>
      ) : (
        <>
          <span>↗</span>
          <span>{loading ? 'Creating link...' : 'Share this'}</span>
        </>
      )}
    </button>
  )
}