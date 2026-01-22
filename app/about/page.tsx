'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About URLSNAG</h1>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p>
              URLSNAG is the premier marketplace for buying and selling premium domains. We connect domain investors, entrepreneurs, and businesses to find the perfect digital real estate for their ventures.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Choose URLSNAG?</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Transparent pricing and fair marketplace practices</li>
              <li>Secure escrow services for all transactions</li>
              <li>Expert verification of domain ownership</li>
              <li>Comprehensive domain analytics and insights</li>
              <li>24/7 customer support</li>
              <li>Access to thousands of premium domains</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Story</h2>
            <p>
              Founded in 2020, URLSNAG was created to simplify the domain marketplace. We recognized that finding the right domain shouldn't be complicated or risky. Our platform brings together buyers and sellers in a secure, transparent environment where deals happen fairly and efficiently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">50K+</p>
                <p className="text-sm text-gray-600">Domains Listed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">15K+</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">$500M+</p>
                <p className="text-sm text-gray-600">Transaction Volume</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">98%</p>
                <p className="text-sm text-gray-600">User Satisfaction</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
