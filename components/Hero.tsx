'use client'

import { Search, ChevronDown, Info } from 'lucide-react'
import { useState } from 'react'

interface HeroProps {
  onSearch: (query: string) => void
}

export default function Hero({ onSearch }: HeroProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [showLegend, setShowLegend] = useState(false)
  const [filters, setFilters] = useState({
    includeHyphens: false,
    exactMatch: false,
    numericOnly: false,
    pronounceable: false,
    singleWord: false,
    twoWords: false,
    minChars: 1,
    maxChars: 100,
    minPrice: 0,
    maxPrice: 10000000,
    userType: 'all',
    language: 'all',
    hasWebsite: false,
    hasLogo: false,
    hasSocialMedia: false,
    hasBusinessAssets: false,
    hasVariants: false,
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const userTypes = [
    { value: 'all', label: 'All Users' },
    { value: 'individual', label: 'Individual' },
    { value: 'broker', label: 'Broker' },
    { value: 'business', label: 'Business' }
  ]

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'russian', label: 'Russian' },
    { value: 'korean', label: 'Korean' },
    { value: 'italian', label: 'Italian' },
    { value: 'dutch', label: 'Dutch' },
    { value: 'swedish', label: 'Swedish' },
    { value: 'polish', label: 'Polish' },
    { value: 'turkish', label: 'Turkish' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'thai', label: 'Thai' }
  ]

  const priceScale = [
    1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000,
    2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000
  ]

  const getPriceFromScale = (index: number) => {
    if (index >= priceScale.length) return 10000000
    return priceScale[index]
  }

  const getScaleIndexFromPrice = (price: number) => {
    if (price >= 10000000) return priceScale.length
    const index = priceScale.indexOf(price)
    return index >= 0 ? index : priceScale.length
  }

  const displayPrice = (price: number) => {
    if (price >= 10000000) return 'Any'
    return '$' + price.toLocaleString()
  }

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Buy & Sell Premium Domains</h1>
          <p className="text-xl text-blue-100">
            Discover valuable domain names and connect with buyers and sellers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Main Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search domains..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <Search className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
          </div>

          {/* Toggle Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-blue-100 hover:text-white flex items-center gap-2 text-sm font-medium"
          >
            <span>{showFilters ? 'Hide' : 'Show'} Advanced Filters</span>
            <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 bg-white bg-opacity-95 rounded-lg p-6 space-y-6 text-gray-900">
              {/* Legend Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowLegend(!showLegend)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <Info className="w-4 h-4" />
                  {showLegend ? 'Hide' : 'Show'} Legend
                </button>
              </div>

              {/* Legend */}
              {showLegend && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
                  <p className="font-semibold text-blue-900">Filter Meanings:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li><strong>Include Hyphens:</strong> Allows domains with hyphens (e.g., my-domain.com)</li>
                    <li><strong>Exact Match:</strong> Only domains that exactly match your search term</li>
                    <li><strong>Numeric Only:</strong> Domains containing only numbers (e.g., 123.com)</li>
                    <li><strong>Pronounceable:</strong> Domains that sound natural when spoken</li>
                    <li><strong>Single Word:</strong> Domains with one word only (e.g., apple.com)</li>
                    <li><strong>Two Words:</strong> Domains with exactly two words (e.g., apple-pie.com)</li>
                    <li><strong>Domain Length:</strong> Filter by character count (min-max)</li>
                    <li><strong>Price Range:</strong> Filter by asking price in USD</li>
                  </ul>
                </div>
              )}

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">Seller Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {userTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleFilterChange('userType', type.value)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        filters.userType === type.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain Options Checkboxes */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">Domain Options</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.includeHyphens}
                      onChange={(e) => handleFilterChange('includeHyphens', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Include Hyphens</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.exactMatch}
                      onChange={(e) => handleFilterChange('exactMatch', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Exact Match Only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.numericOnly}
                      onChange={(e) => handleFilterChange('numericOnly', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Numeric Domains Only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.pronounceable}
                      onChange={(e) => handleFilterChange('pronounceable', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Pronounceable</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.singleWord}
                      onChange={(e) => handleFilterChange('singleWord', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Single Word</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.twoWords}
                      onChange={(e) => handleFilterChange('twoWords', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Two Words</span>
                  </label>
                </div>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">Language</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => handleFilterChange('language', lang.value)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        filters.language === lang.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Character Length - Single Line */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-900">Domain Length</label>
                  <span className="text-sm font-medium text-blue-600">{filters.minChars} - {filters.maxChars === 100 ? 'Any' : filters.maxChars} characters</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.minChars}
                    onChange={(e) => handleFilterChange('minChars', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-gray-600 w-12 text-center">Min</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={filters.maxChars}
                    onChange={(e) => handleFilterChange('maxChars', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-gray-600 w-12 text-center">Max</span>
                </div>
              </div>

              {/* Price Range - Single Line */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-gray-900">Price Range</label>
                  <span className="text-sm font-medium text-blue-600">{displayPrice(filters.minPrice)} - {displayPrice(filters.maxPrice)}</span>
                </div>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="0"
                    max={priceScale.length}
                    value={getScaleIndexFromPrice(filters.minPrice)}
                    onChange={(e) => handleFilterChange('minPrice', getPriceFromScale(parseInt(e.target.value)))}
                    className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-gray-600 w-12 text-center">Min</span>
                  <input
                    type="range"
                    min="0"
                    max={priceScale.length}
                    value={getScaleIndexFromPrice(filters.maxPrice)}
                    onChange={(e) => handleFilterChange('maxPrice', getPriceFromScale(parseInt(e.target.value)))}
                    className="flex-1 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs text-gray-600 w-12 text-center">Max</span>
                </div>
              </div>

              {/* Domain Assets */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">Domain Assets</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasWebsite}
                      onChange={(e) => handleFilterChange('hasWebsite', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Has Website</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasLogo}
                      onChange={(e) => handleFilterChange('hasLogo', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Has Logo</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasSocialMedia}
                      onChange={(e) => handleFilterChange('hasSocialMedia', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Has Social Media</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasBusinessAssets}
                      onChange={(e) => handleFilterChange('hasBusinessAssets', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Has Business Assets</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasVariants}
                      onChange={(e) => handleFilterChange('hasVariants', e.target.checked)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Has Variants</span>
                  </label>
                </div>
              </div>

              {/* Apply Filters Button */}
              <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition">
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
