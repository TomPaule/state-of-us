import React from 'react'
import { getRingsByCluster } from '@/lib/data/rings'
import { CLUSTER_DEFS } from '@/lib/types'
import RingCard from '@/components/rings/RingCard'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="max-w-2xl mb-14">
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-4">
          Societal Health Index · United States · Prototype
        </div>
        <h1 className="font-display text-5xl font-medium text-stone-900 leading-tight mb-5">
          The state of us.
        </h1>
        <p className="text-lg text-stone-600 leading-relaxed mb-6">
          Twelve vital signs tracking where society is, what keeps it stuck, and
          what you can do about it. No political agenda. No advertising. Just the
          data — and a path forward.
        </p>
      </div>

      {CLUSTER_DEFS.map((cluster) => {
        const rings = getRingsByCluster(cluster.id)
        return (
          <section key={cluster.id} className="mb-14">
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="font-display text-2xl font-medium text-stone-900">
                {cluster.label}
              </h2>
              <span className="text-stone-400 text-sm italic">{cluster.description}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {rings.map((ring, i) => (
                <RingCard
                  key={ring.id}
                  ring={ring}
                  animationIndex={i}
                  isProofOfConcept={ring.id === 'lives'}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
