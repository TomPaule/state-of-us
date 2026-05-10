'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const links = [
  { href: '/',        label: 'Vital Signs' },
  { href: '/tracker', label: 'Policy Tracker' },
  { href: '/actions', label: 'Actions' },
]

export default function Nav() {
  const path = usePathname()

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

        
          href="#"
          className="hidden md:block text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          Subscribe to updates →
        </a>
      </div>
    </header>
  )
}
