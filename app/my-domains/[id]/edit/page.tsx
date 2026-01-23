'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db, storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/components/ToastContext'
import { AlertCircle, Loader, Upload, X, ChevronDown } from 'lucide-react'
import { CATEGORIES, suggestCategory } from '@/lib/categories'

interface DomainListing {
  id: string
  domain: string
  category: string
  price: number
  status: 'pending_approval' | 'approved' | 'rejected' | 'sold'
  description: string
  priceType: string
  logo?: string
  sellerId: string
  minimumOfferPrice?: number
  startingBid?: number
  reservePrice?: number
  hideMinimumOffer?: boolean
  hideReservePrice?: boolean
  hasWebsite?: boolean
  website?: string
  hasLogo?: boolean
  hasBusinessAssets?: boolean
  businessName?: string
  businessDescription?: string
  businessAssets?: string[]
  hasSocialAccounts?: boolean
  socialMedia?: Array<{ platform: string; url: string }>
  hasAdultContent?: boolean
  dnsToken?: string
  verified?: boolean
  forSalePageEnabled?: boolean
}

export default function EditDomainPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const domainId = params.id as string
  const { success, error } = useToast()

  const [domain, setDomain] = useState<DomainListing | null>(null)
  const [formData, setFormData] = useState({
    category: '',
    price: '',
    description: '',
    priceType: '',
    minimumOfferPrice: '',
    startingBid: '',
    reservePrice: '',
    website: '',
    businessName: '',
    businessDescription: '',
  })
  const [priceMode, setPriceMode] = useState<'set' | 'accepting' | 'auction'>('set')
  const [hideMinimumOffer, setHideMinimumOffer] = useState(false)
  const [hideReservePrice, setHideReservePrice] = useState(false)
  const [hasWebsite, setHasWebsite] = useState(false)
  const [hasLogo, setHasLogo] = useState(false)
  const [hasBusinessAssets, setHasBusinessAssets] = useState(false)
  const [hasSocialAccounts, setHasSocialAccounts] = useState(false)
  const [businessAssets, setBusinessAssets] = useState<string[]>([])
  const [socialAccounts, setSocialAccounts] = useState<Array<{ platform: string; url: string }>>([])
  const [newAsset, setNewAsset] = useState('')
  const [newSocial, setNewSocial] = useState({ platform: 'Instagram', url: '' })
  const [listingImageFile, setListingImageFile] = useState<File | null>(null)
  const [listingImagePreview, setListingImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [hasAdultContent, setHasAdultContent] = useState(false)
  const [adultContentAcknowledged, setAdultContentAcknowledged] = useState(false)
  const [selectedRegistrar, setSelectedRegistrar] = useState<string>('')
  const [forSalePageEnabled, setForSalePageEnabled] = useState(false)
  const [showForSaleSetup, setShowForSaleSetup] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)


  const isApproved = domain?.status === 'approved'
  const isPending = domain?.status === 'pending_approval'

  const explicitKeywords = [
    'porn', 'porno', 'sex', 'xxx', 'adult', 'erotic', 'erotica', 'explicit', 'nsfw', 'lewd', 'naughty', 'dirty', 'raunchy', 'spicy', 'sinful', 'taboo', 'fantasy', 'fantasies', 'desire', 'desires', 'lust', 'lusty', 'horny', 'passion', 'passionate', 'nude', 'nudes', 'naked', 'bare', 'barenaked', 'topless', 'bottomless', 'undressed', 'unclothed', 'exposed', 'revealing', 'fuck', 'fucking', 'fucked', 'fuk', 'fuks', 'fuking', 'fapper', 'fap', 'fapping', 'jerkoff', 'stroking', 'edging', 'tease', 'teasing', 'cock', 'cocks', 'dick', 'dicks', 'shaft', 'boner', 'hardon', 'erection', 'member', 'rod', 'tool', 'pussy', 'pussies', 'cunt', 'cunts', 'slit', 'honeypot', 'kitty', 'beaver', 'snatch', 'peach', 'boobs', 'boobies', 'tits', 'titties', 'knockers', 'melons', 'rack', 'busty', 'cleavage', 'ass', 'asses', 'booty', 'butt', 'butts', 'backside', 'rear', 'cheeks', 'bubblebutt', 'cum', 'cums', 'cumming', 'cumshot', 'creampie', 'load', 'splooge', 'seed', 'spunk', 'oral', 'anal', 'analsex', 'hardcore', 'roughsex', 'hardsex', 'softcore', 'intimacy', 'blowjob', 'handjob', 'footjob', 'rimjob', 'threesome', 'foursome', 'gangbang', 'orgy', 'bukkake', 'swinger', 'swingers', 'swap', 'swapping', 'fetish', 'fetishes', 'kinky', 'kink', 'perversion', 'deviant', 'deviance', 'bdsm', 'bondage', 'domination', 'submissive', 'dominant', 'dom', 'sub', 'switch', 'sadism', 'masochism', 'painplay', 'spank', 'spanking', 'spanked', 'whip', 'whipping', 'flog', 'flogging', 'paddle', 'latex', 'leather', 'rubber', 'pvc', 'vinyl', 'lace', 'lingerie', 'stockings', 'garter', 'corset', 'bodysuit', 'milf', 'dilf', 'cougar', 'stud', 'stallion', 'alpha', 'strip', 'stripping', 'stripper', 'stripclub', 'dancers', 'exotic', 'pole', 'lapdance', 'cam', 'cams', 'camgirl', 'camgirls', 'camboy', 'camboys', 'webcam', 'livestream', 'escort', 'escorts', 'companion', 'companions', 'courtesan', 'callgirl', 'voyeur', 'voyeurism', 'peeping', 'peepshow', 'exhibitionist', 'flashing', 'massage', 'rubdown', 'happyending', 'bodywork', 'sensual', 'roleplay', 'cosplay', 'scenarios', 'toys', 'toyplay', 'dildo', 'dildos', 'vibrator', 'vibrators', 'wand', 'plug', 'plugs', 'beads', 'rings', 'lubricant', 'lube', 'slick', 'oil', 'oils', 'massageoil', 'dating', 'hookups', 'hookup', 'singles', 'casual', 'encounters', 'onlyfans', 'fansly', 'fanvue', 'subscription', 'premium', 'paywall', 'exclusive', 'chat', 'sext', 'sexting', 'sexvideo', 'sexvideochat', 'sexvideoz', 'sexvideohub', '18plus', 'adults', 'adultsonly', 'xxxrated', 'unrated', 'hentai', 'ecchi', 'rule34', 'animeporn', 'gay', 'gays', 'lesbian', 'lesbians', 'bi', 'bisexual', 'pansexual', 'queer', 'lgbt', 'lgbtq', 'twink', 'bear', 'otter', 'jock', 'trans', 'transgender', 'ts', 'shemale', 'femboy', 'interracial', 'ebony', 'latina', 'asian', 'arab', 'exotic', 'feet', 'footfetish', 'armpit', 'bodyworship', 'uniform', 'nurseplay', 'maidplay', 'teacherplay', 'voyageur', 'voyeurcam', 'hidden', 'candid', 'club', 'lounge', 'adultclub', 'pleasure', 'pleasures', 'fantasycam', 'premiumsex', 'adultflix', 'sexvideozone', 'heat', 'steam', 'steamy', 'sultry', 'tempting', 'uncensored', 'raw', 'real', 'amateur', 'homemade', 'authentic', 'models', 'performers', 'creators', 'stars', 'vip', 'elite', 'luxury', 'indulgence', 'indulgent', 'playroom', 'dungeon', 'redroom', 'darkroom', 'afterdark', 'midnight', 'latehours', 'nocturnal', 'flirt', 'flirting', 'temptation', 'teasezone', 'desirehub', 'uncut', 'unfiltered', 'uncaged', 'unleashed', 'pleasurezone', 'lustzone', 'kinkzone', 'fantasyzone', 'r18', 'r-18', 'viagra', 'cialis', 'erectile', 'impotence', 'penis', 'vagina', 'breast', 'boob', 'jizz', 'sperm', 'semen', 'ejaculate', 'masturbate', 'masturbation', 'foreplay', 'intercourse', 'copulation', 'coitus', 'prostitute', 'slave', 'master', 'mistress', 'orgasm', 'climax', 'sexy', 'shit', 'slut', 'whore', 'bitch', '18+', '21+', 'restricted', 'explicit content', 'adult only', 'adults only'
  ]

  const checkForExplicitContent = (domainName: string): boolean => {
    const domain = domainName.toLowerCase().replace(/[.-]/g, ' ')
    return explicitKeywords.some(keyword => domain.includes(keyword))
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

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    fetchDomain()
  }, [user, authLoading, router, domainId])

  const fetchDomain = async () => {
    try {
      setLoading(true)
      const docRef = doc(db, 'listings', domainId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        setErrorMessage('Domain not found')
        return
      }

      const data = docSnap.data() as DomainListing
      data.id = domainId

      if (data.sellerId !== user?.uid) {
        setErrorMessage('You do not have permission to edit this domain')
        router.push('/my-domains')
        return
      }

      setDomain(data)
      setPriceMode(
        data.priceType === 'asking' ? 'set' : 
        data.priceType === 'accepting_offers' ? 'accepting' : 
        'auction'
      )
      setFormData({
        category: data.category,
        price: data.price.toString(),
        description: data.description,
        priceType: data.priceType,
        minimumOfferPrice: data.minimumOfferPrice?.toString() || '',
        startingBid: data.startingBid?.toString() || '',
        reservePrice: data.reservePrice?.toString() || '',
        website: data.website || '',
        businessName: data.businessName || '',
        businessDescription: data.businessDescription || '',
      })

      setHasWebsite(data.hasWebsite || false)
      setHasLogo(data.hasLogo || false)
      setHasBusinessAssets(data.hasBusinessAssets || false)
      setHasSocialAccounts(data.hasSocialAccounts || false)
      setHasAdultContent(data.hasAdultContent || false)
      setHideMinimumOffer(data.hideMinimumOffer || false)
      setHideReservePrice(data.hideReservePrice || false)
      setForSalePageEnabled(data.forSalePageEnabled || false)
      setBusinessAssets(data.businessAssets || [])
      setSocialAccounts(data.socialMedia || [])

      // Generate DNS token if it doesn't exist
      if (!data.dnsToken) {
        const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        data.dnsToken = newToken
        // Update the domain in Firestore with the new token
        await updateDoc(doc(db, 'listings', domainId), { dnsToken: newToken })
      }

      if (data.logo && !data.logo.includes('stylized')) {
        setListingImagePreview(data.logo)
      }
    } catch (err) {
      console.error('Error fetching domain:', err)
      setErrorMessage('Failed to load domain')
    } finally {
      setLoading(false)
    }
  }

  const handleListingImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processImageFile(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-suggest category when domain name changes (for pending domains only)
    if (name === 'domain' && value.trim().length > 0 && isPending) {
      // Auto-check adult content immediately
      if (checkForExplicitContent(value)) {
        setHasAdultContent(true)
      }
      
      // Auto-suggest category (with debouncing - wait 1.5 seconds for user to finish typing)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      debounceTimer.current = setTimeout(() => {
        const suggestedCategory = suggestCategory(value)
        setFormData(prev => ({ ...prev, category: suggestedCategory }))
      }, 1500)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!domain) return

    // Validate price based on price mode
    if (priceMode === 'set') {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setErrorMessage('Please enter a valid asking price')
        return
      }
    } else if (priceMode === 'accepting') {
      if (!formData.minimumOfferPrice || parseFloat(formData.minimumOfferPrice) <= 0) {
        setErrorMessage('Please enter a valid minimum offer price')
        return
      }
    } else if (priceMode === 'auction') {
      if (!formData.startingBid || parseFloat(formData.startingBid) <= 0) {
        setErrorMessage('Please enter a valid starting bid')
        return
      }
      if (!formData.reservePrice || parseFloat(formData.reservePrice) <= 0) {
        setErrorMessage('Please enter a valid reserve price')
        return
      }
    }

    setSaving(true)

    try {
      const updateData: any = {
        category: formData.category,
        price: parseInt(formData.price) || 0,
        description: formData.description,
        priceType: priceMode === 'set' ? 'asking' : priceMode === 'accepting' ? 'accepting_offers' : 'starting_bid',
      }

      if (priceMode === 'accepting') {
        updateData.minimumOfferPrice = parseInt(formData.minimumOfferPrice) || 0
        updateData.hideMinimumOffer = hideMinimumOffer
      }

      if (priceMode === 'auction') {
        updateData.startingBid = parseInt(formData.startingBid) || 0
        updateData.reservePrice = parseInt(formData.reservePrice) || 0
        updateData.hideReservePrice = hideReservePrice
      }

      // Add optional fields
      updateData.hasWebsite = hasWebsite
      updateData.website = formData.website || null
      updateData.hasLogo = hasLogo
      updateData.hasBusinessAssets = hasBusinessAssets
      updateData.businessName = formData.businessName || null
      updateData.businessDescription = formData.businessDescription || null
      updateData.businessAssets = businessAssets
      updateData.hasSocialAccounts = hasSocialAccounts
      updateData.socialMedia = socialAccounts
      updateData.forSalePageEnabled = forSalePageEnabled

      if (listingImageFile) {
        const timestamp = Date.now()
        const storageRef = ref(storage, `listings/${domainId}/images/${timestamp}_${listingImageFile.name}`)
        await uploadBytes(storageRef, listingImageFile)
        const logoUrl = await getDownloadURL(storageRef)
        updateData.logo = logoUrl
        updateData.thumbnail = logoUrl
      }

      await updateDoc(doc(db, 'listings', domainId), updateData)

      success('Domain updated successfully!')
      setTimeout(() => {
        router.push('/my-domains')
      }, 1500)
    } catch (err: any) {
      console.error('Error updating domain:', err)
      const errorMessage = err?.message || 'Failed to update domain'
      error(`Failed to update domain: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!domain) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Domain not found</p>
            <button
              onClick={() => router.push('/my-domains')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Back to My Domains
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery="" onSearchChange={() => {}} showSearchBar={false} />

      <main className="w-full max-w-2xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Edit Domain Listing</h1>
          <p className="text-sm sm:text-base text-gray-600">{domain.domain}</p>
          {isApproved && (
            <p className="text-xs sm:text-sm text-amber-600 mt-2">
              ℹ️ This domain is approved. You can edit images, prices, and description, but not the domain name.
            </p>
          )}
          {isPending && (
            <p className="text-xs sm:text-sm text-orange-600 mt-2">
              ℹ️ This domain is pending approval. You can edit all fields.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-3 sm:p-8 space-y-4 sm:space-y-6">
          {/* Domain Name (Read-only if approved) */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Domain Name</label>
            <input
              type="text"
              value={domain.domain}
              disabled={isApproved}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-medium disabled:opacity-75"
            />
            {isApproved && <p className="text-xs text-gray-500 mt-1">Cannot be changed after approval</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2">Category</label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
              >
                {[...CATEGORIES].sort((a, b) => {
                  if (a.name === 'Other') return 1
                  if (b.name === 'Other') return -1
                  return a.name.localeCompare(b.name)
                }).map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 sm:top-3.5 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 mt-1">💡 AI automatically suggests the best category based on your domain name. You can change it anytime.</p>
          </div>

          {/* DNS Verification Status */}
          {domain && (
            <div className={`border rounded-lg p-4 ${domain.verified ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <h3 className={`text-sm font-semibold mb-2 ${domain.verified ? 'text-green-900' : 'text-amber-900'}`}>
                {domain.verified ? '✓ Domain Verified' : '⏳ Domain Verification Pending'}
              </h3>
              {!domain.verified && (
                <>
                  <p className="text-xs text-amber-800 mb-3">
                    Select your domain registrar to see specific instructions for adding the DNS verification record:
                  </p>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-900 mb-2">Which registrar do you use?</label>
                    <select
                      value={selectedRegistrar}
                      onChange={(e) => setSelectedRegistrar(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    >
                      <option value="">-- Select your registrar --</option>
                      <option value="godaddy">GoDaddy</option>
                      <option value="namecheap">Namecheap</option>
                      <option value="bluehost">Bluehost</option>
                      <option value="route53">Route 53 (AWS)</option>
                      <option value="other">Other Registrar</option>
                    </select>
                  </div>

                  {selectedRegistrar && (
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="bg-white p-3 rounded border border-amber-200">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 mb-1">Name</p>
                              <p className="font-mono text-xs break-all">_urlsnag-verify</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText('_urlsnag-verify')
                                success('Name copied!')
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 flex-shrink-0"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-amber-200">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 mb-1">Value</p>
                              <p className="font-mono text-xs break-all">{domain.dnsToken || 'Generating...'}</p>
                            </div>
                            {domain.dnsToken && (
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(domain.dnsToken || '')
                                  success('Value copied!')
                                }}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 flex-shrink-0"
                              >
                                Copy
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {selectedRegistrar === 'godaddy' && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3 space-y-3">
                          <div>
                            <h4 className="text-xs font-semibold text-blue-900 mb-2">Option 1: Quick Verification (Recommended)</h4>
                            <p className="text-xs text-blue-800 mb-2">GoDaddy offers a quick "Verify Domain Ownership" feature:</p>
                            <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
                              <li>Go to your GoDaddy domain settings</li>
                              <li>Click "Verify Domain Ownership"</li>
                              <li>Paste the Value above into the text field</li>
                              <li>Click "Verify"</li>
                            </ol>
                          </div>
                          <div className="border-t border-blue-200 pt-3">
                            <h4 className="text-xs font-semibold text-blue-900 mb-2">Option 2: Manual DNS Record</h4>
                            <p className="text-xs text-blue-800 mb-2">Or add it manually:</p>
                            <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
                              <li>Log in to your GoDaddy account</li>
                              <li>Go to "My Products" and find your domain</li>
                              <li>Click "Manage DNS"</li>
                              <li>Click "Add" under DNS Records</li>
                              <li>Select "TXT" as the record type</li>
                              <li>Enter the Name and Value from above</li>
                              <li>Click "Save"</li>
                            </ol>
                          </div>
                        </div>
                      )}

                      {selectedRegistrar === 'namecheap' && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                          <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
                            <li>Log in to your Namecheap account</li>
                            <li>Go to "Domain List"</li>
                            <li>Click "Manage" next to your domain</li>
                            <li>Go to the "Advanced DNS" tab</li>
                            <li>Click "Add New Record"</li>
                            <li>Select "TXT Record" as the type</li>
                            <li>Enter the Name and Value from above</li>
                            <li>Click the checkmark to save</li>
                          </ol>
                        </div>
                      )}

                      {selectedRegistrar === 'bluehost' && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                          <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
                            <li>Log in to your Bluehost account</li>
                            <li>Click "Domains" in the sidebar</li>
                            <li>Find your domain and click "Manage"</li>
                            <li>Click "DNS Records"</li>
                            <li>Click "Add DNS Record"</li>
                            <li>Select "TXT" as the type</li>
                            <li>Enter the Name and Value from above</li>
                            <li>Click "Add Record"</li>
                          </ol>
                        </div>
                      )}

                      {selectedRegistrar === 'route53' && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                          <ol className="list-decimal list-inside text-xs text-blue-800 space-y-1">
                            <li>Log in to AWS Console</li>
                            <li>Go to Route 53</li>
                            <li>Click "Hosted zones"</li>
                            <li>Select your domain</li>
                            <li>Click "Create record"</li>
                            <li>Select "TXT" as the record type</li>
                            <li>Enter the Name and Value from above</li>
                            <li>Click "Create records"</li>
                          </ol>
                        </div>
                      )}

                      {selectedRegistrar === 'other' && (
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-3">
                          <p className="text-xs text-blue-800 mb-2">For your registrar, look for "DNS Management", "DNS Records", or "Advanced DNS" in your account settings. Add a new TXT record with:</p>
                          <ul className="list-disc list-inside text-xs text-blue-800 space-y-1">
                            <li><strong>Name:</strong> _urlsnag-verify</li>
                            <li><strong>Type:</strong> TXT</li>
                            <li><strong>Value:</strong> {domain.dnsToken}</li>
                          </ul>
                        </div>
                      )}

                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded p-2">
                        <p className="text-xs text-blue-800">
                          <strong>Note:</strong> After adding the DNS record, there may be a slight delay before it's detectable. If verification fails, wait a few minutes and try again. DNS propagation can take up to 48 hours in some cases.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            setSaving(true)
                            success('Checking DNS record... This may take a few moments.')
                            
                            // Call the DNS verification API
                            const response = await fetch('/api/verify-dns', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                domain: domain.domain,
                                dnsToken: domain.dnsToken,
                                registrar: selectedRegistrar
                              })
                            })

                            const result = await response.json()

                            if (result.verified) {
                              // Update domain with verified status
                              await updateDoc(doc(db, 'listings', domainId), { verified: true })
                              setDomain(prev => prev ? { ...prev, verified: true } : null)
                              success('✓ Domain verified successfully!')
                            } else {
                              error(result.message || 'DNS record not found. Please ensure you\'ve added it to your registrar and wait for propagation.')
                            }
                          } catch (err) {
                            console.error('Error checking DNS record:', err)
                            error('Failed to check DNS record. Please try again.')
                          } finally {
                            setSaving(false)
                          }
                        }}
                        disabled={saving}
                        className="w-full px-3 py-2 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Checking...' : 'Check for DNS Record'}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Adult Content in Domain Name */}
          <label className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <input
              type="checkbox"
              checked={hasAdultContent}
              onChange={(e) => setHasAdultContent(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 mt-0.5 flex-shrink-0"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Adult Content in Domain Name</span>
              <p className="text-xs text-gray-600 mt-1">We auto-detected adult-oriented keywords in your domain name. Uncheck if this was flagged incorrectly.</p>
            </div>
          </label>

          {isPending && !domain?.verified && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs text-amber-900 mb-3">
                To make your domain live, you need to verify ownership by adding a DNS record to your registrar.
              </p>
              {domain?.dnsToken && (
                <>
                  <div className="bg-white p-3 rounded border border-amber-200 mb-3 font-mono text-xs break-all">
                    {domain.dnsToken}
                  </div>
                  <button
                    onClick={async () => {
                      setSaving(true)
                      try {
                        const response = await fetch('/api/verify-dns', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ domain: domain.domain, token: domain.dnsToken }),
                        })

                        const result = await response.json()

                        if (result.verified) {
                          // Update domain with verified status
                          await updateDoc(doc(db, 'listings', domainId), { verified: true })
                          setDomain(prev => prev ? { ...prev, verified: true } : null)
                          success('✓ Domain verified successfully!')
                        } else {
                          error(result.message || 'DNS record not found. Please ensure you\'ve added it to your registrar and wait for propagation.')
                        }
                      } catch (err) {
                        console.error('Error checking DNS record:', err)
                        error('Failed to check DNS record. Please try again.')
                      } finally {
                        setSaving(false)
                      }
                    }}
                    disabled={saving}
                    className="w-full px-3 py-2 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Checking...' : 'Check for DNS Record'}
                  </button>
                </>
              )}
            </div>
          )}

          {domain?.verified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-800">
                ✓ Your domain ownership has been verified. You can now make this domain live once it's approved.
              </p>
            </div>
          )}

          {/* How do you want to sell? */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">How do you want to sell?</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                type="button"
                onClick={() => setPriceMode('set')}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition ${
                  priceMode === 'set'
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-400'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold">Set Price</div>
                <div className="text-xs hidden sm:block">Fixed asking price</div>
              </button>
              <button
                type="button"
                onClick={() => setPriceMode('accepting')}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition ${
                  priceMode === 'accepting'
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-400'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold">Offers</div>
                <div className="text-xs hidden sm:block">Negotiate with buyers</div>
              </button>
              <button
                type="button"
                onClick={() => setPriceMode('auction')}
                className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition ${
                  priceMode === 'auction'
                    ? 'bg-blue-100 text-blue-900 border-2 border-blue-400'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="font-semibold">Auction</div>
                <div className="text-xs hidden sm:block">Starting bid & reserve</div>
              </button>
            </div>
          </div>

          {/* Price fields based on mode */}
          {priceMode === 'set' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Asking Price</label>
              <div className="flex gap-2">
                <select
                  defaultValue="USD"
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ appearance: 'textfield', MozAppearance: 'textfield' }}
                />
              </div>
            </div>
          )}

          {priceMode === 'accepting' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Minimum Offer Price ($)</label>
                <input
                  type="number"
                  value={formData.minimumOfferPrice}
                  onChange={(e) => setFormData({ ...formData, minimumOfferPrice: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
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
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Starting Bid ($)</label>
                <input
                  type="number"
                  value={formData.startingBid}
                  onChange={(e) => setFormData({ ...formData, startingBid: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Reserve Price ($)</label>
                <input
                  type="number"
                  value={formData.reservePrice}
                  onChange={(e) => setFormData({ ...formData, reservePrice: e.target.value })}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum price to accept (optional)</p>
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
                    onClick={() => setLightboxImage(listingImagePreview)}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-300 cursor-pointer hover:opacity-80 transition"
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

          {/* For Sale Page */}
          <div className="border border-blue-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setForSalePageEnabled(!forSalePageEnabled)
                setShowForSaleSetup(!showForSaleSetup)
              }}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 transition flex items-center gap-2"
            >
              <input
                type="checkbox"
                checked={forSalePageEnabled}
                onChange={() => {}}
                className="w-4 h-4 rounded border-gray-300"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-sm font-medium text-gray-700">Enable For Sale Landing Page For Your Domain</span>
              <span className={`ml-auto transform transition ${showForSaleSetup ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {showForSaleSetup && (
              <div className="p-4 bg-white border-t border-blue-200 space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900">Your For Sale Landing Page URL:</h4>
                  <div className="bg-white p-3 rounded border border-blue-200 font-mono text-sm text-gray-700 break-all">
                    urlsnag.com/for-sale/{domain?.domain.replace(/\./g, '-')}
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mt-4">How to Set It Up:</h4>
                  <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                    <li><strong>Log into your domain registrar</strong> (GoDaddy, Namecheap, etc.)</li>
                    <li><strong>Find DNS settings</strong> and look for "URL Redirect" or "Domain Forwarding"</li>
                    <li><strong>Create a redirect</strong> from your domain to the URL above</li>
                    <li><strong>Choose "Permanent" (301) redirect</strong> as the redirect type</li>
                    <li><strong>Save and wait</strong> 24-48 hours for DNS to propagate</li>
                  </ol>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-4">
                    <p className="text-xs text-amber-900">
                      <strong>Note:</strong> Once DNS propagates, visitors to your domain will see your for-sale landing page with contact info and instructions for making an offer.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error and Success Messages */}
          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/my-domains')}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition font-medium flex items-center justify-center gap-2"
            >
              {saving && <Loader className="w-4 h-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxImage}
              alt="Full size"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              Click anywhere to close
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
