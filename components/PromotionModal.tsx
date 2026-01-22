'use client'

import { useState } from 'react'
import { Zap, X } from 'lucide-react'

interface PromotionModalProps {
  domain: string
  onClose: () => void
  onPromote: () => Promise<void>
  isLoading?: boolean
}

export default function PromotionModal({ domain, onClose, onPromote, isLoading }: PromotionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePromote = async () => {
    setIsProcessing(true)
    try {
      await onPromote()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Promote Your Domain</h2>
              <p className="text-sm text-gray-600 mt-1">{domain}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-gray-700 mb-3">
            Get more visibility for your domain! Promote it for just <span className="font-bold text-lg text-yellow-600">$1</span> and it will appear in the featured section for 7 days.
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Featured placement for 7 days</li>
            <li>✓ Increased visibility to buyers</li>
            <li>✓ Higher chance of offers</li>
            <li>✓ One-time payment of $1</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePromote}
            disabled={isProcessing || isLoading}
            className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {isProcessing ? 'Processing...' : 'Promote for $1'}
          </button>
        </div>
      </div>
    </div>
  )
}
