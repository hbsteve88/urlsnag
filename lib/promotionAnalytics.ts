import { collection, addDoc, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface PromotionAnalytics {
  id: string
  listingId: string
  eventType: 'view' | 'click'
  timestamp: Timestamp
  userAgent?: string
  referrer?: string
}

export interface PromotionStats {
  listingId: string
  totalViews: number
  totalClicks: number
  clickThroughRate: number
  viewsRemaining: number
  daysRemaining: number
  isActive: boolean
}

export async function logPromotionView(listingId: string) {
  try {
    await addDoc(collection(db, 'promotion_analytics'), {
      listingId,
      eventType: 'view',
      timestamp: Timestamp.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    })
  } catch (err) {
    console.error('Error logging promotion view:', err)
  }
}

export async function logPromotionClick(listingId: string) {
  try {
    await addDoc(collection(db, 'promotion_analytics'), {
      listingId,
      eventType: 'click',
      timestamp: Timestamp.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    })
  } catch (err) {
    console.error('Error logging promotion click:', err)
  }
}

export async function getPromotionStats(listingId: string): Promise<PromotionStats | null> {
  try {
    // Get listing promotion details
    const listingDoc = await getDocs(
      query(collection(db, 'listings'), where('__name__', '==', listingId))
    )
    
    if (listingDoc.empty) return null

    const listing = listingDoc.docs[0].data()
    
    if (!listing.isPromoted) {
      return {
        listingId,
        totalViews: 0,
        totalClicks: 0,
        clickThroughRate: 0,
        viewsRemaining: 0,
        daysRemaining: 0,
        isActive: false,
      }
    }

    // Get analytics for this listing
    const analyticsQuery = query(
      collection(db, 'promotion_analytics'),
      where('listingId', '==', listingId)
    )
    const analyticsSnapshot = await getDocs(analyticsQuery)

    const views = analyticsSnapshot.docs.filter(doc => doc.data().eventType === 'view').length
    const clicks = analyticsSnapshot.docs.filter(doc => doc.data().eventType === 'click').length
    const ctr = views > 0 ? (clicks / views) * 100 : 0

    // Calculate remaining views and days
    const promotedAt = listing.promotedAt?.toDate?.() || new Date()
    const expiresAt = listing.promotionExpiresAt?.toDate?.() || new Date()
    const now = new Date()
    
    const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const totalViewsAllowed = listing.promotionViews || 0
    const viewsRemaining = Math.max(0, totalViewsAllowed - views)
    const isActive = now < expiresAt && viewsRemaining > 0

    return {
      listingId,
      totalViews: views,
      totalClicks: clicks,
      clickThroughRate: parseFloat(ctr.toFixed(2)),
      viewsRemaining,
      daysRemaining,
      isActive,
    }
  } catch (err) {
    console.error('Error getting promotion stats:', err)
    return null
  }
}

export async function getUserPromotionStats(userId: string) {
  try {
    // Get all promoted listings for this user
    const listingsQuery = query(
      collection(db, 'listings'),
      where('sellerId', '==', userId),
      where('isPromoted', '==', true)
    )
    const listingsSnapshot = await getDocs(listingsQuery)

    const stats = await Promise.all(
      listingsSnapshot.docs.map(doc => getPromotionStats(doc.id))
    )

    return stats.filter(s => s !== null) as PromotionStats[]
  } catch (err) {
    console.error('Error getting user promotion stats:', err)
    return []
  }
}
