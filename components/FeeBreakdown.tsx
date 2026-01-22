'use client'

import { calculateFees, formatCurrency } from '@/lib/firestore-schema'
import { AlertCircle, Info } from 'lucide-react'

interface FeeBreakdownProps {
  agreedPrice: number
  userType: 'buyer' | 'seller'
  showDetails?: boolean
}

export default function FeeBreakdown({
  agreedPrice,
  userType,
  showDetails = true,
}: FeeBreakdownProps) {
  const fees = calculateFees(agreedPrice)

  if (userType === 'seller') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3 mb-4">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <h3 className="font-semibold text-blue-900">Your Earnings</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-blue-800">Agreed Price</span>
            <span className="font-medium text-blue-900">
              {formatCurrency(agreedPrice)}
            </span>
          </div>

          <div className="border-t border-blue-200 pt-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-blue-800">URLSNAG Platform Fee (1%)</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(fees.platformFee)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded p-3 border border-blue-200">
            <div className="flex justify-between">
              <span className="font-semibold text-blue-900">You Receive</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(fees.sellerReceives)}
              </span>
            </div>
          </div>

          {showDetails && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-700 mb-2">
                <strong>Note:</strong> The buyer pays escrow and transfer fees separately.
                You receive the full agreed price minus our 1% platform fee.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Buyer view
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex gap-3 mb-4">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <h3 className="font-semibold text-amber-900">Total Cost Breakdown</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-amber-800">Domain Price</span>
          <span className="font-medium text-amber-900">
            {formatCurrency(agreedPrice)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-amber-800">Escrow Service Fee (~2.5%)</span>
          <span className="font-medium text-amber-900">
            {formatCurrency(fees.escrowFee)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-amber-800">Domain Transfer Fee</span>
          <span className="font-medium text-amber-900">
            {formatCurrency(fees.transferFee)}
          </span>
        </div>

        <div className="border-t border-amber-200 pt-3">
          <div className="bg-white rounded p-3 border border-amber-200">
            <div className="flex justify-between">
              <span className="font-semibold text-amber-900">Your Total Cost</span>
              <span className="text-lg font-bold text-amber-900">
                {formatCurrency(fees.buyerTotal)}
              </span>
            </div>
          </div>
        </div>

        {showDetails && (
          <div className="mt-4 pt-4 border-t border-amber-200">
            <p className="text-xs text-amber-700 mb-3">
              <strong>Important:</strong> By proceeding, you agree that:
            </p>
            <ul className="text-xs text-amber-700 space-y-1 ml-3">
              <li>✓ This is a legally binding contract</li>
              <li>✓ All fees are non-refundable once accepted</li>
              <li>✓ Funds will be held in escrow until transfer confirmed</li>
              <li>✓ You accept the domain in its current condition</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
