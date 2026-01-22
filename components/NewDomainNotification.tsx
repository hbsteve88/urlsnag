'use client'

import { X, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Listing } from '@/lib/generateListings'

interface NewDomainNotificationProps {
  listing: Listing
  onClose: () => void
}

export default function NewDomainNotification({
  listing,
  onClose,
}: NewDomainNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, 10000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 animate-slide-in">
      <div className="bg-white rounded-lg shadow-2xl border-4 border-blue-600 p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-600 mt-1" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">New Domain Listed!</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-bold text-gray-900">{listing.domain}</span> just listed for{' '}
              <span className="font-bold text-gray-900">
                ${listing.price.toLocaleString()}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-2">{listing.category}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
