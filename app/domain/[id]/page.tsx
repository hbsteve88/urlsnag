'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DomainDetails from '@/components/DomainDetails'
import { generateListings, Listing } from '@/lib/generateListings'

// Cache listings to ensure consistency across page reloads
let cachedListings: Listing[] | null = null

export default function DomainDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const domainId = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use cached listings if available, otherwise generate new ones
    if (!cachedListings) {
      cachedListings = generateListings(500)
    }
    
    const found = cachedListings.find((l) => l.id === domainId)
    setListing(found || null)
    setLoading(false)
  }, [domainId])

  const handleToggleSave = (id: string) => {
    const newSaved = new Set(savedListings)
    if (newSaved.has(id)) {
      newSaved.delete(id)
    } else {
      newSaved.add(id)
    }
    setSavedListings(newSaved)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Loading...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-white">
        <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Domain not found</p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DomainDetails
          listing={listing}
          onClose={() => window.history.back()}
          isSaved={savedListings.has(listing.id)}
          onToggleSave={() => handleToggleSave(listing.id)}
        />
      </div>
      <Footer />
    </main>
  )
}
