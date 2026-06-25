import { livesLostRing } from './lives-lost'

export interface FlatPolicyWatchEntry {
  id: string
  title: string
  administration: string
  date: string
  direction: 'toward' | 'away' | 'mixed'
  concern: string
  dataPoints: Array<{
    claim: string
    finding: string
    contested: boolean
    source: string
  }>
  ringImpact: string
  evidenceQuality: 'A' | 'B' | 'C' | 'D'
  tradeOffs: Array<{
    ifYouPrioritize: string
    assessment: string
  }>
  source: string
  // Context
  ringId: string
  ringName: string
  ringColor: string
  categoryName: string
  driverLabel: string
  subsectionLabel: string
}

export function getAllPolicyWatchEntries(): FlatPolicyWatchEntry[] {
  const entries: FlatPolicyWatchEntry[] = []

  const rings = [livesLostRing]

  for (const ring of rings) {
    for (const category of ring.categories) {
      for (const dataPoint of category.dataPoints) {
        if (!dataPoint.drivers) continue
        for (const driver of dataPoint.drivers) {
          if (!driver.subsections) continue
          for (const subsection of driver.subsections) {
            if (!subsection.policyWatch?.federal) continue
            for (const entry of subsection.policyWatch.federal) {
              entries.push({
                ...entry,
                ringId: ring.id,
                ringName: ring.name,
                ringColor: ring.color,
                categoryName: category.name,
                driverLabel: driver.label,
                subsectionLabel: subsection.label,
              })
            }
          }
        }
      }
    }
  }

  return entries
}