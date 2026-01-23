'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthContext'
import { useToast } from '@/components/ToastContext'
import { CheckCircle, XCircle, Clock, AlertCircle, Filter, Search, Edit2, Trash2, Zap, Eye } from 'lucide-react'
import { CATEGORIES, getCategoryConfig } from '@/lib/categories'

const CANNED_REJECTIONS = [
  'Adult content not properly identified/declared',
  'Incomplete or missing listing information',
  'Domain ownership not verified',
  'Price appears unrealistic or suspicious',
  'Domain has trademark/copyright issues',
  'Suspicious seller history or activity',
  'Misleading or deceptive listing description',
  'Domain has known security issues',
  'Violates platform policies',
  'Insufficient documentation provided',
  'Domain appears to be parked/inactive',
  'Domain contains prohibited content',
]

interface AdminListing {
  id: string
  domain: string
  category: string
  price: number
  status: string
  verified: boolean
  sellerId: string
  sellerEmail?: string
  sellerName?: string
  createdAt: any
  description: string
  priceType: string
  logo?: string
  isPromoted?: boolean
  promotedAt?: any
  promotionExpiresAt?: any
  minimumOfferPrice?: number
  startingBid?: number
  reservePrice?: number
  hideMinimumOffer?: boolean
  hideReservePrice?: boolean
  hasWebsite?: boolean
  website?: string
  hasLogo?: boolean
  hasBusinessAssets?: boolean
  businessName?: string
  businessDescription?: string
  businessAssets?: string[]
  hasSocialAccounts?: boolean
  socialMedia?: Array<{ platform: string; url: string }>
  isLive?: boolean
  hasAdultContent?: boolean
}

type AdminTab = 'all' | 'active' | 'pending' | 'promoted'

export default function AdminDashboardV2() {
  const { user, loading: authLoading } = useAuth()
  const { success, error } = useToast()
  const [activeTab, setActiveTab] = useState<AdminTab>('all')
  const [allListings, setAllListings] = useState<AdminListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set())
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null)
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [bulkApproving, setBulkApproving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingListing, setEditingListing] = useState<AdminListing | null>(null)
  const [editFormData, setEditFormData] = useState({
    domain: '',
    category: '',
    price: '',
    description: '',
    priceType: '',
    minimumOfferPrice: '',
    startingBid: '',
    reservePrice: '',
    website: '',
    businessName: '',
    businessDescription: '',
  })
  const [editPriceMode, setEditPriceMode] = useState<'set' | 'accepting' | 'auction'>('set')
  const [editHideMinimumOffer, setEditHideMinimumOffer] = useState(false)
  const [editHideReservePrice, setEditHideReservePrice] = useState(false)
  const [editHasWebsite, setEditHasWebsite] = useState(false)
  const [editHasLogo, setEditHasLogo] = useState(false)
  const [editHasBusinessAssets, setEditHasBusinessAssets] = useState(false)
  const [editHasSocialAccounts, setEditHasSocialAccounts] = useState(false)
  const [editBusinessAssets, setEditBusinessAssets] = useState<string[]>([])
  const [editSocialAccounts, setEditSocialAccounts] = useState<Array<{ platform: string; url: string }>>([])
  const [editNewAsset, setEditNewAsset] = useState('')
  const [editNewSocial, setEditNewSocial] = useState({ platform: 'Instagram', url: '' })
  const [promotedSearchQuery, setPromotedSearchQuery] = useState('')
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const [allSearchQuery, setAllSearchQuery] = useState('')
  const [allStatusFilter, setAllStatusFilter] = useState<string>('')
  const [allVerifiedFilter, setAllVerifiedFilter] = useState<boolean | null>(null)
  const [allLiveFilter, setAllLiveFilter] = useState<boolean | null>(null)
  const [promotingListing, setPromotingListing] = useState<AdminListing | null>(null)
  const [promotionFormData, setPromotionFormData] = useState({
    type: 'duration', // 'duration', 'views', 'until_sold'
    duration: '7', // days
    views: '1000',
  })

  useEffect(() => {
    if (authLoading || !user) return
    fetchAllListings()
  }, [user, authLoading])

  const fetchAllListings = async () => {
    try {
      setLoading(true)
      const q = query(collection(db, 'listings'))
      const snapshot = await getDocs(q)
      const listings = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          domain: data.domain || '',
          category: data.category || '',
          price: data.price || 0,
          status: data.status || '',
          verified: data.verified || false,
          sellerId: data.sellerId || '',
          sellerEmail: data.sellerEmail,
          sellerName: data.sellerName,
          createdAt: data.createdAt,
          description: data.description || '',
          priceType: data.priceType || '',
          logo: data.logo,
          isPromoted: data.isPromoted || false,
          promotedAt: data.promotedAt,
          promotionExpiresAt: data.promotionExpiresAt,
          minimumOfferPrice: data.minimumOfferPrice,
          startingBid: data.startingBid,
          reservePrice: data.reservePrice,
          hideMinimumOffer: data.hideMinimumOffer,
          hideReservePrice: data.hideReservePrice,
          hasWebsite: data.hasWebsite,
          website: data.website,
          hasLogo: data.hasLogo,
          hasBusinessAssets: data.hasBusinessAssets,
          businessName: data.businessName,
          businessDescription: data.businessDescription,
          businessAssets: data.businessAssets,
          hasSocialAccounts: data.hasSocialAccounts,
          socialMedia: data.socialMedia,
          isLive: data.isLive,
          hasAdultContent: data.hasAdultContent || false,
        } as AdminListing
      })
      setAllListings(listings)
    } catch (err) {
      console.error('Error fetching listings:', err)
      error('Failed to load listings')
    } finally {
      setLoading(false)
    }
  }

  // Filter listings based on active tab
  const filteredListings = useMemo(() => {
    let filtered = allListings

    if (activeTab === 'all') {
      if (allStatusFilter) {
        filtered = filtered.filter(l => l.status === allStatusFilter)
      }
      if (allVerifiedFilter !== null) {
        filtered = filtered.filter(l => l.verified === allVerifiedFilter)
      }
      if (allLiveFilter !== null) {
        filtered = filtered.filter(l => (l.isLive || false) === allLiveFilter)
      }
      if (allSearchQuery) {
        filtered = filtered.filter(l => 
          l.domain.toLowerCase().includes(allSearchQuery.toLowerCase()) ||
          l.category.toLowerCase().includes(allSearchQuery.toLowerCase()) ||
          l.sellerEmail?.toLowerCase().includes(allSearchQuery.toLowerCase())
        )
      }
    } else if (activeTab === 'active') {
      filtered = filtered.filter(l => l.status === 'approved' && l.verified === true)
      if (activeSearchQuery) {
        filtered = filtered.filter(l => 
          l.domain.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          l.category.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          l.sellerEmail?.toLowerCase().includes(activeSearchQuery.toLowerCase())
        )
      }
    } else if (activeTab === 'pending') {
      filtered = filtered.filter(l => l.status === 'pending_approval')
      if (filterVerified === true) {
        filtered = filtered.filter(l => l.verified)
      }
      if (filterMinPrice) {
        filtered = filtered.filter(l => l.price > 0)
      }
      if (searchQuery) {
        filtered = filtered.filter(l => 
          l.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.sellerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
    } else if (activeTab === 'promoted') {
      filtered = filtered.filter(l => l.isPromoted === true)
    }

    return filtered
  }, [allListings, activeTab, filterVerified, filterMinPrice, searchQuery, activeSearchQuery, allSearchQuery, allStatusFilter, allVerifiedFilter, allLiveFilter])

  const handleApprove = async (listingId: string) => {
    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: user?.uid,
      })
      setAllListings(allListings.map(l => 
        l.id === listingId ? { ...l, status: 'approved' } : l
      ))
      setSelectedListing(null)
      success('Domain approved successfully')
    } catch (err) {
      console.error('Error approving listing:', err)
      error('Failed to approve domain')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (listingId: string) => {
    if (!rejectionReason.trim()) {
      error('Please select a rejection reason')
      return
    }

    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        status: 'rejected',
        rejectionReason: rejectionReason,
        rejectedAt: new Date(),
        rejectedBy: user?.uid,
      })
      setAllListings(allListings.map(l => 
        l.id === listingId ? { ...l, status: 'rejected', rejectionReason } : l
      ))
      setSelectedListing(null)
      setRejectionReason('')
      success('Domain rejected')
    } catch (err) {
      console.error('Error rejecting listing:', err)
      error('Failed to reject domain')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkApprove = async () => {
    if (selectedListings.size === 0) {
      error('Please select listings to approve')
      return
    }

    setBulkApproving(true)
    try {
      let approvedCount = 0
      const listingIds = Array.from(selectedListings)
      for (const listingId of listingIds) {
        try {
          await updateDoc(doc(db, 'listings', listingId), {
            status: 'approved',
            approvedAt: new Date(),
            approvedBy: user?.uid,
          })
          approvedCount++
        } catch (err) {
          console.error(`Error approving listing ${listingId}:`, err)
        }
      }
      setAllListings(allListings.map(l => 
        selectedListings.has(l.id) ? { ...l, status: 'approved' } : l
      ))
      setSelectedListings(new Set())
      success(`${approvedCount} domain(s) approved successfully`)
    } catch (err) {
      console.error('Error in bulk approve:', err)
      error('Failed to approve domains')
    } finally {
      setBulkApproving(false)
    }
  }

  const handleEditListing = async () => {
    if (!editingListing) return

    setActionLoading(true)
    try {
      const updateData: any = {
        category: editFormData.category,
        price: parseInt(editFormData.price) || 0,
        description: editFormData.description,
        priceType: editPriceMode === 'set' ? 'asking' : editPriceMode === 'accepting' ? 'accepting_offers' : 'starting_bid',
      }

      if (editPriceMode === 'accepting') {
        updateData.minimumOfferPrice = parseInt(editFormData.minimumOfferPrice) || 0
        updateData.hideMinimumOffer = editHideMinimumOffer
      }

      if (editPriceMode === 'auction') {
        updateData.startingBid = parseInt(editFormData.startingBid) || 0
        updateData.reservePrice = parseInt(editFormData.reservePrice) || 0
        updateData.hideReservePrice = editHideReservePrice
      }

      updateData.hasWebsite = editHasWebsite
      updateData.website = editFormData.website || null
      updateData.hasLogo = editHasLogo
      updateData.hasBusinessAssets = editHasBusinessAssets
      updateData.businessName = editFormData.businessName || null
      updateData.businessDescription = editFormData.businessDescription || null
      updateData.businessAssets = editBusinessAssets
      updateData.hasSocialAccounts = editHasSocialAccounts
      updateData.socialMedia = editSocialAccounts
      updateData.isLive = editingListing.isLive || false

      await updateDoc(doc(db, 'listings', editingListing.id), updateData)
      setAllListings(allListings.map(l => 
        l.id === editingListing.id 
          ? { 
              ...l, 
              ...updateData,
            } 
          : l
      ))
      setEditingListing(null)
      success('Listing updated successfully')
    } catch (err) {
      console.error('Error updating listing:', err)
      error('Failed to update listing')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemovePromotion = async (listingId: string) => {
    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        isPromoted: false,
        promotedAt: null,
        promotionExpiresAt: null,
      })
      setAllListings(allListings.map(l => 
        l.id === listingId ? { ...l, isPromoted: false } : l
      ))
      success('Promotion removed')
    } catch (err) {
      console.error('Error removing promotion:', err)
      error('Failed to remove promotion')
    } finally {
      setActionLoading(false)
    }
  }

  const handlePromoteListing = async () => {
    if (!promotingListing) return

    setActionLoading(true)
    try {
      let promotionExpiresAt = null

      if (promotionFormData.type === 'duration') {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + parseInt(promotionFormData.duration))
        promotionExpiresAt = expiryDate
      }

      await updateDoc(doc(db, 'listings', promotingListing.id), {
        isPromoted: true,
        promotedAt: new Date(),
        promotionExpiresAt: promotionExpiresAt,
        promotionType: promotionFormData.type,
        promotionDuration: promotionFormData.type === 'duration' ? parseInt(promotionFormData.duration) : null,
        promotionViews: promotionFormData.type === 'views' ? parseInt(promotionFormData.views) : null,
      })

      setAllListings(allListings.map(l => 
        l.id === promotingListing.id 
          ? { 
              ...l, 
              isPromoted: true,
              promotedAt: new Date(),
              promotionExpiresAt: promotionExpiresAt,
            } 
          : l
      ))
      setPromotingListing(null)
      success('Listing promoted successfully')
    } catch (err) {
      console.error('Error promoting listing:', err)
      error('Failed to promote listing')
    } finally {
      setActionLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'all'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          All Listings ({allListings.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Live Listings ({allListings.filter(l => l.status === 'approved' && l.verified === true).length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'pending'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Pending Approvals ({allListings.filter(l => l.status === 'pending_approval').length})
        </button>
        <button
          onClick={() => setActiveTab('promoted')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'promoted'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Promoted ({allListings.filter(l => l.isPromoted).length})
        </button>
      </div>

      {/* All Listings Tab */}
      {activeTab === 'all' && (
        <div>
          <div className="sticky top-16 z-40 mb-6 bg-white rounded-lg shadow p-4 space-y-4">
            <input
              type="text"
              placeholder="Search by domain, category, or seller email..."
              value={allSearchQuery}
              onChange={(e) => setAllSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Status</label>
                <select
                  value={allStatusFilter}
                  onChange={(e) => setAllStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-6">
                <input
                  type="checkbox"
                  checked={allVerifiedFilter === true}
                  onChange={(e) => setAllVerifiedFilter(e.target.checked ? true : null)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Verified Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer pt-6">
                <input
                  type="checkbox"
                  checked={allLiveFilter === true}
                  onChange={(e) => setAllLiveFilter(e.target.checked ? true : null)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Live Only</span>
              </label>
            </div>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No listings found</p>
              </div>
            ) : (
              filteredListings.map(listing => (
                <div key={listing.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-blue-600">{listing.domain}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          listing.status === 'approved' ? 'bg-green-100 text-green-800' :
                          listing.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {listing.status === 'approved' ? 'Approved' :
                           listing.status === 'pending_approval' ? 'Pending' :
                           'Rejected'}
                        </span>
                        {listing.isLive && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Live
                          </span>
                        )}
                        {listing.verified && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Category</p>
                          <p>{listing.category}</p>
                        </div>
                        <div>
                          <p className="font-medium">Price</p>
                          <p>${listing.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Seller</p>
                          <p>{listing.sellerEmail || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Created</p>
                          <p>{listing.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingListing(listing)
                        setEditPriceMode(
                          listing.priceType === 'asking' ? 'set' : 
                          listing.priceType === 'accepting_offers' ? 'accepting' : 
                          'auction'
                        )
                        setEditFormData({
                          domain: listing.domain,
                          category: listing.category,
                          price: listing.price.toString(),
                          description: listing.description,
                          priceType: listing.priceType,
                          minimumOfferPrice: listing.minimumOfferPrice?.toString() || '',
                          startingBid: listing.startingBid?.toString() || '',
                          reservePrice: listing.reservePrice?.toString() || '',
                          website: listing.website || '',
                          businessName: listing.businessName || '',
                          businessDescription: listing.businessDescription || '',
                        })
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <Edit2 className="w-4 h-4 inline mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Active Listings Tab */}
      {activeTab === 'active' && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by domain, category, or seller email..."
              value={activeSearchQuery}
              onChange={(e) => setActiveSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="grid gap-4">
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600">No active listings</p>
              </div>
            ) : (
              filteredListings.map(listing => (
                <div key={listing.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-blue-600">{listing.domain}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Live
                        </span>
                        {listing.verified && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Category</p>
                          <p>{listing.category}</p>
                        </div>
                        <div>
                          <p className="font-medium">Price</p>
                          <p>${listing.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Seller</p>
                          <p>{listing.sellerEmail || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="font-medium">Created</p>
                          <p>{listing.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingListing(listing)
                        setEditPriceMode(
                          listing.priceType === 'asking' ? 'set' : 
                          listing.priceType === 'accepting_offers' ? 'accepting' : 
                          'auction'
                        )
                        setEditFormData({
                          domain: listing.domain,
                          category: listing.category,
                          price: listing.price.toString(),
                          description: listing.description,
                          priceType: listing.priceType,
                          minimumOfferPrice: listing.minimumOfferPrice?.toString() || '',
                          startingBid: listing.startingBid?.toString() || '',
                          reservePrice: listing.reservePrice?.toString() || '',
                          website: listing.website || '',
                          businessName: listing.businessName || '',
                          businessDescription: listing.businessDescription || '',
                        })
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <Edit2 className="w-4 h-4 inline mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Pending Approvals Tab */}
      {activeTab === 'pending' && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by domain, category, or seller email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
            />
          </div>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-6 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterVerified === true}
                  onChange={(e) => setFilterVerified(e.target.checked ? true : null)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Verified Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterMinPrice === 'has-price'}
                  onChange={(e) => setFilterMinPrice(e.target.checked ? 'has-price' : '')}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Has Price Specified</span>
              </label>
              <button
                onClick={() => {
                  setFilterVerified(null)
                  setFilterMinPrice('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
              >
                Reset Filters
              </button>
            </div>

            {selectedListings.size > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedListings.size} selected
                </span>
                <button
                  onClick={handleBulkApprove}
                  disabled={bulkApproving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {bulkApproving ? 'Approving...' : 'Bulk Approve'}
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {filteredListings.map(listing => (
              <div key={listing.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="checkbox"
                        checked={selectedListings.has(listing.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedListings)
                          if (e.target.checked) {
                            newSelected.add(listing.id)
                          } else {
                            newSelected.delete(listing.id)
                          }
                          setSelectedListings(newSelected)
                        }}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <h3 className="text-lg font-bold text-blue-600">{listing.domain}</h3>
                      {listing.verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Category: {listing.category}</span>
                      <span>Price: ${listing.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal - shown when editingListing is set */}
      {editingListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Listing: {editingListing.domain}</h2>
              <button
                onClick={() => {
                  setEditingListing({
                    ...editingListing,
                    isLive: !editingListing.isLive
                  })
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  editingListing.isLive
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {editingListing.isLive ? 'Live' : 'Make Live'}
              </button>
            </div>
            
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Domain */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Domain</label>
                <input
                  type="text"
                  value={editFormData.domain}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Mode */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">How do you want to sell?</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditPriceMode('set')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                      editPriceMode === 'set'
                        ? 'bg-blue-100 text-blue-900 border-2 border-blue-400'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Set Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPriceMode('accepting')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                      editPriceMode === 'accepting'
                        ? 'bg-blue-100 text-blue-900 border-2 border-blue-400'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Offers
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditPriceMode('auction')}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                      editPriceMode === 'auction'
                        ? 'bg-blue-100 text-blue-900 border-2 border-blue-400'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Auction
                  </button>
                </div>
              </div>

              {/* Price fields based on mode */}
              {editPriceMode === 'set' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Asking Price</label>
                  <input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              )}

              {editPriceMode === 'accepting' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Offer Price ($)</label>
                    <input
                      type="number"
                      value={editFormData.minimumOfferPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, minimumOfferPrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editHideMinOffer"
                      checked={editHideMinimumOffer}
                      onChange={(e) => setEditHideMinimumOffer(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="editHideMinOffer" className="text-sm text-gray-700">
                      Hide minimum offer amount from buyers
                    </label>
                  </div>
                </>
              )}

              {editPriceMode === 'auction' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Starting Bid ($)</label>
                    <input
                      type="number"
                      value={editFormData.startingBid}
                      onChange={(e) => setEditFormData({ ...editFormData, startingBid: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Reserve Price ($)</label>
                    <input
                      type="number"
                      value={editFormData.reservePrice}
                      onChange={(e) => setEditFormData({ ...editFormData, reservePrice: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editHideReserve"
                      checked={editHideReservePrice}
                      onChange={(e) => setEditHideReservePrice(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="editHideReserve" className="text-sm text-gray-700">
                      Hide reserve price from buyers
                    </label>
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  rows={4}
                />
              </div>

              {/* Optional Assets */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Optional Assets & Information</h3>
                
                {/* Website */}
                <div className="mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editHasWebsite}
                      onChange={(e) => setEditHasWebsite(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Includes Website</span>
                  </label>
                  {editHasWebsite && (
                    <input
                      type="url"
                      value={editFormData.website}
                      onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mt-2"
                    />
                  )}
                </div>

                {/* Logo */}
                <div className="mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editHasLogo}
                      onChange={(e) => setEditHasLogo(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Includes Logo</span>
                  </label>
                </div>

                {/* Business Assets */}
                <div className="mb-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editHasBusinessAssets}
                      onChange={(e) => setEditHasBusinessAssets(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Includes Business Assets</span>
                  </label>
                  {editHasBusinessAssets && (
                    <div className="space-y-2 mt-2">
                      <input
                        type="text"
                        value={editFormData.businessName}
                        onChange={(e) => setEditFormData({ ...editFormData, businessName: e.target.value })}
                        placeholder="Business Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      />
                      <textarea
                        value={editFormData.businessDescription}
                        onChange={(e) => setEditFormData({ ...editFormData, businessDescription: e.target.value })}
                        placeholder="Describe the business assets included..."
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Social Accounts */}
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editHasSocialAccounts}
                      onChange={(e) => setEditHasSocialAccounts(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Includes Social Media Accounts</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setEditingListing(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEditListing}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promoted Tab */}
      {activeTab === 'promoted' && (
        <div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by domain name..."
              value={promotedSearchQuery}
              onChange={(e) => setPromotedSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="grid gap-4">
            {allListings
              .filter(l => 
                (l.domain.toLowerCase().includes(promotedSearchQuery.toLowerCase()) ||
                l.category.toLowerCase().includes(promotedSearchQuery.toLowerCase()) ||
                l.sellerEmail?.toLowerCase().includes(promotedSearchQuery.toLowerCase())) &&
                (l.status === 'approved' || l.status === 'pending_approval')
              )
              .map(listing => (
                <div key={listing.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {listing.isPromoted && <Zap className="w-5 h-5 text-yellow-500" />}
                        <h3 className="text-lg font-bold text-blue-600">{listing.domain}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          listing.isPromoted 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.isPromoted ? 'Promoted' : 'Not Promoted'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Category</p>
                          <p>{listing.category}</p>
                        </div>
                        <div>
                          <p className="font-medium">Price</p>
                          <p>${listing.price.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status</p>
                          <p className="capitalize">{listing.status}</p>
                        </div>
                        <div>
                          <p className="font-medium">Seller</p>
                          <p>{listing.sellerEmail || 'Unknown'}</p>
                        </div>
                        {listing.isPromoted && (
                          <>
                            <div>
                              <p className="font-medium">Promoted At</p>
                              <p>{listing.promotedAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-medium">Expires At</p>
                              <p>{listing.promotionExpiresAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-col">
                      {listing.isPromoted ? (
                        <>
                          <button
                            onClick={() => {
                              setPromotingListing(listing)
                              setPromotionFormData({
                                type: 'duration',
                                duration: '7',
                                views: '1000',
                              })
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                          >
                            Edit Promotion
                          </button>
                          <button
                            onClick={() => handleRemovePromotion(listing.id)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 text-sm"
                          >
                            Remove Promotion
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setPromotingListing(listing)
                            setPromotionFormData({
                              type: 'duration',
                              duration: '7',
                              views: '1000',
                            })
                          }}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium text-sm"
                        >
                          Promote
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Promote Listing Modal */}
          {promotingListing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Promote Listing: {promotingListing.domain}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Promotion Type</label>
                    <select
                      value={promotionFormData.type}
                      onChange={(e) => setPromotionFormData({ ...promotionFormData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="duration">Duration (Days)</option>
                      <option value="views">View Limit</option>
                      <option value="until_sold">Until Sold</option>
                    </select>
                  </div>

                  {promotionFormData.type === 'duration' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Duration (Days)</label>
                      <input
                        type="number"
                        min="1"
                        value={promotionFormData.duration}
                        onChange={(e) => setPromotionFormData({ ...promotionFormData, duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  )}

                  {promotionFormData.type === 'views' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">View Limit</label>
                      <input
                        type="number"
                        min="100"
                        value={promotionFormData.views}
                        onChange={(e) => setPromotionFormData({ ...promotionFormData, views: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setPromotingListing(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePromoteListing}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium disabled:opacity-50"
                    >
                      {actionLoading ? 'Promoting...' : 'Promote'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedListing && activeTab === 'pending' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedListing.domain}</h2>
            
            {/* Image Preview */}
            {selectedListing.logo && !selectedListing.logo.includes('stylized') && (
              <div className="mb-4">
                <img 
                  src={selectedListing.logo} 
                  alt={selectedListing.domain}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90"
                  onClick={() => setLightboxImage(selectedListing.logo || null)}
                />
              </div>
            )}
            
            <div className="mb-6 space-y-3 text-sm text-gray-600">
              <p><strong>Category:</strong> {selectedListing.category}</p>
              <p><strong>Price:</strong> ${selectedListing.price.toLocaleString()}</p>
              <p><strong>Verified:</strong> {selectedListing.verified ? 'Yes' : 'No'}</p>
              <p><strong>Description:</strong> {selectedListing.description}</p>
              {selectedListing.hasAdultContent && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <p className="text-red-800"><strong>⚠️ Adult Content Declared:</strong> Yes</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Rejection Reason</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select a reason...</option>
                {CANNED_REJECTIONS.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedListing(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => handleReject(selectedListing.id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApprove(selectedListing.id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
