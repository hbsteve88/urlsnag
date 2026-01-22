'use client'

import { X, AlertCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Listing } from '@/lib/generateListings'

interface OutbidNotificationProps {
  listing: Listing
  onClose: () => void
}

export default function OutbidNotification({
  listing,
  onClose,
}: OutbidNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="bg-white rounded-lg shadow-2xl border-4 border-orange-500 p-4 w-80">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <AlertCircle className="w-5 h-5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">You've Been Outbid!</h3>
          <p className="text-sm text-gray-600 mt-1 break-words">
            <span className="font-bold text-gray-900">{listing.domain}</span> has a new bid of{' '}
            <span className="font-bold text-gray-900">
              ${listing.price.toLocaleString()}
            </span>
          </p>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition ml-2"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
