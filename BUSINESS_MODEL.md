# URLSNAG Business Model & Fee Structure

## Overview
URLSNAG is a domain marketplace with a transparent fee structure, legal binding agreements, and escrow-based transactions.

---

## Access Levels

### User Roles
1. **Regular User**
   - Can browse all domains
   - Can make offers on domains
   - Can list domains (requires verification)
   - Can accept/reject offers
   - Cannot approve listings or manage platform

2. **Admin**
   - Full access to all features
   - Can approve/reject domain listings
   - Can view all transactions and offers
   - Can manage user accounts
   - Can view platform analytics and fees
   - Can modify platform settings

### User Collection Structure
```
/users/{userId}
  name: string
  email: string
  profilePic: string
  role: "user" | "admin"
  domainsCount: number
  createdAt: timestamp
  verified: boolean
  kycStatus: "pending" | "approved" | "rejected"
  totalSalesVolume: number
  totalFesPaid: number
```

---

## Domain Listing Approval System

### Listing Lifecycle
1. **Seller creates listing** → Status: `pending_approval`
2. **Admin reviews listing** → Checks for:
   - Valid domain ownership
   - Legitimate content
   - No prohibited domains
   - Complete information
3. **Admin approves/rejects** → Status: `approved` or `rejected`
4. **Approved listings appear** in marketplace
5. **Buyers can make offers**

### Listings Collection Structure
```
/listings/{listingId}
  domain: string
  tld: string
  price: number
  priceType: "asking" | "accepting_offers" | "starting_bid"
  category: string
  description: string
  sellerId: string
  thumbnail: string
  logo: string
  
  // Approval workflow
  status: "pending_approval" | "approved" | "rejected" | "sold"
  approvedAt: timestamp
  approvedBy: string (admin userId)
  rejectionReason: string (if rejected)
  
  // Listing details
  verified: boolean
  offers: number
  createdAt: timestamp
  endTime: timestamp (for auctions)
  businessAssets: array
  socialMedia: array
  variants: array
```

---

## Fee Structure

### Listing Fees
- **Sellers**: FREE to list domains
- **Buyers**: FREE to browse and make offers

### Transaction Fees (When Agreement is Made)
- **Seller Platform Fee**: 1% of agreed sale price
- **Buyer Additional Fees**: 
  - Escrow service fee: ~2-3% (varies by escrow provider)
  - Domain transfer fee: ~$8-15 (varies by registrar)
  - **Total buyer cost**: Agreed price + escrow fee + transfer fee
- **Seller receives**: Agreed price (minus 1% platform fee)

### Fee Examples

**Example 1: $10,000 Domain Sale**
```
Agreed Price:           $10,000
Seller Platform Fee:    -$100 (1%)
Seller Receives:        $9,900

Buyer Pays:
  Agreed Price:         $10,000
  Escrow Fee (2.5%):    +$250
  Transfer Fee:         +$12
  Total Buyer Cost:     $10,262
```

**Example 2: $50,000 Domain Sale**
```
Agreed Price:           $50,000
Seller Platform Fee:    -$500 (1%)
Seller Receives:        $49,500

Buyer Pays:
  Agreed Price:         $50,000
  Escrow Fee (2.5%):    +$1,250
  Transfer Fee:         +$12
  Total Buyer Cost:     $51,262
```

---

## Escrow Integration

### Why Escrow?
- **Protects both parties** in domain transactions
- **Ensures domain transfer** before payment release
- **Holds funds** until all conditions met
- **Resolves disputes** professionally

### Recommended Escrow Providers
1. **Escrow.com** (Industry standard for domains)
   - Established 1999
   - Handles millions in transactions
   - Domain-specific experience
   - Fee: ~2-3% of transaction value

2. **Sedo Escrow** (Domain-specific)
   - Specialized in domain transfers
   - Integrated with registrars
   - Fee: ~2% of transaction value

3. **PayPal Goods & Services** (Budget option)
   - Lower fees (~3%)
   - Less specialized for domains
   - Buyer protection only

### Transaction Flow with Escrow
```
1. Buyer makes offer → Seller accepts
2. Agreement created → Both parties notified
3. Legal contract generated → Both must accept
4. Escrow account opened → Buyer funds escrow
5. Domain transferred → Seller initiates transfer
6. Escrow releases funds → To seller's account
7. Transaction complete
```

### Transactions Collection Structure
```
/transactions/{transactionId}
  listingId: string
  buyerId: string
  sellerId: string
  agreedPrice: number
  
  // Fees breakdown
  platformFee: number (1% of agreedPrice)
  escrowFee: number
  transferFee: number
  buyerTotal: number (agreedPrice + escrowFee + transferFee)
  sellerReceives: number (agreedPrice - platformFee)
  
  // Escrow details
  escrowProvider: "escrow.com" | "sedo" | "paypal"
  escrowId: string
  escrowStatus: "pending" | "funded" | "transferred" | "completed" | "disputed"
  
  // Legal agreement
  agreementAcceptedBySeller: boolean
  agreementAcceptedByBuyer: boolean
  agreementAcceptedAt: timestamp
  
  // Status
  status: "pending_agreement" | "pending_payment" | "in_transfer" | "completed" | "disputed"
  createdAt: timestamp
  completedAt: timestamp
```

---

## Legal Binding Agreement

### What Buyers & Sellers Must Understand
1. **This is a legal binding contract**
2. **Fees are non-refundable** once accepted
3. **Domain transfer is final** and irreversible
4. **Escrow holds funds** until transfer confirmed
5. **Both parties responsible** for their obligations

### Agreement Template
```
DOMAIN PURCHASE AGREEMENT

This agreement is entered into between:
SELLER: [Seller Name] ([Seller Email])
BUYER: [Buyer Name] ([Buyer Email])

DOMAIN: [domain.tld]
AGREED PRICE: $[amount]

SELLER'S OBLIGATIONS:
- Transfer domain within 5 business days
- Provide all necessary credentials
- Ensure domain is free of liens
- Maintain domain until transfer complete

BUYER'S OBLIGATIONS:
- Fund escrow account within 24 hours
- Accept domain in current condition
- Complete domain transfer process
- Pay all agreed fees

FEES & COSTS:
- Seller Platform Fee: 1% of agreed price ($[amount])
- Escrow Service Fee: ~2-3% ($[amount])
- Domain Transfer Fee: ~$8-15 ($[amount])
- Buyer Total Cost: $[total]
- Seller Receives: $[amount after fees]

PAYMENT & ESCROW:
- Funds held by [Escrow Provider]
- Released upon successful transfer
- Dispute resolution through escrow

BINDING NATURE:
By accepting this agreement, both parties acknowledge:
✓ This is a legally binding contract
✓ All terms are final and non-negotiable
✓ Fees are non-refundable
✓ Domain transfer is irreversible

Both parties must digitally sign to proceed.
```

### Agreement Acceptance Flow
1. Agreement generated with all terms
2. Seller reviews and accepts/rejects
3. Buyer reviews and accepts/rejects
4. Both must accept before escrow opens
5. Timestamp recorded for legal purposes

---

## Admin Dashboard Features

### Pending Approvals
- List of all pending domain listings
- Seller information and history
- Domain details and verification status
- Approve/Reject buttons with reason field

### Transaction Management
- View all active transactions
- Monitor escrow status
- Resolve disputes
- View fee analytics

### User Management
- View all users
- Promote users to admin
- View user history and reputation
- Ban/suspend accounts if needed

### Analytics
- Total platform fees collected
- Transaction volume
- Average transaction value
- User growth metrics

---

## Seller Dashboard Features

### My Listings
- All listings with status (pending, approved, rejected)
- Rejection reasons if applicable
- Resubmit rejected listings
- View offers received

### My Sales
- Completed transactions
- Platform fees paid
- Total revenue
- Payment history

---

## Buyer Dashboard Features

### My Offers
- Active offers made
- Offer history
- Accepted agreements
- Completed purchases

### My Domains
- Purchased domains
- Transfer status
- Domain management links

---

## Security & Compliance

### KYC (Know Your Customer)
- Required for sellers before listing
- Email verification
- Optional: Phone verification
- Optional: ID verification for high-value sales

### Dispute Resolution
- Escrow provider handles disputes
- URLSNAG mediates if needed
- 30-day dispute window
- Final resolution binding

### Fraud Prevention
- Monitor for suspicious activity
- Flag unusual patterns
- Verify domain ownership
- Escrow provides protection

---

## Implementation Roadmap

### Phase 1: Core System (Current)
- ✅ User roles (user/admin)
- ✅ Domain approval workflow
- ✅ Fee structure documentation
- 🔄 Firestore collections setup
- 🔄 Admin dashboard

### Phase 2: Escrow Integration
- Escrow.com API integration
- Payment processing
- Transfer coordination
- Dispute handling

### Phase 3: Legal & Compliance
- Agreement template system
- Digital signature integration
- Compliance documentation
- Audit trails

### Phase 4: Analytics & Optimization
- Dashboard analytics
- Fee reporting
- User analytics
- Performance optimization

---

## Key Principles

1. **Transparency**: All fees clearly displayed upfront
2. **Protection**: Escrow protects both parties
3. **Fairness**: 1% fee is minimal and sustainable
4. **Legal**: Binding agreements protect everyone
5. **Trust**: Clear processes build marketplace confidence
