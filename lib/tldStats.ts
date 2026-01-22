import { Listing } from './generateListings'

export interface TldInfo {
  tld: string
  count: number
  location?: string
  category: 'popular' | 'location' | 'volume'
}

export interface TldStats {
  popular: TldInfo[]
  byLocation: { [location: string]: TldInfo[] }
  byVolume: TldInfo[]
}

const locationMap: { [key: string]: string } = {
  'com': 'Global',
  'net': 'Global',
  'org': 'Global',
  'io': 'Global',
  'co': 'Global',
  'app': 'Global',
  'dev': 'Global',
  'ai': 'Global',
  'tech': 'Global',
  'shop': 'Global',
  'us': 'United States',
  'uk': 'United Kingdom',
  'ca': 'Canada',
  'de': 'Germany',
  'fr': 'France',
  'au': 'Australia',
  'jp': 'Japan',
  'cn': 'China',
  'in': 'India',
  'br': 'Brazil',
  'mx': 'Mexico',
  'es': 'Spain',
  'it': 'Italy',
  'nl': 'Netherlands',
  'be': 'Belgium',
  'ch': 'Switzerland',
  'se': 'Sweden',
  'no': 'Norway',
  'dk': 'Denmark',
  'fi': 'Finland',
  'pl': 'Poland',
  'cz': 'Czech Republic',
  'ru': 'Russia',
  'ua': 'Ukraine',
}

export function calculateTldStats(listings: Listing[]): TldStats {
  const tldCounts: { [key: string]: number } = {}

  // Count listings by TLD
  listings.forEach((listing) => {
    tldCounts[listing.tld] = (tldCounts[listing.tld] || 0) + 1
  })

  // Popular TLDs (top 10)
  const popularTlds = ['com', 'net', 'org', 'io', 'co', 'app', 'dev', 'ai', 'tech', 'shop']
  const popular: TldInfo[] = popularTlds
    .filter((tld) => tldCounts[tld])
    .map((tld) => ({
      tld,
      count: tldCounts[tld],
      location: locationMap[tld],
      category: 'popular',
    }))

  // By location
  const byLocation: { [location: string]: TldInfo[] } = {}
  Object.entries(tldCounts).forEach(([tld, count]) => {
    if (!popularTlds.includes(tld)) {
      const location = locationMap[tld] || 'Other'
      if (!byLocation[location]) {
        byLocation[location] = []
      }
      byLocation[location].push({
        tld,
        count,
        location,
        category: 'location',
      })
    }
  })

  // Sort each location by count
  Object.keys(byLocation).forEach((location) => {
    byLocation[location].sort((a, b) => b.count - a.count)
  })

  // By volume (all TLDs sorted by count)
  const byVolume: TldInfo[] = Object.entries(tldCounts)
    .map(([tld, count]) => ({
      tld,
      count,
      location: locationMap[tld],
      category: 'volume' as const,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    popular,
    byLocation,
    byVolume,
  }
}

export function getTldDisplayLabel(tld: string, count: number): string {
  return `.${tld} (${count})`
}
