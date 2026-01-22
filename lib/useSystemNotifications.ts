import { useEffect, useRef } from 'react'
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface SystemNotificationEvent {
  type: 'outbid' | 'approved' | 'rejected' | 'promoted'
  domain: string
  message: string
}

export function useSystemNotifications(userId: string | undefined, onNotification: (event: SystemNotificationEvent) => void) {
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const lastCheckedRef = useRef<Record<string, any>>({})
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    if (!userId) return

    // Monitor user's listings for status changes
    const listingsQuery = query(
      collection(db, 'listings'),
      where('sellerId', '==', userId)
    )

    unsubscribeRef.current = onSnapshot(listingsQuery, (snapshot) => {
      // On initial load, just cache the current state without triggering notifications
      if (isInitialLoadRef.current) {
        snapshot.docs.forEach((doc) => {
          const listing = doc.data()
          const listingId = doc.id
          lastCheckedRef.current[listingId] = {
            status: listing.status,
            isPromoted: listing.isPromoted,
            offers: listing.offers,
          }
        })
        isInitialLoadRef.current = false
        return
      }

      // After initial load, only trigger notifications for actual changes
      snapshot.docChanges().forEach((change) => {
        const listing = change.doc.data()
        const listingId = change.doc.id
        const lastChecked = lastCheckedRef.current[listingId] || {}

        // Check for approval
        if (listing.status === 'approved' && lastChecked.status !== 'approved') {
          onNotification({
            type: 'approved',
            domain: listing.domain,
            message: `✓ ${listing.domain} has been approved!`,
          })
        }

        // Check for rejection
        if (listing.status === 'rejected' && lastChecked.status !== 'rejected') {
          onNotification({
            type: 'rejected',
            domain: listing.domain,
            message: `✗ ${listing.domain} was rejected. Reason: ${listing.rejectionReason || 'See details'}`,
          })
        }

        // Check for promotion activation
        if (listing.isPromoted && !lastChecked.isPromoted) {
          onNotification({
            type: 'promoted',
            domain: listing.domain,
            message: `⚡ ${listing.domain} promotion is now active!`,
          })
        }

        // Check for outbid (if listing has bids)
        if (listing.offers && listing.offers > (lastChecked.offers || 0)) {
          onNotification({
            type: 'outbid',
            domain: listing.domain,
            message: `🔔 You have a new offer on ${listing.domain}!`,
          })
        }

        // Update last checked state
        lastCheckedRef.current[listingId] = {
          status: listing.status,
          isPromoted: listing.isPromoted,
          offers: listing.offers,
        }
      })
    })

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [userId, onNotification])
}
