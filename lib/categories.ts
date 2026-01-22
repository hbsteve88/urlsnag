const baseCategories = [
  { name: 'Accounting', color: '#16A34A', bgColor: 'bg-green-300', textColor: 'text-green-900', borderColor: 'border-green-500' },
  { name: 'Advertising', color: '#F97316', bgColor: 'bg-orange-200', textColor: 'text-orange-900', borderColor: 'border-orange-400' },
  { name: 'Agriculture', color: '#22C55E', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' },
  { name: 'AI', color: '#0EA5E9', bgColor: 'bg-sky-100', textColor: 'text-sky-800', borderColor: 'border-sky-300' },
  { name: 'Analytics', color: '#D946EF', bgColor: 'bg-fuchsia-100', textColor: 'text-fuchsia-800', borderColor: 'border-fuchsia-300' },
  { name: 'Architecture', color: '#5B21B6', bgColor: 'bg-purple-400', textColor: 'text-purple-900', borderColor: 'border-purple-600' },
  { name: 'Automation', color: '#06B6D4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-300' },
  { name: 'Automotive', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Banking', color: '#4ADE80', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-300' },
  { name: 'Beauty', color: '#BE185D', bgColor: 'bg-pink-300', textColor: 'text-pink-900', borderColor: 'border-pink-500' },
  { name: 'Beverage', color: '#FBBF24', bgColor: 'bg-amber-200', textColor: 'text-amber-900', borderColor: 'border-amber-400' },
  { name: 'Biotech', color: '#E11D48', bgColor: 'bg-rose-200', textColor: 'text-rose-900', borderColor: 'border-rose-400' },
  { name: 'Branding', color: '#EA580C', bgColor: 'bg-orange-300', textColor: 'text-orange-900', borderColor: 'border-orange-500' },
  { name: 'Careers', color: '#0284C7', bgColor: 'bg-sky-200', textColor: 'text-sky-900', borderColor: 'border-sky-400' },
  { name: 'Civic', color: '#082F49', bgColor: 'bg-blue-500', textColor: 'text-blue-900', borderColor: 'border-blue-700' },
  { name: 'Climate', color: '#65A30D', bgColor: 'bg-lime-200', textColor: 'text-lime-900', borderColor: 'border-lime-400' },
  { name: 'Cloud', color: '#8B5CF6', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Coaching', color: '#0EA5E9', bgColor: 'bg-sky-100', textColor: 'text-sky-800', borderColor: 'border-sky-300' },
  { name: 'Commerce', color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Community', color: '#6D28D9', bgColor: 'bg-violet-200', textColor: 'text-violet-900', borderColor: 'border-violet-400' },
  { name: 'Compliance', color: '#1E3A8A', bgColor: 'bg-blue-300', textColor: 'text-blue-900', borderColor: 'border-blue-500' },
  { name: 'Consulting', color: '#FCD34D', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
  { name: 'Content', color: '#991B1B', bgColor: 'bg-red-300', textColor: 'text-red-900', borderColor: 'border-red-500' },
  { name: 'Construction', color: '#6D28D9', bgColor: 'bg-purple-300', textColor: 'text-purple-900', borderColor: 'border-purple-500' },
  { name: 'Courses', color: '#0284C7', bgColor: 'bg-sky-200', textColor: 'text-sky-900', borderColor: 'border-sky-400' },
  { name: 'Data', color: '#A855F7', bgColor: 'bg-purple-200', textColor: 'text-purple-900', borderColor: 'border-purple-400' },
  { name: 'Education', color: '#3B82F6', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Energy', color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Engineering', color: '#334155', bgColor: 'bg-slate-300', textColor: 'text-slate-900', borderColor: 'border-slate-500' },
  { name: 'Entertainment', color: '#6D28D9', bgColor: 'bg-purple-300', textColor: 'text-purple-900', borderColor: 'border-purple-500' },
  { name: 'Esports', color: '#7C3AED', bgColor: 'bg-purple-200', textColor: 'text-purple-900', borderColor: 'border-purple-400' },
  { name: 'Events', color: '#14B8A6', bgColor: 'bg-teal-100', textColor: 'text-teal-800', borderColor: 'border-teal-300' },
  { name: 'Fashion', color: '#DB2777', bgColor: 'bg-pink-200', textColor: 'text-pink-900', borderColor: 'border-pink-400' },
  { name: 'Farming', color: '#16A34A', bgColor: 'bg-green-200', textColor: 'text-green-900', borderColor: 'border-green-400' },
  { name: 'Finance', color: '#65A30D', bgColor: 'bg-lime-200', textColor: 'text-lime-900', borderColor: 'border-lime-400' },
  { name: 'Fitness', color: '#BE185D', bgColor: 'bg-pink-300', textColor: 'text-pink-900', borderColor: 'border-pink-500' },
  { name: 'Food', color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Gaming', color: '#8B5CF6', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Government', color: '#0C4A6E', bgColor: 'bg-blue-400', textColor: 'text-blue-900', borderColor: 'border-blue-600' },
  { name: 'Hardware', color: '#10B981', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800', borderColor: 'border-emerald-300' },
  { name: 'Health', color: '#EC4899', bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { name: 'Hospitality', color: '#0E7490', bgColor: 'bg-cyan-300', textColor: 'text-cyan-900', borderColor: 'border-cyan-500' },
  { name: 'Housing', color: '#A78BFA', bgColor: 'bg-purple-200', textColor: 'text-purple-900', borderColor: 'border-purple-400' },
  { name: 'HR', color: '#0369A1', bgColor: 'bg-sky-300', textColor: 'text-sky-900', borderColor: 'border-sky-500' },
  { name: 'Industrial', color: '#475569', bgColor: 'bg-slate-200', textColor: 'text-slate-900', borderColor: 'border-slate-400' },
  { name: 'Infrastructure', color: '#DC2626', bgColor: 'bg-red-200', textColor: 'text-red-900', borderColor: 'border-red-400' },
  { name: 'Insurance', color: '#22C55E', bgColor: 'bg-green-200', textColor: 'text-green-900', borderColor: 'border-green-400' },
  { name: 'Jobs', color: '#0EA5E9', bgColor: 'bg-sky-100', textColor: 'text-sky-800', borderColor: 'border-sky-300' },
  { name: 'Learning', color: '#1E40AF', bgColor: 'bg-blue-200', textColor: 'text-blue-900', borderColor: 'border-blue-400' },
  { name: 'Legal', color: '#1E40AF', bgColor: 'bg-blue-200', textColor: 'text-blue-900', borderColor: 'border-blue-400' },
  { name: 'Lifestyle', color: '#EC4899', bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { name: 'Logistics', color: '#991B1B', bgColor: 'bg-red-400', textColor: 'text-red-900', borderColor: 'border-red-600' },
  { name: 'Luxury', color: '#9D174D', bgColor: 'bg-pink-400', textColor: 'text-pink-900', borderColor: 'border-pink-600' },
  { name: 'Manufacturing', color: '#64748B', bgColor: 'bg-slate-100', textColor: 'text-slate-800', borderColor: 'border-slate-300' },
  { name: 'Marketplace', color: '#FBBF24', bgColor: 'bg-amber-200', textColor: 'text-amber-900', borderColor: 'border-amber-400' },
  { name: 'Marketing', color: '#FB923C', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Materials', color: '#1E293B', bgColor: 'bg-slate-400', textColor: 'text-slate-900', borderColor: 'border-slate-600' },
  { name: 'Media', color: '#DC2626', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Medical', color: '#F43F5E', bgColor: 'bg-rose-100', textColor: 'text-rose-800', borderColor: 'border-rose-300' },
  { name: 'Mobility', color: '#DC2626', bgColor: 'bg-red-200', textColor: 'text-red-900', borderColor: 'border-red-400' },
  { name: 'Networking', color: '#EA580C', bgColor: 'bg-orange-100', textColor: 'text-orange-800', borderColor: 'border-orange-300' },
  { name: 'Payments', color: '#84CC16', bgColor: 'bg-lime-100', textColor: 'text-lime-800', borderColor: 'border-lime-300' },
  { name: 'Pharma', color: '#BE123C', bgColor: 'bg-rose-300', textColor: 'text-rose-900', borderColor: 'border-rose-500' },
  { name: 'Privacy', color: '#F43F5E', bgColor: 'bg-rose-100', textColor: 'text-rose-800', borderColor: 'border-rose-300' },
  { name: 'Property', color: '#7C3AED', bgColor: 'bg-purple-200', textColor: 'text-purple-900', borderColor: 'border-purple-400' },
  { name: 'Publishing', color: '#B91C1C', bgColor: 'bg-red-200', textColor: 'text-red-900', borderColor: 'border-red-400' },
  { name: 'Realty', color: '#8B5CF6', bgColor: 'bg-purple-100', textColor: 'text-purple-800', borderColor: 'border-purple-300' },
  { name: 'Recreation', color: '#DC2626', bgColor: 'bg-red-200', textColor: 'text-red-900', borderColor: 'border-red-400' },
  { name: 'Retail', color: '#FCD34D', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800', borderColor: 'border-yellow-300' },
  { name: 'Robotics', color: '#14B8A6', bgColor: 'bg-teal-100', textColor: 'text-teal-800', borderColor: 'border-teal-300' },
  { name: 'Security', color: '#EC4899', bgColor: 'bg-pink-100', textColor: 'text-pink-800', borderColor: 'border-pink-300' },
  { name: 'Services', color: '#FBBF24', bgColor: 'bg-amber-200', textColor: 'text-amber-900', borderColor: 'border-amber-400' },
  { name: 'Shipping', color: '#7F1D1D', bgColor: 'bg-red-500', textColor: 'text-red-900', borderColor: 'border-red-700' },
  { name: 'Social', color: '#7C3AED', bgColor: 'bg-violet-100', textColor: 'text-violet-800', borderColor: 'border-violet-300' },
  { name: 'Software', color: '#1E40AF', bgColor: 'bg-blue-200', textColor: 'text-blue-900', borderColor: 'border-blue-400' },
  { name: 'Sports', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Staffing', color: '#075985', bgColor: 'bg-sky-400', textColor: 'text-sky-900', borderColor: 'border-sky-600' },
  { name: 'Support', color: '#F59E0B', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-300' },
  { name: 'Sustainability', color: '#84CC16', bgColor: 'bg-lime-100', textColor: 'text-lime-800', borderColor: 'border-lime-300' },
  { name: 'Tech', color: '#3B82F6', bgColor: 'bg-blue-100', textColor: 'text-blue-800', borderColor: 'border-blue-300' },
  { name: 'Telecom', color: '#EF4444', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-300' },
  { name: 'Tourism', color: '#0891B2', bgColor: 'bg-cyan-200', textColor: 'text-cyan-900', borderColor: 'border-cyan-400' },
  { name: 'Training', color: '#1E3A8A', bgColor: 'bg-blue-300', textColor: 'text-blue-900', borderColor: 'border-blue-500' },
  { name: 'Transport', color: '#B91C1C', bgColor: 'bg-red-300', textColor: 'text-red-900', borderColor: 'border-red-500' },
  { name: 'Travel', color: '#06B6D4', bgColor: 'bg-cyan-100', textColor: 'text-cyan-800', borderColor: 'border-cyan-300' },
  { name: 'Utilities', color: '#FBBF24', bgColor: 'bg-amber-200', textColor: 'text-amber-900', borderColor: 'border-amber-400' },
  { name: 'Wellness', color: '#DB2777', bgColor: 'bg-pink-200', textColor: 'text-pink-900', borderColor: 'border-pink-400' },
  { name: 'Wholesale', color: '#FBBF24', bgColor: 'bg-amber-200', textColor: 'text-amber-900', borderColor: 'border-amber-400' },
]

export const CATEGORIES = [
  ...baseCategories,
  { name: 'Adult', color: '#6B21A8', bgColor: 'bg-purple-900', textColor: 'text-purple-100', borderColor: 'border-purple-700' },
  { name: 'Other', color: '#6B7280', bgColor: 'bg-gray-100', textColor: 'text-gray-800', borderColor: 'border-gray-300' },
]

export function getCategoryConfig(categoryName: string) {
  return CATEGORIES.find(cat => cat.name === categoryName) || CATEGORIES[0]
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
