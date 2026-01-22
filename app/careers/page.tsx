'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function CareersPage() {
  const jobs = [
    { title: "Senior Full Stack Engineer", location: "Remote", type: "Full-time" },
    { title: "Product Manager", location: "San Francisco, CA", type: "Full-time" },
    { title: "Customer Success Manager", location: "Remote", type: "Full-time" },
    { title: "Domain Analyst", location: "New York, NY", type: "Full-time" },
  ]

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Join Our Team</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Work at URLSNAG?</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Work on a mission-driven platform transforming the domain marketplace</li>
              <li>Competitive salary and equity packages</li>
              <li>Comprehensive health and wellness benefits</li>
              <li>Flexible remote work options</li>
              <li>Professional development and learning opportunities</li>
              <li>Collaborative and innovative team culture</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <div className="space-y-3">
              {jobs.map((job, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.location} • {job.type}</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Don't see a fit?</h2>
            <p className="text-gray-700 mb-4">We're always looking for talented people. Send us your resume and tell us what you'd like to work on.</p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Send Your Resume
            </button>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  )
}
