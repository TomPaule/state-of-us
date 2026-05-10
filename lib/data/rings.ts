import type { Ring } from '../types'
import { livesLostRing } from './lives-lost'

function placeholderRing(overrides: Partial<Ring> & Pick<Ring, 'id' | 'order' | 'cluster' | 'name' | 'color' | 'bgColor' | 'score' | 'humanMetric' | 'humanMetricLabel' | 'status' | 'northStar' | 'tagline'>): Ring {
  return {
    updateCadence: 'Annual · Next update: Jan 2026',
    trustStatement: 'Data sourced from official government and peer-reviewed institutional sources.',
    trustSources: [
      { name: 'Official government data', description: 'Primary statistical agencies' },
      { name: 'Peer-reviewed research', description: 'Academic and institutional validation' },
    ],
    summaryStats: [],
    categories: [],
    ...overrides,
  }
}

export const ALL_RINGS: Ring[] = [
  placeholderRing({
    id: 'existential', order: 1, cluster: 'survival',
    name: 'Existential Risk', color: '#C0392B', bgColor: '#FDECEA',
    score: 22, humanMetric: '90 seconds to midnight',
    humanMetricLabel: 'Doomsday Clock — closest in history',
    status: 'critical',
    northStar: 'Zero unmitigated civilization-level threats',
    tagline: 'Everything else is moot if civilization itself is at risk. Lowest probability, infinite consequence.',
  }),
  placeholderRing({
    id: 'environment', order: 2, cluster: 'survival',
    name: 'Environmental Stability', color: '#1D9E75', bgColor: '#E1F5EE',
    score: 62, humanMetric: '1.2°C above baseline',
    humanMetricLabel: 'Global temperature rise — accelerating',
    status: 'declining',
    northStar: 'A stable, livable planet in perpetuity',
    tagline: 'The physical foundation everything rests on. Without a habitable planet the other rings are moot.',
  }),
  livesLostRing,
  placeholderRing({
    id: 'disease', order: 4, cluster: 'survival',
    name: 'Disease Burden', color: '#D85A30', bgColor: '#FAECE7',
    score: 40, humanMetric: '83 million DALYs lost',
    humanMetricLabel: 'To preventable disease annually',
    status: 'concerning',
    northStar: 'Zero preventable suffering',
    tagline: 'Survival isn\'t enough. Years lived in avoidable pain or illness count too.',
  }),
  placeholderRing({
    id: 'economic', order: 5, cluster: 'prosperity',
    name: 'Economic Security', color: '#BA7517', bgColor: '#FAEEDA',
    score: 45, humanMetric: 'Age 64 average retirement',
    humanMetricLabel: 'Above living wage — if it happens at all',
    status: 'concerning',
    northStar: 'Everyone retires with dignity before they\'re too old to enjoy it',
    tagline: 'Can people meet their basic needs and build a secure future? The personal-level prosperity ring.',
  }),
  placeholderRing({
    id: 'financial', order: 6, cluster: 'prosperity',
    name: 'Financial System Health', color: '#7B5EA7', bgColor: '#F0EBFA',
    score: 42, humanMetric: 'Top 1% own 38% of wealth',
    humanMetricLabel: 'Bottom 50% own 2.5%',
    status: 'concerning',
    northStar: 'A financial system that serves people, not the other way around',
    tagline: 'Is the system itself working? Inflation, currency, trade, debt, and market competition.',
  }),
  placeholderRing({
    id: 'quality', order: 7, cluster: 'prosperity',
    name: 'Quality of Life', color: '#2E86AB', bgColor: '#E3F4FA',
    score: 51, humanMetric: '0 days mandated paid vacation',
    humanMetricLabel: 'Only wealthy nation with none',
    status: 'moderate',
    northStar: 'A life genuinely worth living, available to everyone',
    tagline: 'Who cares if you retire if everywhere sucks? Does society convert prosperity into a genuinely good life?',
  }),
  placeholderRing({
    id: 'innovation', order: 8, cluster: 'prosperity',
    name: 'Innovation & Future', color: '#E07B39', bgColor: '#FDF0E6',
    score: 55, humanMetric: '#1 in R&D spending',
    humanMetricLabel: 'But losing ground in outcomes and access',
    status: 'moderate',
    northStar: 'A society that continuously improves the human condition through discovery',
    tagline: 'How a society invests in its own future. Stagnation compounds — so does progress.',
  }),
  placeholderRing({
    id: 'freedom', order: 9, cluster: 'participation',
    name: 'Personal Freedom', color: '#534AB7', bgColor: '#EEEDFE',
    score: 63, humanMetric: '531 per 100K incarcerated',
    humanMetricLabel: 'Highest rate in the developed world',
    status: 'moderate',
    northStar: 'Every person can live authentically without domination or coercion',
    tagline: 'Can people live as they are — with control over their body, their data, and their choices?',
  }),
  placeholderRing({
    id: 'governance', order: 10, cluster: 'participation',
    name: 'Governance', color: '#2D6A4F', bgColor: '#E8F5EE',
    score: 52, humanMetric: '16% trust in government',
    humanMetricLabel: 'Near historic low',
    status: 'moderate',
    northStar: 'A government that is accountable, representative, and functionally competent',
    tagline: 'Do the systems making collective decisions actually work? Democracy is the mechanism.',
  }),
  placeholderRing({
    id: 'informed', order: 11, cluster: 'participation',
    name: 'Informed Society', color: '#378ADD', bgColor: '#E6F1FB',
    score: 38, humanMetric: '54% consume low-quality news',
    humanMetricLabel: 'As their primary news source',
    status: 'critical',
    northStar: 'Every person receives accurate information and can think critically about it',
    tagline: 'The meta-ring. Without it the public cannot protect or improve any of the others.',
  }),
  placeholderRing({
    id: 'social', order: 12, cluster: 'participation',
    name: 'Social Fabric', color: '#C2529A', bgColor: '#FAEAF4',
    score: 44, humanMetric: '1 in 2 Americans lonely',
    humanMetricLabel: 'Surgeon General declared epidemic in 2023',
    status: 'declining',
    northStar: 'No one is isolated against their will. Everyone belongs somewhere.',
    tagline: 'The invisible foundation. Societies with strong social fabric survive crises. Atomized ones don\'t.',
  }),
]

export function getRingById(id: string): Ring | undefined {
  return ALL_RINGS.find(r => r.id === id)
}

export function getRingsByCluster(cluster: string): Ring[] {
  return ALL_RINGS.filter(r => r.cluster === cluster)
}