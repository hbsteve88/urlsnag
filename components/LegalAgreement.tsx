'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { formatCurrency } from '@/lib/firestore-schema'

interface LegalAgreementProps {
  domain: string
  agreedPrice: number
  platformFee: number
  escrowFee: number
  transferFee: number
  buyerTotal: number
  sellerReceives: number
  buyerName: string
  sellerName: string
  onAccept: () => Promise<void>
  onReject: () => void
  loading?: boolean
}

export default function LegalAgreement({
  domain,
  agreedPrice,
  platformFee,
  escrowFee,
  transferFee,
  buyerTotal,
  sellerReceives,
  buyerName,
  sellerName,
  onAccept,
  onReject,
  loading = false,
}: LegalAgreementProps) {
  const [accepted, setAccepted] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 10
    setScrolledToBottom(isAtBottom)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-red-50">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-red-900">
                Legal Binding Agreement
              </h2>
              <p className="text-sm text-red-700 mt-1">
                Please read and accept the terms below
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Content */}
        <div
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Title */}
          <div className="text-center border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900">
              DOMAIN PURCHASE AGREEMENT
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              This is a legally binding contract
            </p>
          </div>

          {/* Parties */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Parties to Agreement</h4>
            <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
              <p>
                <span className="font-medium">SELLER:</span> {sellerName}
              </p>
              <p>
                <span className="font-medium">BUYER:</span> {buyerName}
              </p>
              <p>
                <span className="font-medium">PLATFORM:</span> URLSNAG
              </p>
            </div>
          </div>

          {/* Domain & Price */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Transaction Details</h4>
            <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
              <p>
                <span className="font-medium">Domain:</span> {domain}
              </p>
              <p>
                <span className="font-medium">Agreed Price:</span>{' '}
                {formatCurrency(agreedPrice)}
              </p>
            </div>
          </div>

          {/* Fees & Costs */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Fees & Costs</h4>
            <div className="space-y-2 text-sm bg-blue-50 p-3 rounded border border-blue-200">
              <div className="flex justify-between">
                <span>Domain Price:</span>
                <span className="font-medium">{formatCurrency(agreedPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>URLSNAG Platform Fee (1%):</span>
                <span className="font-medium">{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Escrow Service Fee (~2.5%):</span>
                <span className="font-medium">{formatCurrency(escrowFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Domain Transfer Fee:</span>
                <span className="font-medium">{formatCurrency(transferFee)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Seller Receives:</span>
                  <span className="text-green-600">{formatCurrency(sellerReceives)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Buyer Pays Total:</span>
                  <span className="text-amber-600">{formatCurrency(buyerTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seller Obligations */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Seller's Obligations</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Transfer domain within 5 business days of payment</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Provide all necessary credentials and access</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Ensure domain is free of liens and encumbrances</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Maintain domain until transfer is complete</span>
              </li>
            </ul>
          </div>

          {/* Buyer Obligations */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Buyer's Obligations</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Fund escrow account within 24 hours</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Accept domain in its current condition</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Complete domain transfer process promptly</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Pay all agreed fees and costs</span>
              </li>
            </ul>
          </div>

          {/* Binding Nature */}
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <h4 className="font-semibold text-red-900 mb-3">Binding Nature</h4>
            <p className="text-sm text-red-800 mb-3">
              By accepting this agreement, both parties acknowledge and agree that:
            </p>
            <ul className="text-sm space-y-2 text-red-800">
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>This is a legally binding contract</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>All terms are final and non-negotiable</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>All fees are non-refundable once accepted</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Domain transfer is irreversible</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Escrow holds funds until transfer confirmed</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>Disputes resolved through escrow provider</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs text-gray-600">
            <p className="mb-2">
              <strong>Legal Disclaimer:</strong> This agreement is a binding legal
              contract. By accepting, you acknowledge that you have read, understood,
              and agree to all terms. If you do not agree, do not accept this
              agreement.
            </p>
            <p>
              For disputes or questions, contact URLSNAG support or the escrow
              provider directly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {/* Acceptance Checkbox */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 mt-1 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              I have read and understand this agreement. I acknowledge that this is a
              legally binding contract and agree to all terms and conditions.
            </span>
          </label>

          {/* Scroll Reminder */}
          {!scrolledToBottom && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
              Please scroll down to read the entire agreement before accepting.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onReject}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 disabled:bg-gray-100 transition font-medium"
            >
              Reject & Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!accepted || loading || !scrolledToBottom}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Processing...' : 'Accept Agreement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
