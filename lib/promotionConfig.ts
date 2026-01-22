export interface PromotionPackage {
  id: string
  name: string
  duration: number // days
  views: number
  price: number
  description: string
}

export const PROMOTION_PACKAGES: PromotionPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    duration: 7,
    views: 1000,
    price: 9.99,
    description: '7 days, 1,000 views'
  },
  {
    id: 'popular',
    name: 'Popular',
    duration: 14,
    views: 5000,
    price: 24.99,
    description: '14 days, 5,000 views'
  },
  {
    id: 'premium',
    name: 'Premium',
    duration: 30,
    views: 15000,
    price: 49.99,
    description: '30 days, 15,000 views'
  },
  {
    id: 'elite',
    name: 'Elite',
    duration: 60,
    views: 50000,
    price: 99.99,
    description: '60 days, 50,000 views'
  },
]

export function getPackageById(id: string): PromotionPackage | undefined {
  return PROMOTION_PACKAGES.find(pkg => pkg.id === id)
}

export function calculateViewsPerDay(pkg: PromotionPackage): number {
  return Math.round(pkg.views / pkg.duration)
}
