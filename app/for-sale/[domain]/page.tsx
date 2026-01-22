'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Mail, Copy, Check, ExternalLink, AlertCircle } from 'lucide-react'

interface Listing {
  id: string
  domain: string
  price: number
  priceType: string
  category: string
  description: string
  seller?: {
    name: string
    email: string
  }
  logo?: string
  thumbnail?: string
}

export default function ForSalePage() {
  const params = useParams()
  const domainParam = params.domain as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  // Convert URL param back to domain (e.g., "example-com" -> "example.com")
  const domainName = domainParam?.replace(/-/g, '.') || ''

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true)
        const q = query(
          collection(db, 'listings'),
          where('domain', '==', domainName),
          where('status', '==', 'approved'),
          where('isLive', '==', true)
        )
        const snapshot = await getDocs(q)
        
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as any
          setListing({
            id: snapshot.docs[0].id,
            domain: data.domain || domainName,
            price: data.price || 0,
            priceType: data.priceType || 'asking',
            category: data.category || 'Other',
            description: data.description || '',
            seller: data.seller || undefined,
            logo: data.logo || undefined,
            thumbnail: data.thumbnail || undefined,
          })
        }
      } catch (err) {
        console.error('Error fetching listing:', err)
      } finally {
        setLoading(false)
      }
    }

    if (domainName) {
      fetchListing()
    }
  }, [domainName])

  const handleCopyEmail = () => {
    if (listing?.seller?.email) {
      navigator.clipboard.writeText(listing.seller.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getPriceLabel = () => {
    switch (listing?.priceType) {
      case 'asking':
        return 'Asking Price'
      case 'accepting_offers':
        return 'Make an Offer'
      case 'starting_bid':
        return 'Starting Bid'
      default:
        return 'Price'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="min-h-screen bg-white">
        <Header searchQuery="" onSearchChange={() => {}} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Not Found</h1>
            <p className="text-gray-600">This domain is not currently listed for sale.</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header searchQuery="" onSearchChange={() => {}} />
      
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Domain */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-center">
            <h1 className="text-5xl font-bold text-white mb-2 break-words">{listing.domain}</h1>
            <p className="text-blue-100 text-lg">is for sale</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {/* Logo if available */}
            {listing.logo && (
              <div className="flex justify-center">
                <img
                  src={listing.logo}
                  alt="Domain logo"
                  className="h-24 w-24 object-cover rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-200">
              <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-2">
                {getPriceLabel()}
              </p>
              {listing.priceType === 'accepting_offers' ? (
                <p className="text-4xl font-bold text-blue-600">Contact for Price</p>
              ) : (
                <p className="text-4xl font-bold text-blue-600">${listing.price.toLocaleString()}</p>
              )}
            </div>

            {/* Category and Description */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">Category</p>
                <p className="text-lg text-gray-900">{listing.category}</p>
              </div>
              
              {listing.description && (
                <div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">Description</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
                </div>
              )}
            </div>

            {/* Contact Section */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Interested?</h2>
              
              {listing.seller?.email ? (
                <div className="space-y-3">
                  <p className="text-gray-700">Contact the seller to make an offer:</p>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-900 font-medium flex-1 break-all">{listing.seller.email}</span>
                    <button
                      onClick={handleCopyEmail}
                      className="p-2 hover:bg-gray-200 rounded transition flex-shrink-0"
                      title="Copy email"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Contact information not available.</p>
              )}
            </div>

            {/* View Full Listing Button */}
            <div className="pt-4 border-t">
              <a
                href={`/domain/${listing.id}`}
                className="inline-flex items-center gap-2 w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                View Full Listing
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* DNS Setup Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="font-semibold text-amber-900">How to set up domain forwarding</h3>
                <span className={`transform transition ${showInstructions ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {showInstructions && (
                <div className="mt-4 space-y-4 text-sm text-amber-900">
                  <p>To forward this domain to this page, follow these steps:</p>
                  
                  <div className="bg-white rounded p-4 space-y-3">
                    <div>
                      <p className="font-semibold mb-1">Step 1: Log into your domain registrar</p>
                      <p className="text-gray-700">Access your domain's DNS settings (GoDaddy, Namecheap, etc.)</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Step 2: Find "URL Redirect" or "Domain Forwarding"</p>
                      <p className="text-gray-700">Look for a forwarding or redirect option in your DNS management panel</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Step 3: Set up the redirect</p>
                      <ul className="text-gray-700 space-y-1 ml-4">
                        <li>• <strong>From:</strong> {listing.domain}</li>
                        <li>• <strong>To:</strong> {`https://urlsnag.com/for-sale/${domainParam}`}</li>
                        <li>• <strong>Type:</strong> Permanent (301) redirect</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1">Step 4: Save and wait</p>
                      <p className="text-gray-700">DNS changes can take 24-48 hours to propagate. After that, visitors to {listing.domain} will see this page.</p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-4">
                    <p className="text-blue-900 text-xs">
                      <strong>Need help?</strong> Most registrars have similar processes. Search for "URL redirect" or "domain forwarding" in your registrar's help docs.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note with Logo */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <span>Powered by</span>
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">U</span>
            </div>
            <span className="font-semibold text-blue-600">URLSnag</span>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
