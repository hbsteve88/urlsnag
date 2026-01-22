'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, list a domain, or make a purchase. This includes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name and contact information</li>
              <li>Payment information</li>
              <li>Domain ownership details</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Process transactions and send related information</li>
              <li>Provide customer service and support</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our services and website</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All transactions are encrypted using SSL technology.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Cookies</h2>
            <p>We use cookies to enhance your experience on our website. You can control cookie settings through your browser preferences. Some features may not function properly if cookies are disabled.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Third-Party Services</h2>
            <p>We may share your information with third-party service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information at any time. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us at privacy@urlsnag.com</p>
          </section>

          <p className="text-sm text-gray-500 mt-8">Last updated: January 2026</p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
