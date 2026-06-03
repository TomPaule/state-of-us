'use client'
import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'

interface ContactRepModalProps {
  billName: string
  billNumber: string
  ringId: string
  categoryId: string
  actionId: string
  defaultMessage: string
  onClose: () => void
}

export default function ContactRepModal({
  billName,
  billNumber,
  ringId,
  categoryId,
  actionId,
  defaultMessage,
  onClose,
}: ContactRepModalProps) {
  const [message, setMessage] = useState(defaultMessage)
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  async function logAction() {
    if (!user) return
    await supabase.from('civic_actions').insert({
      user_id: user.id,
      action_id: actionId,
      ring_id: ringId,
      category_id: categoryId,
      action_type: 'contact_rep',
      verified: true,
      verification_method: 'self_reported',
      metadata: { billName, billNumber, state },
    })
  }

  async function handleSendEmail() {
    const subject = encodeURIComponent(`Please support ${billNumber} — ${billName}`)
    const body = encodeURIComponent(message)
    window.open(`mailto:?subject=${subject}&body=${body}`)
    await logAction()
    setSent(true)
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message)
    await logAction()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">

          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="font-display text-xl font-medium text-stone-900 mb-2">
                Message sent
              </h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-2">
                Your contact with your representative has been logged to your civic record.
              </p>
              {!user && (
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  Sign in to track this action permanently in your civic record.
                </p>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="text-xs font-mono text-stone-400 mb-1">Contact your representative</div>
                  <h2 className="font-display text-lg font-medium text-stone-900">{billName}</h2>
                  <div className="text-xs text-stone-500">{billNumber}</div>
                </div>
                <button
                  onClick={onClose}
                  className="text-stone-400 hover:text-stone-700 transition-colors text-xl leading-none shrink-0"
                >
                  ×
                </button>
              </div>

              {/* Your info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Your state</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="Georgia"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-600">Your message</label>
                  <span className="text-xs text-stone-400">Edit freely — this is your voice</span>
                </div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                />
              </div>

              {/* Note */}
              <div className="mb-5 px-3 py-2.5 bg-stone-50 border border-stone-100 rounded-lg">
                <p className="text-xs text-stone-500 leading-relaxed">
                  <span className="font-medium text-stone-600">How this works:</span> Clicking "Open in email" will open your email app with this message pre-filled. You choose who to send it to — we suggest your senators and representatives. Not sure who they are?{' '}
                  
                    <a href="https://www.congress.gov/members/find-your-member" target="_blank" rel="noopener noreferrer" className="text-stone-700 underline hover:text-stone-900">Find your member of Congress</a>
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleSendEmail}
                  className="flex-1 px-4 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
                >
                  Open in email
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy message'}
                </button>
              </div>

              {!user && (
                <p className="text-xs text-stone-400 text-center mt-3">
                  <a href="/auth" className="underline hover:text-stone-700">Sign in</a> to log this action to your civic record
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}