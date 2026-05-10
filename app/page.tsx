import { ALL_RINGS, getRingsByCluster } from '@/lib/data/rings'
import { CLUSTER_DEFS } from '@/lib/types'
import RingCard from '@/components/rings/RingCard'

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero */}
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
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Policy actions update continuously
          </div>
          <div className="text-sm text-stone-400">·</div>
          <div className="text-sm text-stone-500">Scores update annually</div>
          <div className="text-sm text-stone-400">·</div>
          <a href="/methodology" className="text-sm text-stone-500 hover:text-stone-900 underline underline-offset-2 transition-colors">
            How we calculate this
          </a>
        </div>
      </div>

      {/* Score summary bar */}
      <div className="grid grid-cols-3 divide-x divide-stone-200 border border-stone-200 rounded-xl mb-14 bg-white shadow-card overflow-hidden">
        <SummaryCell label="Overall societal health" value="47 / 100" note="Weighted composite of 12 rings" />
        <SummaryCell label="Lives that could be saved" value="~380K/yr" note="If US matched peer-nation rates" color="text-red-600" />
        <SummaryCell label="Rings trending toward goals" value="2 of 12" note="10 rings declining or stagnant" />
      </div>

      {/* Clusters */}
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

      {/* Trust section */}
      <div className="border border-stone-200 rounded-xl bg-white shadow-card p-8 mb-8">
        <div className="max-w-3xl">
          <h2 className="font-display text-xl font-medium text-stone-900 mb-3">
            Why you should trust this — and where its limits are
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed mb-4">
            Every metric on this platform links to its primary source. Preventable fractions come
            from peer-reviewed epidemiological literature, not our editorial judgment. Scores are
            composites of sub-metrics — the methodology is documented and the weights are transparent.
            We show you where institutions disagree, not just where they agree.
          </p>
          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            We are not a news outlet. We do not rate politicians. We rate policies against universal
            goals that cross political lines. The platform is funded transparently, editorially
            independent, and committed to showing corrections prominently.
          </p>
          <div className="flex gap-4 flex-wrap">
            <a href="/methodology" className="text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors underline underline-offset-2">
              Read our methodology →
            </a>
            <a href="/about" className="text-sm font-medium text-stone-900 hover:text-stone-600 transition-colors underline underline-offset-2">
              About this platform →
            </a>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="rounded-xl p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)' }}
      >
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-medium mb-3">
            Ready to do something about it?
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed mb-6">
            Every ring has an action catalog — personal, community, and systemic — with detailed
            guidance on what actually moves the needle. Start with the ring that matters most to you.
          </p>
          <div className="flex gap-3 flex-wrap">
            
              href="/actions"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-stone-900 rounded-lg text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Explore all actions →
            </a>
            
              href="/tracker"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-600 text-white rounded-lg text-sm font-medium hover:border-stone-400 transition-colors"
            >
              Policy action tracker →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCell({
  label, value, note, color = 'text-stone-900',
}: {
  label: string; value: string; note: string; color?: string
}) {
  return (
    <div className="px-6 py-5">
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div className={`text-2xl font-semibold ${color} mb-0.5`}>{value}</div>
      <div className="text-xs text-stone-400">{note}</div>
    </div>
  )
}