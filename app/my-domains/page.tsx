'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/ToastContext'
import PromotionCheckoutModal from '@/components/PromotionCheckoutModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import BulkEditModal, { BulkEditUpdates } from '@/components/BulkEditModal'
import ConfirmationModal from '@/components/ConfirmationModal'
import GroupModal from '@/components/GroupModal'
import { Edit, Trash2, AlertCircle, Loader, Eye, X, Zap, ChevronUp, ChevronDown, Link2 } from 'lucide-react'
import { logPromotionView } from '@/lib/promotionAnalytics'
import { getCategoryConfig, CATEGORIES } from '@/lib/categories'

interface DomainListing {
  id: string
  domain: string
  category: string
  price: number
  status: 'pending_approval' | 'approved' | 'rejected' | 'sold'
  createdAt: any
  description: string
  priceType: string
  logo?: string
  isLive?: boolean
  rejectionReason?: string
  isPromoted?: boolean
  verified?: boolean
  dnsToken?: string
  hideMinimumOffer?: boolean
  minimumOfferPrice?: number
  startingBid?: number
  reservePrice?: number
  hideReservePrice?: boolean
  groupId?: string
  groupName?: string
  hasWebsite?: boolean
  hasLogo?: boolean
  hasBusinessAssets?: boolean
  hasSocialAccounts?: boolean
  website?: string
  businessName?: string
  businessDescription?: string
  businessAssets?: any[]
  socialMedia?: Array<{ platform: string; url: string }>
}

const getPriceTypeLabel = (type: string) => {
  switch (type) {
    case 'asking':
      return 'Set Price'
    case 'accepting_offers':
      return 'Offers'
    case 'starting_bid':
      return 'Auction'
    default:
      return 'Price'
  }
}

export default function MyDomainsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { success, error } = useToast()
  const [domains, setDomains] = useState<DomainListing[]>([])
  const [filteredDomains, setFilteredDomains] = useState<DomainListing[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'price-high' | 'price-low' | 'name'>('recent')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [priceTypeFilter, setPriceTypeFilter] = useState<string>('all')
  const [previewDomain, setPreviewDomain] = useState<DomainListing | null>(null)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [rejectionModal, setRejectionModal] = useState<DomainListing | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'approved' | 'pending' | 'rejected' | 'verified'>('all')
  const [showPromotedOnly, setShowPromotedOnly] = useState(false)
  const [promotionModal, setPromotionModal] = useState<DomainListing | null>(null)
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set())
  const [bulkEditModal, setBulkEditModal] = useState(false)
  const [bulkEditLoading, setBulkEditLoading] = useState(false)
  const [bulkMakeLiveConfirm, setBulkMakeLiveConfirm] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  })
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)
  const [groupModal, setGroupModal] = useState(false)
  const [groupLoading, setGroupLoading] = useState(false)
  const [domainGroups, setDomainGroups] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    fetchUserDomains()
  }, [user, authLoading, router])

  useEffect(() => {
    let filtered = domains.filter(d => {
      // Search filter
      const matchesSearch = d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.category.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false

      // Category filter
      if (categoryFilter !== 'all' && d.category !== categoryFilter) {
        return false
      }

      // Price type filter
      if (priceTypeFilter !== 'all' && d.priceType !== priceTypeFilter) {
        return false
      }

      // Status filter
      if (statusFilter === 'live') {
        if (d.status !== 'approved' || d.isLive !== true || !d.verified) return false
      } else if (statusFilter === 'approved') {
        if (d.status !== 'approved' || d.isLive === true) return false
      } else if (statusFilter === 'pending') {
        if (d.status !== 'pending_approval') return false
      } else if (statusFilter === 'rejected') {
        if (d.status !== 'rejected') return false
      } else if (statusFilter === 'verified') {
        if (!d.verified) return false
      }

      // Promoted filter
      if (showPromotedOnly && d.isPromoted !== true) {
        return false
      }
      
      return true
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent': {
          const dateA = a.createdAt?.toDate?.() || new Date(0)
          const dateB = b.createdAt?.toDate?.() || new Date(0)
          return dateB.getTime() - dateA.getTime()
        }
        case 'price-high':
          return b.price - a.price
        case 'price-low':
          return a.price - b.price
        case 'name':
          return a.domain.localeCompare(b.domain)
        default:
          return 0
      }
    })

    setFilteredDomains(filtered)
  }, [domains, searchQuery, sortBy, statusFilter, showPromotedOnly, categoryFilter, priceTypeFilter])

  const fetchUserDomains = async () => {
    try {
      setLoading(true)
      const q = query(
        collection(db, 'listings'),
        where('sellerId', '==', user?.uid)
      )
      const snapshot = await getDocs(q)
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as DomainListing[]
      setDomains(listings.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0)
        const dateB = b.createdAt?.toDate?.() || new Date(0)
        return dateB.getTime() - dateA.getTime()
      }))
    } catch (err) {
      console.error('Error fetching domains:', err)
      setErrorMessage('Failed to load your domains')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      await deleteDoc(doc(db, 'listings', deleteConfirm))
      setDomains(domains.filter(d => d.id !== deleteConfirm))
      success('Domain listing deleted successfully')
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Error deleting domain:', err)
      error('Failed to delete domain')
      setDeleteConfirm(null)
    }
  }

  const handleToggleLive = async (id: string, currentLive: boolean) => {
    try {
      const domain = domains.find(d => d.id === id)
      if (!domain) return

      const newLiveStatus = !currentLive
      
      // Prevent making domain live if not verified
      if (newLiveStatus && !domain.verified) {
        setErrorMessage('Domain must be verified before going live')
        error('Domain must be verified before going live')
        return
      }

      console.log(`Toggling listing ${id} to isLive: ${newLiveStatus}`)
      await updateDoc(doc(db, 'listings', id), {
        isLive: newLiveStatus,
      })
      console.log(`Successfully updated listing ${id}`)
      setDomains(domains.map(d => 
        d.id === id ? { ...d, isLive: newLiveStatus } : d
      ))
      setErrorMessage('')
      success(newLiveStatus ? 'Domain is now live!' : 'Domain removed from live')
    } catch (err) {
      console.error('Error toggling live status:', err)
      error(`Failed to update listing status`)
    }
  }

  const handleResubmitRejected = async (id: string) => {
    try {
      await updateDoc(doc(db, 'listings', id), {
        status: 'pending_approval',
        rejectionReason: null,
      })
      setDomains(domains.map(d => 
        d.id === id ? { ...d, status: 'pending_approval', rejectionReason: undefined } : d
      ))
      setRejectionModal(null)
      setErrorMessage('')
      success('Domain resubmitted for review!')
    } catch (err) {
      console.error('Error resubmitting domain:', err)
      error('Failed to resubmit domain')
    }
  }

  const handlePromoteDomain = async (promotionData: { type: string; duration?: number; views?: number; price: number }) => {
    if (!promotionModal) return
    
    setPromotingId(promotionModal.id)
    try {
      let expiresAt = null
      let updateData: any = {
        isPromoted: true,
        promotedAt: new Date(),
        promotionType: promotionData.type,
        promotionPrice: promotionData.price,
      }

      if (promotionData.type === 'duration' && promotionData.duration) {
        expiresAt = new Date(Date.now() + promotionData.duration * 24 * 60 * 60 * 1000)
        updateData.promotionExpiresAt = expiresAt
        updateData.promotionDuration = promotionData.duration
      } else if (promotionData.type === 'views' && promotionData.views) {
        updateData.promotionViews = promotionData.views
      } else if (promotionData.type === 'until_sold') {
        updateData.promotionUntilSold = true
      }
      
      await updateDoc(doc(db, 'listings', promotionModal.id), updateData)
      
      setDomains(domains.map(d => 
        d.id === promotionModal.id 
          ? { ...d, isPromoted: true } 
          : d
      ))
      setPromotionModal(null)
      
      let successMessage = 'Domain promoted successfully!'
      if (promotionData.type === 'duration' && promotionData.duration) {
        successMessage = `Domain promoted for ${promotionData.duration} days!`
      } else if (promotionData.type === 'views' && promotionData.views) {
        successMessage = `Domain promoted with ${promotionData.views.toLocaleString()} bonus views!`
      } else if (promotionData.type === 'until_sold') {
        successMessage = 'Domain promoted until sold!'
      }
      
      success(successMessage)
    } catch (err) {
      console.error('Error promoting domain:', err)
      error('Failed to promote domain')
    } finally {
      setPromotingId(null)
    }
  }

  const toggleDomainSelection = (domainId: string) => {
    const newSelected = new Set(selectedDomains)
    if (newSelected.has(domainId)) {
      newSelected.delete(domainId)
    } else {
      newSelected.add(domainId)
    }
    setSelectedDomains(newSelected)
  }

  const selectAllFiltered = () => {
    if (selectedDomains.size === filteredDomains.length) {
      setSelectedDomains(new Set())
    } else {
      setSelectedDomains(new Set(filteredDomains.map(d => d.id)))
    }
  }

  const handleBulkEdit = async (updates: BulkEditUpdates) => {
    if (selectedDomains.size === 0) return

    setBulkEditLoading(true)
    try {
      let updatedCount = 0
      const listingIds = Array.from(selectedDomains)
      const updateData: Record<string, any> = {
        priceType: updates.priceType,
      }

      if (updates.category) {
        updateData.category = updates.category
      }

      // Set price based on price type
      if (updates.priceType === 'asking' && updates.price !== undefined) {
        updateData.price = updates.price
      } else if (updates.priceType === 'accepting_offers') {
        if (updates.minimumOfferPrice !== undefined) {
          updateData.minimumOfferPrice = updates.minimumOfferPrice
          updateData.price = updates.minimumOfferPrice
        }
        updateData.hideMinimumOffer = updates.hideMinimumOffer ?? false
      } else if (updates.priceType === 'starting_bid') {
        if (updates.startingBid !== undefined) {
          updateData.startingBid = updates.startingBid
          updateData.price = updates.startingBid
        }
        if (updates.reservePrice !== undefined) {
          updateData.reservePrice = updates.reservePrice
        }
        updateData.hideReservePrice = updates.hideReservePrice ?? false
      }
      
      for (const listingId of listingIds) {
        try {
          await updateDoc(doc(db, 'listings', listingId), updateData)
          updatedCount++
        } catch (err) {
          console.error(`Error updating listing ${listingId}:`, err)
        }
      }

      setDomains(domains.map(d => {
        if (selectedDomains.has(d.id)) {
          const updatedDomain: any = {
            ...d,
            priceType: updates.priceType,
          }
          
          if (updates.category) {
            updatedDomain.category = updates.category
          }

          if (updates.priceType === 'asking' && updates.price !== undefined) {
            updatedDomain.price = updates.price
          } else if (updates.priceType === 'accepting_offers') {
            if (updates.minimumOfferPrice !== undefined) {
              updatedDomain.minimumOfferPrice = updates.minimumOfferPrice
              updatedDomain.price = updates.minimumOfferPrice
            }
            updatedDomain.hideMinimumOffer = updates.hideMinimumOffer ?? false
          } else if (updates.priceType === 'starting_bid') {
            if (updates.startingBid !== undefined) {
              updatedDomain.startingBid = updates.startingBid
              updatedDomain.price = updates.startingBid
            }
            if (updates.reservePrice !== undefined) {
              updatedDomain.reservePrice = updates.reservePrice
            }
            updatedDomain.hideReservePrice = updates.hideReservePrice ?? false
          }

          return updatedDomain
        }
        return d
      }))

      setSelectedDomains(new Set())
      setBulkEditModal(false)
      success(`Successfully updated ${updatedCount} domain${updatedCount !== 1 ? 's' : ''}`)
    } catch (err) {
      console.error('Error in bulk edit:', err)
      error('Failed to update domains')
    } finally {
      setBulkEditLoading(false)
    }
  }

  const handleBulkMakeLiveClick = () => {
    if (selectedDomains.size === 0) return

    const selectedDomainsArray = Array.from(selectedDomains)
      .map(id => domains.find(d => d.id === id))
      .filter(Boolean) as DomainListing[]

    const alreadyLiveCount = selectedDomainsArray.filter(d => d.isLive).length
    const domainsToMakeLive = selectedDomainsArray.filter(d => !d.isLive)

    if (domainsToMakeLive.length === 0) {
      error('All selected domains are already live')
      return
    }

    const message = alreadyLiveCount > 0 
      ? `Make ${domainsToMakeLive.length} domain${domainsToMakeLive.length !== 1 ? 's' : ''} live? (${alreadyLiveCount} already live)`
      : `Make ${domainsToMakeLive.length} domain${domainsToMakeLive.length !== 1 ? 's' : ''} live?`

    setBulkMakeLiveConfirm({ isOpen: true, message })
  }

  const handleBulkMakeLiveConfirm = async () => {
    if (selectedDomains.size === 0) return

    const selectedDomainsArray = Array.from(selectedDomains)
      .map(id => domains.find(d => d.id === id))
      .filter(Boolean) as DomainListing[]

    const domainsToMakeLive = selectedDomainsArray.filter(d => !d.isLive)

    setBulkEditLoading(true)
    try {
      let updatedCount = 0
      let skippedCount = 0

      for (const domain of domainsToMakeLive) {
        try {
          await updateDoc(doc(db, 'listings', domain.id), {
            isLive: true,
          })
          updatedCount++
        } catch (err) {
          console.error(`Error making listing ${domain.id} live:`, err)
          skippedCount++
        }
      }

      setDomains(domains.map(d => {
        if (selectedDomains.has(d.id) && !d.isLive) {
          return { ...d, isLive: true }
        }
        return d
      }))

      setSelectedDomains(new Set())
      setBulkMakeLiveConfirm({ isOpen: false, message: '' })
      let successMessage = `Successfully made ${updatedCount} domain${updatedCount !== 1 ? 's' : ''} live!`
      if (skippedCount > 0) {
        successMessage += ` (${skippedCount} failed)`
      }
      success(successMessage)
    } catch (err) {
      console.error('Error in bulk make live:', err)
      error('Failed to make domains live')
    } finally {
      setBulkEditLoading(false)
    }
  }

  const handleCreateGroup = async (groupName: string) => {
    if (selectedDomains.size < 2) {
      error('Select at least 2 domains to create a group')
      return
    }

    setGroupLoading(true)
    try {
      const groupId = `group_${Date.now()}`
      const domainIds = Array.from(selectedDomains)

      // Update each domain with the group ID
      for (const domainId of domainIds) {
        await updateDoc(doc(db, 'listings', domainId), {
          groupId: groupId,
          groupName: groupName,
        })
      }

      // Update local state
      const newGroups = { ...domainGroups }
      newGroups[groupId] = domainIds
      setDomainGroups(newGroups)

      // Refresh domains
      fetchUserDomains()
      setSelectedDomains(new Set())
      setGroupModal(false)
      success(`Created group "${groupName}" with ${domainIds.length} domains`)
    } catch (err) {
      console.error('Error creating group:', err)
      error('Failed to create group')
    } finally {
      setGroupLoading(false)
    }
  }

  const formatPriceType = (priceType: string) => {
    const priceTypeMap: Record<string, string> = {
      asking: 'Set Price',
      accepting_offers: 'Accepting Offers',
      starting_bid: 'Auction',
    }
    return priceTypeMap[priceType] || priceType
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending_approval: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Pending Review' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      sold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Sold' },
    }
    const config = statusConfig[status] || statusConfig.pending_approval
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
            <p className="text-gray-600">Loading your domains...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        {domains.length > 0 && (
          <div className="sticky top-16 z-40 mb-6 bg-white rounded-lg shadow transition-all duration-200">
            {/* Header with Collapse Toggle */}
            <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search domains or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                className="ml-3 p-2 hover:bg-gray-100 rounded-lg transition"
                title={isHeaderCollapsed ? "Expand filters" : "Collapse filters"}
              >
                {isHeaderCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>

            {/* Collapsible Content */}
            {!isHeaderCollapsed && (
              <div className="p-3 sm:p-4 space-y-3">
                {/* Status and Sort in one row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value="all">All Categories</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price Type</label>
                    <select
                      value={priceTypeFilter}
                      onChange={(e) => setPriceTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value="all">All Types</option>
                      <option value="asking">Set Price</option>
                      <option value="accepting_offers">Offers</option>
                      <option value="starting_bid">Auction</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="live">Live</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending Review</option>
                      <option value="rejected">Rejected</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sort</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>
                </div>

                {/* Promoted Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPromotedOnly}
                    onChange={(e) => setShowPromotedOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Promoted Only</span>
                </label>

                {/* Selection and Bulk Actions */}
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDomains.size > 0 && selectedDomains.size === filteredDomains.length}
                      onChange={selectAllFiltered}
                      className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                    />
                    <label className="text-sm font-medium text-gray-700 cursor-pointer">
                      Select All ({filteredDomains.length})
                    </label>
                  </div>
                  {selectedDomains.size > 0 && (
                    <div className="flex items-center justify-between gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-sm font-medium text-blue-900">
                        {selectedDomains.size} selected
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setSelectedDomains(new Set())}
                          className="px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition"
                        >
                          Clear
                        </button>
                        <button
                          onClick={handleBulkMakeLiveClick}
                          disabled={bulkEditLoading}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
                        >
                          {bulkEditLoading ? 'Making Live...' : 'Make Live'}
                        </button>
                        <button
                          onClick={() => setBulkEditModal(true)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                        >
                          Bulk Edit
                        </button>
                        <button
                          onClick={() => setGroupModal(true)}
                          disabled={selectedDomains.size < 2}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition flex items-center gap-2"
                        >
                          <Link2 className="w-4 h-4" />
                          Create Group
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-600">
                  Showing {filteredDomains.length} of {domains.length} domains
                </p>
              </div>
            )}
          </div>
        )}

        {domains.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't listed any domains yet</p>
            <button
              onClick={() => router.push('/sell')}
              className="px-6 py-2 bg-[#7299CB] text-white rounded-lg hover:bg-[#5a7aaa] transition font-medium"
            >
              List Your First Domain
            </button>
          </div>
        ) : filteredDomains.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No domains match your search</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {filteredDomains.map(domain => (
              <div key={domain.id} className="bg-white rounded-lg shadow p-3 sm:p-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
                  <div className="flex gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedDomains.has(domain.id)}
                      onChange={() => toggleDomainSelection(domain.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 rounded border-gray-300 cursor-pointer mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {domain.isPromoted && <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                        <h3 className="text-base sm:text-lg font-bold text-blue-600 truncate">{domain.domain}</h3>
                      </div>
                      {getStatusBadge(domain.status)}
                      {domain.groupName && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {domain.groupName}
                        </span>
                      )}
                      {domain.isPromoted && (
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Promoted
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                      <div>
                        <p className="text-gray-500">Category</p>
                        {(() => {
                          const categoryConfig = getCategoryConfig(domain.category)
                          return (
                            <span 
                              className="inline-block px-2 py-1 rounded-full text-xs font-medium truncate"
                              style={{
                                backgroundColor: categoryConfig.color + '20',
                                color: categoryConfig.color,
                                borderColor: categoryConfig.color,
                                borderWidth: '1px'
                              }}
                            >
                              {domain.category}
                            </span>
                          )
                        })()}
                      </div>
                      <div>
                        <p className="text-gray-500">Price</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">${domain.price.toLocaleString()}</p>
                          {domain.priceType === 'accepting_offers' && domain.hideMinimumOffer && (
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Hidden</span>
                          )}
                          {domain.priceType === 'starting_bid' && domain.hideReservePrice && (
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">Hidden</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Price Type</p>
                        <p className="font-medium text-gray-900 truncate">{formatPriceType(domain.priceType)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Listed</p>
                        <p className="font-medium text-gray-900">
                          {domain.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </p>
                      </div>
                    </div>
                      {domain.description && (
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{domain.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    {domain.status === 'approved' && (
                      <>
                        {domain.isLive ? (
                          <button
                            onClick={() => handleToggleLive(domain.id, domain.isLive || false)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition w-full sm:w-auto whitespace-nowrap bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            Live
                          </button>
                        ) : !domain.verified ? (
                          <button
                            onClick={() => router.push(`/my-domains/${domain.id}/edit`)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition w-full sm:w-auto whitespace-nowrap bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          >
                            Verification Required
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleLive(domain.id, domain.isLive || false)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition w-full sm:w-auto whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Make Live
                          </button>
                        )}
                      </>
                    )}
                    {domain.status === 'rejected' && (
                      <button
                        onClick={() => setRejectionModal(domain)}
                        className="px-3 py-2 rounded-lg text-xs font-medium transition w-full sm:w-auto whitespace-nowrap bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        View Rejection
                      </button>
                    )}
                    {domain.status === 'approved' && !domain.isPromoted && (
                      <button
                        onClick={() => setPromotionModal(domain)}
                        className="px-3 py-2 rounded-lg text-xs font-medium transition w-full sm:w-auto whitespace-nowrap bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center justify-center gap-1"
                      >
                        <Zap className="w-4 h-4" />
                        Promote
                      </button>
                    )}
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => setPreviewDomain(domain)}
                        className="flex-1 sm:flex-none p-2 text-green-600 hover:bg-green-50 rounded-lg transition border border-green-200"
                        title="Preview listing"
                      >
                        <Eye className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => router.push(`/my-domains/${domain.id}/edit`)}
                        className="flex-1 sm:flex-none p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200"
                        title="Edit domain"
                      >
                        <Edit className="w-5 h-5 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDelete(domain.id)}
                        className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 rounded-lg transition border border-red-200"
                        title="Delete domain"
                      >
                        <Trash2 className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Preview Modal */}
      {previewDomain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900">{previewDomain.domain}</h1>
              <button
                onClick={() => setPreviewDomain(null)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Image & Assets */}
                <div className="md:col-span-1">
                  {previewDomain.logo && !previewDomain.logo.includes('stylized') && (
                    <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
                      <img
                        src={previewDomain.logo}
                        alt={previewDomain.domain}
                        onClick={() => previewDomain.logo && setLightboxImage(previewDomain.logo)}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition"
                      />
                    </div>
                  )}

                  {/* Assets Pills */}
                  {(previewDomain.hasWebsite || previewDomain.hasLogo || previewDomain.hasBusinessAssets || previewDomain.hasSocialAccounts) && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Included Assets</h3>
                      <div className="flex flex-wrap gap-2">
                        {previewDomain.hasWebsite && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            Website
                          </span>
                        )}
                        {previewDomain.hasLogo && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            Logo
                          </span>
                        )}
                        {previewDomain.hasBusinessAssets && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Business Assets
                          </span>
                        )}
                        {previewDomain.hasSocialAccounts && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-800">
                            Social Accounts
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Domain Info */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Category</p>
                      <p className="font-semibold text-gray-900">{previewDomain.category}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Price Type</p>
                      <p className="font-semibold text-gray-900">{getPriceTypeLabel(previewDomain.priceType)}</p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="md:col-span-2 space-y-6">
                  {/* Price Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        {previewDomain.priceType === 'accepting_offers' && previewDomain.hideMinimumOffer ? (
                          <>
                            <p className="text-sm text-gray-600 mb-1">Price</p>
                            <p className="text-3xl font-bold text-gray-900">Accepting Offers</p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 mb-1">{getPriceTypeLabel(previewDomain.priceType)}</p>
                            <p className="text-3xl font-bold text-gray-900">
                              ${previewDomain.price.toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seller Notice */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    {previewDomain.priceType === 'asking' && (
                      <>
                        <p className="text-sm font-semibold text-blue-900 mb-2">Fixed-Price Sale</p>
                        <p className="text-sm text-blue-800">
                          By listing this domain at a fixed price, the seller indicates intent to sell to the first buyer who completes payment at the listed price.
                        </p>
                      </>
                    )}
                    {previewDomain.priceType === 'accepting_offers' && (
                      <>
                        <p className="text-sm font-semibold text-blue-900 mb-2">Negotiated Offers</p>
                        <p className="text-sm text-blue-800">
                          The seller allows buyers to submit purchase proposals for review. Accepting an offer indicates intent to sell at the agreed price.
                        </p>
                      </>
                    )}
                    {previewDomain.priceType === 'starting_bid' && (
                      <>
                        <p className="text-sm font-semibold text-blue-900 mb-2">Auction Listing</p>
                        <p className="text-sm text-blue-800">
                          The seller agrees to sell the domain to the winning bidder if the auction concludes with a valid bid that meets any stated reserve requirements.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Description */}
                  {previewDomain.description && previewDomain.description.trim() && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-700 whitespace-pre-wrap break-words">{previewDomain.description}</p>
                    </div>
                  )}

                  {/* Asset Details */}
                  {(previewDomain.hasWebsite || previewDomain.hasLogo || previewDomain.hasBusinessAssets || previewDomain.hasSocialAccounts) && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Asset Details</h3>
                      <div className="space-y-4">
                        {previewDomain.hasWebsite && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">Website</p>
                            {previewDomain.website ? (
                              <a
                                href={previewDomain.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                              >
                                {previewDomain.website}
                              </a>
                            ) : (
                              <p className="text-sm text-gray-600">Website included</p>
                            )}
                          </div>
                        )}
                        {previewDomain.hasLogo && (
                          <div>
                            <p className="text-sm font-medium text-gray-900">Logo</p>
                            <p className="text-sm text-gray-600">Professional logo included</p>
                          </div>
                        )}
                        {previewDomain.hasBusinessAssets && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Business Assets</p>
                            <div className="text-sm text-gray-600 space-y-2">
                              {previewDomain.businessName && (
                                <div className="p-2 bg-white border border-gray-200 rounded">
                                  <p className="whitespace-pre-wrap break-words">{previewDomain.businessName}</p>
                                </div>
                              )}
                              {previewDomain.businessDescription && (
                                <div className="p-2 bg-white border border-gray-200 rounded">
                                  <p className="whitespace-pre-wrap break-words">{previewDomain.businessDescription}</p>
                                </div>
                              )}
                              {previewDomain.businessAssets && previewDomain.businessAssets.length > 0 && (
                                <div>
                                  {previewDomain.businessAssets.map((asset: any, idx: number) => (
                                    <div key={idx} className="p-2 bg-white border border-gray-200 rounded mb-2">
                                      <p className="whitespace-pre-wrap break-words">{asset.type || asset}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!previewDomain.businessName && !previewDomain.businessDescription && (!previewDomain.businessAssets || previewDomain.businessAssets.length === 0) && (
                                <p>Business assets included</p>
                              )}
                            </div>
                          </div>
                        )}
                        {previewDomain.hasSocialAccounts && (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">Social Accounts</p>
                            {previewDomain.socialMedia && previewDomain.socialMedia.length > 0 ? (
                              <div className="space-y-1.5">
                                {previewDomain.socialMedia.map((social: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-20">{social.platform}:</span>
                                    <a
                                      href={social.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                    >
                                      {social.url}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">Social media accounts included</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setPreviewDomain(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setPreviewDomain(null)
                    router.push(`/my-domains/${previewDomain.id}/edit`)
                  }}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Edit Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Full size"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Listing Rejected</h2>
                <p className="text-sm text-gray-600 mt-1">{rejectionModal.domain}</p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-semibold text-red-900 mb-2">Reason for Rejection:</p>
              <p className="text-sm text-red-800">{rejectionModal.rejectionReason || 'No reason provided'}</p>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              You can make changes to your listing and resubmit it for review. Click "Edit Listing" to make changes, or "Resubmit" to send it for review again without changes.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setRejectionModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setRejectionModal(null)
                  router.push(`/my-domains/${rejectionModal.id}/edit`)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Edit Listing
              </button>
              <button
                onClick={() => handleResubmitRejected(rejectionModal.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Resubmit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promotion Modal */}
      {promotionModal && (
        <PromotionCheckoutModal
          domain={promotionModal.domain}
          onClose={() => setPromotionModal(null)}
          onCheckout={handlePromoteDomain}
          isLoading={promotingId === promotionModal.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Delete Domain Listing"
        message="Are you sure you want to delete this domain listing? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Bulk Edit Modal */}
      {bulkEditModal && (
        <BulkEditModal
          selectedDomains={Array.from(selectedDomains).map(id => 
            domains.find(d => d.id === id)!
          ).filter(Boolean)}
          onClose={() => setBulkEditModal(false)}
          onApply={handleBulkEdit}
          isLoading={bulkEditLoading}
        />
      )}

      {/* Bulk Make Live Confirmation Modal */}
      <ConfirmationModal
        isOpen={bulkMakeLiveConfirm.isOpen}
        title="Make Domains Live"
        message={bulkMakeLiveConfirm.message}
        confirmText="Make Live"
        cancelText="Cancel"
        isLoading={bulkEditLoading}
        onConfirm={handleBulkMakeLiveConfirm}
        onCancel={() => setBulkMakeLiveConfirm({ isOpen: false, message: '' })}
      />

      {/* Group Modal */}
      <GroupModal
        isOpen={groupModal}
        onClose={() => setGroupModal(false)}
        onConfirm={handleCreateGroup}
        selectedCount={selectedDomains.size}
        isLoading={groupLoading}
      />

      <Footer />
    </div>
  )
}
