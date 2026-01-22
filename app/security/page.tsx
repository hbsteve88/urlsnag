'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Shield, Lock, AlertCircle, CheckCircle } from 'lucide-react'

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Security & Trust</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Security Commitment</h2>
            <p className="text-gray-700 mb-4">
              At URLSNAG, security is our top priority. We implement industry-leading security measures to protect your data and transactions.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <Lock className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Encryption</h3>
              <p className="text-gray-700 text-sm">All data is encrypted in transit using SSL/TLS protocols and at rest using AES-256 encryption.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <Shield className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Escrow Service</h3>
              <p className="text-gray-700 text-sm">All transactions use our secure escrow service to protect both buyers and sellers.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <CheckCircle className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Verification</h3>
              <p className="text-gray-700 text-sm">We verify domain ownership and seller identity before any transaction is completed.</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <AlertCircle className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Fraud Prevention</h3>
              <p className="text-gray-700 text-sm">Our advanced fraud detection systems monitor all transactions for suspicious activity.</p>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Practices for Users</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Use a strong, unique password for your URLSNAG account</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Enable two-factor authentication on your account</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Never share your account credentials or API keys</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Verify domain ownership before listing or transferring</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">5.</span>
                <span>Report suspicious activity immediately</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance</h2>
            <p className="text-gray-700 mb-4">
              URLSNAG complies with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>GDPR (General Data Protection Regulation)</li>
              <li>CCPA (California Consumer Privacy Act)</li>
              <li>PCI DSS (Payment Card Industry Data Security Standard)</li>
              <li>SOC 2 Type II compliance</li>
            </ul>
          </section>

          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Report a Security Issue</h2>
            <p className="text-gray-700 mb-4">
              If you discover a security vulnerability, please report it responsibly to our security team.
            </p>
            <a href="mailto:security@urlsnag.com" className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Report Security Issue
            </a>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
