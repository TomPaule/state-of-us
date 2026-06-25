import React from 'react'
import Link from 'next/link'

export default function UpdatesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Updates</div>
      <h1 className="font-display text-4xl font-medium text-stone-900 mb-4 leading-tight">
        What's changed and what's coming
      </h1>
      <p className="text-stone-600 leading-relaxed mb-8">
        New studies released. Ring scores updated. Bills moving through Congress. 
        Quizzes added. This is where you find out what's new on the platform 
        and what's changed in the data since you last visited.
      </p>

      <div className="border-2 border-dashed border-stone-200 rounded-xl p-12 text-center">
        <div className="text-4xl mb-4">📡</div>
        <h2 className="font-display text-xl font-medium text-stone-900 mb-2">
          Coming soon
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
          The Updates feed will show new data releases, legislative developments, 
          research breakthroughs, and platform improvements — curated to the rings 
          you care about most.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/rings/lives"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            Explore Lives Lost
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            See all vital signs
          </Link>
        </div>
      </div>
    </div>
  )
}