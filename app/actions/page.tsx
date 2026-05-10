import Link from 'next/link'

export default function ActionsPage() {
  const tiers = [
    {
      label: 'Personal',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Things one person can do that have documented impact — today, in under an hour.',
      count: '84 actions',
    },
    {
      label: 'Community',
      color: 'bg-green-50 text-green-700 border-green-200',
      description: 'Starting or joining local organizations, attending city council meetings, mutual aid networks.',
      count: '67 actions',
    },
    {
      label: 'Systemic',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Policy campaigns, ballot initiatives, institutional reforms — the levers that move the metrics.',
      count: '91 actions',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="max-w-2xl mb-10">
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Action Catalog</div>
        <h1 className="font-display text-4xl font-medium text-stone-900 mb-4 leading-tight">
          Here's what actually moves the needle.
        </h1>
        <p className="text-stone-600 leading-relaxed">
          Every action in this catalog is tagged to the ring it affects, the tier of effort it requires,
          and the evidence for why it works. Start where you have time and energy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {tiers.map(tier => (
          <div key={tier.label} className={`border rounded-xl p-5 ${tier.color}`}>
            <div className="text-lg font-semibold mb-1">{tier.label}</div>
            <div className="text-xs font-mono mb-3 opacity-70">{tier.count}</div>
            <p className="text-sm leading-relaxed opacity-80">{tier.description}</p>
          </div>
        ))}
      </div>

      <div className="border-2 border-dashed border-stone-200 rounded-xl p-12 text-center mb-8">
        <div className="text-4xl mb-4">🚧</div>
        <h2 className="font-display text-xl font-medium text-stone-900 mb-2">
          Full action catalog coming in the next build session
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
          For now, actions are accessible within each ring detail page.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/rings/lives"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            See Lives Lost actions →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Explore all rings
          </Link>
        </div>
      </div>

      <div
        className="rounded-xl p-8 text-white"
        style={{ background: 'linear-gradient(135deg, #1C1917 0%, #44403C 100%)' }}
      >
        <div className="max-w-xl">
          <div className="text-xs font-mono text-stone-400 uppercase tracking-widest mb-3">Coming soon</div>
          <h2 className="font-display text-2xl font-medium mb-3">Your civic record</h2>
          <p className="text-stone-300 text-sm leading-relaxed">
            As you take actions, you'll build a civic portfolio — a record of your contributions
            across rings, tiers, and time. Not a points game. A genuine record of what you've done
            and what it's connected to.
          </p>
        </div>
      </div>
    </div>
  )
}