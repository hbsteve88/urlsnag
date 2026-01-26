'use client'

import { useState } from 'react'
import { Zap, X, Check } from 'lucide-react'

type PromotionType = 'duration' | 'views' | 'until_sold'

interface PromotionOption {
  id: string
  label: string
  duration?: number
  views?: number
  price: number
}

const DURATION_OPTIONS: PromotionOption[] = [
  { id: 'duration_7', label: '7 Days', duration: 7, price: 7 },
  { id: 'duration_30', label: '30 Days', duration: 30, price: 25 },
  { id: 'duration_60', label: '60 Days', duration: 60, price: 45 },
  { id: 'duration_90', label: '90 Days', duration: 90, price: 60 },
]

const VIEW_LIMIT_OPTIONS: PromotionOption[] = [
  { id: 'views_500', label: '500 Views', views: 500, price: 5 },
  { id: 'views_1500', label: '1,500 Views', views: 1500, price: 10 },
  { id: 'views_5000', label: '5,000 Views', views: 5000, price: 20 },
  { id: 'views_15000', label: '15,000 Views', views: 15000, price: 50 },
]

const UNTIL_SOLD_OPTION: PromotionOption = {
  id: 'until_sold',
  label: 'Until Sold',
  price: 100,
}

interface PromotionCheckoutModalProps {
  domain: string
  onClose: () => void
  onCheckout: (promotionData: { type: PromotionType; duration?: number; views?: number; price: number }) => Promise<void>
  isLoading?: boolean
}

export default function PromotionCheckoutModal({ domain, onClose, onCheckout, isLoading }: PromotionCheckoutModalProps) {
  const [promotionType, setPromotionType] = useState<PromotionType>('duration')
  const [selectedOption, setSelectedOption] = useState<string>('duration_7')
  const [isProcessing, setIsProcessing] = useState(false)

  const getOptions = () => {
    switch (promotionType) {
      case 'duration':
        return DURATION_OPTIONS
      case 'views':
        return VIEW_LIMIT_OPTIONS
      case 'until_sold':
        return [UNTIL_SOLD_OPTION]
      default:
        return []
    }
  }

  const selectedOpt = getOptions().find(opt => opt.id === selectedOption)

  const handleCheckout = async () => {
    if (!selectedOpt) return
    
    setIsProcessing(true)
    try {
      await onCheckout({
        type: promotionType,
        duration: selectedOpt.duration,
        views: selectedOpt.views,
        price: selectedOpt.price,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Promote Your Domain</h2>
            <p className="text-sm text-gray-600 mt-1">{domain}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-600 mb-6">
            Choose a promotion type to get your domain featured and increase visibility. All promotions are non-refundable.
          </p>

          {/* Promotion Type Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Promotion Type</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setPromotionType('duration')
                  setSelectedOption('duration_7')
                }}
                className={`w-full p-3 rounded-lg border-2 transition text-left font-medium ${
                  promotionType === 'duration'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }`}
              >
                Duration (Days)
              </button>
              <button
                onClick={() => {
                  setPromotionType('views')
                  setSelectedOption('views_500')
                }}
                className={`w-full p-3 rounded-lg border-2 transition text-left font-medium ${
                  promotionType === 'views'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }`}
              >
                View Limit
              </button>
              <button
                onClick={() => {
                  setPromotionType('until_sold')
                  setSelectedOption('until_sold')
                }}
                className={`w-full p-3 rounded-lg border-2 transition text-left font-medium ${
                  promotionType === 'until_sold'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                }`}
              >
                Until Sold
              </button>
            </div>
          </div>

          {/* Options for Selected Type */}
          {promotionType !== 'until_sold' && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                {promotionType === 'duration' ? 'Select Duration' : 'Select View Limit'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {getOptions().map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      selectedOption === opt.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{opt.label}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">${opt.price}</p>
                      </div>
                    </div>
                    <p className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-600" />
                      Featured placement
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Until Sold Option */}
          {promotionType === 'until_sold' && (
            <div className="p-4 rounded-lg border-2 border-blue-600 bg-blue-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">Until Sold</h4>
                  <p className="text-sm text-gray-600">Promotion continues until domain is sold</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">$100</p>
                </div>
              </div>
              <p className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-600" />
                Featured placement
              </p>
            </div>
          )}
        </div>

        {selectedOpt && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-medium text-gray-900">
                  {promotionType === 'duration' ? 'Duration' : promotionType === 'views' ? 'View Limit' : 'Until Sold'}
                </span>
              </div>
              {selectedOpt.duration && (
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium text-gray-900">{selectedOpt.duration} days</span>
                </div>
              )}
              {selectedOpt.views && (
                <div className="flex justify-between">
                  <span>View Limit:</span>
                  <span className="font-medium text-gray-900">{selectedOpt.views.toLocaleString()} views</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Refundable:</span>
                <span className="font-medium text-gray-900">No</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-blue-600">${selectedOpt.price}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCheckout}
            disabled={isProcessing || isLoading || !selectedOpt}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isProcessing ? 'Processing...' : `Pay $${selectedOpt?.price}`}
          </button>
        </div>
      </div>
    </div>
  )
}
