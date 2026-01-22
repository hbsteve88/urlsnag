'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: "How do I buy a domain on URLSNAG?",
      a: "Browse our marketplace, find a domain you like, and click 'Make an Offer'. The seller will respond to your offer, and if accepted, we'll handle the secure transfer."
    },
    {
      q: "How do I sell my domain?",
      a: "Click 'Sell' in the header, fill out the domain information, set your price, and list it. Our team will verify ownership and your domain will be live within 24 hours."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept credit cards, bank transfers, and cryptocurrency. All transactions are processed through our secure escrow system."
    },
    {
      q: "How long does a domain transfer take?",
      a: "Typically 3-5 business days. We handle all the technical details and keep both parties updated throughout the process."
    },
    {
      q: "Is my transaction secure?",
      a: "Yes. All transactions use our escrow service, which holds funds until both parties confirm the transfer is complete."
    },
  ]

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-lg text-gray-600 mb-8">Find answers to common questions</p>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900 text-left">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still need help?</h2>
          <p className="text-gray-700 mb-4">Our support team is here to help. Contact us anytime.</p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Contact Support
          </button>
        </div>
      </div>

      <Footer />
    </main>
  )
}
