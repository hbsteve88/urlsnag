export interface BusinessAsset {
  type: 'logo' | 'website' | 'social' | 'email' | 'content' | 'code' | 'brand'
  name: string
  description: string
}

export interface Seller {
  id: string
  name: string
  profilePic: string
  domainsCount: number
}

export interface DomainVariant {
  domain: string
  type: 'extension' | 'misspelling'
  included: boolean
}

export interface SocialMedia {
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin'
  handle: string
  followers: number
  url: string
}

export interface Listing {
  id: string
  domain: string
  tld: string
  price: number
  priceType: 'asking' | 'accepting_offers' | 'starting_bid'
  category: string
  contentType: 'general' | 'adult' | 'gambling' | 'weapons'
  verified: boolean
  offers: number
  views: number
  bids: number
  icon: string
  thumbnail: string
  logo?: string
  hasReserve: boolean
  endTime?: Date
  createdAt: Date
  registeredDate?: Date
  businessAssets: BusinessAsset[]
  description: string
  seller: Seller
  variants?: DomainVariant[]
  socialMedia?: SocialMedia[]
  hasWebsite?: boolean
  website?: string
  hasLogo?: boolean
  hasBusinessAssets?: boolean
  businessName?: string
  businessDescription?: string
  hasSocialAccounts?: boolean
  isPromoted?: boolean
  bundledDomains?: string[]
  forSalePageEnabled?: boolean
}

const categories = [
  'Technology',
  'Ecommerce',
  'Services',
  'Health',
  'Finance',
  'Education',
  'Entertainment',
  'Real Estate',
  'Travel',
  'Food',
  'Fashion',
  'Sports',
  'Gaming',
  'Crypto',
  'AI',
  'SaaS',
  'Startup',
  'Media',
  'Lifestyle',
  'Business',
  'Marketing',
  'Design',
  'Photography',
  'Music',
  'Art',
  'Community',
  'Social',
  'News',
  'Blog',
  'Shop',
  'Brand',
  'Automotive',
  'Real Estate',
  'Legal',
  'Medical',
  'Fitness',
  'Beauty',
  'Wellness',
  'Travel & Tourism',
  'Hospitality',
  'Restaurant',
  'Cafe',
  'Bar',
  'Nightlife',
  'Events',
  'Wedding',
  'Photography',
  'Video Production',
  'Consulting',
  'Coaching',
  'Training',
  'E-Learning',
  'Publishing',
  'Writing',
  'Podcast',
  'Streaming',
  'Gaming',
  'Esports',
  'Fitness',
  'Yoga',
  'Meditation',
  'Mental Health',
  'Therapy',
  'Counseling',
  'Pet Care',
  'Veterinary',
  'Animal Rescue',
  'Wildlife',
  'Environmental',
  'Sustainability',
  'Green Energy',
  'Solar',
  'Wind',
  'Renewable',
  'Non-Profit',
  'Charity',
  'Fundraising',
  'Volunteering',
  'Community Service',
  'Government',
  'Politics',
  'Activism',
  'Advocacy',
  'Human Rights',
  'Education',
  'University',
  'College',
  'School',
  'Tutoring',
  'Online Courses',
  'Bootcamp',
  'Certification',
  'Professional Development',
  'Recruitment',
  'HR',
  'Staffing',
  'Freelance',
  'Gig Economy',
  'Remote Work',
  'Coworking',
  'Office Space',
  'Workspace',
  'Industrial',
  'Manufacturing',
  'Supply Chain',
  'Logistics',
  'Shipping',
  'Warehousing',
  'Distribution',
  'Retail',
  'Wholesale',
  'B2B',
  'B2C',
  'D2C',
  'Marketplace',
  'Auction',
  'Classifieds',
  'Directory',
  'Portal',
  'Platform',
  'App',
  'Software',
  'SaaS',
  'Cloud',
  'Data',
  'Analytics',
  'AI',
  'Machine Learning',
  'Blockchain',
  'Web3',
  'Metaverse',
  'Virtual Reality',
  'Augmented Reality',
  'IoT',
  'Smart Home',
  'Robotics',
  'Automation',
  'Security',
  'Cybersecurity',
  'Privacy',
  'Compliance',
  'Legal Tech',
  'Fintech',
  'Insurtech',
  'Proptech',
  'Healthtech',
  'Edtech',
  'Agritech',
  'Foodtech',
  'Cleantech',
  'Mobility',
  'Transportation',
  'Logistics',
  'Delivery',
  'Ride Sharing',
  'Car Rental',
  'Parking',
  'EV Charging',
  'Aviation',
  'Maritime',
  'Railway',
  'Public Transport',
]

const tlds = [
  'com', 'org', 'net', 'co', 'info',
  'today', 'tokyo', 'tools', 'top', 'tours', 'town', 'toys', 'trade', 'training', 'travel',
  'tube', 'tv', 'tw', 'uk', 'uk.com', 'uk.net', 'university', 'uno', 'us',
  'vacations', 'vc', 'vegas', 'ventures', 'vet', 'vg', 'viajes', 'video', 'villas', 'vin',
  'vip', 'vision', 'vodka', 'vote', 'voting', 'voto', 'voyage', 'vu',
  'wales', 'watch', 'watches', 'web.ve', 'webcam', 'website', 'wedding', 'wiki', 'win', 'wine',
  'work', 'works', 'world', 'ws', 'wtf',
  'xxx', 'xyz',
  'yachts', 'yoga', 'yokohama',
  'zip', 'zone',
  'io', 'app', 'dev', 'shop', 'ai', 'tech',
  'biz', 'pro', 'xyz', 'online', 'site', 'info', 'us', 'uk', 'ca', 'de',
  'fr', 'au', 'jp', 'cn', 'in', 'br', 'mx', 'es', 'it', 'nl',
  'be', 'ch', 'se', 'no', 'dk', 'fi', 'pl', 'cz', 'ru', 'ua',
  'tv', 'cc', 'ws', 'mobi', 'tel', 'name', 'asia', 'aero', 'coop', 'museum',
  'jobs', 'post', 'travel', 'xxx', 'adult', 'gay', 'wiki', 'blog', 'news', 'press',
  'media', 'photo', 'photography', 'video', 'music', 'art', 'design', 'fashion', 'beauty', 'health',
  'fitness', 'yoga', 'sport', 'games', 'gaming', 'esports', 'poker', 'casino', 'bet', 'finance',
  'bank', 'insurance', 'invest', 'crypto', 'bitcoin', 'eth', 'nft', 'web3', 'metaverse', 'cloud',
  'data', 'analytics', 'software', 'systems', 'network', 'security', 'hosting', 'server', 'domain', 'email',
  'chat', 'social', 'community', 'forum', 'support', 'help', 'service', 'services', 'solutions', 'consulting',
  'agency', 'studio', 'creative', 'marketing', 'seo', 'digital', 'web', 'website', 'store', 'market',
  'trade', 'business', 'company', 'corp', 'group', 'ventures', 'capital', 'fund', 'labs', 'research',
  'science', 'tech', 'engineering', 'build', 'maker', 'craft', 'diy', 'home', 'garden', 'kitchen',
  'food', 'restaurant', 'cafe', 'bar', 'wine', 'beer', 'coffee', 'tea', 'pizza', 'burger',
  'sushi', 'ramen', 'tacos', 'travel', 'hotel', 'resort', 'vacation', 'tour', 'adventure', 'explore',
  'nature', 'outdoor', 'camping', 'hiking', 'bike', 'car', 'auto', 'motor', 'racing', 'drive',
  'taxi', 'uber', 'ride', 'delivery', 'food', 'pizza', 'shop', 'store', 'mall', 'market',
  'sale', 'deals', 'discount', 'coupon', 'offer', 'promo', 'auction', 'bid', 'buy', 'sell',
  'rent', 'lease', 'property', 'real', 'estate', 'land', 'house', 'apartment', 'condo', 'villa',
  'resort', 'spa', 'wellness', 'medical', 'doctor', 'clinic', 'hospital', 'pharmacy', 'dental', 'vision',
  'education', 'school', 'university', 'college', 'course', 'training', 'learn', 'academy', 'institute', 'tutor',
  'book', 'library', 'read', 'story', 'novel', 'poetry', 'write', 'author', 'publish', 'print',
  'movie', 'film', 'cinema', 'actor', 'director', 'producer', 'studio', 'show', 'entertainment', 'comedy',
  'drama', 'horror', 'action', 'romance', 'thriller', 'mystery', 'crime', 'detective', 'police', 'law',
  'legal', 'attorney', 'lawyer', 'court', 'judge', 'justice', 'rights', 'freedom', 'liberty', 'peace',
  'love', 'family', 'kids', 'baby', 'parent', 'mom', 'dad', 'sister', 'brother', 'friend',
  'dating', 'match', 'love', 'romance', 'wedding', 'bride', 'groom', 'marriage', 'divorce', 'relationship',
  'pet', 'dog', 'cat', 'bird', 'fish', 'animal', 'wildlife', 'zoo', 'sanctuary', 'rescue',
  'charity', 'nonprofit', 'donate', 'volunteer', 'cause', 'mission', 'impact', 'change', 'world', 'earth',
  'green', 'eco', 'sustainable', 'renewable', 'energy', 'solar', 'wind', 'water', 'clean', 'organic',
]

const domainNames = [
  'startup', 'webdesign', 'ecommerce', 'ai', 'budget', 'fitness', 'cloud', 'digital', 'smart', 'future',
  'nexus', 'prime', 'elite', 'apex', 'zenith', 'quantum', 'velocity', 'horizon', 'stellar', 'cosmic',
  'pixel', 'data', 'code', 'sync', 'flow', 'wave', 'spark', 'pulse', 'echo', 'sonic',
  'swift', 'blaze', 'forge', 'vault', 'nexo', 'prism', 'atlas', 'titan', 'nova', 'lunar',
  'solar', 'cyber', 'meta', 'neo', 'ultra', 'hyper', 'mega', 'giga', 'turbo', 'super',
  'pro', 'max', 'plus', 'core', 'hub', 'node', 'link', 'net', 'web', 'site',
  'zone', 'space', 'realm', 'world', 'globe', 'earth', 'ocean', 'sky', 'fire', 'water',
  'wind', 'stone', 'metal', 'wood', 'gold', 'silver', 'bronze', 'iron', 'steel', 'diamond',
  'pearl', 'ruby', 'sapphire', 'emerald', 'crystal', 'glass', 'mirror', 'light', 'dark', 'bright',
  'clear', 'pure', 'clean', 'fresh', 'new', 'old', 'rare', 'unique', 'special', 'premium',
  'luxury', 'classic', 'modern', 'retro', 'vintage', 'tech', 'innovation', 'solution', 'service', 'platform',
  'system', 'network', 'connect', 'bridge', 'gateway', 'portal', 'access', 'entry', 'door', 'path',
  'route', 'journey', 'quest', 'mission', 'goal', 'target', 'focus', 'vision', 'dream', 'hope',
  'faith', 'trust', 'believe', 'achieve', 'succeed', 'victory', 'triumph', 'glory', 'honor', 'pride',
  'power', 'strength', 'force', 'energy', 'drive', 'passion', 'spirit', 'soul', 'heart', 'mind',
  'brain', 'thought', 'idea', 'concept', 'theory', 'logic', 'reason', 'sense', 'wisdom', 'knowledge',
  'learn', 'teach', 'guide', 'mentor', 'coach', 'leader', 'master', 'expert', 'pro', 'ace',
  'star', 'hero', 'champion', 'winner', 'victor', 'conqueror', 'ruler', 'king', 'queen', 'prince',
  'princess', 'noble', 'royal', 'imperial', 'sovereign', 'supreme', 'ultimate', 'absolute', 'total', 'complete',
  'whole', 'entire', 'full', 'perfect', 'ideal', 'best', 'greatest', 'finest', 'superior', 'excellent',
  'outstanding', 'remarkable', 'amazing', 'wonderful', 'fantastic', 'fabulous', 'marvelous', 'magnificent', 'splendid', 'glorious',
  'radiant', 'brilliant', 'shining', 'gleaming', 'glowing', 'luminous', 'vibrant', 'vivid', 'colorful', 'dynamic',
  'active', 'lively', 'spirited', 'energetic', 'vigorous', 'robust', 'strong', 'mighty', 'powerful', 'potent',
  'intense', 'extreme', 'radical', 'bold', 'daring', 'brave', 'courageous', 'fearless', 'valiant', 'heroic',
  'epic', 'legendary', 'mythic', 'magical', 'mystical', 'enchanted', 'charmed', 'blessed', 'sacred', 'holy',
  'divine', 'celestial', 'heavenly', 'ethereal', 'spiritual', 'transcendent', 'sublime', 'exquisite', 'elegant', 'refined',
  'sophisticated', 'cultured', 'civilized', 'polished', 'smooth', 'sleek', 'slick', 'sharp', 'keen', 'acute',
  'quick', 'fast', 'rapid', 'swift', 'speedy', 'hasty', 'prompt', 'instant', 'immediate', 'direct',
  'straight', 'clear', 'obvious', 'evident', 'apparent', 'visible', 'noticeable', 'prominent', 'striking', 'bold',
  'vivid', 'intense', 'strong', 'powerful', 'mighty', 'formidable', 'impressive', 'awesome', 'incredible', 'unbelievable',
  'astonishing', 'astounding', 'shocking', 'surprising', 'unexpected', 'unusual', 'uncommon', 'rare', 'scarce', 'precious',
  'valuable', 'priceless', 'treasured', 'cherished', 'beloved', 'adored', 'admired', 'respected', 'honored', 'esteemed',
  'revered', 'venerated', 'worshipped', 'idolized', 'celebrated', 'famous', 'renowned', 'illustrious', 'distinguished', 'notable',
  'eminent', 'prominent', 'leading', 'foremost', 'principal', 'primary', 'main', 'chief', 'head', 'top',
  'first', 'initial', 'original', 'authentic', 'genuine', 'real', 'true', 'actual', 'factual', 'concrete',
  'solid', 'substantial', 'tangible', 'material', 'physical', 'corporeal', 'embodied', 'incarnate', 'manifest', 'express',
  'explicit', 'clear', 'distinct', 'definite', 'precise', 'exact', 'accurate', 'correct', 'right', 'proper',
  'appropriate', 'suitable', 'fitting', 'apt', 'relevant', 'pertinent', 'applicable', 'useful', 'practical', 'functional',
  'operational', 'working', 'active', 'running', 'performing', 'executing', 'operating', 'functioning', 'working', 'serving',
]

const icons = [
  '🚀',
  '💻',
  '🌐',
  '🎯',
  '💡',
  '⚡',
  '🔥',
  '💎',
  '🏆',
  '🎨',
  '📱',
  '🖥️',
  '⌚',
  '🎮',
  '🎬',
  '🎵',
  '🎤',
  '📸',
  '📹',
  '🎭',
  '🎪',
  '🎨',
  '🖌️',
  '✏️',
  '📝',
  '📚',
  '📖',
  '📕',
  '📗',
  '📘',
  '📙',
  '🔐',
  '🔑',
  '🗝️',
  '🔓',
  '🔒',
  '🛡️',
  '⚔️',
  '🗡️',
  '🏹',
  '🎯',
  '🎲',
  '🃏',
  '🎰',
  '🧩',
  '🎳',
  '🏀',
  '⚽',
  '🏈',
  '⚾',
  '🥎',
  '🎾',
  '🏐',
  '🏉',
  '🥏',
  '🎿',
  '⛷️',
  '🏂',
  '🪂',
  '🛹',
  '🛼',
  '🛴',
  '🚲',
  '🚵',
  '🏇',
  '🐎',
  '🐕',
  '🐈',
  '🦁',
  '🐯',
  '🐻',
  '🐼',
  '🐨',
  '🐶',
  '🦊',
  '🦝',
  '🐭',
  '🐹',
  '🐰',
  '🦌',
  '🦬',
  '🐄',
  '🐂',
  '🐃',
  '🐓',
  '🐔',
  '🐦',
  '🦅',
  '🦉',
  '🦆',
  '🦢',
  '🦜',
  '🦚',
  '🦃',
  '🦚',
  '🦩',
  '🕊️',
  '🐇',
  '🦝',
  '🦨',
  '🦡',
  '🦦',
  '🦥',
  '🐁',
  '🐀',
  '🐿️',
  '🦔',
]

const photoThumbnails = [
  'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=200&fit=crop',
]

const backgroundColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#52C9A3',
  '#FF8C94', '#6C5CE7', '#A29BFE', '#FD79A8', '#FDCB6E',
]

const sellerNames = [
  'Alex Chen', 'Sarah Johnson', 'Marcus Williams', 'Emma Davis', 'James Rodriguez',
  'Olivia Martinez', 'Liam Anderson', 'Sophia Taylor', 'Noah Thomas', 'Ava Jackson',
  'Ethan White', 'Isabella Harris', 'Mason Martin', 'Mia Thompson', 'Lucas Garcia',
  'Charlotte Lee', 'Oliver Perez', 'Amelia Roberts', 'Benjamin Phillips', 'Harper Campbell',
  'Elijah Parker', 'Evelyn Evans', 'Logan Edwards', 'Abigail Collins', 'Mason Stewart',
  'Elizabeth Morris', 'Mason Rogers', 'Emily Murphy', 'Jacob Cook', 'Avery Morgan',
  'Michael Bell', 'Ella Murphy', 'Daniel Bailey', 'Scarlett Rivera', 'Matthew Oliver',
  'Grace Hardy', 'Jackson Graham', 'Chloe Sullivan', 'Aiden Wallace', 'Lily Woods',
  'Sebastian Ross', 'Hannah Henderson', 'Jack Coleman', 'Zoe Jenkins', 'Alexander Perry',
  'Natalie Powell', 'Caleb Long', 'Leah Patterson', 'Ryan Hughes', 'Lillian Flores',
]

function generateStylizedThumbnail(domain: string): string {
  const [name] = domain.split('.')
  const bgColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
  
  // Return a data URL with encoded color and domain name for client-side rendering
  return `stylized:${bgColor}:${name}`
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function generateDomain(): string {
  const name = getRandomItem(domainNames)
  // 70% .com, 30% other TLDs
  const tld = Math.random() < 0.7 ? 'com' : getRandomItem(tlds)
  return `${name}.${tld}`
}

function generatePrice(): number {
  // Generate premium domain prices starting at 100k+
  const ranges = [
    Math.floor(Math.random() * 10) * 10000 + 100000,   // 100k-200k
    Math.floor(Math.random() * 10) * 25000 + 150000,   // 150k-400k
    Math.floor(Math.random() * 10) * 50000 + 200000,   // 200k-700k
    Math.floor(Math.random() * 5) * 100000 + 300000,   // 300k-800k
  ]
  return ranges[Math.floor(Math.random() * ranges.length)]
}

function hasReservePrice(): boolean {
  return Math.random() > 0.7
}

function generateContentType(): 'general' | 'adult' | 'gambling' | 'weapons' {
  const rand = Math.random()
  // 85% general, 10% adult, 3% gambling, 2% weapons
  if (rand < 0.85) return 'general'
  if (rand < 0.95) return 'adult'
  if (rand < 0.98) return 'gambling'
  return 'weapons'
}

function generatePriceType(): 'asking' | 'accepting_offers' | 'starting_bid' {
  const rand = Math.random()
  if (rand < 0.5) return 'asking'
  if (rand < 0.8) return 'accepting_offers'
  return 'starting_bid'
}

function generateBusinessAssets(): BusinessAsset[] {
  const assets: BusinessAsset[] = []
  const assetTypes: Array<'logo' | 'website' | 'social' | 'email' | 'content' | 'code' | 'brand'> = [
    'logo',
    'website',
    'social',
    'email',
    'content',
    'code',
    'brand',
  ]

  // Premium domains include 3-5 assets
  const numAssets = Math.floor(Math.random() * 3) + 3

  const selectedTypes = new Set<string>()
  while (selectedTypes.size < numAssets) {
    selectedTypes.add(assetTypes[Math.floor(Math.random() * assetTypes.length)])
  }

  const descriptions: Record<string, string[]> = {
    logo: [
      'Professional logo design',
      'Brand identity package',
      'Logo with brand guidelines',
    ],
    website: [
      'Fully functional website',
      'WordPress site with content',
      'Custom built website',
    ],
    social: [
      '50K Instagram followers',
      'Active Twitter account',
      'TikTok with 100K followers',
    ],
    email: [
      'Email list with 5K subscribers',
      'Newsletter setup',
      'Email marketing templates',
    ],
    content: [
      'Blog with 100+ articles',
      'Video content library',
      'SEO-optimized content',
    ],
    code: [
      'Source code included',
      'GitHub repository',
      'Mobile app source code',
    ],
    brand: [
      'Established brand reputation',
      'Brand partnerships',
      'Media coverage archive',
    ],
  }

  selectedTypes.forEach((type) => {
    assets.push({
      type: type as 'logo' | 'website' | 'social' | 'email' | 'content' | 'code' | 'brand',
      name: type.charAt(0).toUpperCase() + type.slice(1),
      description: descriptions[type][Math.floor(Math.random() * descriptions[type].length)],
    })
  })

  return assets
}

function generateDescription(domain: string): string {
  const descriptions = [
    `Premium ${domain} domain - perfect for your next venture`,
    `Established brand potential with ${domain}`,
    `High-value ${domain} domain ready for development`,
    `${domain} - ideal for startups and entrepreneurs`,
    `Memorable ${domain} domain with strong branding potential`,
    `${domain} - monetization ready`,
    `Professional ${domain} domain for serious buyers`,
  ]
  return descriptions[Math.floor(Math.random() * descriptions.length)]
}

function generateEndTime(): Date | undefined {
  if (Math.random() > 0.6) {
    const now = new Date()
    const daysFromNow = Math.floor(Math.random() * 30) + 1
    return new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000)
  }
  return undefined
}

function generateSeller(): Seller {
  const name = sellerNames[Math.floor(Math.random() * sellerNames.length)]
  const initials = name.split(' ').map(n => n[0]).join('')
  const bgColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)]
  
  // Create avatar SVG with initials
  const svg = `
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${bgColor}"/>
      <text x="50" y="50" font-size="40" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, sans-serif">
        ${initials}
      </text>
    </svg>
  `
  
  return {
    id: `seller-${Math.random().toString(36).substr(2, 9)}`,
    name,
    profilePic: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
    domainsCount: Math.floor(Math.random() * 50) + 5,
  }
}

function generateSocialMedia(): SocialMedia[] {
  const platforms: Array<'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin'> = [
    'twitter', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin'
  ]
  
  const socialAccounts: SocialMedia[] = []
  const numAccounts = Math.floor(Math.random() * 4) + 1 // 1-4 social accounts
  const selectedPlatforms = new Set<string>()
  
  while (selectedPlatforms.size < numAccounts) {
    selectedPlatforms.add(platforms[Math.floor(Math.random() * platforms.length)])
  }
  
  selectedPlatforms.forEach((platform) => {
    const handles: Record<string, string[]> = {
      twitter: ['@brand', '@official', '@team', '@news', '@updates'],
      instagram: ['brand', 'official_brand', 'brandofficial', 'thebrand', 'brand_co'],
      facebook: ['Brand', 'Official Brand', 'Brand Official', 'The Brand', 'Brand Co'],
      tiktok: ['@brand', '@official_brand', '@brandhq', '@brand_official', '@thebrand'],
      youtube: ['Brand', 'Official Brand', 'Brand Channel', 'Brand HQ', 'The Brand'],
      linkedin: ['brand', 'brand-official', 'the-brand', 'brand-co', 'official-brand']
    }
    
    const handle = handles[platform][Math.floor(Math.random() * handles[platform].length)]
    const followerRanges: Record<string, [number, number]> = {
      twitter: [5000, 500000],
      instagram: [10000, 1000000],
      facebook: [20000, 2000000],
      tiktok: [50000, 5000000],
      youtube: [100000, 10000000],
      linkedin: [5000, 500000]
    }
    
    const [min, max] = followerRanges[platform]
    const followers = Math.floor(Math.random() * (max - min)) + min
    
    socialAccounts.push({
      platform: platform as 'twitter' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin',
      handle,
      followers,
      url: `https://${platform}.com/${handle}`
    })
  })
  
  return socialAccounts
}

function generateDomainVariants(domain: string): DomainVariant[] {
  const variants: DomainVariant[] = []
  const [name, tld] = domain.split('.')
  
  // 60% of listings have variants
  if (Math.random() > 0.4) {
    // Generate 1-3 extension variants
    const numExtensions = Math.floor(Math.random() * 3) + 1
    const selectedTlds = new Set<string>()
    while (selectedTlds.size < numExtensions) {
      const randomTld = tlds[Math.floor(Math.random() * tlds.length)]
      if (randomTld !== tld) {
        selectedTlds.add(randomTld)
      }
    }
    
    selectedTlds.forEach(t => {
      variants.push({
        domain: `${name}.${t}`,
        type: 'extension',
        included: Math.random() > 0.3,
      })
    })
    
    // Generate 0-2 misspellings
    const numMisspellings = Math.floor(Math.random() * 2)
    const misspellingVariations = [
      name.replace(/a/g, 'e'),
      name.replace(/e/g, 'a'),
      name.slice(0, -1),
      name + 's',
      name.replace(/o/g, '0'),
    ]
    
    for (let i = 0; i < numMisspellings && i < misspellingVariations.length; i++) {
      const misspelled = misspellingVariations[i]
      if (misspelled !== name && misspelled.length > 0) {
        variants.push({
          domain: `${misspelled}.${tld}`,
          type: 'misspelling',
          included: Math.random() > 0.4,
        })
      }
    }
  }
  
  return variants
}

export function generateListings(count: number): Listing[] {
  const listings: Listing[] = []
  const usedDomains = new Set<string>()

  for (let i = 0; i < count; i++) {
    let domain = generateDomain()
    while (usedDomains.has(domain)) {
      domain = generateDomain()
    }
    usedDomains.add(domain)

    const [name, tld] = domain.split('.')
    const price = generatePrice()
    const endTime = generateEndTime()

    // 50% stylized, 50% photo
    const useStylized = Math.random() < 0.5
    
    listings.push({
      id: `domain-${i}`,
      domain,
      tld,
      price,
      priceType: generatePriceType(),
      category: getRandomItem(categories),
      contentType: generateContentType(),
      verified: Math.random() > 0.5,
      offers: Math.floor(Math.random() * 20),
      views: Math.floor(Math.random() * 5000) + 100,
      bids: Math.floor(Math.random() * 50),
      icon: getRandomItem(icons),
      thumbnail: useStylized ? generateStylizedThumbnail(domain) : getRandomItem(photoThumbnails),
      logo: Math.random() > 0.6 ? getRandomItem(photoThumbnails) : undefined,
      hasReserve: hasReservePrice(),
      endTime,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      businessAssets: generateBusinessAssets(),
      description: generateDescription(domain),
      seller: generateSeller(),
      variants: generateDomainVariants(domain),
      socialMedia: Math.random() > 0.5 ? generateSocialMedia() : undefined,
      hasWebsite: Math.random() > 0.6,
      website: Math.random() > 0.6 ? `https://${domain}` : undefined,
      hasLogo: Math.random() > 0.5,
      hasBusinessAssets: Math.random() > 0.6,
      businessName: Math.random() > 0.7 ? `${name} Inc.` : undefined,
      businessDescription: Math.random() > 0.7 ? `Established ${name} business with strong market presence` : undefined,
      hasSocialAccounts: Math.random() > 0.5,
    })
  }

  return listings
}
