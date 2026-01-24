const baseCategories = [
  { name: 'Accounting & Compliance', color: '#059669', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', borderColor: 'border-emerald-300' },
  { name: 'AI & Automation', color: '#0891B2', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-300' },
  { name: 'APIs & Integrations', color: '#0284C7', bgColor: 'bg-sky-100', textColor: 'text-sky-800', borderColor: 'border-sky-300' },
  { name: 'Apps & Tools', color: '#2563EB', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Architecture & Design', color: '#7C3AED', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Agriculture & Farming', color: '#16A34A', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' },
  { name: 'Auctions & Listings', color: '#D97706', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Automotive & Mobility', color: '#DC2626', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Banking & Insurance', color: '#1E40AF', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Blogs & News', color: '#B91C1C', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Branding & Design', color: '#9333EA', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Calculators & Converters', color: '#CA8A04', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
  { name: 'Cloud & Infrastructure', color: '#6366F1', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', borderColor: 'border-indigo-300' },
  { name: 'Commerce & Shopping', color: '#EA580C', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Construction & Home', color: '#B45309', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Content & Creators', color: '#BE185D', bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { name: 'Courses & Training', color: '#0369A1', bgColor: 'bg-sky-100', textColor: 'text-sky-800', borderColor: 'border-sky-300' },
  { name: 'Dashboards & Analytics', color: '#D946EF', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-800', borderColor: 'border-fuchsia-300' },
  { name: 'Data & Analytics', color: '#7E22CE', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Dating & Relationships', color: '#EC4899', bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { name: 'Deals & Coupons', color: '#F97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'DIY & Crafts', color: '#84CC16', bgColor: 'bg-lime-100', textColor: 'text-lime-800', borderColor: 'border-lime-300' },
  { name: 'Donations & Crowdfunding', color: '#10B981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', borderColor: 'border-emerald-300' },
  { name: 'Education & Learning', color: '#3B82F6', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Fashion & Beauty', color: '#DB2777', bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { name: 'Fitness & Nutrition', color: '#F43F5E', bgColor: 'bg-rose-100', textColor: 'text-rose-800', borderColor: 'border-rose-300' },
  { name: 'Food & Beverage', color: '#C2410C', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Forms & Surveys', color: '#7C2D12', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Forums & Communities', color: '#4F46E5', bgColor: 'bg-indigo-100', textColor: 'text-indigo-800', borderColor: 'border-indigo-300' },
  { name: 'Freelance & Gigs', color: '#06B6D4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-300' },
  { name: 'Games & Entertainment', color: '#A855F7', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Government & Civic', color: '#1D4ED8', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Guides & Resources', color: '#0EA5E9', bgColor: 'bg-sky-100', textColor: 'text-sky-800', borderColor: 'border-sky-300' },
  { name: 'Health & Wellness', color: '#059669', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', borderColor: 'border-emerald-300' },
  { name: 'Hobbies & Collectibles', color: '#7F1D1D', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Home & Garden', color: '#65A30D', bgColor: 'bg-lime-100', textColor: 'text-lime-800', borderColor: 'border-lime-300' },
  { name: 'Influencers & Creators', color: '#E11D48', bgColor: 'bg-rose-100', textColor: 'text-rose-800', borderColor: 'border-rose-300' },
  { name: 'Jobs & Careers', color: '#2DD4BF', bgColor: 'bg-teal-100', textColor: 'text-teal-800', borderColor: 'border-teal-300' },
  { name: 'Legal & Compliance', color: '#1E3A8A', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Lifestyle & Personal', color: '#F472B6', bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { name: 'Luxury & Style', color: '#C084FC', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Marketing & Advertising', color: '#FB923C', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Marketplaces & Platforms', color: '#FBBF24', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Media & Publishing', color: '#991B1B', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Medical & Biotech', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Meetups & Events', color: '#14B8A6', bgColor: 'bg-teal-100', textColor: 'text-teal-800', borderColor: 'border-teal-300' },
  { name: 'Music & Audio', color: '#8B5CF6', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Nonprofits & Causes', color: '#22C55E', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' },
  { name: 'Outdoor & Adventure', color: '#92400E', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Parenting & Family', color: '#F97316', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Payments & Finance', color: '#FCD34D', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
  { name: 'Pets & Animals', color: '#15803D', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' },
  { name: 'Photography & Art', color: '#92400E', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Podcasts & Audio', color: '#6D28D9', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Portfolios & Profiles', color: '#0891B2', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-300' },
  { name: 'Real Estate & Property', color: '#B45309', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Restaurants & Dining', color: '#92400E', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Reviews & Ratings', color: '#6D28D9', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Security & Privacy', color: '#7F1D1D', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Shipping & Supply', color: '#991B1B', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Social & Communities', color: '#2563EB', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Sports & Recreation', color: '#DC2626', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Streaming & Video', color: '#C084FC', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Subscriptions & Memberships', color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Tech & Software', color: '#1E40AF', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Tools & Utilities', color: '#FBBF24', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Tourism & Events', color: '#0891B2', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-300' },
  { name: 'Transport & Logistics', color: '#B91C1C', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Travel & Hospitality', color: '#06B6D4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-300' },
]

export const CATEGORIES = [
  ...baseCategories,
  { name: 'Adult', color: '#6B21A8', bgColor: 'bg-purple-900', textColor: 'text-purple-100', borderColor: 'border-purple-700' },
  { name: 'Other', color: '#6B7280', bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-300' },
]

export function getCategoryConfig(categoryName: string) {
  if (!categoryName) return CATEGORIES[0]
  
  const normalized = categoryName.trim().toLowerCase()
  
  // Exact match (case-insensitive)
  const exactMatch = CATEGORIES.find(cat => cat.name.toLowerCase() === normalized)
  if (exactMatch) return exactMatch
  
  // Partial match - prioritize matches where the stored value is the first word
  const partialMatches = CATEGORIES.filter(cat => {
    const catLower = cat.name.toLowerCase()
    return catLower.includes(normalized) || normalized.includes(catLower)
  })
  
  if (partialMatches.length > 0) {
    // Prioritize matches where the stored value is at the start of the category name
    const startsWithMatch = partialMatches.find(cat => 
      cat.name.toLowerCase().startsWith(normalized)
    )
    if (startsWithMatch) return startsWithMatch
    
    // Otherwise return first match
    return partialMatches[0]
  }
  
  // Fallback to gray "Other" category
  const otherCategory = CATEGORIES.find(cat => cat.name === 'Other')
  return otherCategory || CATEGORIES[0]
}

export function suggestCategory(domainName: string): string {
  const domain = domainName.toLowerCase().replace(/[.-]/g, ' ').trim()
  const domainWords = domain.split(' ').filter(w => w.length > 0)

  // Priority order - check more specific categories first
  const keywordPriority = [
    // Adult (check first to catch explicit content)
    { category: 'Adult', keywords: ['porn', 'porno', 'sex', 'xxx', 'adult', 'erotic', 'erotica', 'explicit', 'nsfw', 'lewd', 'naughty', 'dirty', 'raunchy', 'spicy', 'sinful', 'taboo', 'fantasy', 'fantasies', 'desire', 'desires', 'lust', 'lusty', 'horny', 'passion', 'passionate', 'nude', 'nudes', 'naked', 'bare', 'barenaked', 'topless', 'bottomless', 'undressed', 'unclothed', 'exposed', 'revealing', 'fuck', 'fucking', 'fucked', 'fuk', 'fuks', 'fuking', 'fapper', 'fap', 'fapping', 'jerkoff', 'stroking', 'edging', 'tease', 'teasing', 'cock', 'cocks', 'dick', 'dicks', 'shaft', 'boner', 'hardon', 'erection', 'member', 'rod', 'tool', 'pussy', 'pussies', 'cunt', 'cunts', 'slit', 'honeypot', 'kitty', 'beaver', 'snatch', 'peach', 'boobs', 'boobies', 'tits', 'titties', 'knockers', 'melons', 'rack', 'busty', 'cleavage', 'ass', 'asses', 'booty', 'butt', 'butts', 'backside', 'rear', 'cheeks', 'bubblebutt', 'cum', 'cums', 'cumming', 'cumshot', 'creampie', 'load', 'splooge', 'seed', 'spunk', 'oral', 'anal', 'analsex', 'hardcore', 'roughsex', 'hardsex', 'softcore', 'intimacy', 'blowjob', 'handjob', 'footjob', 'rimjob', 'threesome', 'foursome', 'gangbang', 'orgy', 'bukkake', 'swinger', 'swingers', 'swap', 'swapping', 'fetish', 'fetishes', 'kinky', 'kink', 'perversion', 'deviant', 'deviance', 'bdsm', 'bondage', 'domination', 'submissive', 'dominant', 'dom', 'sub', 'switch', 'sadism', 'masochism', 'painplay', 'spank', 'spanking', 'spanked', 'whip', 'whipping', 'flog', 'flogging', 'paddle', 'latex', 'leather', 'rubber', 'pvc', 'vinyl', 'lace', 'lingerie', 'stockings', 'garter', 'corset', 'bodysuit', 'milf', 'dilf', 'cougar', 'stud', 'stallion', 'alpha', 'strip', 'stripping', 'stripper', 'stripclub', 'dancers', 'exotic', 'pole', 'lapdance', 'cam', 'cams', 'camgirl', 'camgirls', 'camboy', 'camboys', 'webcam', 'livestream', 'escort', 'escorts', 'companion', 'companions', 'courtesan', 'callgirl', 'voyeur', 'voyeurism', 'peeping', 'peepshow', 'exhibitionist', 'flashing', 'massage', 'rubdown', 'happyending', 'bodywork', 'sensual', 'roleplay', 'cosplay', 'scenarios', 'toys', 'toyplay', 'dildo', 'dildos', 'vibrator', 'vibrators', 'wand', 'plug', 'plugs', 'beads', 'rings', 'lubricant', 'lube', 'slick', 'oil', 'oils', 'massageoil', 'dating', 'hookups', 'hookup', 'singles', 'casual', 'encounters', 'onlyfans', 'fansly', 'fanvue', 'subscription', 'premium', 'paywall', 'exclusive', 'chat', 'sext', 'sexting', 'sexvideo', 'sexvideochat', 'sexvideoz', 'sexvideohub', '18plus', 'adults', 'adultsonly', 'xxxrated', 'unrated', 'hentai', 'ecchi', 'rule34', 'animeporn', 'gay', 'gays', 'lesbian', 'lesbians', 'bi', 'bisexual', 'pansexual', 'queer', 'lgbt', 'lgbtq', 'twink', 'bear', 'otter', 'jock', 'trans', 'transgender', 'ts', 'shemale', 'femboy', 'interracial', 'ebony', 'latina', 'asian', 'arab', 'exotic', 'feet', 'footfetish', 'armpit', 'bodyworship', 'uniform', 'nurseplay', 'maidplay', 'teacherplay', 'voyageur', 'voyeurcam', 'hidden', 'candid', 'club', 'lounge', 'adultclub', 'pleasure', 'pleasures', 'fantasycam', 'premiumsex', 'adultflix', 'sexvideozone', 'heat', 'steam', 'steamy', 'sultry', 'tempting', 'uncensored', 'raw', 'real', 'amateur', 'homemade', 'authentic', 'models', 'performers', 'creators', 'stars', 'vip', 'elite', 'luxury', 'indulgence', 'indulgent', 'playroom', 'dungeon', 'redroom', 'darkroom', 'afterdark', 'midnight', 'latehours', 'nocturnal', 'flirt', 'flirting', 'temptation', 'teasezone', 'desirehub', 'uncut', 'unfiltered', 'uncaged', 'unleashed', 'pleasurezone', 'lustzone', 'kinkzone', 'fantasyzone', 'r18', 'r-18', 'viagra', 'cialis', 'erectile', 'impotence', 'penis', 'vagina', 'breast', 'boob', 'jizz', 'sperm', 'semen', 'ejaculate', 'masturbate', 'masturbation', 'foreplay', 'intercourse', 'copulation', 'coitus', 'prostitute', 'slave', 'master', 'mistress', 'orgasm', 'climax', 'sexy', 'shit', 'slut', 'whore', 'bitch', 'uncut', 'unfiltered', 'uncaged', 'unleashed', '18+', '21+', 'restricted', 'explicit content', 'adult only', 'adults only'] },
    // Food & Beverage (check before other categories)
    { category: 'Food', keywords: ['food', 'restaurant', 'cafe', 'pizza', 'burger', 'delivery', 'recipe', 'dining', 'cuisine', 'thai', 'chinese', 'italian', 'sushi', 'ramen'] },
    { category: 'Beverage', keywords: ['beverage', 'drink', 'coffee', 'beer', 'wine', 'tea', 'juice'] },
    // Health & Wellness
    { category: 'Health', keywords: ['health', 'medical', 'doctor', 'clinic', 'wellness', 'fitness', 'gym', 'healthcare', 'hospital'] },
    { category: 'Fitness', keywords: ['fitness', 'gym', 'workout', 'exercise', 'yoga', 'trainer'] },
    { category: 'Medical', keywords: ['medical', 'medicine', 'hospital', 'pharma', 'drug'] },
    // Fashion & Lifestyle
    { category: 'Fashion', keywords: ['fashion', 'style', 'clothing', 'wear', 'apparel', 'boutique', 'clothes', 'dress', 'shoe'] },
    { category: 'Beauty', keywords: ['beauty', 'cosmetics', 'makeup', 'skincare', 'salon'] },
    // Travel & Hospitality
    { category: 'Travel', keywords: ['travel', 'trip', 'tour', 'hotel', 'flight', 'vacation', 'booking', 'tourism', 'resort'] },
    { category: 'Hospitality', keywords: ['hospitality', 'hotel', 'resort', 'lodge'] },
    // Commerce
    { category: 'Commerce', keywords: ['shop', 'store', 'buy', 'sell', 'market', 'commerce', 'trade', 'ecommerce', 'retail', 'cardboard', 'box', 'boxes'] },
    { category: 'Finance', keywords: ['finance', 'fintech', 'crypto', 'bitcoin', 'trade', 'invest', 'bank', 'money', 'payment'] },
    // Technology
    { category: 'AI', keywords: ['ai', 'artificial', 'intelligence', 'ml', 'machine', 'learning', 'neural', 'deep', 'gpt'] },
    { category: 'Cloud', keywords: ['cloud', 'aws', 'azure', 'gcp', 'server', 'hosting'] },
    { category: 'Tech', keywords: ['tech', 'software', 'app', 'digital', 'web', 'code', 'dev', 'it', 'platform'] },
    { category: 'Security', keywords: ['security', 'cyber', 'safe', 'protect', 'vault', 'lock', 'encryption'] },
    // Gaming & Entertainment
    { category: 'Gaming', keywords: ['game', 'gaming', 'play', 'esports', 'stream', 'gamer', 'video'] },
    { category: 'Entertainment', keywords: ['entertainment', 'fun', 'movie', 'show'] },
    { category: 'Sports', keywords: ['sports', 'sport', 'athletic', 'athlete', 'soccer', 'basketball'] },
    // Education
    { category: 'Education', keywords: ['education', 'learn', 'school', 'course', 'edu', 'academy', 'training', 'tutor', 'university'] },
    // Real Estate
    { category: 'Realty', keywords: ['realty', 'real estate', 'property', 'home', 'house', 'apartment'] },
    // Jobs & HR
    { category: 'Jobs', keywords: ['job', 'jobs', 'career', 'hire', 'recruit', 'work', 'employment', 'hiring'] },
    // Services
    { category: 'Services', keywords: ['service', 'services', 'consulting', 'consultant'] },
    // Other categories
    { category: 'Legal', keywords: ['legal', 'law', 'lawyer', 'attorney'] },
    { category: 'Automotive', keywords: ['auto', 'automotive', 'vehicle', 'motor', 'car', 'cars'] },
    { category: 'Agriculture', keywords: ['agriculture', 'farm', 'farming', 'crop'] },
    { category: 'Energy', keywords: ['energy', 'power', 'solar', 'wind'] },
  ]

  // Score each category based on keyword matches
  const scores: Record<string, number> = {}
  
  for (const { category, keywords } of keywordPriority) {
    let score = 0
    
    // Sort keywords by length (longest first) to prioritize specific matches
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length)
    
    for (const keyword of sortedKeywords) {
      // Exact word match (highest priority)
      if (domainWords.includes(keyword)) {
        score += keyword.length * 100
      }
      // Multi-word phrase match
      else if (keyword.includes(' ') && domain.includes(keyword)) {
        score += keyword.length * 50
      }
      // Substring match only for longer keywords (5+ chars)
      else if (keyword.length >= 5 && domain.includes(keyword)) {
        score += keyword.length * 10
      }
      // Short keyword substring match (3-4 chars) - lower priority
      else if (keyword.length >= 3 && keyword.length < 5 && domain.includes(keyword)) {
        // Only count if it's a word boundary or part of a longer word
        const regex = new RegExp(`\\b${keyword}|${keyword}\\w`)
        if (regex.test(domain)) {
          score += keyword.length * 2
        }
      }
    }
    
    if (score > 0) {
      scores[category] = score
    }
  }

  // Return category with highest score
  let bestCategory = 'Other'
  let bestScore = 0
  
  for (const [category, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  return bestCategory
}
