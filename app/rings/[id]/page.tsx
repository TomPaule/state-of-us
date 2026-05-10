import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRingById } from '@/lib/data/rings'
import RingArc from '@/components/ui/RingArc'
import StatusBadge from '@/components/ui/StatusBadge'

interface RingPageProps {
  params: { id: string }
}

export default function RingPage({ params }: RingPageProps) {
  const ring = getRingById(params.id)
  if (!ring) notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-8">
        <Link href="/" className="hover:text-stone-700 transition-colors">Vital Signs</Link>
        <span>/</span>
        <span className="text-stone-900">{ring.name}</span>
      </div>

      <div className="flex items-start gap-6 mb-10">
        <RingArc score={ring.score} color={ring.color} bgColor={ring.bgColor} size={72} strokeWidth={5} />
        <div className="flex-1">
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-1">
            Ring {ring.order} of 12
          </div>
          <h1 className="font-display text-3xl font-medium text-stone-900 mb-1">{ring.name}</h1>
          <div className="text-2xl font-semibold mb-0.5" style={{ color: ring.color }}>
            {ring.humanMetric}
          </div>
          <div className="text-stone-500 text-sm mb-3">{ring.humanMetricLabel}</div>
          <p className="text-stone-600 text-sm leading-relaxed mb-3">{ring.tagline}</p>
          <div className="flex items-center gap-3">
            <StatusBadge status={ring.status} />
            <span className="text-xs text-stone-400 font-mono">Score: {ring.score} / 100</span>
          </div>
        </div>
      </div>

      <div className="border-2 border-dashed border-stone-200 rounded-xl p-12 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="font-display text-xl font-medium text-stone-900 mb-2">
          Full detail coming soon
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
          The <strong>{ring.name}</strong> ring is being built to the same depth as Lives Lost —
          with per-datapoint charts, broken incentive analysis, a deep action catalog, and
          proximity to solutions for each category.
        </p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{ background: ring.bgColor, color: ring.color }}
        >
          Goal: {ring.northStar}
        </div>
      </div>

      <div className="flex justify-between mt-12 pt-8 border-t border-stone-200">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          ← All vital signs
        </Link>
        <Link href="/rings/lives" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          See Lives Lost proof of concept →
        </Link>
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return [
    { id: 'existential' },
    { id: 'environment' },
    { id: 'disease' },
    { id: 'economic' },
    { id: 'financial' },
    { id: 'quality' },
    { id: 'innovation' },
    { id: 'freedom' },
    { id: 'governance' },
    { id: 'informed' },
    { id: 'social' },
  ]
}