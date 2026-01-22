'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: "The Ultimate Guide to Domain Valuation",
      excerpt: "Learn how to accurately value your domain and maximize your selling potential.",
      date: "Jan 15, 2026",
      category: "Guide"
    },
    {
      id: 2,
      title: "Top 10 Domain Trends in 2026",
      excerpt: "Discover the most sought-after domain extensions and naming patterns this year.",
      date: "Jan 12, 2026",
      category: "Trends"
    },
    {
      id: 3,
      title: "How to Protect Your Domain Investment",
      excerpt: "Essential security practices for domain owners and investors.",
      date: "Jan 8, 2026",
      category: "Security"
    },
    {
      id: 4,
      title: "Success Stories: From Startup to Scale",
      excerpt: "Real stories of entrepreneurs who found their perfect domain on URLSNAG.",
      date: "Jan 5, 2026",
      category: "Stories"
    }
  ]

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">URLSNAG Blog</h1>
        <p className="text-lg text-gray-600 mb-8">Domain insights, tips, and industry news</p>

        <div className="space-y-6">
          {posts.map(post => (
            <article key={post.id} className="border-b border-gray-200 pb-6 hover:shadow-md transition p-4 rounded">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{post.title}</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{post.category}</span>
              </div>
              <p className="text-gray-600 mb-3">{post.excerpt}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{post.date}</span>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">Read More →</a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
