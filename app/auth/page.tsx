'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSubmitted(true)
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✉️</span>
          </div>
          <h1 className="font-display text-2xl font-medium text-stone-900 mb-3">
            Check your email
          </h1>
          <p className="text-stone-600 leading-relaxed mb-6">
            We sent a magic link to <strong>{email}</strong>. Click it to sign in — no password needed.
          </p>
          <p className="text-sm text-stone-400">
            Wrong email?{' '}
            <button
              onClick={() => setSubmitted(false)}
              className="text-stone-600 underline hover:text-stone-900"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="mb-8">
          <Link href="/" className="text-sm text-stone-400 hover:text-stone-700 transition-colors">
            The State of Us
          </Link>
        </div>

        <h1 className="font-display text-3xl font-medium text-stone-900 mb-2">
          Sign in to your civic record
        </h1>
        <p className="text-stone-600 mb-8 leading-relaxed">
          Track your actions, contact your representatives, and build a record of your civic contributions. No password — just your email.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent bg-white"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full px-4 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending magic link...' : 'Send magic link'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-stone-200">
          <p className="text-xs text-stone-400 leading-relaxed">
            By signing in you agree to use this platform to understand and improve societal health. Your civic record is yours — we will never sell your data or use it for advertising.
          </p>
        </div>
      </div>
    </div>
  )
}