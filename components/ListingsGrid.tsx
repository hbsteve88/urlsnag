'use client'

import { Heart, MapPin, TrendingUp, Search, Filter, X, ChevronDown, Eye, EyeOff, Zap, Link2 } from 'lucide-react'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { getCategoryConfig, CATEGORIES } from '@/lib/categories'
import { Listing } from '@/lib/generateListings'
import { useCountdown } from '@/lib/useCountdown'
import { calculateTldStats, getTldDisplayLabel } from '@/lib/tldStats'
import OutbidNotification from './OutbidNotification'

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'offers-low' | 'offers-high' | 'popular'

const categories = ['all', ...CATEGORIES.map(cat => cat.name)]

interface ListingsGridProps {
  listings: Listing[]
  searchQuery: string
  filterCategory: string
  onCategoryChange: (category: string) => void
  onSelectListing?: (listing: Listing) => void
  savedListings?: Set<string>
  onToggleSave?: (id: string) => void
  advancedFilters?: {
    hasWebsite?: boolean
    hasLogo?: boolean
    hasSocialMedia?: boolean
    hasBusinessAssets?: boolean
    hasVariants?: boolean
  }
  onAdvancedFiltersChange?: (filters: {
    hasWebsite?: boolean
    hasLogo?: boolean
    hasSocialMedia?: boolean
    hasBusinessAssets?: boolean
    hasVariants?: boolean
  }) => void
}

const BASE_ITEMS_PER_PAGE = 100

// All available TLDs - Top 10 popular first, then alphabetical
const allTlds = [
  'all',
  // Top 10 most popular
  'com', 'net', 'org', 'io', 'co', 'app', 'dev', 'ai', 'tech', 'shop',
  // Rest alphabetical
  'academy', 'aero', 'adult', 'agency', 'analytics', 'anniversary', 'apartment', 'art', 'asia', 'attorney',
  'auction', 'author', 'auto', 'band', 'bank', 'bar', 'beach', 'beauty', 'bed', 'beer',
  'bet', 'bid', 'bike', 'biz', 'blog', 'blue', 'boat', 'book', 'bot', 'box',
  'br', 'brand', 'bread', 'brewery', 'bridge', 'broker', 'brother', 'brown', 'build', 'builder',
  'business', 'buy', 'buzz', 'ca', 'cab', 'cafe', 'cake', 'call', 'camera', 'camp',
  'can', 'canal', 'cancel', 'candy', 'capital', 'car', 'card', 'care', 'career', 'cargo',
  'casino', 'cat', 'catch', 'catering', 'cause', 'cave', 'cc', 'center', 'ceo', 'ch',
  'chat', 'cheap', 'check', 'cheese', 'chef', 'chemical', 'chess', 'chicken', 'child', 'children',
  'china', 'choice', 'christmas', 'church', 'cinema', 'circle', 'city', 'civil', 'claim', 'class',
  'clean', 'click', 'clinic', 'clothing', 'cloud', 'club', 'cn', 'coach', 'coast', 'code',
  'coffee', 'coop', 'corp', 'company', 'community', 'concert', 'conduct', 'confirm', 'connect', 'consulting',
  'contact', 'content', 'contest', 'control', 'convention', 'cook', 'cool', 'coop', 'copy', 'coral',
  'core', 'corn', 'correct', 'cost', 'cottage', 'country', 'couple', 'course', 'court', 'cousin',
  'cove', 'cover', 'coyote', 'crab', 'craft', 'cram', 'crane', 'crash', 'crater', 'crawl',
  'crazy', 'cream', 'credit', 'creek', 'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop',
  'cross', 'crouch', 'crowd', 'crucial', 'cruel', 'cruise', 'crumb', 'crunch', 'crush', 'cry',
  'crystal', 'cube', 'culture', 'cup', 'cupboard', 'curious', 'current', 'curtain', 'curve', 'cushion',
  'custom', 'cute', 'cycle', 'dad', 'damage', 'damp', 'dance', 'danger', 'dare', 'dash',
  'date', 'dating', 'daughter', 'dawn', 'day', 'deal', 'debate', 'debris', 'debt', 'debut',
  'decade', 'decide', 'decimal', 'deck', 'decor', 'decrease', 'deer', 'defense', 'define', 'defy',
  'degree', 'delay', 'deliver', 'delivery', 'demand', 'demise', 'denial', 'dentist', 'deny', 'depart',
  'depend', 'deposit', 'depth', 'deputy', 'derive', 'describe', 'desert', 'design', 'desk', 'despair',
  'destroy', 'detail', 'detect', 'develop', 'device', 'devil', 'devise', 'devote', 'diagram', 'dial',
  'diamond', 'diary', 'dice', 'diesel', 'diet', 'differ', 'digital', 'dignify', 'dilemma', 'dinner',
  'dinosaur', 'direct', 'dirt', 'disagree', 'discover', 'disease', 'dish', 'dismiss', 'disorder', 'display',
  'distance', 'divert', 'divide', 'divorce', 'dizzy', 'doctor', 'document', 'dog', 'doll', 'dolphin',
  'domain', 'donate', 'donkey', 'donor', 'door', 'dose', 'double', 'dove', 'draft', 'dragon',
  'drama', 'drastic', 'draw', 'dream', 'dress', 'drift', 'drill', 'drink', 'drip', 'drive',
  'drop', 'drove', 'drown', 'drug', 'drum', 'drunk', 'dry', 'duck', 'dumb', 'dune',
  'dungeon', 'duplex', 'dusk', 'dust', 'dutch', 'duty', 'dwarf', 'dwell', 'dynamic', 'eager',
  'eagle', 'early', 'earn', 'earth', 'easily', 'east', 'easy', 'echo', 'ecology', 'economy',
  'ecosystem', 'edge', 'edit', 'educate', 'education', 'effect', 'effort', 'egg', 'eight', 'either',
  'elbow', 'elder', 'electric', 'elegant', 'element', 'elephant', 'elevate', 'elite', 'else', 'email',
  'embrace', 'emerge', 'emotion', 'employ', 'empower', 'empty', 'enable', 'enact', 'end', 'endless',
  'endorse', 'enemy', 'energy', 'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlarge', 'enough',
  'enrich', 'enroll', 'ensure', 'enter', 'entire', 'entry', 'envelope', 'episode', 'equal', 'equip',
  'era', 'erase', 'erect', 'erode', 'erosion', 'error', 'erupt', 'escape', 'escrow', 'esports',
  'essay', 'essence', 'estate', 'eternal', 'ethics', 'eth', 'ethnic', 'ethos', 'europe', 'evacuate',
  'evade', 'evaluate', 'evaporate', 'even', 'evening', 'event', 'ever', 'evoke', 'evolve', 'exact',
  'example', 'excess', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exercise', 'exhaust', 'exhibit',
  'exile', 'exist', 'exit', 'expand', 'expect', 'expire', 'explain', 'expose', 'express', 'extend',
  'extra', 'eye', 'eyebrow', 'fabric', 'face', 'faculty', 'fade', 'faint', 'faith', 'fall',
  'false', 'fame', 'family', 'famous', 'fan', 'fancy', 'fantasy', 'farm', 'fashion', 'fat',
  'fatal', 'father', 'fatigue', 'fault', 'favorite', 'feature', 'february', 'federal', 'fee', 'feed',
  'feel', 'feet', 'feign', 'feline', 'female', 'fence', 'festival', 'fetch', 'fever', 'few',
  'fiber', 'fiction', 'field', 'figure', 'file', 'film', 'filter', 'final', 'find', 'fine',
  'finger', 'finish', 'fire', 'firm', 'first', 'fiscal', 'fish', 'fit', 'fitness', 'fix',
  'flag', 'flame', 'flash', 'flat', 'flavor', 'flee', 'fleet', 'flesh', 'flight', 'flip',
  'float', 'flock', 'floor', 'flower', 'fluid', 'flush', 'fly', 'foam', 'focus', 'fog',
  'foil', 'fold', 'follow', 'food', 'foot', 'force', 'forest', 'forget', 'fork', 'fortune',
  'forum', 'forward', 'fossil', 'foster', 'found', 'fox', 'fragile', 'frame', 'frequent', 'fresh',
  'friend', 'fringe', 'frog', 'front', 'frost', 'frown', 'frozen', 'fruit', 'fuel', 'fun',
  'funny', 'furnace', 'fury', 'future', 'gadget', 'gain', 'galaxy', 'gallery', 'game', 'gaming',
  'gap', 'garage', 'garbage', 'garden', 'garlic', 'garment', 'gas', 'gasp', 'gate', 'gather',
  'gauge', 'gaze', 'general', 'genius', 'genre', 'gentle', 'genuine', 'gesture', 'ghost', 'giant',
  'gift', 'giggle', 'ginger', 'giraffe', 'girl', 'give', 'glad', 'glance', 'glare', 'glass',
  'glide', 'glimpse', 'globe', 'gloom', 'glory', 'glove', 'glow', 'glue', 'goat', 'goddess',
  'gold', 'good', 'goose', 'gorilla', 'gospel', 'gossip', 'govern', 'gown', 'grab', 'grace',
  'grain', 'grant', 'grape', 'grass', 'gravity', 'great', 'green', 'grid', 'grief', 'grit',
  'grocery', 'group', 'grow', 'grunt', 'guard', 'guess', 'guide', 'guilt', 'guitar', 'gun',
  'gym', 'habit', 'hair', 'half', 'hammer', 'hamster', 'hand', 'happy', 'harbor', 'hard',
  'harsh', 'harvest', 'hat', 'have', 'hawk', 'hazard', 'head', 'health', 'heart', 'heavy',
  'hedgehog', 'height', 'hello', 'helmet', 'help', 'hen', 'hero', 'hidden', 'high', 'hill',
  'hint', 'hip', 'hire', 'history', 'hobby', 'hockey', 'hold', 'hole', 'holiday', 'hollow',
  'home', 'honey', 'hood', 'hope', 'horn', 'horror', 'horse', 'hospital', 'host', 'hotel',
  'hour', 'hover', 'hub', 'huge', 'human', 'humble', 'humor', 'hundred', 'hungry', 'hunt',
  'hurdle', 'hurry', 'hurt', 'husband', 'hybrid', 'hydrogen', 'hygiene', 'hymn', 'hypothesis', 'hysterical',
  'ice', 'icon', 'idea', 'identify', 'identity', 'idle', 'ignore', 'ill', 'illegal', 'illness',
  'image', 'imitate', 'immense', 'immoral', 'immune', 'impact', 'impose', 'improve', 'impulse', 'in',
  'inch', 'include', 'income', 'increase', 'index', 'indicate', 'indoor', 'indulge', 'industry', 'infant',
  'inflict', 'inform', 'inhale', 'inherit', 'initial', 'inject', 'injury', 'inmate', 'inner', 'innocent',
  'input', 'inquiry', 'insane', 'insect', 'inside', 'inspire', 'install', 'intact', 'interest', 'into',
  'invest', 'invite', 'involve', 'inward', 'io', 'ion', 'iota', 'iris', 'iron', 'irony',
  'island', 'isolate', 'issue', 'item', 'ivory', 'jacket', 'jaguar', 'jar', 'jazz', 'jealous',
  'jeans', 'jelly', 'jewel', 'job', 'jobs', 'join', 'joke', 'journey', 'joy', 'judge',
  'juice', 'jump', 'jungle', 'junior', 'junk', 'just', 'kangaroo', 'keen', 'keep', 'ketchup',
  'key', 'kick', 'kid', 'kidney', 'kind', 'kingdom', 'kiss', 'kit', 'kitchen', 'kite',
  'kitten', 'kiwi', 'knee', 'knife', 'knock', 'know', 'lab', 'label', 'labor', 'ladder',
  'lady', 'lake', 'lamp', 'language', 'laptop', 'large', 'later', 'latin', 'laugh', 'laundry',
  'lava', 'law', 'lawn', 'lawsuit', 'lawyer', 'layer', 'lazy', 'leader', 'leaf', 'learn',
  'leave', 'lecture', 'left', 'legal', 'legend', 'leisure', 'lemon', 'lend', 'length', 'lens',
  'leopard', 'lesson', 'letter', 'level', 'liar', 'liberty', 'library', 'license', 'life', 'lift',
  'light', 'like', 'limb', 'limit', 'link', 'lion', 'liquid', 'list', 'listen', 'literal',
  'literary', 'literature', 'little', 'live', 'lizard', 'load', 'loan', 'lobster', 'local', 'lock',
  'logic', 'lonely', 'long', 'loop', 'lottery', 'loud', 'lounge', 'love', 'lovely', 'lover',
  'low', 'loyal', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'luxury', 'lyrics', 'machine',
  'mad', 'magic', 'magnet', 'maid', 'mail', 'main', 'major', 'make', 'mammal', 'man',
  'manage', 'mane', 'mango', 'mansion', 'manual', 'many', 'map', 'marble', 'march', 'margin',
  'marine', 'market', 'marriage', 'mask', 'mass', 'master', 'match', 'material', 'math', 'matrix',
  'matter', 'maximum', 'maze', 'meadow', 'mean', 'measure', 'meat', 'mechanic', 'medal', 'media',
  'melody', 'melt', 'member', 'memory', 'mention', 'menu', 'mercy', 'merge', 'merit', 'merry',
  'mesh', 'message', 'metal', 'method', 'middle', 'midnight', 'milk', 'million', 'mimic', 'mind',
  'minimum', 'minor', 'minute', 'miracle', 'mirror', 'mischief', 'miss', 'mistake', 'mix', 'mixed',
  'mixture', 'mobile', 'model', 'modify', 'mom', 'moment', 'monitor', 'monkey', 'monster', 'month',
  'moon', 'moral', 'more', 'morning', 'mosquito', 'mother', 'motion', 'motor', 'mountain', 'mouse',
  'move', 'movie', 'much', 'muffin', 'mule', 'multiply', 'muscle', 'museum', 'mushroom', 'music',
  'must', 'mutual', 'myself', 'mystery', 'myth', 'mythic', 'name', 'nanny', 'napkin', 'narrow',
  'nasty', 'nation', 'nature', 'near', 'neck', 'need', 'negative', 'neglect', 'neither', 'nephew',
  'nerve', 'nest', 'net', 'network', 'neutral', 'never', 'news', 'next', 'nice', 'night',
  'noble', 'noise', 'nomad', 'noodle', 'normal', 'north', 'nose', 'notable', 'note', 'nothing',
  'notice', 'novel', 'now', 'nuclear', 'number', 'nurse', 'nut', 'oak', 'obey', 'object',
  'oblige', 'obscure', 'observe', 'obtain', 'obvious', 'occur', 'ocean', 'october', 'odor', 'off',
  'offer', 'office', 'often', 'oil', 'okay', 'old', 'olive', 'olympic', 'omit', 'once',
  'one', 'onion', 'online', 'only', 'open', 'opera', 'opinion', 'oppose', 'option', 'orange',
  'orbit', 'orchard', 'order', 'ordinary', 'organ', 'orient', 'original', 'orphan', 'ostrich', 'other',
  'outdoor', 'outer', 'output', 'outside', 'oval', 'oven', 'over', 'own', 'owner', 'oxygen',
  'oyster', 'ozone', 'pact', 'paddle', 'page', 'paid', 'pail', 'pain', 'paint', 'pair',
  'palace', 'palm', 'panda', 'panel', 'panic', 'panther', 'paper', 'parade', 'parent', 'park',
  'parrot', 'party', 'pass', 'patch', 'path', 'patient', 'patrol', 'pattern', 'pause', 'pave',
  'payment', 'peace', 'peanut', 'pear', 'peasant', 'pelican', 'pen', 'penalty', 'pencil', 'people',
  'pepper', 'perfect', 'permit', 'person', 'pet', 'phone', 'photo', 'photography', 'phrase', 'physical',
  'piano', 'picnic', 'picture', 'piece', 'pig', 'pigeon', 'pill', 'pilot', 'pink', 'pioneer',
  'pipe', 'pistol', 'pitch', 'pizza', 'place', 'planet', 'plastic', 'plate', 'play', 'please',
  'pledge', 'pluck', 'plug', 'plunge', 'poem', 'poet', 'point', 'polar', 'pole', 'police',
  'pond', 'pony', 'pool', 'popular', 'portion', 'position', 'possible', 'post', 'potato', 'pottery',
  'poverty', 'powder', 'power', 'practice', 'praise', 'predict', 'prefer', 'prepare', 'present', 'pretty',
  'prevent', 'price', 'pride', 'primary', 'print', 'priority', 'prison', 'private', 'prize', 'problem',
  'process', 'produce', 'profit', 'program', 'project', 'promote', 'proof', 'property', 'prosper', 'protect',
  'proud', 'provide', 'public', 'pudding', 'pull', 'pulp', 'pulse', 'pumpkin', 'punch', 'pupil',
  'puppy', 'purchase', 'purity', 'purpose', 'purse', 'push', 'put', 'puzzle', 'pyramid', 'quality',
  'quantum', 'quarter', 'question', 'quick', 'quiet', 'quill', 'quit', 'quiz', 'quote', 'rabbit',
  'raccoon', 'race', 'rack', 'radar', 'radio', 'rail', 'rain', 'raise', 'rally', 'ramp',
  'ranch', 'random', 'range', 'rank', 'rapid', 'rare', 'rate', 'rather', 'raven', 'raw',
  'razor', 'ready', 'real', 'reason', 'rebel', 'rebuild', 'recall', 'receive', 'recipe', 'record',
  'recycle', 'reduce', 'reflect', 'reform', 'refuse', 'region', 'regret', 'regular', 'reject', 'relax',
  'release', 'relief', 'rely', 'remain', 'remember', 'remind', 'remove', 'render', 'renew', 'rent',
  'reopen', 'repair', 'repeat', 'replace', 'report', 'require', 'rescue', 'resemble', 'resist', 'resource',
  'response', 'result', 'retire', 'retreat', 'return', 'reunion', 'reveal', 'review', 'reward', 'rhythm',
  'rib', 'ribbon', 'rice', 'rich', 'ride', 'ridge', 'rifle', 'right', 'rigid', 'ring',
  'riot', 'ripple', 'risk', 'ritual', 'rival', 'river', 'road', 'roast', 'robot', 'robust',
  'rocket', 'romance', 'roof', 'rookie', 'room', 'rose', 'rotate', 'rough', 'round', 'route',
  'royal', 'rubber', 'rude', 'rug', 'rule', 'run', 'runway', 'rural', 'sad', 'saddle',
  'sadness', 'safe', 'sail', 'sake', 'salad', 'salmon', 'salon', 'salt', 'salute', 'same',
  'sample', 'sand', 'satisfy', 'satoshi', 'sauce', 'sausage', 'save', 'say', 'scale', 'scan',
  'scare', 'scatter', 'scene', 'scent', 'school', 'science', 'scissors', 'scorpion', 'scout', 'scrap',
  'screen', 'script', 'scrub', 'sea', 'search', 'season', 'seat', 'second', 'secret', 'section',
  'security', 'seed', 'seek', 'seem', 'seen', 'self', 'sell', 'seminar', 'senior', 'sense',
  'sentence', 'series', 'service', 'session', 'settle', 'setup', 'seven', 'shadow', 'shaft', 'shallow',
  'share', 'shed', 'shell', 'sheriff', 'shield', 'shift', 'shine', 'ship', 'shiver', 'shock',
  'shoe', 'shoot', 'shop', 'short', 'shot', 'should', 'shoulder', 'shove', 'shrimp', 'shrug',
  'shuffle', 'shun', 'shutter', 'shy', 'sibling', 'sick', 'side', 'siege', 'sight', 'sign',
  'silent', 'silk', 'silly', 'silver', 'similar', 'simple', 'since', 'sing', 'siren', 'sister',
  'site', 'situate', 'six', 'size', 'sketch', 'ski', 'skill', 'skin', 'skirt', 'skull',
  'slab', 'slam', 'sleep', 'slender', 'slice', 'slide', 'slight', 'slim', 'slogan', 'slot',
  'slow', 'slush', 'small', 'smart', 'smile', 'smoke', 'smooth', 'snack', 'snake', 'snap',
  'sniff', 'snow', 'snug', 'soak', 'soap', 'soar', 'soccer', 'social', 'sock', 'soda',
  'soft', 'solar', 'soldier', 'solid', 'solution', 'solve', 'someone', 'song', 'soon', 'sorry',
  'sort', 'soul', 'sound', 'soup', 'source', 'south', 'space', 'spare', 'spatial', 'spawn',
  'speak', 'special', 'speed', 'spell', 'spend', 'sphere', 'spice', 'spider', 'spike', 'spin',
  'spirit', 'split', 'spoil', 'spoke', 'sponge', 'spoon', 'spore', 'sport', 'spot', 'spray',
  'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stable', 'stadium', 'staff', 'stage',
  'stairs', 'stamp', 'stand', 'start', 'state', 'stay', 'steak', 'steel', 'stem', 'step',
  'stereo', 'stick', 'still', 'sting', 'stink', 'stock', 'stomach', 'stone', 'stool', 'story',
  'stove', 'strategy', 'street', 'strike', 'string', 'strip', 'stroke', 'strong', 'struck', 'student',
  'studio', 'stuff', 'stumble', 'stump', 'stung', 'stunk', 'style', 'subject', 'submit', 'subway',
  'success', 'such', 'sudden', 'suffer', 'sugar', 'suggest', 'suit', 'summer', 'sun', 'sunny',
  'sunset', 'super', 'supply', 'supreme', 'sure', 'surface', 'surge', 'surprise', 'surround', 'survey',
  'suspect', 'sustain', 'swallow', 'swamp', 'swap', 'swarm', 'swear', 'sweat', 'sweep', 'sweet',
  'swift', 'swim', 'swing', 'switch', 'sword', 'swore', 'sworn', 'swum', 'swing', 'symbol',
  'symptom', 'syrup', 'system', 'table', 'tackle', 'tag', 'tail', 'talent', 'talk', 'tall',
  'talon', 'tame', 'tan', 'tangible', 'tank', 'tape', 'target', 'task', 'taste', 'tattoo',
  'taxi', 'teach', 'team', 'tell', 'ten', 'tenant', 'tend', 'tender', 'tennis', 'tent',
  'term', 'test', 'text', 'thank', 'that', 'theme', 'then', 'theory', 'there', 'they',
  'thing', 'this', 'thought', 'three', 'threw', 'throw', 'thrown', 'thrust', 'thumb', 'thunder',
  'ticket', 'tide', 'tidy', 'tie', 'tiger', 'tilt', 'timber', 'time', 'tiny', 'tip',
  'tired', 'tissue', 'title', 'toast', 'tobacco', 'today', 'toddler', 'toe', 'together', 'toilet',
  'token', 'told', 'toll', 'tomato', 'tomb', 'tome', 'tomorrow', 'tone', 'tongue', 'tonight',
  'tool', 'tooth', 'top', 'topic', 'topple', 'torch', 'tornado', 'tortoise', 'toss', 'total',
  'tourist', 'toward', 'tower', 'town', 'toy', 'track', 'trade', 'traffic', 'tragic', 'train',
  'transfer', 'trap', 'trash', 'travel', 'tray', 'treat', 'tree', 'trend', 'trial', 'triangle',
  'tribe', 'trick', 'tried', 'tries', 'trigger', 'trim', 'trip', 'tripod', 'triumph', 'trolley',
  'troop', 'tropical', 'trot', 'trouble', 'truck', 'true', 'truly', 'trumpet', 'trust', 'truth',
  'try', 'tube', 'tuition', 'tumble', 'tuna', 'tune', 'tunnel', 'turbo', 'turf', 'turkey',
  'turn', 'turtle', 'twelve', 'twenty', 'twice', 'twin', 'twine', 'twist', 'two', 'type',
  'typical', 'ugly', 'umbrella', 'unable', 'unaware', 'uncle', 'uncover', 'under', 'undo', 'unfair',
  'unfold', 'unhappy', 'uniform', 'unique', 'unit', 'universe', 'unknown', 'unlock', 'until', 'unusual',
  'unveil', 'update', 'upgrade', 'uphold', 'upon', 'upper', 'upset', 'urban', 'urge', 'usage',
  'use', 'used', 'useful', 'useless', 'usual', 'utility', 'vacant', 'vacuum', 'vague', 'valid',
  'valley', 'valve', 'van', 'vanish', 'vapor', 'various', 'vast', 'vault', 'vehicle', 'velvet',
  'vendor', 'venture', 'venue', 'verb', 'verify', 'version', 'very', 'vessel', 'veteran', 'viable',
  'vibrant', 'vicious', 'victory', 'video', 'view', 'village', 'vintage', 'violin', 'virtual', 'virus',
  'visa', 'visit', 'visual', 'vital', 'vivid', 'vocal', 'voice', 'void', 'volcano', 'volume',
  'vote', 'voyage', 'wager', 'wagon', 'wait', 'walk', 'wall', 'walnut', 'want', 'warfare',
  'warm', 'warrior', 'wash', 'wasp', 'waste', 'water', 'wave', 'way', 'wealth', 'weapon',
  'wear', 'weasel', 'weather', 'web', 'website', 'wed', 'wedding', 'weekend', 'weird', 'welcome',
  'west', 'wet', 'whale', 'what', 'wheat', 'wheel', 'when', 'where', 'whip', 'whisper',
  'wide', 'width', 'wife', 'wild', 'will', 'win', 'window', 'wine', 'wing', 'wink',
  'winner', 'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness', 'wizard', 'wobble', 'woke',
  'wolf', 'woman', 'wonder', 'wood', 'wool', 'word', 'work', 'world', 'worry', 'worth',
  'wrap', 'wreck', 'wrestle', 'wrist', 'write', 'wrong', 'wrote', 'xxx', 'xray', 'yacht',
  'yak', 'yard', 'yarn', 'yawn', 'yeah', 'year', 'yellow', 'you', 'young', 'youth',
  'youtube', 'yummy', 'zany', 'zap', 'zealous', 'zebra', 'zero', 'zone', 'zoo', 'zoom',
]

export default function ListingsGrid({
  listings,
  searchQuery,
  filterCategory,
  onCategoryChange,
  onSelectListing,
  savedListings: externalSavedListings,
  onToggleSave: externalOnToggleSave,
  advancedFilters = {},
  onAdvancedFiltersChange,
}: ListingsGridProps) {
  const [allListings, setAllListings] = useState<Listing[]>([])
  const [displayedListings, setDisplayedListings] = useState<Listing[]>([])
  const [internalSavedListings, setInternalSavedListings] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)
  const [showMore, setShowMore] = useState(false)
  const [showQuestionable, setShowQuestionable] = useState(false)
  const [filterTld, setFilterTld] = useState('all')
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [showGroupsOnly, setShowGroupsOnly] = useState(false)
  const [outbidNotifications, setOutbidNotifications] = useState<Array<{ id: string; listing: Listing }>>([])
  const [columnCount, setColumnCount] = useState(4)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Calculate items per page based on column count
  const getItemsPerPage = useCallback(() => {
    // Find the closest divisor to BASE_ITEMS_PER_PAGE that's divisible by columnCount
    let itemsPerPage = BASE_ITEMS_PER_PAGE
    const remainder = itemsPerPage % columnCount
    if (remainder !== 0) {
      itemsPerPage = itemsPerPage - remainder + columnCount
    }
    return itemsPerPage
  }, [columnCount])

  const ITEMS_PER_PAGE = getItemsPerPage()

  // Detect grid column count on mount and continuously monitor resize
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout
    const detectColumns = () => {
      if (gridRef.current) {
        const gridStyle = window.getComputedStyle(gridRef.current)
        const templateColumns = gridStyle.gridTemplateColumns
        const columns = templateColumns.split(' ').length
        setColumnCount((prevCount) => {
          if (prevCount !== columns) {
            setPage(1) // Reset page when columns change
          }
          return columns
        })
      }
    }

    detectColumns()
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(detectColumns, 150)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  // Use external saved listings if provided, otherwise use internal
  const savedListings = externalSavedListings || internalSavedListings
  const isSavedListingsExternal = !!externalSavedListings

  // Use listings from props
  useEffect(() => {
    setAllListings(listings)
  }, [listings])

  // Calculate TLD stats
  const tldStats = useMemo(() => {
    return calculateTldStats(allListings)
  }, [allListings])

  // Filter and sort listings
  useEffect(() => {
    const savedListingsSet = externalSavedListings || internalSavedListings
    let filtered = allListings.filter((listing) => {
      const matchesSearch =
        listing.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === ''
      const matchesCategory =
        filterCategory === 'all' || listing.category === filterCategory
      const matchesTld = filterTld === 'all' || listing.tld === filterTld
      const matchesContent =
        showQuestionable || listing.contentType === 'general'
      const matchesSaved = !showSavedOnly || savedListingsSet.has(listing.id)
      const matchesGroups = !showGroupsOnly || (listing as any).groupId

      // Apply advanced filters
      let matchesAdvanced = true
      if (advancedFilters) {
        if (advancedFilters.hasWebsite && !listing.hasWebsite) matchesAdvanced = false
        if (advancedFilters.hasLogo && !listing.hasLogo) matchesAdvanced = false
        if (advancedFilters.hasSocialMedia && !listing.hasSocialAccounts) matchesAdvanced = false
        if (advancedFilters.hasBusinessAssets && !listing.hasBusinessAssets) matchesAdvanced = false
        if (advancedFilters.hasVariants && (!listing.variants || listing.variants.length === 0)) matchesAdvanced = false
      }

      return matchesSearch && matchesCategory && matchesTld && matchesContent && matchesAdvanced && matchesSaved && matchesGroups
    })

    // Sort - promoted domains first, then by selected sort option
    filtered.sort((a, b) => {
      // First, sort by promoted status (promoted domains first)
      const aPromoted = (a as any).isPromoted ? 1 : 0
      const bPromoted = (b as any).isPromoted ? 1 : 0
      if (aPromoted !== bPromoted) {
        return bPromoted - aPromoted
      }

      // Then apply the selected sort option
      switch (sortBy) {
        case 'newest':
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
          return bTime - aTime
        case 'oldest':
          const aTimeOld = a.createdAt instanceof Date ? a.createdAt.getTime() : 0
          const bTimeOld = b.createdAt instanceof Date ? b.createdAt.getTime() : 0
          return aTimeOld - bTimeOld
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'offers-low':
          return a.offers - b.offers
        case 'offers-high':
          return b.offers - a.offers
        default:
          return 0
      }
    })

    setDisplayedListings(filtered.slice(0, ITEMS_PER_PAGE * page))
    setPage(1)
  }, [allListings, searchQuery, filterCategory, filterTld, showQuestionable, sortBy, advancedFilters, showSavedOnly, showGroupsOnly, externalSavedListings, internalSavedListings, ITEMS_PER_PAGE])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !showMore) {
          setShowMore(true)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [showMore])

  const handleShowMore = useCallback(() => {
    const nextPage = page + 1
    const savedListingsSet = externalSavedListings || internalSavedListings
    const filtered = allListings.filter((listing) => {
      const matchesSearch =
        listing.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === ''
      const matchesCategory =
        filterCategory === 'all' || listing.category === filterCategory
      const matchesTld = filterTld === 'all' || listing.tld === filterTld
      const matchesContent =
        showQuestionable || listing.contentType === 'general'
      const matchesSaved = !showSavedOnly || savedListingsSet.has(listing.id)
      return matchesSearch && matchesCategory && matchesTld && matchesContent && matchesSaved
    })

    let sorted = [...filtered]
    sorted.sort((a, b) => {
      // First, sort by promoted status (promoted domains first)
      const aPromoted = (a as any).isPromoted ? 1 : 0
      const bPromoted = (b as any).isPromoted ? 1 : 0
      if (aPromoted !== bPromoted) {
        return bPromoted - aPromoted
      }

      // Then apply the selected sort option
      switch (sortBy) {
        case 'popular':
          const aPopularity = (a.views || 0) + (a.bids || 0) * 2
          const bPopularity = (b.views || 0) + (b.bids || 0) * 2
          return bPopularity - aPopularity
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'offers-low':
          return a.offers - b.offers
        case 'offers-high':
          return b.offers - a.offers
        default:
          return 0
      }
    })

    setDisplayedListings(sorted.slice(0, ITEMS_PER_PAGE * nextPage))
    setPage(nextPage)
    setShowMore(false)
  }, [page, allListings, searchQuery, filterCategory, filterTld, showQuestionable, sortBy, showSavedOnly, externalSavedListings, internalSavedListings, ITEMS_PER_PAGE])

  const toggleSave = (id: string) => {
    if (externalOnToggleSave) {
      externalOnToggleSave(id)
    } else {
      const newSaved = new Set(internalSavedListings)
      if (newSaved.has(id)) {
        newSaved.delete(id)
      } else {
        newSaved.add(id)
      }
      setInternalSavedListings(newSaved)
    }
  }

  const addOutbidNotification = useCallback((listing: Listing) => {
    const id = `outbid-${listing.id}-${Date.now()}`
    setOutbidNotifications((prev) => [...prev, { id, listing }])
  }, [])

  const removeOutbidNotification = useCallback((id: string) => {
    setOutbidNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }, [])

  return (
    <section className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sticky Category Filter */}
        <div className="sticky top-16 z-40 bg-white border-b border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => {
              const getCatColor = (category: string) => {
                if (category === 'all') return '#3B82F6'
                const config = getCategoryConfig(category)
                return config.color
              }
              const catColor = getCatColor(cat)
              return (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  style={{
                    backgroundColor: filterCategory === cat ? catColor : catColor + '20',
                    color: filterCategory === cat ? 'white' : catColor,
                    borderColor: catColor,
                    borderWidth: '1px'
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition whitespace-nowrap hover:opacity-90"
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Sort and Filter Controls */}
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900">
            {displayedListings.length} Domains
          </h2>
          <div className="flex gap-4 flex-wrap">
            {/* Saved Domains Filter */}
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                showSavedOnly
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
              title="Show only saved domains"
            >
              {showSavedOnly ? (
                <>
                  <Heart className="w-4 h-4 fill-red-500" />
                  Saved only
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  All domains
                </>
              )}
            </button>

            {/* Groups Only Filter */}
            <button
              onClick={() => setShowGroupsOnly(!showGroupsOnly)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                showGroupsOnly
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
              title="Show only grouped domains"
            >
              {showGroupsOnly ? (
                <>
                  <Link2 className="w-4 h-4" />
                  Groups only
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  All domains
                </>
              )}
            </button>

            {/* Content Filter Toggle */}
            <button
              onClick={() => setShowQuestionable(!showQuestionable)}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                showQuestionable
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
              title="Toggle adult, gambling, and weapons content"
            >
              {showQuestionable ? (
                <>
                  <Eye className="w-4 h-4" />
                  Adult sites shown
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Adult sites hidden
                </>
              )}
            </button>

            {/* TLD Filter with Stats */}
            <div className="relative">
              <select
                value={filterTld}
                onChange={(e) => setFilterTld(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-10"
              >
                <option value="all">All Extensions</option>

                {/* Popular TLDs */}
                {tldStats.popular.length > 0 && (
                  <optgroup label="🔥 Popular">
                    {tldStats.popular.map((info) => (
                      <option key={info.tld} value={info.tld}>
                        .{info.tld} ({info.count})
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* By Location */}
                {Object.entries(tldStats.byLocation).map(([location, tlds]) => (
                  <optgroup key={location} label={`📍 ${location}`}>
                    {tlds.map((info) => (
                      <option key={info.tld} value={info.tld}>
                        .{info.tld} ({info.count})
                      </option>
                    ))}
                  </optgroup>
                ))}

                {/* By Volume */}
                {tldStats.byVolume.length > 0 && (
                  <optgroup label="📊 By Volume">
                    {tldStats.byVolume.slice(0, 20).map((info) => (
                      <option key={info.tld} value={info.tld}>
                        .{info.tld} ({info.count})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none pr-10"
              >
                <option value="popular">🔥 Popular (Traffic & Bids)</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="offers-low">Offers: Low to High</option>
                <option value="offers-high">Offers: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

          </div>
        </div>


        {/* Listings Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={savedListings.has(listing.id)}
              onToggleSave={() => toggleSave(listing.id)}
              onSelect={() => onSelectListing?.(listing)}
            />
          ))}
        </div>

        {displayedListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No domains found</p>
          </div>
        )}

        {/* Show More Button */}
        {displayedListings.length < allListings.length && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleShowMore}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Show More
            </button>
          </div>
        )}

        {/* Infinite Scroll Observer */}
        <div ref={observerTarget} className="h-4 mt-8" />
      </div>

      {/* Outbid Notifications Stack */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm">
        {outbidNotifications.map((notif) => (
          <OutbidNotification
            key={notif.id}
            listing={notif.listing}
            onClose={() => removeOutbidNotification(notif.id)}
          />
        ))}
      </div>
    </section>
  )
}

interface ListingCardProps {
  listing: Listing
  isSaved: boolean
  onToggleSave: () => void
  onSelect?: () => void
}

function ListingCard({ listing, isSaved, onToggleSave, onSelect }: ListingCardProps) {
  const countdown = useCountdown(listing.endTime)

  const getPriceTypeLabel = (type: string) => {
    switch (type) {
      case 'asking':
        return 'Asking'
      case 'accepting_offers':
        return 'Offers'
      case 'starting_bid':
        return 'Starting Bid'
      default:
        return 'Price'
    }
  }

  // Calculate font size based on domain name length
  const getDomainFontSize = (domain: string) => {
    const length = domain.length
    if (length <= 12) return 'text-3xl'     // 12 chars or less: large
    if (length <= 18) return 'text-2xl'     // 13-18 chars: medium
    if (length <= 24) return 'text-xl'      // 19-24 chars: small
    if (length <= 30) return 'text-lg'      // 25-30 chars: smaller
    return 'text-base'                      // 30+ chars: extra small
  }

  // Get category-specific color
  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      // Technology
      'Tech': '#3B82F6',
      'Software': '#1E40AF',
      'AI': '#0EA5E9',
      'Automation': '#06B6D4',
      'Robotics': '#14B8A6',
      'Hardware': '#10B981',
      'Cloud': '#8B5CF6',
      'Data': '#A855F7',
      'Analytics': '#D946EF',
      'Security': '#EC4899',
      'Privacy': '#F43F5E',
      'Telecom': '#EF4444',
      'Infrastructure': '#DC2626',
      'Networking': '#EA580C',
      // Commerce
      'Commerce': '#F59E0B',
      'Marketplace': '#FBBF24',
      'Retail': '#FCD34D',
      'Wholesale': '#FBBF24',
      'Payments': '#84CC16',
      'Finance': '#65A30D',
      'Banking': '#4ADE80',
      'Insurance': '#22C55E',
      'Accounting': '#16A34A',
      // Marketing & Media
      'Marketing': '#FB923C',
      'Advertising': '#F97316',
      'Branding': '#EA580C',
      'Media': '#DC2626',
      'Publishing': '#B91C1C',
      'Content': '#991B1B',
      'Social': '#7C3AED',
      'Community': '#6D28D9',
      // Health & Wellness
      'Health': '#EC4899',
      'Wellness': '#DB2777',
      'Fitness': '#BE185D',
      'Medical': '#F43F5E',
      'Biotech': '#E11D48',
      'Pharma': '#BE123C',
      // Education
      'Education': '#3B82F6',
      'Learning': '#1E40AF',
      'Training': '#1E3A8A',
      'Coaching': '#0EA5E9',
      'Courses': '#0284C7',
      // Real Estate
      'Realty': '#8B5CF6',
      'Property': '#7C3AED',
      'Construction': '#6D28D9',
      'Architecture': '#5B21B6',
      'Housing': '#A78BFA',
      // Automotive & Transport
      'Automotive': '#EF4444',
      'Mobility': '#DC2626',
      'Transport': '#B91C1C',
      'Logistics': '#991B1B',
      'Shipping': '#7F1D1D',
      // Travel & Hospitality
      'Travel': '#06B6D4',
      'Tourism': '#0891B2',
      'Hospitality': '#0E7490',
      'Events': '#14B8A6',
      // Food & Beverage
      'Food': '#F59E0B',
      'Beverage': '#FBBF24',
      // Agriculture
      'Agriculture': '#22C55E',
      'Farming': '#16A34A',
      // Energy
      'Energy': '#F59E0B',
      'Utilities': '#FBBF24',
      'Sustainability': '#84CC16',
      'Climate': '#65A30D',
      // Manufacturing
      'Manufacturing': '#64748B',
      'Industrial': '#475569',
      'Engineering': '#334155',
      'Materials': '#1E293B',
      // Legal & Government
      'Legal': '#1E40AF',
      'Compliance': '#1E3A8A',
      'Government': '#0C4A6E',
      'Civic': '#082F49',
      // Gaming & Entertainment
      'Gaming': '#8B5CF6',
      'Esports': '#7C3AED',
      'Entertainment': '#6D28D9',
      'Sports': '#EF4444',
      'Recreation': '#DC2626',
      // Lifestyle
      'Lifestyle': '#EC4899',
      'Fashion': '#DB2777',
      'Beauty': '#BE185D',
      'Luxury': '#9D174D',
      // Jobs & HR
      'Jobs': '#0EA5E9',
      'Careers': '#0284C7',
      'HR': '#0369A1',
      'Staffing': '#075985',
      // Services
      'Support': '#F59E0B',
      'Services': '#FBBF24',
      'Consulting': '#FCD34D',
    }
    return categoryColors[category] || '#3B82F6'
  }

  return (
    <div 
      onClick={onSelect}
      className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Thumbnail */}
      <div 
        className="relative w-full h-40 group rounded-b-lg border-4"
        style={{ 
          backgroundColor: getCategoryConfig(listing.category).color,
          borderColor: getCategoryConfig(listing.category).color
        }}
      >
        {listing.thumbnail.startsWith('stylized:') ? (
          (() => {
            const [, bgColor, domainName] = listing.thumbnail.split(':')
            const categoryConfig = getCategoryConfig(listing.category || 'Tech')
            
            // Calculate font size based on domain name length
            const getThumbnailFontSize = (domain: string) => {
              const length = domain.length
              if (length <= 12) return 'text-3xl'      // 12 chars or less: large
              if (length <= 18) return 'text-2xl'      // 13-18 chars: medium
              if (length <= 24) return 'text-xl'       // 19-24 chars: small
              if (length <= 30) return 'text-lg'       // 25-30 chars: smaller
              return 'text-base'                       // 30+ chars: extra small
            }
            
            return (
              <div
                style={{ backgroundColor: getCategoryConfig(listing.category).color }}
                className="w-full h-full flex items-center justify-center rounded-b-lg px-2"
              >
                <span className={`font-bold text-white text-center break-words ${getThumbnailFontSize(domainName)}`} style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                  {domainName}
                </span>
              </div>
            )
          })()
        ) : (
          <img
            src={listing.thumbnail}
            alt={listing.domain}
            className="w-full h-full object-cover rounded-b-lg"
          />
        )}
      </div>

      {/* Domain Name Section - Blue Background with Rounded Corners */}
      <div className="relative mt-1">
        <button
          onClick={onSelect}
          className={`w-full px-3 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 transition text-center rounded-lg break-words ${getDomainFontSize(listing.domain)}`}
          style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}
        >
          {listing.domain}
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow relative">
        {/* Price Label and Amount */}
        <div className="mb-3">
          {listing.priceType === 'accepting_offers' ? (
            <p className="text-3xl font-bold text-gray-900">Make Offer</p>
          ) : (
            <>
              <p className="text-sm text-gray-700 font-semibold">
                {listing.priceType === 'asking' && 'Asking Price'}
                {listing.priceType === 'starting_bid' && 'Starting Bid'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${listing.price.toLocaleString()}
              </p>
            </>
          )}
        </div>

        {/* Countdown Timer - Single Line */}
        {listing.endTime && (
          <div className="mb-3 text-xs text-orange-700 font-semibold">
            {countdown.isExpired ? (
              <p>Auction Ended</p>
            ) : (
              <p>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s remaining
              </p>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          {listing.hasReserve && listing.priceType !== 'starting_bid' && (
            <span className="text-blue-600 font-semibold">Reserve Met</span>
          )}
          {listing.contentType !== 'general' && (
            <span
              className={`font-semibold ${
                listing.contentType === 'adult'
                  ? 'text-red-600'
                  : listing.contentType === 'gambling'
                  ? 'text-orange-600'
                  : 'text-purple-600'
              }`}
            >
              {listing.contentType === 'adult'
                ? '🔞 Adult'
                : listing.contentType === 'gambling'
                ? '🎰 Gambling'
                : '⚔️ Weapons'}
            </span>
          )}
        </div>

        {/* Assets Pills */}
        {((listing as any).hasWebsite || (listing as any).hasLogo || (listing as any).hasBusinessAssets || (listing as any).hasSocialAccounts) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {(listing as any).hasWebsite && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Website
              </span>
            )}
            {(listing as any).hasLogo && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Logo
              </span>
            )}
            {(listing as any).hasBusinessAssets && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Assets
              </span>
            )}
            {(listing as any).hasSocialAccounts && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                Social
              </span>
            )}
          </div>
        )}

        {/* Bottom Row - Promoted Badge Left, Heart Right */}
        <div className="flex items-center justify-between mt-auto">
          {listing.isPromoted && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded-full">
              <Zap className="w-3 h-3 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-800">Promoted</span>
            </div>
          )}
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            {(listing as any).groupId && (
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Part of a domain group"
              >
                <Link2 className="w-5 h-5 text-purple-600" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleSave()
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              title={isSaved ? 'Remove from saved' : 'Save domain'}
            >
              <Heart
                className={`w-5 h-5 ${
                  isSaved ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
