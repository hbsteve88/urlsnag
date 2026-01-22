'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const faqs = [
    {
      category: "Buying",
      questions: [
        { q: "What makes a good domain?", a: "Short, memorable, easy to spell, and relevant to your business. Domains with popular extensions like .com are generally more valuable." },
        { q: "Can I negotiate the price?", a: "Yes! You can make an offer on any domain. The seller can accept, decline, or counter your offer." },
        { q: "What if the domain I want isn't listed?", a: "You can use our 'Make an Offer' feature to contact the current owner directly through URLSNAG." },
      ]
    },
    {
      category: "Selling",
      questions: [
        { q: "How do I price my domain?", a: "Consider factors like length, memorability, keyword value, and comparable sales. Our analytics tools can help guide your pricing." },
        { q: "How long does it take to sell?", a: "It varies. Some domains sell within hours, others take weeks. Premium domains typically sell faster." },
        { q: "What are the fees?", a: "We charge a 10% commission on successful sales. All other services are free." },
      ]
    },
    {
      category: "Technical",
      questions: [
        { q: "How do domain transfers work?", a: "We handle the technical transfer process. You'll authorize the transfer, and we'll manage the DNS updates and registrar changes." },
        { q: "Can I keep my domain private?", a: "Yes, we offer WHOIS privacy protection for all domains." },
        { q: "What if I have DNS records on my domain?", a: "We'll preserve your DNS records during the transfer process." },
      ]
    }
  ]

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 mb-8">Everything you need to know about URLSNAG</p>

        <div className="space-y-8">
          {faqs.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.questions.map((faq, idx) => {
                  const uniqueId = `${sectionIdx}-${idx}`
                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => setOpenFaq(openFaq === uniqueId ? null : uniqueId)}
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                      >
                        <span className="font-semibold text-gray-900 text-left">{faq.q}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition flex-shrink-0 ${openFaq === uniqueId ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === uniqueId && (
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
