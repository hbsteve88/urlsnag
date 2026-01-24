'use client'

import { X, Heart, Share2, Copy, Check, Link2, Loader } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Listing } from '@/lib/generateListings'
import { useCountdown } from '@/lib/useCountdown'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

interface DomainDetailsProps {
  listing: Listing
  onClose: () => void
  isSaved: boolean
  onToggleSave: () => void
  onViewSellerDomains?: (sellerId: string) => void
}

export default function DomainDetails({
  listing,
  onClose,
  isSaved,
  onToggleSave,
  onViewSellerDomains,
}: DomainDetailsProps) {
  const { user } = useAuth()
  const { success, error } = useToast()
  const countdown = useCountdown(listing.endTime)
  const [activeTab, setActiveTab] = useState<'assets' | 'variants'>((listing.businessAssets && listing.businessAssets.length > 0) ? 'assets' : 'variants')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [groupDomains, setGroupDomains] = useState<string[]>([])
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [showOfferConfirmation, setShowOfferConfirmation] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerCurrency, setOfferCurrency] = useState('USD')
  const [offerMessage, setOfferMessage] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [submittingOffer, setSubmittingOffer] = useState(false)

  // Fetch group domains if this listing is part of a group
  useEffect(() => {
    const fetchGroupDomains = async () => {
      if ((listing as any).groupId) {
        try {
          const q = query(
            collection(db, 'listings'),
            where('groupId', '==', (listing as any).groupId)
          )
          const snapshot = await getDocs(q)
          const domains = snapshot.docs.map(doc => doc.data().domain).sort()
          setGroupDomains(domains)
        } catch (err) {
          console.error('Error fetching group domains:', err)
        }
      }
    }
    fetchGroupDomains()
  }, [(listing as any).groupId])

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/domain/${listing.id}` : ''

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmitOffer = () => {
    console.log('handleSubmitOffer called', { user, offerAmount, agreedToTerms })
    
    if (!user) {
      error('Please sign in to make an offer')
      return
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      error('Please enter a valid offer amount')
      return
    }

    if (!agreedToTerms) {
      error('Please agree to the terms and conditions')
      return
    }

    console.log('All validations passed, showing confirmation modal')
    // Show confirmation modal instead of submitting immediately
    setShowOfferConfirmation(true)
  }

  const handleConfirmOffer = async () => {
    if (!user) {
      error('Please sign in to make an offer')
      return
    }

    setSubmittingOffer(true)
    try {
      await addDoc(collection(db, 'offers'), {
        listingId: listing.id,
        domain: listing.domain,
        buyerId: user.uid,
        buyerEmail: user.email,
        offerAmount: parseFloat(offerAmount),
        offerCurrency: offerCurrency,
        message: offerMessage,
        status: 'pending',
        createdAt: serverTimestamp(),
      })

      success('Offer submitted successfully! The seller will review your offer.')
      setShowOfferModal(false)
      setShowOfferConfirmation(false)
      setOfferAmount('')
      setOfferMessage('')
      setOfferCurrency('USD')
      setAgreedToTerms(false)
    } catch (err) {
      console.error('Error submitting offer:', err)
      error('Failed to submit offer. Please try again.')
    } finally {
      setSubmittingOffer(false)
    }
  }

  const getPriceTypeLabel = (type: string) => {
    switch (type) {
      case 'asking':
        return 'Asking Price'
      case 'accepting_offers':
        return 'Accepting Offers'
      case 'starting_bid':
        return listing.verified ? 'Current Bid' : 'Starting Bid'
      default:
        return 'Price'
    }
  }

  const renderNameXRay = (domain: string) => {
    return domain.toLowerCase().split('').map((char, idx) => {
      let color = 'text-red-600'
      if (/[a-z]/.test(char)) {
        color = 'text-blue-600'
      } else if (/[0-9]/.test(char)) {
        color = 'text-green-600'
      }
      return (
        <span key={idx} className={`font-mono font-bold ${color}`}>
          {char}
        </span>
      )
    })
  }

  const getDomainAge = () => {
    if (!listing.registeredDate) return 'Unknown'
    const registered = listing.registeredDate instanceof Date 
      ? listing.registeredDate 
      : new Date(listing.registeredDate)
    const now = new Date()
    const years = Math.floor((now.getTime() - registered.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    const months = Math.floor(((now.getTime() - registered.getTime()) % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000))
    
    if (years > 0) {
      return `${years}y ${months}m old`
    } else if (months > 0) {
      return `${months}m old`
    } else {
      const days = Math.floor((now.getTime() - registered.getTime()) / (24 * 60 * 60 * 1000))
      return `${days}d old`
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-start p-6 border-b border-gray-200">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{listing.domain}</h2>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Lowercase:</p>
                  <p className="font-mono text-gray-900">{listing.domain.toLowerCase()}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs uppercase tracking-wide mb-1">Uppercase:</p>
                  <p className="font-mono text-gray-900">{listing.domain.toUpperCase()}</p>
                </div>
                <div className="group relative">
                  <p className="text-gray-600 text-xs uppercase tracking-wide mb-1 cursor-help">NameXRay:</p>
                  <p className="font-mono text-gray-900 tracking-wide">
                    {renderNameXRay(listing.domain)}
                  </p>
                  <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                    <p className="mb-2 font-semibold">Color Legend:</p>
                    <p className="mb-1"><span className="text-blue-400">● Blue</span> = Letters (a-z)</p>
                    <p className="mb-1"><span className="text-green-400">● Green</span> = Numbers (0-9)</p>
                    <p><span className="text-red-400">● Red</span> = Special Characters</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  title="Share this domain"
                >
                  <Share2 className="w-6 h-6 text-gray-600" />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Share this domain</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50 truncate"
                        />
                        <button
                          onClick={handleCopyLink}
                          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={onToggleSave}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title={isSaved ? 'Remove from saved' : 'Save domain'}
              >
                <Heart className={`w-6 h-6 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Left Column - Images */}
            <div className="md:col-span-1">
              {listing.thumbnail && !listing.thumbnail.startsWith('stylized:') && (
                <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
                  <img
                    src={listing.thumbnail}
                    alt={listing.domain}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  {listing.logo && listing.logo !== listing.thumbnail && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-4 border-white overflow-hidden shadow-lg bg-white">
                      <img
                        src={listing.logo}
                        alt="Logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button 
                  onClick={() => setShowOfferModal(true)}
                  disabled={listing.priceType === 'starting_bid' && !listing.verified}
                  className={`w-full px-4 py-3 rounded-lg transition font-medium ${
                    listing.priceType === 'starting_bid' && !listing.verified
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {listing.priceType === 'starting_bid' && !listing.verified ? 'Bidding Disabled' : 'Make an Offer'}
                </button>
              </div>

              {/* Domain Information Grid */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Domain Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Domain Age</p>
                    <p className="font-semibold text-gray-900">{getDomainAge()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{listing.category}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Extension</p>
                    <p className="font-semibold text-gray-900">.{listing.tld}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Offers</p>
                    <p className="font-semibold text-gray-900">{listing.offers}</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              {listing.socialMedia && listing.socialMedia.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Social Media Accounts</h3>
                  <div className="space-y-3">
                    {listing.socialMedia.map((social, idx) => {
                      const platformEmojis: Record<string, string> = {
                        twitter: '𝕏',
                        instagram: '📷',
                        facebook: '👥',
                        tiktok: '🎵',
                        youtube: '▶️',
                        linkedin: '💼'
                      }
                      
                      return (
                        <a
                          key={idx}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                          <span className="text-xl">{platformEmojis[social.platform]}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 capitalize text-sm">{social.platform}</p>
                            {(social as any).handle && <p className="text-xs text-gray-600 truncate">{(social as any).handle}</p>}
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2">
              {/* Price Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    {!(listing as any).hideMinimumOffer && !(listing as any).hideReservePrice ? (
                      <>
                        <p className="text-sm text-gray-600 mb-1">{getPriceTypeLabel(listing.priceType)}</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ${listing.price.toLocaleString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">
                        {getPriceTypeLabel(listing.priceType)}
                      </p>
                    )}
                  </div>
                  {listing.offers > 0 && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{listing.offers} {listing.offers === 1 ? 'Offer' : 'Offers'}</p>
                    </div>
                  )}
                </div>
                {(listing as any).groupName && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    Part of group: <span className="font-semibold">{(listing as any).groupName}</span>
                  </p>
                )}
              </div>

              {/* Seller Notice - Based on Listing Type */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                {listing.priceType === 'asking' && (
                  <>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Fixed-Price Sale</p>
                    <p className="text-sm text-blue-800">
                      By listing this domain at a fixed price, the seller indicates intent to sell to the first buyer who completes payment at the listed price. No obligation to transfer ownership exists until payment has been successfully received through the approved payment or escrow process.
                    </p>
                  </>
                )}
                {listing.priceType === 'accepting_offers' && (
                  <>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Negotiated Offers</p>
                    <p className="text-sm text-blue-800">
                      The seller allows buyers to submit purchase proposals for review. Accepting an offer indicates intent to sell at the agreed price, subject to the buyer completing payment within the required timeframe. The agreement becomes binding only after payment or escrow funding has been confirmed.
                    </p>
                  </>
                )}
                {listing.priceType === 'starting_bid' && (
                  <>
                    <p className="text-sm font-semibold text-blue-900 mb-2">Auction Listing</p>
                    <p className="text-sm text-blue-800">
                      The seller agrees to sell the domain to the winning bidder if the auction concludes with a valid bid that meets any stated reserve requirements. The sale becomes binding only after the winning bidder completes payment within the required timeframe.
                    </p>
                  </>
                )}
              </div>

              {/* Group Details Section */}
              {(listing as any).groupId && groupDomains.length > 0 && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-purple-900">Domain Group Bundle</h3>
                  </div>
                  <p className="text-sm text-purple-800 mb-3">
                    This domain is sold as part of a bundle. All domains in this group are sold together for one price.
                  </p>
                  <div className="space-y-2">
                    {groupDomains.map((domain: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          onClose()
                          // Trigger domain detail view for this domain
                          window.dispatchEvent(new CustomEvent('viewDomain', { detail: { domain } }))
                        }}
                        className="w-full flex items-center gap-2 p-2 bg-white rounded border border-purple-100 hover:border-purple-300 hover:bg-purple-50 transition text-left"
                      >
                        <Link2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 hover:text-purple-600">{domain}</span>
                        {domain === listing.domain && (
                          <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Current</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Countdown */}
              {listing.endTime && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  {countdown.isExpired ? (
                    <p className="text-red-600 font-semibold">Auction Ended</p>
                  ) : (
                    <>
                      <p className="text-sm text-orange-700 mb-1">Time Remaining</p>
                      <p className="text-lg font-bold text-orange-700">
                        {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              {listing.description && listing.description.trim() && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{listing.description}</p>
              </div>
              )}

            </div>
          </div>

          {/* Tabs */}
          {(listing.businessAssets && listing.businessAssets.length > 0) || (listing.variants && listing.variants.length > 0) && (
          <div className="border-t border-gray-200">
            <div className="flex gap-4 px-6 pt-4">
              {listing.businessAssets && listing.businessAssets.length > 0 && (
                <button
                  onClick={() => setActiveTab('assets')}
                  className={`pb-4 font-medium transition border-b-2 ${
                    activeTab === 'assets'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Business Assets
                </button>
              )}
              {listing.variants && listing.variants.length > 0 && (
                <button
                  onClick={() => setActiveTab('variants')}
                  className={`pb-4 font-medium transition border-b-2 ${
                    activeTab === 'variants'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Domain Variants ({listing.variants.length})
                </button>
              )}
            </div>

            {/* Tab Content */}
            <div className="px-6 pb-6">
              {activeTab === 'assets' && (
                <div className="py-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Included Assets</h3>
                  <div className="space-y-3">
                    {listing.businessAssets.map((asset, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900 capitalize">
                              {asset.type}
                            </p>
                            <p className="text-sm text-gray-600">{asset.description}</p>
                          </div>
                          <span className="text-2xl">
                            {asset.type === 'logo'
                              ? '🎨'
                              : asset.type === 'website'
                              ? '🌐'
                              : asset.type === 'social'
                              ? '📱'
                              : asset.type === 'email'
                              ? '📧'
                              : asset.type === 'content'
                              ? '📝'
                              : asset.type === 'code'
                              ? '💻'
                              : '🏢'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'variants' && listing.variants && (
                <div className="py-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Available Domain Variants</h3>
                  <div className="space-y-3">
                    {listing.variants.map((variant, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{variant.domain}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              {variant.type === 'extension' ? '🔗 Alternative Extension' : '✏️ Misspelling Variant'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {variant.included ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Included in Sale
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Extra Cost
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* Offer Confirmation Modal */}
          {showOfferConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Confirm Your Offer</h2>
                  <button
                    onClick={() => setShowOfferConfirmation(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {/* Domain(s) */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Domain</p>
                    <p className="text-lg font-bold text-gray-900">{listing.domain}</p>
                    {(listing as any).groupId && groupDomains.length > 1 && (
                      <p className="text-xs text-gray-600 mt-2">
                        Part of group with {groupDomains.length} domain{groupDomains.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Offer Amount and Currency */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">Offer Amount</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {offerCurrency} {parseFloat(offerAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Message Preview */}
                  {offerMessage && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Message</p>
                      <p className="text-sm text-gray-700">{offerMessage}</p>
                    </div>
                  )}

                  {/* Confirmation Text */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      By confirming, you agree to the offer terms and understand that payment must be completed if the seller accepts your offer.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 p-6 flex gap-3">
                  <button
                    onClick={() => setShowOfferConfirmation(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleConfirmOffer}
                    disabled={submittingOffer}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
                  >
                    {submittingOffer && <Loader className="w-4 h-4 animate-spin" />}
                    {submittingOffer ? 'Confirming...' : 'Confirm Offer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Make an Offer Modal */}
          {showOfferModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Make an Offer</h2>
                  <button
                    onClick={() => setShowOfferModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                  {/* Domain Info */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">Domain</p>
                    <p className="text-xl font-bold text-blue-900">{listing.domain}</p>
                  </div>

                  {/* Offer Submission Notice */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Offer Submission Notice</p>
                    <p className="text-sm text-amber-800 space-y-2">
                      <span className="block">By submitting an offer, you are making a serious, good-faith proposal to purchase this domain name at the price you specify.</span>
                      <span className="block">If the seller accepts your offer, you agree to complete payment through the approved payment or escrow process within the required timeframe. The transaction becomes binding only once payment has been successfully secured.</span>
                      <span className="block">No transfer of ownership will occur until payment is received. Failure to complete payment after acceptance may result in cancellation of the offer, account limitations, or other actions as outlined in our Terms of Service.</span>
                      <span className="block">Please ensure you are authorized to submit this offer and understand the obligations involved before proceeding.</span>
                    </p>
                  </div>

                  {/* Offer Amount and Currency */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Offer Amount</label>
                    <style>{`
                      input[type="number"]::-webkit-outer-spin-button,
                      input[type="number"]::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                      }
                      input[type="number"] {
                        -moz-appearance: textfield;
                      }
                    `}</style>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        placeholder="Enter your offer amount"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={offerCurrency}
                        onChange={(e) => setOfferCurrency(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                        <option value="CAD">CAD</option>
                        <option value="AUD">AUD</option>
                        <option value="CHF">CHF</option>
                        <option value="JPY">JPY</option>
                        <option value="CNY">CNY</option>
                      </select>
                    </div>
                  </div>

                  {/* Offer Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Message (Optional)</label>
                    <textarea
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      placeholder="Add any additional information or questions for the seller..."
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Terms Agreement */}
                  <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">I understand and agree to the offer terms</p>
                      <p className="text-xs text-gray-600 mt-1">
                        I confirm that I have read and understand the offer submission notice above. I understand that if the seller accepts my offer, I am obligated to complete payment within the required timeframe, and the transaction becomes binding only once payment is secured.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
                  <button
                    onClick={() => setShowOfferModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitOffer}
                    disabled={submittingOffer || !agreedToTerms || !offerAmount}
                    title={!offerAmount ? 'Please enter an offer amount' : !agreedToTerms ? 'Please agree to the terms' : ''}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
                  >
                    {submittingOffer && <Loader className="w-4 h-4 animate-spin" />}
                    {submittingOffer ? 'Submitting...' : 'Submit Offer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
