'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter } from 'next/navigation'
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AlertCircle, Loader, MessageSquare } from 'lucide-react'

interface Offer {
  id: string
  domain: string
  offerAmount: number
  buyerEmail: string
  buyerName: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: any
  listingId: string
}

export default function MyOffersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'amount-high' | 'amount-low' | 'status'>('recent')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    fetchOffers()
  }, [user, authLoading, router])

  useEffect(() => {
    let filtered = offers.filter(o =>
      o.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
        case 'amount-high':
          return b.offerAmount - a.offerAmount
        case 'amount-low':
          return a.offerAmount - b.offerAmount
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    setFilteredOffers(filtered)
  }, [offers, searchQuery, sortBy])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      const q = query(
        collection(db, 'offers'),
        where('sellerId', '==', user?.uid)
      )
      const snapshot = await getDocs(q)
      const offersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Offer[]
      setOffers(offersList)
    } catch (err) {
      console.error('Error fetching offers:', err)
      setError('Failed to load your offers')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending' },
      accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your offers...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Offers</h1>
          <p className="text-gray-600">Offers received on your domain listings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {offers.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search by domain, buyer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="recent">Most Recent</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
                <option value="status">Status</option>
              </select>
            </div>
            <p className="text-sm text-gray-600">
              Showing {filteredOffers.length} of {offers.length} offers
            </p>
          </div>
        )}

        {offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't received any offers yet</p>
            <button
              onClick={() => router.push('/sell')}
              className="px-6 py-2 bg-[#7299CB] text-white rounded-lg hover:bg-[#5a7aaa] transition font-medium"
            >
              List a Domain
            </button>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No offers match your search</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOffers.map(offer => (
              <div key={offer.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-blue-600">{offer.domain}</h3>
                      {getStatusBadge(offer.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <p className="text-gray-500">Offer Amount</p>
                        <p className="font-medium text-gray-900">${offer.offerAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Buyer</p>
                        <p className="font-medium text-gray-900">{offer.buyerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="font-medium text-gray-900 truncate">{offer.buyerEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Received</p>
                        <p className="font-medium text-gray-900">
                          {offer.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                    {offer.message && (
                      <div className="bg-gray-50 rounded p-3 mb-4">
                        <div className="flex gap-2 items-start">
                          <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{offer.message}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
