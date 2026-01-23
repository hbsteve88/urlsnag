'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ListingsGrid from '@/components/ListingsGrid'
import Footer from '@/components/Footer'
import DomainDetails from '@/components/DomainDetails'
import NewDomainNotification from '@/components/NewDomainNotification'
import OutbidNotification from '@/components/OutbidNotification'
import { collection, query, where, onSnapshot, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Listing } from '@/lib/generateListings'
import { useAuth } from '@/components/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showHeaderSearch, setShowHeaderSearch] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set())
  const [newNotifications, setNewNotifications] = useState<Listing[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [outbidNotifications, setOutbidNotifications] = useState<Array<{ id: string; listing: Listing }>>([])
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [advancedFilters, setAdvancedFilters] = useState({
    hasWebsite: false,
    hasLogo: false,
    hasSocialMedia: false,
    hasBusinessAssets: false,
    hasVariants: false,
  })

  const handleScroll = () => {
    if (typeof window !== 'undefined') {
      setShowHeaderSearch(window.scrollY > 400)
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Load saved domains from user's Firestore document
  useEffect(() => {
    if (user?.uid) {
      const loadSavedDomains = async () => {
        try {
          const userDocSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)))
          if (!userDocSnap.empty) {
            const userData = userDocSnap.docs[0].data()
            const saved = userData.savedDomains || []
            setSavedListings(new Set(saved))
          }
        } catch (err) {
          console.error('Error loading saved domains:', err)
        }
      }
      loadSavedDomains()
    }
  }, [user?.uid])

  // Fetch real listings from Firestore
  useEffect(() => {
    // Set up the real-time listener for live approved listings
    const q = query(
      collection(db, 'listings'),
      where('status', '==', 'approved')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs
        .map((doc) => {
          const data = doc.data() as any
          const domain = data.domain || ''
          const tld = domain.split('.').pop() || 'com'
          let createdAt = new Date()
          if (data.createdAt) {
            if (typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate()
            } else if (data.createdAt instanceof Date) {
              createdAt = data.createdAt
            }
          }
          return {
            id: doc.id,
            tld,
            contentType: 'general',
            createdAt,
            ...data,
          }
        })
        .filter((listing: any) => listing.isLive === true) as Listing[]
      setAllListings(listings)
    }, (error) => {
      console.error('Error fetching listings:', error)
    })

    return () => unsubscribe()
  }, [])

  const handleToggleSave = async (id: string) => {
    const newSaved = new Set(savedListings)
    if (newSaved.has(id)) {
      newSaved.delete(id)
    } else {
      newSaved.add(id)
    }
    setSavedListings(newSaved)

    // Save to Firestore if user is logged in
    if (user?.uid) {
      try {
        const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid))
        const userDocSnap = await getDocs(userQuery)
        if (!userDocSnap.empty) {
          const userDocRef = doc(db, 'users', userDocSnap.docs[0].id)
          await updateDoc(userDocRef, {
            savedDomains: Array.from(newSaved)
          })
        }
      } catch (err) {
        console.error('Error saving domain:', err)
      }
    }
  }

  const handleRemoveNotification = (index: number) => {
    setNewNotifications((prev) => prev.filter((_, i) => i !== index))
  }

  const handleTriggerOutbidDemo = () => {
    if (allListings.length > 0) {
      const randomListing = allListings[Math.floor(Math.random() * allListings.length)]
      const id = `outbid-${randomListing.id}-${Date.now()}`
      setOutbidNotifications((prev) => [...prev, { id, listing: randomListing }])
    }
  }

  const handleRemoveOutbidNotification = (id: string) => {
    setOutbidNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }


  return (
    <main className="min-h-screen bg-white">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearchBar={showHeaderSearch}
      />
      <Hero onSearch={setSearchQuery} />
      <ListingsGrid
        listings={allListings}
        searchQuery={searchQuery}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
        onSelectListing={setSelectedListing}
        savedListings={savedListings}
        onToggleSave={handleToggleSave}
        advancedFilters={advancedFilters}
        onAdvancedFiltersChange={(filters) => setAdvancedFilters({
          hasWebsite: filters.hasWebsite || false,
          hasLogo: filters.hasLogo || false,
          hasSocialMedia: filters.hasSocialMedia || false,
          hasBusinessAssets: filters.hasBusinessAssets || false,
          hasVariants: filters.hasVariants || false,
        })}
      />
      <Footer />

      {/* Domain Details Modal */}
      {selectedListing && (
        <DomainDetails
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          isSaved={savedListings.has(selectedListing.id)}
          onToggleSave={() => handleToggleSave(selectedListing.id)}
        />
      )}

      {/* New Domain Notifications */}
      {newNotifications.map((notification, idx) => (
        <NewDomainNotification
          key={`${notification.id}-${idx}`}
          listing={notification}
          onClose={() => handleRemoveNotification(idx)}
        />
      ))}

      {/* Outbid Notifications Stack - macOS style stacking */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        {outbidNotifications.map((notif, idx) => (
          <div key={notif.id} style={{ transform: `translateY(${idx * 8}px)` }} className="pointer-events-auto">
            <OutbidNotification
              listing={notif.listing}
              onClose={() => handleRemoveOutbidNotification(notif.id)}
            />
          </div>
        ))}
      </div>
    </main>
  )
}
