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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-sm border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
          <span className="font-display text-base sm:text-lg font-medium tracking-tight text-stone-900">
            The State of Us
          </span>
          <span className="hidden sm:block text-xs font-mono text-stone-400 mt-0.5">
            Societal Health Index
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
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

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/record" className="text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors">
                Civic Record
              </Link>
              <button onClick={handleSignOut} className="text-xs font-medium text-stone-400 hover:text-stone-700 transition-colors">
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/auth" className="text-xs font-medium px-3 py-1.5 bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors">
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-stone-100 transition-colors"
          aria-label="Toggle menu"
        >
          <span className={clsx('block w-5 h-0.5 bg-stone-700 transition-transform duration-200', menuOpen && 'rotate-45 translate-y-2')} />
          <span className={clsx('block w-5 h-0.5 bg-stone-700 transition-opacity duration-200', menuOpen && 'opacity-0')} />
          <span className={clsx('block w-5 h-0.5 bg-stone-700 transition-transform duration-200', menuOpen && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full z-[100] bg-white border-t border-b border-stone-200 shadow-lg max-h-screen overflow-y-auto">
          <nav className="flex flex-col p-4 gap-1">
            {links.map(({ href, label }) => {
              const active = path === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    active
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  )}
                >
                  {label}
                </Link>
              )
            })}
            <div className="mt-4 pt-4 border-t border-stone-200">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/record"
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                  >
                    Civic Record
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-3 rounded-lg text-base font-medium text-stone-400 hover:bg-stone-100 transition-colors text-left"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 bg-stone-900 text-white rounded-lg text-base font-medium text-center hover:bg-stone-700 transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}