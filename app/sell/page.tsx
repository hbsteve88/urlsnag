'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ListingsGrid from '@/components/ListingsGrid'
import Footer from '@/components/Footer'
import DomainDetails from '@/components/DomainDetails'
import NewDomainNotification from '@/components/NewDomainNotification'
import OutbidNotification from '@/components/OutbidNotification'
import { useToast } from '@/components/ToastContext'
import { useAuth } from '@/components/AuthContext'
import { CheckCircle, AlertCircle, Upload, X, ChevronDown, Loader } from 'lucide-react'
import { CATEGORIES } from '@/lib/categories'

export default function SellPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { success, error } = useToast()
  const [listingMode, setListingMode] = useState<'single' | 'bulk'>('single')
  const [priceMode, setPriceMode] = useState<'set' | 'accepting' | 'auction'>('set')
  const [formData, setFormData] = useState({
    domain: '',
    category: 'Tech',
    price: '',
    reservePrice: '',
    startingBid: '',
    description: '',
    website: '',
    businessName: '',
    businessDescription: '',
  })
  const [hasWebsite, setHasWebsite] = useState(false)
  const [hasLogo, setHasLogo] = useState(false)
  const [hasBusinessAssets, setHasBusinessAssets] = useState(false)
  const [hasSocialAccounts, setHasSocialAccounts] = useState(false)
  const [businessAssets, setBusinessAssets] = useState<string[]>([])
  const [socialAccounts, setSocialAccounts] = useState<Array<{ platform: string; url: string }>>([])
  const [newAsset, setNewAsset] = useState('')
  const [newSocial, setNewSocial] = useState({ platform: 'Instagram', url: '' })
  const [bulkDomains, setBulkDomains] = useState('')
  const [listingImageFile, setListingImageFile] = useState<File | null>(null)
  const [listingImagePreview, setListingImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [hideMinimumOffer, setHideMinimumOffer] = useState(false)
  const [hideReservePrice, setHideReservePrice] = useState(false)
  const [bulkUploadSuccess, setBulkUploadSuccess] = useState<{ count: number; errors: number } | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const [hasAdultContent, setHasAdultContent] = useState(false)
  const [adultContentAcknowledged, setAdultContentAcknowledged] = useState(false)
  const [showDNSModal, setShowDNSModal] = useState(false)
  const [dnsToken, setDnsToken] = useState('')
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  const explicitKeywords = [
    'porn', 'porno', 'sex', 'xxx', 'adult', 'erotic', 'erotica', 'explicit', 'nsfw', 'lewd', 'naughty', 'dirty', 'raunchy', 'spicy', 'sinful', 'taboo', 'fantasy', 'fantasies', 'desire', 'desires', 'lust', 'lusty', 'horny', 'passion', 'passionate', 'nude', 'nudes', 'naked', 'bare', 'barenaked', 'topless', 'bottomless', 'undressed', 'unclothed', 'exposed', 'revealing', 'fuck', 'fucking', 'fucked', 'fuk', 'fuks', 'fuking', 'fapper', 'fap', 'fapping', 'jerkoff', 'stroking', 'edging', 'tease', 'teasing', 'cock', 'cocks', 'dick', 'dicks', 'shaft', 'boner', 'hardon', 'erection', 'member', 'rod', 'tool', 'pussy', 'pussies', 'cunt', 'cunts', 'slit', 'honeypot', 'kitty', 'beaver', 'snatch', 'peach', 'boobs', 'boobies', 'tits', 'titties', 'knockers', 'melons', 'rack', 'busty', 'cleavage', 'ass', 'asses', 'booty', 'butt', 'butts', 'backside', 'rear', 'cheeks', 'bubblebutt', 'cum', 'cums', 'cumming', 'cumshot', 'creampie', 'load', 'splooge', 'seed', 'spunk', 'oral', 'anal', 'analsex', 'hardcore', 'roughsex', 'hardsex', 'softcore', 'intimacy', 'blowjob', 'handjob', 'footjob', 'rimjob', 'threesome', 'foursome', 'gangbang', 'orgy', 'bukkake', 'swinger', 'swingers', 'swap', 'swapping', 'fetish', 'fetishes', 'kinky', 'kink', 'perversion', 'deviant', 'deviance', 'bdsm', 'bondage', 'domination', 'submissive', 'dominant', 'dom', 'sub', 'switch', 'sadism', 'masochism', 'painplay', 'spank', 'spanking', 'spanked', 'whip', 'whipping', 'flog', 'flogging', 'paddle', 'latex', 'leather', 'rubber', 'pvc', 'vinyl', 'lace', 'lingerie', 'stockings', 'garter', 'corset', 'bodysuit', 'milf', 'dilf', 'cougar', 'stud', 'stallion', 'alpha', 'strip', 'stripping', 'stripper', 'stripclub', 'dancers', 'exotic', 'pole', 'lapdance', 'cam', 'cams', 'camgirl', 'camgirls', 'camboy', 'camboys', 'webcam', 'livestream', 'escort', 'escorts', 'companion', 'companions', 'courtesan', 'callgirl', 'voyeur', 'voyeurism', 'peeping', 'peepshow', 'exhibitionist', 'flashing', 'massage', 'rubdown', 'happyending', 'bodywork', 'sensual', 'roleplay', 'cosplay', 'scenarios', 'toys', 'toyplay', 'dildo', 'dildos', 'vibrator', 'vibrators', 'wand', 'plug', 'plugs', 'beads', 'rings', 'lubricant', 'lube', 'slick', 'oil', 'oils', 'massageoil', 'dating', 'hookups', 'hookup', 'singles', 'casual', 'encounters', 'onlyfans', 'fansly', 'fanvue', 'subscription', 'premium', 'paywall', 'exclusive', 'chat', 'sext', 'sexting', 'sexvideo', 'sexvideochat', 'sexvideoz', 'sexvideohub', '18plus', 'adults', 'adultsonly', 'xxxrated', 'unrated', 'hentai', 'ecchi', 'rule34', 'animeporn', 'gay', 'gays', 'lesbian', 'lesbians', 'bi', 'bisexual', 'pansexual', 'queer', 'lgbt', 'lgbtq', 'twink', 'bear', 'otter', 'jock', 'trans', 'transgender', 'ts', 'shemale', 'femboy', 'interracial', 'ebony', 'latina', 'asian', 'arab', 'exotic', 'feet', 'footfetish', 'armpit', 'bodyworship', 'uniform', 'nurseplay', 'maidplay', 'teacherplay', 'voyageur', 'voyeurcam', 'hidden', 'candid', 'club', 'lounge', 'adultclub', 'pleasure', 'pleasures', 'fantasycam', 'premiumsex', 'adultflix', 'sexvideozone', 'heat', 'steam', 'steamy', 'sultry', 'tempting', 'uncensored', 'raw', 'real', 'amateur', 'homemade', 'authentic', 'models', 'performers', 'creators', 'stars', 'vip', 'elite', 'luxury', 'indulgence', 'indulgent', 'playroom', 'dungeon', 'redroom', 'darkroom', 'afterdark', 'midnight', 'latehours', 'nocturnal', 'flirt', 'flirting', 'temptation', 'teasezone', 'desirehub', 'uncut', 'unfiltered', 'uncaged', 'unleashed', 'pleasurezone', 'lustzone', 'kinkzone', 'fantasyzone', 'r18', 'r-18', 'viagra', 'cialis', 'erectile', 'impotence', 'penis', 'vagina', 'breast', 'boob', 'jizz', 'sperm', 'semen', 'ejaculate', 'masturbate', 'masturbation', 'foreplay', 'intercourse', 'copulation', 'coitus', 'prostitute', 'slave', 'master', 'mistress', 'orgasm', 'climax', 'sexy', 'shit', 'slut', 'whore', 'bitch', '18+', '21+', 'restricted', 'explicit content', 'adult only', 'adults only'
  ]

  const checkForExplicitContent = (domainName: string): boolean => {
    const domain = domainName.toLowerCase().replace(/[.-]/g, ' ')
    return explicitKeywords.some(keyword => domain.includes(keyword))
  }

  const suggestCategoryFromAPI = async (domainName: string) => {
    try {
      const response = await fetch('/api/suggest-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainName }),
      })
      const data = await response.json()
      if (data.category) {
        setFormData(prev => ({ ...prev, category: data.category }))
      }
    } catch (err) {
      console.error('Error suggesting category:', err)
    }
  }

  const processImageFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Listing image must be less than 10MB')
      return
    }
    setListingImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setListingImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleListingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processImageFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        processImageFile(file)
      } else {
        setErrorMessage('Please drop an image file')
      }
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-check adult content immediately when domain name changes
    if (name === 'domain' && value.trim().length > 0) {
      if (checkForExplicitContent(value)) {
        setHasAdultContent(true)
      }
      
      // Auto-suggest category (with debouncing - wait 1.5 seconds for user to finish typing)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = setTimeout(() => {
        suggestCategoryFromAPI(value)
      }, 1500)
    }
  }

  const generateDNSToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!user) {
      setErrorMessage('You must be signed in to list a domain')
      return
    }

    if (listingMode === 'single') {
      // For single domain listing, show DNS verification modal first
      const token = generateDNSToken()
      setDnsToken(token)
      setShowDNSModal(true)
      return
    }

    if (listingMode === 'bulk') {
      // Handle bulk upload
      if (!bulkDomains.trim()) {
        setErrorMessage('Please enter at least one domain')
        return
      }

      setLoading(true)
      try {
        // Parse domains from textarea (handle both CSV and newline-separated)
        const domains = bulkDomains
          .split(/[,\n]/)
          .map(d => d.trim().toLowerCase())
          .filter(d => d.length > 0)

        if (domains.length === 0) {
          setErrorMessage('Please enter at least one valid domain')
          setLoading(false)
          return
        }

        let successCount = 0
        let errorCount = 0
        let skippedCount = 0

        // Create listings for each domain
        for (let i = 0; i < domains.length; i++) {
          const domain = domains[i]
          setUploadProgress({ current: i + 1, total: domains.length })
          
          try {
            // Check if user already has a listing for this domain
            const existingQuery = query(
              collection(db, 'listings'),
              where('domain', '==', domain),
              where('sellerId', '==', user.uid)
            )
            const existingDocs = await getDocs(existingQuery)
            
            if (existingDocs.size > 0) {
              console.log(`Skipping ${domain} - already in your account`)
              skippedCount++
              continue
            }

            const listingData: any = {
              domain: domain,
              category: 'Technology',
              description: '',
              sellerId: user.uid,
              status: 'pending_approval',
              priceType: 'asking',
              price: 0,
              verified: false,
              offers: 0,
              views: 0,
              bids: 0,
              createdAt: new Date(),
              thumbnail: `stylized:${Math.random() > 0.5 ? '#3B82F6' : '#8B5CF6'}:${domain}`,
              logo: null,
              businessAssets: [],
              socialMedia: [],
              variants: [],
              hasReserve: false,
              isLive: false,
              hasWebsite: false,
              hasLogo: false,
              hasBusinessAssets: false,
              hasSocialAccounts: false,
            }

            await addDoc(collection(db, 'listings'), listingData)
            successCount++
          } catch (error) {
            console.error(`Error creating listing for ${domain}:`, error)
            errorCount++
          }
        }
        
        setUploadProgress(null)

        if (successCount > 0 || skippedCount > 0) {
          setBulkUploadSuccess({ count: successCount, errors: errorCount + skippedCount })
          setBulkDomains('')
          success(`✓ Added ${successCount} domain(s)${skippedCount > 0 ? ` (${skippedCount} already in your account)` : ''}`)
        } else if (errorCount > 0 && successCount === 0) {
          error(`Failed to create listings. Please try again.`)
        }
      } catch (error: any) {
        console.error('Error in bulk upload:', error)
        setErrorMessage(error.message || 'Failed to create listings. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      // Handle single domain upload
      if (!formData.domain.trim()) {
        setErrorMessage('Please enter a domain name')
        return
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        setErrorMessage('Please enter a valid price')
        return
      }

      setLoading(true)

      try {
        // First create the listing document
        const listingData: any = {
          domain: formData.domain.toLowerCase().trim(),
          category: formData.category,
          description: formData.description,
          sellerId: user.uid,
          status: 'pending_approval',
          priceType: priceMode === 'set' ? 'asking' : priceMode === 'accepting' ? 'accepting_offers' : 'starting_bid',
          price: parseInt(formData.price),
          verified: false,
          offers: 0,
          views: 0,
          bids: 0,
          createdAt: new Date(),
          thumbnail: `stylized:${Math.random() > 0.5 ? '#3B82F6' : '#8B5CF6'}:${formData.domain}`,
          logo: null,
          businessAssets: [],
          socialMedia: [],
          variants: [],
          hasReserve: priceMode === 'auction' && formData.reservePrice ? true : false,
          isLive: false,
        }

        if (priceMode === 'auction' && formData.startingBid) {
          listingData.price = parseInt(formData.startingBid)
        }

        if (priceMode === 'accepting') {
          listingData.minimumOfferPrice = parseInt(formData.price) || 0
          listingData.hideMinimumOffer = hideMinimumOffer
        }

        if (priceMode === 'auction') {
          listingData.startingBid = parseInt(formData.startingBid) || 0
          listingData.reservePrice = parseInt(formData.reservePrice) || 0
          listingData.hideReservePrice = hideReservePrice
        }

        // Add optional fields
        listingData.hasWebsite = hasWebsite
        listingData.website = formData.website || null
        listingData.hasLogo = hasLogo
        listingData.hasBusinessAssets = hasBusinessAssets
        listingData.businessName = formData.businessName || null
        listingData.businessDescription = formData.businessDescription || null
        listingData.businessAssets = businessAssets
        listingData.hasSocialAccounts = hasSocialAccounts
        listingData.socialMedia = socialAccounts

        const docRef = await addDoc(collection(db, 'listings'), listingData)
        let listingImageUrl = null

        // Then upload image if provided
        if (listingImageFile) {
          const timestamp = Date.now()
          const storageRef = ref(storage, `listings/${docRef.id}/images/${timestamp}_${listingImageFile.name}`)
          await uploadBytes(storageRef, listingImageFile)
          listingImageUrl = await getDownloadURL(storageRef)
          
          // Update the listing with the image URL
          await updateDoc(doc(db, 'listings', docRef.id), {
            logo: listingImageUrl,
            thumbnail: listingImageUrl,
          })
        }

        success('✓ Domain listing submitted for approval!')
        setFormData({
          domain: '',
          category: 'Technology',
          price: '',
          reservePrice: '',
          startingBid: '',
          description: '',
          website: '',
          businessName: '',
          businessDescription: '',
        })
        setHasWebsite(false)
        setHasLogo(false)
        setHasBusinessAssets(false)
        setHasSocialAccounts(false)
        setBusinessAssets([])
        setSocialAccounts([])
        setNewAsset('')
        setNewSocial({ platform: 'Instagram', url: '' })
      } catch (error: any) {
        console.error('Error creating listing:', error)
        setErrorMessage(error.message || 'Failed to create listing. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white flex flex-col">
        <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-600 mb-6">You must be signed in to list a domain on URLSNAG.</p>
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Sign In / Sign Up
            </button>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
      
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sell Your Domain</h1>
          <p className="text-lg text-gray-600">List your domain on URLSNAG and reach thousands of buyers</p>
        </div>

        {/* Listing Mode Toggle */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setListingMode('single')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              listingMode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List Single Domain
          </button>
          <button
            onClick={() => setListingMode('bulk')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              listingMode === 'bulk'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bulk Upload
          </button>
        </div>


        {listingMode === 'single' ? (
          <>
            {/* Tips for Successful Listings */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Tips for Successful Listings
              </h3>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• Price competitively - research similar domains on the marketplace</li>
                <li>• Write detailed descriptions highlighting potential uses and value</li>
                <li>• Consider running an auction for better exposure</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              {/* Domain Name */}
              <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Domain Name (with extension)</label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                placeholder="example.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <p className="text-xs text-gray-500 mt-1">Include the full domain with extension (e.g., example.com, mysite.io)</p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                >
                  {[...CATEGORIES].sort((a, b) => {
                    if (a.name === 'Other') return 1
                    if (b.name === 'Other') return -1
                    return a.name.localeCompare(b.name)
                  }).map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-xs text-gray-500 mt-1">💡 AI automatically suggests the best category based on your domain name. You can change it anytime.</p>
            </div>

            {/* Adult Content Disclaimer */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-900 mb-3">⚠️ Adult Content Declaration</h3>
              <p className="text-xs text-red-800 mb-4">
                Failing to declare adult content is a serious violation. Listings with undeclared adult content will be rejected and repeated violations may result in account suspension or permanent cancellation.
              </p>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={hasAdultContent}
                  onChange={(e) => setHasAdultContent(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-red-900 font-medium">This domain contains adult content</span>
              </label>
            </div>

            {/* Price Mode Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">How do you want to sell?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPriceMode('set')}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    priceMode === 'set'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">Set Price</p>
                  <p className="text-sm text-gray-600">Fixed asking price</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode('accepting')}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    priceMode === 'accepting'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">Accepting Offers</p>
                  <p className="text-sm text-gray-600">Negotiate with buyers</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPriceMode('auction')}
                  className={`p-4 rounded-lg border-2 transition text-left ${
                    priceMode === 'auction'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">Auction</p>
                  <p className="text-sm text-gray-600">Starting bid & reserve</p>
                </button>
              </div>
            </div>

            {/* Price Fields Based on Mode */}
            {priceMode === 'set' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Asking Price</label>
                <div className="flex gap-3">
                  <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-medium text-gray-900 min-w-fit">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>CAD</option>
                    <option>AUD</option>
                    <option>JPY</option>
                    <option>CHF</option>
                    <option>CNY</option>
                    <option>INR</option>
                    <option>SGD</option>
                  </select>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            )}

            {priceMode === 'accepting' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Offer Price</label>
                  <div className="flex gap-3">
                    <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-medium text-gray-900 min-w-fit">
                      <option>USD</option>
                      <option>EUR</option>
                      <option>GBP</option>
                      <option>CAD</option>
                      <option>AUD</option>
                      <option>JPY</option>
                      <option>CHF</option>
                      <option>CNY</option>
                      <option>INR</option>
                      <option>SGD</option>
                    </select>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Buyers can make offers above this amount</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hideMinOffer"
                    checked={hideMinimumOffer}
                    onChange={(e) => setHideMinimumOffer(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="hideMinOffer" className="text-sm text-gray-700">
                    Hide minimum offer amount from buyers
                  </label>
                </div>
              </>
            )}

            {priceMode === 'auction' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Starting Bid</label>
                    <div className="flex gap-3">
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-medium text-gray-900 min-w-fit">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>CAD</option>
                        <option>AUD</option>
                        <option>JPY</option>
                        <option>CHF</option>
                        <option>CNY</option>
                        <option>INR</option>
                        <option>SGD</option>
                      </select>
                      <input
                        type="number"
                        name="startingBid"
                        value={formData.startingBid}
                        onChange={handleChange}
                        placeholder="0"
                        required
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Reserve Price</label>
                    <div className="flex gap-3">
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white font-medium text-gray-900 min-w-fit">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>CAD</option>
                        <option>AUD</option>
                        <option>JPY</option>
                        <option>CHF</option>
                        <option>CNY</option>
                        <option>INR</option>
                        <option>SGD</option>
                      </select>
                      <input
                        type="number"
                        name="reservePrice"
                        value={formData.reservePrice}
                        onChange={handleChange}
                        placeholder="0"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum price to accept (optional)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hideReserve"
                    checked={hideReservePrice}
                    onChange={(e) => setHideReservePrice(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <label htmlFor="hideReserve" className="text-sm text-gray-700">
                    Hide reserve price from buyers
                  </label>
                </div>
              </>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell buyers about your domain, its history, potential uses, etc..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Optional Assets Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optional Assets & Information</h3>
              
              {/* Website */}
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={hasWebsite}
                    onChange={(e) => setHasWebsite(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Includes Website</span>
                </label>
                {hasWebsite && (
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                )}
              </div>

              {/* Logo */}
              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasLogo}
                    onChange={(e) => setHasLogo(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Includes Logo</span>
                </label>
              </div>

              {/* Business Assets */}
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={hasBusinessAssets}
                    onChange={(e) => setHasBusinessAssets(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Includes Business Assets</span>
                </label>
                {hasBusinessAssets && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Business Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <textarea
                      value={formData.businessDescription}
                      onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                      placeholder="Describe the business assets included..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAsset}
                        onChange={(e) => setNewAsset(e.target.value)}
                        placeholder="Add asset (e.g., Email list, Customer database)"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newAsset.trim()) {
                            setBusinessAssets([...businessAssets, newAsset])
                            setNewAsset('')
                          }
                        }}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Add
                      </button>
                    </div>
                    {businessAssets.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {businessAssets.map((asset, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm">
                            {asset}
                            <button
                              type="button"
                              onClick={() => setBusinessAssets(businessAssets.filter((_, i) => i !== idx))}
                              className="hover:text-blue-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Social Accounts */}
              <div className="mb-4">
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={hasSocialAccounts}
                    onChange={(e) => setHasSocialAccounts(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Includes Social Media Accounts</span>
                </label>
                {hasSocialAccounts && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={newSocial.platform}
                        onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option>Instagram</option>
                        <option>Facebook</option>
                        <option>Twitter</option>
                        <option>TikTok</option>
                        <option>YouTube</option>
                        <option>LinkedIn</option>
                        <option>Other</option>
                      </select>
                      <input
                        type="url"
                        value={newSocial.url}
                        onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                        placeholder="https://instagram.com/username"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSocial.url.trim()) {
                            setSocialAccounts([...socialAccounts, newSocial])
                            setNewSocial({ platform: 'Instagram', url: '' })
                          }
                        }}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        Add
                      </button>
                    </div>
                    {socialAccounts.length > 0 && (
                      <div className="space-y-2">
                        {socialAccounts.map((social, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-blue-100 text-blue-900 px-3 py-2 rounded-lg text-sm">
                            <span>{social.platform}: {social.url}</span>
                            <button
                              type="button"
                              onClick={() => setSocialAccounts(socialAccounts.filter((_, i) => i !== idx))}
                              className="hover:text-blue-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Listing Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Listing Image (Optional)
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="flex items-center gap-4 p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-400 hover:bg-blue-50"
              >
                {listingImagePreview ? (
                  <div className="relative">
                    <img
                      src={listingImagePreview}
                      alt="Listing preview"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setListingImageFile(null)
                        setListingImagePreview('')
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-white">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleListingImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">Drag and drop or click to upload. Max 10MB. JPG, PNG, or GIF.</p>
                </div>
              </div>
            </div>

            {/* Prove Domain Ownership - Moved to Bottom */}
            <div className="border-t pt-6">
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Prove Domain Ownership</h3>
                    <p className="text-sm text-amber-800 mb-3">
                      To list a domain, you must verify ownership via DNS. When you click "List Domain", we'll generate a unique verification code that you add to your domain's DNS records.
                    </p>
                    <div className="space-y-2 text-sm text-amber-800">
                      <p><strong>How it works:</strong></p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>We generate a unique TXT record value</li>
                        <li>You add it to your domain's DNS settings (through your registrar)</li>
                        <li>We verify the record exists to confirm ownership</li>
                        <li>Your domain is verified and ready to list</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Submitting...' : 'List Domain'}
            </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Domains (CSV or one per line)</label>
              <textarea
                value={bulkDomains}
                onChange={(e) => setBulkDomains(e.target.value)}
                placeholder="example1.com, example2.io, example3.org&#10;or&#10;example1.com&#10;example2.io&#10;example3.org"
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Enter domains separated by commas or one per line</p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next:</strong> After uploading, you'll configure pricing and details for each domain individually.
              </p>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Continue with Bulk Upload
            </button>
          </form>
        )}


      </div>

      {/* Upload Progress Modal */}
      {uploadProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Adding Domains
            </h2>
            <p className="text-gray-600 mb-6">
              Processing domain {uploadProgress.current} of {uploadProgress.total}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{
                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {Math.round((uploadProgress.current / uploadProgress.total) * 100)}% complete
            </p>
          </div>
        </div>
      )}

      {/* Bulk Upload Success Modal */}
      {bulkUploadSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="mb-4">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {bulkUploadSuccess.count > 0 ? 'Domains Added!' : 'Already Existing'}
            </h2>
            <p className="text-gray-600 mb-6">
              {bulkUploadSuccess.count > 0 ? (
                <>
                  {bulkUploadSuccess.count} domain{bulkUploadSuccess.count !== 1 ? 's' : ''} added to your account.
                  {bulkUploadSuccess.errors > 0 && (
                    <span className="block text-sm text-orange-600 mt-2">
                      ({bulkUploadSuccess.errors} already existing or failed)
                    </span>
                  )}
                </>
              ) : (
                <>
                  All {bulkUploadSuccess.errors} domain{bulkUploadSuccess.errors !== 1 ? 's' : ''} are already in your account.
                </>
              )}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {bulkUploadSuccess.count > 0 
                ? 'Your domains are pending admin approval. You can view and manage them in your domains list.'
                : 'No new domains were added.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBulkUploadSuccess(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  setBulkUploadSuccess(null)
                  router.push('/my-domains')
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                View My Domains
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
