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
    views: 500,
    price: 5,
    description: '7 days'
  },
  {
    id: 'popular',
    name: 'Popular',
    duration: 14,
    views: 1500,
    price: 10,
    description: '14 days'
  },
  {
    id: 'premium',
    name: 'Premium',
    duration: 30,
    views: 5000,
    price: 20,
    description: '30 days'
  },
  {
    id: 'elite',
    name: 'Elite',
    duration: 60,
    views: 15000,
    price: 50,
    description: '60 days'
  },
]

export function getPackageById(id: string): PromotionPackage | undefined {
  return PROMOTION_PACKAGES.find(pkg => pkg.id === id)
}

export function calculateViewsPerDay(pkg: PromotionPackage): number {
  return Math.round(pkg.views / pkg.duration)
}
