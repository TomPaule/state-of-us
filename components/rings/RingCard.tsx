'use client'
import Link from 'next/link'
import { clsx } from 'clsx'
import type { Ring } from '@/lib/types'
import RingArc from '@/components/ui/RingArc'
import StatusBadge from '@/components/ui/StatusBadge'

interface RingCardProps {
  ring: Ring
  animationIndex?: number
  isProofOfConcept?: boolean
}

export default function RingCard({ ring, animationIndex = 0, isProofOfConcept = false }: RingCardProps) {
  return (
    <Link
      href={ring.id === 'lives' ? '/rings/lives' : `/rings/${ring.id}`}
      className={clsx(
        'group block rounded-xl border bg-white p-4 transition-all duration-200',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        'animate-fade-up',
        `stagger-${Math.min(animationIndex + 1, 12)}`,
        isProofOfConcept
          ? 'shadow-card-hover'
          : 'border-stone-200 shadow-card',
      )}
      style={
        isProofOfConcept
          ? { borderColor: ring.color, borderWidth: 2 }
          : undefined
      }
    >
      {isProofOfConcept && (
        <div
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-2"
          style={{ background: ring.bgColor, color: ring.color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: ring.color }}
          />
          Full detail available
        </div>
      )}

      <div className="text-xs font-mono text-stone-400 mb-2">Ring {ring.order} of 12</div>

      <div className="flex items-start gap-3 mb-3">
        <RingArc
          score={ring.score}
          color={ring.color}
          bgColor={ring.bgColor}
          size={40}
          strokeWidth={3.5}
        />
        <div className="min-w-0">
          <div className="text-sm font-medium text-stone-900 leading-tight">{ring.name}</div>
          <div className="text-xs text-stone-400 mt-0.5">
            {ring.updateCadence.split('·')[0].trim()}
          </div>
        </div>
      </div>

      <div className="mb-0.5">
        <div className="text-xs text-stone-400 uppercase tracking-widest font-mono">Score</div>
        <div className="text-2xl font-semibold leading-tight" style={{ color: ring.color }}>
          {ring.score}
          <span className="text-sm font-normal text-stone-400"> / 100</span>
        </div>
      </div>

      <div className="text-sm text-stone-600 leading-snug mb-3 min-h-[2.5rem]">
        {ring.humanMetric}{' '}
        <span className="text-xs text-stone-400">{ring.humanMetricLabel}</span>
      </div>

      <div className="h-0.5 bg-stone-100 rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${ring.score}%`, background: ring.color }}
        />
      </div>

      <StatusBadge status={ring.status} />

      <div className="mt-2 text-xs text-stone-400 leading-relaxed line-clamp-2">
        Goal: {ring.northStar}
      </div>
    </Link>
  )
}