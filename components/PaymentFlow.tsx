'use client'

import { useState } from 'react'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import { Listing } from '@/lib/generateListings'

interface PaymentFlowProps {
  listing: Listing
  offerAmount: number
  offerCurrency: string
  onClose: () => void
  onConfirm: (paymentDetails: PaymentDetails) => Promise<void>
}

export interface PaymentDetails {
  salePrice: number
  platformFee: number
  transferFee: number
  ccFee: number
  buyerTotal: number
  sellerPayout: number
  currency: string
}

export const PaymentFlow = ({
  listing,
  offerAmount,
  offerCurrency,
  onClose,
  onConfirm,
}: PaymentFlowProps) => {
  const [step, setStep] = useState<'breakdown' | 'payment' | 'confirmation'>('breakdown')
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate fees
  const platformFeePercent = 0.01 // 1%
  const platformFee = Math.round(offerAmount * platformFeePercent * 100) / 100
  const sellerPayout = offerAmount - platformFee

  // Estimate transfer fee (varies by registrar, using average)
  const transferFee = 35

  // Estimate CC fee (2.9% + $0.30 for Stripe)
  const ccFeePercent = 0.029
  const ccFeeFixed = 0.30
  const ccFee = Math.round((offerAmount + platformFee + transferFee) * ccFeePercent * 100) / 100 + ccFeeFixed

  const buyerTotal = offerAmount + platformFee + transferFee + ccFee

  const paymentDetails: PaymentDetails = {
    salePrice: offerAmount,
    platformFee,
    transferFee,
    ccFee,
    buyerTotal,
    sellerPayout,
    currency: offerCurrency,
  }

  const handleConfirm = async () => {
    setIsProcessing(true)
    try {
      await onConfirm(paymentDetails)
      setStep('confirmation')
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const competitorComparison = [
    { name: 'URLSnag', sellerFee: '1%', buyerFee: 'Transfer + CC', total: '~4-5%', highlight: true },
    { name: 'Sedo', sellerFee: '10%', buyerFee: '7.5%', total: '~17.5%', highlight: false },
    { name: 'Flippa', sellerFee: '10%', buyerFee: '10%', total: '~20%', highlight: false },
    { name: 'GoDaddy', sellerFee: '0%', buyerFee: '10-15%', total: '10-15%', highlight: false },
    { name: 'Namecheap', sellerFee: '5-10%', buyerFee: '2-3%', total: '7-13%', highlight: false },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'breakdown' && 'Payment Breakdown'}
            {step === 'payment' && 'Complete Payment'}
            {step === 'confirmation' && 'Payment Confirmed'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {step === 'breakdown' && (
            <>
              {/* Domain Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Domain</p>
                <p className="text-xl font-bold text-blue-900">{listing.domain}</p>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Fee Breakdown</h3>
                
                {/* Sale Price */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Domain Sale Price</span>
                  <span className="font-semibold text-gray-900">
                    {offerCurrency} {offerAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Platform Fee */}
                <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <span className="text-gray-700">URLSnag Platform Fee (1%)</span>
                    <p className="text-xs text-gray-600 mt-1">Nonrefundable - covers platform operations</p>
                  </div>
                  <span className="font-semibold text-amber-900">
                    {offerCurrency} {platformFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Transfer Fee */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-gray-700">Domain Transfer Fee</span>
                    <p className="text-xs text-gray-600 mt-1">ICANN + registrar fee (estimated)</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {offerCurrency} {transferFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* CC Fee */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-gray-700">Credit Card Processing Fee</span>
                    <p className="text-xs text-gray-600 mt-1">2.9% + $0.30 (Stripe)</p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {offerCurrency} {ccFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-200 pt-3 mt-3" />

                {/* Total */}
                <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-lg font-bold text-blue-900">You Pay (Total)</span>
                  <span className="text-2xl font-bold text-blue-900">
                    {offerCurrency} {buyerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Seller Payout Info */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Seller receives:</span> {offerCurrency} {sellerPayout.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (full agreed amount minus 1% platform fee)
                  </p>
                </div>
              </div>

              {/* Industry Comparison */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Why URLSnag is the Cheapest</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">Marketplace</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">Seller Fee</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">Buyer Fee</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorComparison.map((comp) => (
                        <tr
                          key={comp.name}
                          className={`border-b border-gray-100 ${
                            comp.highlight ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className={`py-3 px-3 font-medium ${comp.highlight ? 'text-blue-900' : 'text-gray-900'}`}>
                            {comp.name}
                          </td>
                          <td className="py-3 px-3 text-gray-700">{comp.sellerFee}</td>
                          <td className="py-3 px-3 text-gray-700">{comp.buyerFee}</td>
                          <td className={`py-3 px-3 font-semibold ${comp.highlight ? 'text-blue-900' : 'text-gray-900'}`}>
                            {comp.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  ✓ Lowest fees in the industry • ✓ Seller gets full agreed amount • ✓ Transparent pricing
                </p>
              </div>

              {/* Important Notice */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Escrow Protection</p>
                  <p>Your payment is held in secure escrow until the domain transfer is complete. No funds are released until you confirm receipt of the domain.</p>
                </div>
              </div>
            </>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Total Amount Due</p>
                <p className="text-3xl font-bold text-gray-900">
                  {offerCurrency} {buyerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Note:</span> Stripe payment form will appear below. Your payment information is encrypted and secure.
                </p>
              </div>

              {/* Stripe Payment Element will be inserted here */}
              <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 text-center text-gray-600">
                Stripe Payment Form (to be integrated)
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-4 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                <p className="text-gray-700 mb-4">
                  Your payment of {offerCurrency} {buyerTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} has been received.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-left space-y-2">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">What happens next:</span>
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Your payment is held in secure escrow</li>
                  <li>Domain transfer will be initiated</li>
                  <li>Once transfer completes, funds are released to seller</li>
                  <li>You'll receive confirmation email</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                <p className="text-sm text-green-900">
                  <span className="font-semibold">Dispute Resolution:</span> All disputes are handled directly by Stripe's escrow service. You will not need to contact URLSnag support for payment or transfer issues.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-6 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            {step === 'confirmation' ? 'Close' : 'Cancel'}
          </button>
          {step !== 'confirmation' && (
            <button
              onClick={() => {
                if (step === 'breakdown') {
                  setStep('payment')
                } else if (step === 'payment') {
                  handleConfirm()
                }
              }}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium"
            >
              {isProcessing ? 'Processing...' : step === 'breakdown' ? 'Continue to Payment' : 'Complete Payment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
