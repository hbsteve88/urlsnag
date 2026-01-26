'use client'

import { useState } from 'react'
import { Zap, X, Check } from 'lucide-react'
import { PROMOTION_PACKAGES, calculateViewsPerDay } from '@/lib/promotionConfig'

interface PromotionCheckoutModalProps {
  domain: string
  onClose: () => void
  onCheckout: (packageId: string) => Promise<void>
  isLoading?: boolean
}

export default function PromotionCheckoutModal({ domain, onClose, onCheckout, isLoading }: PromotionCheckoutModalProps) {
  const [selectedPackage, setSelectedPackage] = useState(PROMOTION_PACKAGES[1].id)
  const [isProcessing, setIsProcessing] = useState(false)

  const selectedPkg = PROMOTION_PACKAGES.find(pkg => pkg.id === selectedPackage)
  const viewsPerDay = selectedPkg ? calculateViewsPerDay(selectedPkg) : 0

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      await onCheckout(selectedPackage)
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
            Choose a promotion package to get your domain featured and increase visibility. Your domain will appear in the featured section and get tracked views.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROMOTION_PACKAGES.map(pkg => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedPackage === pkg.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-600">{pkg.duration} days</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${pkg.price}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    {pkg.views.toLocaleString()} bonus views
                  </p>
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Featured placement
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedPkg && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Package:</span>
                <span className="font-medium text-gray-900">{selectedPkg.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium text-gray-900">{selectedPkg.duration} days</span>
              </div>
              <div className="flex justify-between">
                <span>Bonus Views:</span>
                <span className="font-medium text-gray-900">{selectedPkg.views.toLocaleString()}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg text-blue-600">${selectedPkg.price}</span>
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
            disabled={isProcessing || isLoading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isProcessing ? 'Processing...' : `Pay $${selectedPkg?.price}`}
          </button>
        </div>
      </div>
    </div>
  )
}
