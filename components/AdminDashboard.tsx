'use client'

import { useState, useEffect, useMemo } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/components/AuthContext'
import { CheckCircle, XCircle, Clock, AlertCircle, Filter } from 'lucide-react'
import { Listing, ListingStatus, isAdmin } from '@/lib/firestore-schema'

const CANNED_REJECTIONS = [
  'Domain contains prohibited content',
  'Incomplete or missing listing information',
  'Domain ownership not verified',
  'Price appears unrealistic or suspicious',
  'Domain has trademark/copyright issues',
  'Suspicious seller history or activity',
  'Domain contains adult or explicit content',
  'Misleading or deceptive listing description',
  'Domain has known security issues',
  'Violates platform policies',
  'Insufficient documentation provided',
  'Domain appears to be parked/inactive',
]

interface PendingListing extends Listing {
  sellerName?: string
  sellerEmail?: string
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [pendingListings, setPendingListings] = useState<PendingListing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set())
  const [filterVerified, setFilterVerified] = useState<boolean | null>(null)
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')
  const [bulkApproving, setBulkApproving] = useState(false)

  useEffect(() => {
    if (authLoading || !user) return

    fetchPendingListings()
  }, [user, authLoading])

  const fetchPendingListings = async () => {
    try {
      setLoading(true)
      const q = query(
        collection(db, 'listings'),
        where('status', '==', 'pending_approval')
      )
      const snapshot = await getDocs(q)
      const listings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as PendingListing[]
      setPendingListings(listings)
    } catch (error) {
      console.error('Error fetching pending listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (listingId: string) => {
    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: user?.uid,
      })
      setPendingListings(pendingListings.filter(l => l.id !== listingId))
      setSelectedListing(null)
    } catch (error) {
      console.error('Error approving listing:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (listingId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setActionLoading(true)
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        status: 'rejected',
        rejectionReason: rejectionReason,
      })
      setPendingListings(pendingListings.filter(l => l.id !== listingId))
      setSelectedListing(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting listing:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const filteredListings = useMemo(() => {
    return pendingListings.filter(listing => {
      if (filterVerified === true && !listing.verified) {
        return false
      }
      if (filterMinPrice === 'has-price' && listing.price === 0) {
        return false
      }
      return true
    })
  }, [pendingListings, filterVerified, filterMinPrice])

  const toggleSelection = (listingId: string) => {
    const newSelected = new Set(selectedListings)
    if (newSelected.has(listingId)) {
      newSelected.delete(listingId)
    } else {
      newSelected.add(listingId)
    }
    setSelectedListings(newSelected)
  }

  const selectAll = () => {
    if (selectedListings.size === filteredListings.length) {
      setSelectedListings(new Set())
    } else {
      setSelectedListings(new Set(filteredListings.map(l => l.id)))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedListings.size === 0) {
      alert('Please select at least one domain to approve')
      return
    }

    if (!window.confirm(`Approve ${selectedListings.size} domain(s)?`)) {
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
        } catch (error) {
          console.error(`Error approving listing ${listingId}:`, error)
        }
      }
      setPendingListings(pendingListings.filter(l => !selectedListings.has(l.id)))
      setSelectedListings(new Set())
      alert(`Successfully approved ${approvedCount} domain(s)`)
    } catch (error) {
      console.error('Error in bulk approve:', error)
      alert('Error approving domains')
    } finally {
      setBulkApproving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="p-8">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Pending Domain Approvals ({pendingListings.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading pending listings...</p>
          </div>
        ) : pendingListings.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">All domains have been reviewed!</p>
          </div>
        ) : (
          <>
            {/* Filter and Bulk Actions */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filters & Bulk Actions</h3>
              </div>
              
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
                    setFilterMaxPrice('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
                >
                  Reset Filters
                </button>
              </div>

              {/* Selection and Bulk Approve */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <input
                  type="checkbox"
                  checked={selectedListings.size > 0 && selectedListings.size === filteredListings.length}
                  onChange={selectAll}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
                <label className="text-sm font-medium text-gray-700 cursor-pointer">
                  Select All ({filteredListings.length})
                </label>
                {selectedListings.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600 ml-auto">
                      {selectedListings.size} selected
                    </span>
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkApproving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium text-sm flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {bulkApproving ? 'Approving...' : 'Bulk Approve'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Listings Grid */}
            <div className="space-y-4">
              {filteredListings.map(listing => (
                <div
                  key={listing.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex items-start gap-4"
                >
                  <input
                    type="checkbox"
                    checked={selectedListings.has(listing.id)}
                    onChange={() => toggleSelection(listing.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 rounded border-gray-300 cursor-pointer mt-1 flex-shrink-0"
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedListing(listing)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-600">
                          {listing.domain}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Category: {listing.category}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: ${listing.price.toLocaleString()}
                        </p>
                        {listing.verified && (
                          <p className="text-xs text-green-600 font-medium mt-1">✓ Verified</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted: {listing.createdAt instanceof Timestamp ? listing.createdAt.toDate().toLocaleDateString() : new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">
                Review Domain Listing
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Domain Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Domain Details</h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Domain:</span>{' '}
                    <span className="font-medium">{selectedListing.domain}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Category:</span>{' '}
                    <span className="font-medium">{selectedListing.category}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Price:</span>{' '}
                    <span className="font-medium">
                      ${selectedListing.price.toLocaleString()}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Price Type:</span>{' '}
                    <span className="font-medium">{selectedListing.priceType}</span>
                  </p>
                </div>
              </div>

              {/* Listing Image */}
              {selectedListing.logo && !selectedListing.logo.includes('stylized') && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Listing Image</h4>
                  <img
                    src={selectedListing.logo}
                    alt="Listing"
                    onClick={() => selectedListing.logo && setLightboxImage(selectedListing.logo)}
                    className="w-full h-auto max-h-64 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition"
                  />
                </div>
              )}

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedListing.description}
                </p>
              </div>

              {/* Verification Checklist */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Verification</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span>Domain ownership verified</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span>Content is legitimate</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span>No prohibited content</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span>Complete listing information</span>
                  </label>
                </div>
              </div>

              {/* Rejection Reason (if rejecting) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">
                    Rejection Reason (if applicable)
                  </h4>
                  {rejectionReason && (
                    <button
                      onClick={() => setRejectionReason('')}
                      className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {/* Canned Rejection Options */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Quick rejection reasons:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {CANNED_REJECTIONS.map((reason) => (
                      <button
                        key={reason}
                        onClick={() => setRejectionReason(reason)}
                        className={`text-xs px-3 py-2 rounded border transition ${
                          rejectionReason === reason
                            ? 'bg-red-100 border-red-500 text-red-900 font-medium'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Rejection Text */}
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Or type a custom rejection reason..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedListing(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedListing.id)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {actionLoading ? 'Rejecting...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleApprove(selectedListing.id)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionLoading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage}
              alt="Full size listing image"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition shadow-lg"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
