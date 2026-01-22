// Firestore Collections Schema and Types

export type UserRole = 'user' | 'admin'
export type KYCStatus = 'pending' | 'approved' | 'rejected'
export type ListingStatus = 'pending_approval' | 'approved' | 'rejected' | 'sold'
export type PriceType = 'asking' | 'accepting_offers' | 'starting_bid'
export type TransactionStatus = 'pending_agreement' | 'pending_payment' | 'in_transfer' | 'completed' | 'disputed'
export type EscrowStatus = 'pending' | 'funded' | 'transferred' | 'completed' | 'disputed'
export type EscrowProvider = 'escrow.com' | 'sedo' | 'paypal'

export interface User {
  id: string
  name: string
  email: string
  profilePic: string
  role: UserRole
  domainsCount: number
  createdAt: Date
  verified: boolean
  kycStatus: KYCStatus
  totalSalesVolume: number
  totalFeesPaid: number
}

export interface Listing {
  id: string
  domain: string
  tld: string
  price: number
  priceType: PriceType
  category: string
  description: string
  sellerId: string
  thumbnail: string
  logo?: string
  status: ListingStatus
  approvedAt?: Date
  approvedBy?: string
  rejectionReason?: string
  verified: boolean
  offers: number
  views: number
  bids: number
  createdAt: Date
  endTime?: Date
  businessAssets: BusinessAsset[]
  socialMedia: SocialMedia[]
  variants: DomainVariant[]
}

export interface BusinessAsset {
  name: string
  included: boolean
  cost?: number
}

export interface SocialMedia {
  platform: string
  handle: string
  followers: number
  logo: string
}

export interface DomainVariant {
  domain: string
  tld: string
  included: boolean
  cost?: number
}

export interface Offer {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  amount: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
}

export interface Transaction {
  id: string
  listingId: string
  buyerId: string
  sellerId: string
  agreedPrice: number
  
  // Fees breakdown
  platformFee: number // 1% of agreedPrice
  escrowFee: number
  transferFee: number
  buyerTotal: number // agreedPrice + escrowFee + transferFee
  sellerReceives: number // agreedPrice - platformFee
  
  // Escrow details
  escrowProvider: EscrowProvider
  escrowId: string
  escrowStatus: EscrowStatus
  
  // Legal agreement
  agreementAcceptedBySeller: boolean
  agreementAcceptedByBuyer: boolean
  agreementAcceptedAt?: Date
  
  // Status
  status: TransactionStatus
  createdAt: Date
  completedAt?: Date
}

export interface Agreement {
  id: string
  transactionId: string
  sellerId: string
  buyerId: string
  domain: string
  agreedPrice: number
  platformFee: number
  escrowFee: number
  transferFee: number
  buyerTotal: number
  sellerReceives: number
  
  sellerAccepted: boolean
  sellerAcceptedAt?: Date
  buyerAccepted: boolean
  buyerAcceptedAt?: Date
  
  createdAt: Date
}

export interface DomainApproval {
  id: string
  listingId: string
  sellerId: string
  domain: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: Date
  reviewedAt?: Date
  reviewedBy?: string
  rejectionReason?: string
  notes?: string
}

// Fee calculation utilities
export const calculateFees = (agreedPrice: number) => {
  const platformFee = Math.round(agreedPrice * 0.01) // 1%
  const escrowFee = Math.round(agreedPrice * 0.025) // 2.5% (average)
  const transferFee = 12 // Average domain transfer fee
  
  return {
    platformFee,
    escrowFee,
    transferFee,
    buyerTotal: agreedPrice + escrowFee + transferFee,
    sellerReceives: agreedPrice - platformFee,
  }
}

// Format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin'
}

// Check if user is seller of listing
export const isSellerOfListing = (user: User | null, listing: Listing): boolean => {
  return user?.id === listing.sellerId
}
