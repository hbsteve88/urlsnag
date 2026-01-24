'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

const styles = `
  input[type="number"]::-webkit-outer-spin-button,
  input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
`

interface DomainListing {
  id: string
  domain: string
  category: string
  price: number
  priceType: string
  minimumOfferPrice?: number
  startingBid?: number
  reservePrice?: number
  hideMinimumOffer?: boolean
  hideReservePrice?: boolean
}

interface BulkEditModalProps {
  selectedDomains: DomainListing[]
  onClose: () => void
  onApply: (updates: BulkEditUpdates) => Promise<void>
  isLoading: boolean
}

export interface BulkEditUpdates {
  category?: string
  priceType: string
  price?: number
  minimumOfferPrice?: number
  startingBid?: number
  reservePrice?: number
  hideMinimumOffer?: boolean
  hideReservePrice?: boolean
}

export default function BulkEditModal({
  selectedDomains,
  onClose,
  onApply,
  isLoading,
}: BulkEditModalProps) {
  const [category, setCategory] = useState(selectedDomains[0]?.category || '')
  const [priceMode, setPriceMode] = useState<'set' | 'accepting' | 'auction'>(
    selectedDomains[0]?.priceType === 'asking'
      ? 'set'
      : selectedDomains[0]?.priceType === 'accepting_offers'
      ? 'accepting'
      : 'auction'
  )
  const [price, setPrice] = useState(selectedDomains[0]?.price?.toString() || '')
  const [minimumOfferPrice, setMinimumOfferPrice] = useState(
    selectedDomains[0]?.minimumOfferPrice?.toString() || ''
  )
  const [startingBid, setStartingBid] = useState(
    selectedDomains[0]?.startingBid?.toString() || ''
  )
  const [reservePrice, setReservePrice] = useState(
    selectedDomains[0]?.reservePrice?.toString() || ''
  )
  const [hideMinimumOffer, setHideMinimumOffer] = useState(
    selectedDomains[0]?.hideMinimumOffer || false
  )
  const [hideReservePrice, setHideReservePrice] = useState(
    selectedDomains[0]?.hideReservePrice || false
  )

  const handleApply = async () => {
    const updates: BulkEditUpdates = {
      priceType:
        priceMode === 'set'
          ? 'asking'
          : priceMode === 'accepting'
          ? 'accepting_offers'
          : 'starting_bid',
    }

    if (category) {
      updates.category = category
    }

    if (priceMode === 'set' && price) {
      updates.price = parseInt(price)
    } else if (priceMode === 'accepting') {
      if (price) updates.price = parseInt(price)
      if (minimumOfferPrice) updates.minimumOfferPrice = parseInt(minimumOfferPrice)
      updates.hideMinimumOffer = hideMinimumOffer
    } else if (priceMode === 'auction') {
      if (startingBid) updates.startingBid = parseInt(startingBid)
      if (reservePrice) updates.reservePrice = parseInt(reservePrice)
      updates.hideReservePrice = hideReservePrice
    }

    await onApply(updates)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Bulk Edit Domains</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Selected Domains Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900">
              Editing {selectedDomains.length} domain{selectedDomains.length !== 1 ? 's' : ''}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedDomains.map((domain) => (
                <span
                  key={domain.id}
                  className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {domain.domain}
                </span>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Keep Current Category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Pricing Model
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPriceMode('set')}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  priceMode === 'set'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">Set Price</p>
                <p className="text-xs text-gray-600 mt-1">Fixed asking price</p>
              </button>
              <button
                onClick={() => setPriceMode('accepting')}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  priceMode === 'accepting'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">Offers</p>
                <p className="text-xs text-gray-600 mt-1">Negotiate with buyers</p>
              </button>
              <button
                onClick={() => setPriceMode('auction')}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  priceMode === 'auction'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">Auction</p>
                <p className="text-xs text-gray-600 mt-1">Starting bid & reserve</p>
              </button>
            </div>
          </div>

          {/* Price Fields */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>

            {priceMode === 'set' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asking Price (USD)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {priceMode === 'accepting' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Offer Price (USD)
                  </label>
                  <input
                    type="number"
                    value={minimumOfferPrice}
                    onChange={(e) => setMinimumOfferPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideMinimumOffer}
                    onChange={(e) => setHideMinimumOffer(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Hide minimum offer price</span>
                </label>
              </div>
            )}

            {priceMode === 'auction' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Bid (USD)
                  </label>
                  <input
                    type="number"
                    value={startingBid}
                    onChange={(e) => setStartingBid(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reserve Price (USD)
                  </label>
                  <input
                    type="number"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hideReservePrice}
                    onChange={(e) => setHideReservePrice(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Hide reserve price</span>
                </label>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              These changes will be applied to all {selectedDomains.length} selected domain{selectedDomains.length !== 1 ? 's' : ''}.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Applying...
                </>
              ) : (
                'Apply Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
