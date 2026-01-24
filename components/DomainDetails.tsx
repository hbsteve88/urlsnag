'use client'

import { X, Heart, Share2, Copy, Check, Link2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Listing } from '@/lib/generateListings'
import { useCountdown } from '@/lib/useCountdown'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
  const countdown = useCountdown(listing.endTime)
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'variants'>('overview')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [groupDomains, setGroupDomains] = useState<string[]>([])

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
            </div>

            {/* Right Column - Details */}
            <div className="md:col-span-2">
              {/* Price Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">{getPriceTypeLabel(listing.priceType)}</p>
                {!(listing as any).hideMinimumOffer && !(listing as any).hideReservePrice ? (
                  <p className="text-3xl font-bold text-gray-900">
                    ${listing.price.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-3xl font-bold text-gray-400">
                    Price hidden
                  </p>
                )}
                {(listing as any).groupName && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    Part of group: <span className="font-semibold">{(listing as any).groupName}</span>
                  </p>
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
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded border border-purple-100">
                        <Link2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900">{domain}</span>
                        {domain === listing.domain && (
                          <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Current</span>
                        )}
                      </div>
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
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{listing.description}</p>
              </div>

              {/* Social Media */}
              {listing.socialMedia && listing.socialMedia.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Social Media Accounts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{platformEmojis[social.platform]}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 capitalize text-sm">{social.platform}</p>
                              {(social as any).handle && <p className="text-xs text-gray-600 truncate">{(social as any).handle}</p>}
                              {(social as any).followers && <p className="text-xs text-gray-500 mt-1">{(social as any).followers.toLocaleString()} followers</p>}
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex gap-4 px-6 pt-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 font-medium transition border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
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
              {activeTab === 'overview' && (
                <div className="py-6 space-y-6">
                  {/* Domain Information Grid */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Domain Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                  {/* Bundled Domains Section */}
                  {listing.bundledDomains && listing.bundledDomains.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Bundled Domains</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {listing.bundledDomains.map((domain, idx) => (
                          <div key={idx} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                            <p className="font-semibold text-gray-900">{domain}</p>
                            <p className="text-sm text-gray-600 mt-1">Included in this sale</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seller Profile Section */}
                  {listing.seller && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">About the Seller</h3>
                      <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition">
                        <button
                          onClick={() => onViewSellerDomains?.(listing.seller.id)}
                          className="flex items-center gap-4 w-full text-left"
                        >
                          <img
                            src={listing.seller.profilePic}
                            alt={listing.seller.name}
                            className="w-16 h-16 rounded-full flex-shrink-0 object-cover"
                          />
                          <div className="flex-grow min-w-0">
                            <p className="font-semibold text-gray-900">{listing.seller.name}</p>
                            <p className="text-sm text-gray-600">⭐ 4.8 (127 reviews)</p>
                            <p className="text-sm text-gray-600 mt-1">{listing.seller.domainsCount} domains for sale</p>
                          </div>
                          <span className="text-blue-600 font-semibold flex-shrink-0">View All →</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
        </div>
      </div>
    </div>
  )
}
