export type RingStatus = 'critical' | 'concerning' | 'moderate' | 'improving' | 'declining'
export type ActionTier = 'personal' | 'community' | 'systemic'
export type IncentiveType = 'market' | 'government'
export type SolutionProximity = 'close' | 'medium' | 'far'
export type PolicyDirection = 'toward' | 'away' | 'mixed'
export type ClusterId = 'survival' | 'prosperity' | 'participation'

export interface ChartPoint {
  year: number
  us: number
  peer: number
  target: number
}

export type TrustGrade = 'A' | 'B' | 'C' | 'D'

export interface TrustRating {
  grade: TrustGrade
  explanation: string
}

export interface Driver {
  id: string
  label: string
  stat: string
  why: string
  actions: Array<{
    tier: ActionTier
    text: string
  }>
}

export interface DataPoint {
  id: string
  label: string
  value: string
  note: string
  mechanism?: string
  why: string
  source: string
  sourceUrl?: string
  nextDataRelease?: string
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendIsGood: boolean
  chart: ChartPoint[]
  chartLabel: string
  trust: TrustRating
  solvedPrecedent?: SolvedPrecedent
  impactWeight?: 'primary' | 'secondary' | 'supporting'
  livesSaved?: string
  incentiveNote?: string
  drivers?: Driver[]
}

export interface Incentive {
  type: IncentiveType
  who: string
  what: string
}

export type ActionDifficulty = 'low' | 'medium' | 'high'

export type BillStatus =
  | 'introduced'
  | 'in-committee'
  | 'passed-house'
  | 'passed-senate'
  | 'signed'
  | 'dead'

export interface Legislation {
  billName: string
  billNumber: string
  status: BillStatus
  lastUpdated: string
  url: string
  summary: string
  // Current step progress
  currentStepCount: number
  currentStepTotal: number
  currentStepLabel: string  // e.g. "committee members", "House votes", "Senate votes"
}

export interface SolvedPrecedent {
  title: string
  description: string
  outcome: string
  timeTaken: string
  chart?: ChartPoint[]
  chartLabel?: string
}

export interface Action {
  id: string
  tier: ActionTier
  text: string
  detail: string
  timeEstimate?: string
  difficulty?: ActionDifficulty
  impactScale?: 1 | 2 | 3
  evidenceBase?: string
  livesSaved?: string
  legislation?: Legislation
  organization?: string
  organizationUrl?: string
}

export interface Solution {
  name: string
  proximity: SolutionProximity
  description: string
  progress: number
  progressColor: string
  actions: string[]
}

export interface NewsItem {
  source: string
  title: string
  description: string
  date?: string
  url?: string
}

export interface Category {
  id: string
  name: string
  driver: string
  totalDeaths?: string
  preventable?: string
  peerNations?: string
  progressPct: number
  why: string
  chartLabel: string
  chart: ChartPoint[]
  totalChart?: ChartPoint[]
  dataPoints: DataPoint[]
  systemicIncentive?: string
  actions: Action[]
  solutions: Solution[]
}

export interface Ring {
  id: string
  order: number
  cluster: ClusterId
  name: string
  color: string
  bgColor: string
  score: number
  humanMetric: string
  humanMetricLabel: string
  status: RingStatus
  northStar: string
  tagline: string
  updateCadence: string
  trustStatement: string
  trustSources: Array<{ name: string; description: string }>
  summaryStats: Array<{ label: string; value: string; note: string }>
  categories: Category[]
}

export interface Cluster {
  id: ClusterId
  label: string
  description: string
  rings: string[]
}

export interface RingImpact {
  ringId: string
  verdict: PolicyDirection
  explanation: string
  evidence: Array<{ type: 'good' | 'bad' | 'neutral'; text: string }>
}

export interface PolicyAction {
  id: string
  title: string
  date: string
  administration: string
  overallDirection: PolicyDirection
  description: string
  source: string
  ringImpacts: RingImpact[]
}

export const STATUS_COLORS: Record<RingStatus, string> = {
  critical:   'text-red-700 bg-red-50',
  concerning: 'text-amber-700 bg-amber-50',
  moderate:   'text-blue-700 bg-blue-50',
  improving:  'text-green-700 bg-green-50',
  declining:  'text-red-700 bg-red-50',
}

export const STATUS_LABELS: Record<RingStatus, string> = {
  critical:   'Critical',
  concerning: 'Concerning',
  moderate:   'Moderate',
  improving:  'Improving',
  declining:  'Declining',
}

export const DIRECTION_COLORS: Record<PolicyDirection, string> = {
  toward: 'text-green-800 bg-green-50',
  away:   'text-red-800 bg-red-50',
  mixed:  'text-stone-600 bg-stone-100',
}

export const DIRECTION_ICONS: Record<PolicyDirection, string> = {
  toward: '↑',
  away:   '↓',
  mixed:  '⟷',
}

export const CLUSTER_DEFS: Cluster[] = [
  {
    id: 'survival',
    label: 'Survival',
    description: 'Are we still here?',
    rings: ['existential', 'environment', 'lives', 'disease'],
  },
  {
    id: 'prosperity',
    label: 'Prosperity',
    description: 'Is life actually good?',
    rings: ['economic', 'financial', 'quality', 'innovation'],
  },
  {
    id: 'participation',
    label: 'Participation',
    description: 'Do people have real power?',
    rings: ['freedom', 'governance', 'informed', 'social'],
  },
]