'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const links = [
  { href: '/',         label: 'Vital Signs' },
  { href: '/tracker',  label: 'Policy Tracker' },
  { href: '/actions',  label: 'Actions' },
  { href: '/updates',  label: 'Updates' },
  { href: '/record',   label: 'Civic Record' },
]

export default function Nav() {
  const path = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="font-display text-lg font-medium tracking-tight text-stone-900">
            The State of Us
          </span>
          <span className="hidden sm:block text-xs font-mono text-stone-400 mt-0.5">
            Societal Health Index
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  active
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                )}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/record"
                className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Civic Record
              </Link>
              <button
                onClick={handleSignOut}
                className="text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-xs font-medium px-3 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}