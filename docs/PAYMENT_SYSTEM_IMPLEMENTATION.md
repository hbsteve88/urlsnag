# URLSnag Payment System Implementation Guide

## Overview

This guide covers the complete implementation of the URLSnag payment system with:
- Fee breakdown and transparency for buyers
- Competitor comparison chart
- Stripe payment processing
- Stripe Connect escrow for dispute handling
- Seller fee approval during listing creation
- No URLSnag support needed for payment disputes (Stripe handles everything)

## Architecture

### Components

1. **PaymentFlow.tsx** - Main payment UI component
   - Fee breakdown display
   - Competitor comparison chart
   - Multi-step payment flow (breakdown → payment → confirmation)
   - Escrow protection information

2. **DomainDetails.tsx** - Integration point
   - Offer submission modal
   - Offer confirmation modal
   - Payment flow trigger
   - Payment details storage in Firestore

3. **lib/stripe.ts** - Stripe API utilities
   - Fee calculation
   - Payment intent creation
   - Seller transfers (Stripe Connect)
   - Refund handling
   - Connect account management

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
# or
yarn install
```

This will install:
- `stripe` - Stripe server-side SDK
- `@stripe/stripe-js` - Stripe client-side SDK
- `@stripe/react-stripe-js` - React Stripe components

### Step 2: Environment Variables

Add to `.env.local`:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# Stripe Connect (for seller payouts)
STRIPE_CONNECT_ACCOUNT_ID=acct_xxxxx

# Webhook Secret (for payment confirmations)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Step 3: Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account or sign in
3. Enable Stripe Connect for seller payouts
4. Get API keys from Dashboard → API Keys
5. Set up webhooks for payment confirmations

### Step 4: Database Schema Updates

Add to Firestore `offers` collection:

```javascript
{
  // Existing fields
  listingId: string,
  domain: string,
  buyerId: string,
  buyerEmail: string,
  offerAmount: number,
  offerCurrency: string,
  message: string,
  
  // New fields
  status: 'pending' | 'pending_payment' | 'accepted' | 'completed' | 'failed' | 'cancelled',
  paymentDetails: {
    salePrice: number,
    platformFee: number,
    transferFee: number,
    ccFee: number,
    buyerTotal: number,
    sellerPayout: number,
    currency: string,
  },
  paymentIntentId: string,
  stripeConnectTransferId: string,
  createdAt: timestamp,
  acceptedAt: timestamp,
  paidAt: timestamp,
  completedAt: timestamp,
}
```

Add to Firestore `listings` collection:

```javascript
{
  // Existing fields
  domain: string,
  price: number,
  priceType: string,
  
  // New fields
  sellerApprovedFee: boolean, // Must be true to list
  sellerFeeApprovedAt: timestamp,
  stripeConnectAccountId: string, // Seller's Stripe Connect account
}
```

### Step 5: Create API Routes

Create `/app/api/payments/create-intent.ts`:

```typescript
import { createPaymentIntent } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, offerId, buyerId, sellerId, domain } = await request.json()

    const paymentIntent = await createPaymentIntent(
      amount,
      currency,
      offerId,
      buyerId,
      sellerId,
      domain
    )

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    )
  }
}
```

Create `/app/api/payments/webhook.ts`:

```typescript
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature')
  const body = await request.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig || '',
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as any
      const { offerId } = paymentIntent.metadata

      // Update offer status in Firestore
      const offersRef = collection(db, 'offers')
      const q = query(offersRef, where('id', '==', offerId))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        const offerDoc = snapshot.docs[0]
        await updateDoc(doc(db, 'offers', offerDoc.id), {
          status: 'paid',
          paidAt: new Date(),
          paymentIntentId: paymentIntent.id,
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook error' },
      { status: 400 }
    )
  }
}
```

### Step 6: Update Listing Creation

Add seller fee approval checkbox to domain listing form:

```typescript
const [agreedToSellerFee, setAgreedToSellerFee] = useState(false)

// In form validation
if (!agreedToSellerFee) {
  error('You must agree to the 1% platform fee')
  return
}

// When creating listing
await addDoc(collection(db, 'listings'), {
  // ... existing fields
  sellerApprovedFee: true,
  sellerFeeApprovedAt: serverTimestamp(),
})
```

## Fee Structure

### Buyer Pays
- **Domain Sale Price:** Full agreed amount (e.g., $10,000)
- **URLSnag Platform Fee:** 1% of sale price (e.g., $100)
- **Transfer Fee:** $30-50 (estimated, varies by registrar)
- **CC Processing Fee:** 2.9% + $0.30 (Stripe standard)

**Example for $10,000 domain:**
- Sale Price: $10,000
- Platform Fee (1%): $100
- Transfer Fee: $35
- CC Fee (2.9% + $0.30): $300
- **Buyer Total: $10,435**

### Seller Receives
- **Full Agreed Amount:** $10,000 (minus platform fee)
- **Seller Payout:** $9,900 (after 1% platform fee)

### URLSnag Revenue
- **Platform Fee:** 1% of sale price ($100 in example)
- **Non-refundable** under all circumstances

## Payment Flow

### Step 1: Offer Submission
1. Buyer fills out offer form (amount, currency, message)
2. Buyer checks "I agree to terms" checkbox
3. Buyer clicks "Submit Offer"

### Step 2: Offer Confirmation
1. Confirmation modal shows domain, amount, and currency
2. Buyer clicks "Confirm Offer"

### Step 3: Payment Breakdown
1. PaymentFlow component displays:
   - Domain name
   - Fee breakdown (sale price, platform fee, transfer fee, CC fee)
   - Total amount due
   - Seller payout info
   - Competitor comparison chart
   - Escrow protection information
2. Buyer clicks "Continue to Payment"

### Step 4: Payment Processing
1. Stripe payment form appears
2. Buyer enters card details
3. Payment is processed
4. Payment held in Stripe escrow

### Step 5: Confirmation
1. Success message displayed
2. Buyer receives confirmation email
3. Domain transfer initiated
4. Funds held in escrow until transfer completes
5. Seller receives payout after chargeback window closes

## Dispute Resolution

### No URLSnag Support Needed

All payment disputes are handled directly by Stripe:

- **Buyer Issues:** Contact Stripe support
- **Seller Issues:** Contact Stripe support
- **Chargebacks:** Handled by Stripe (60-180 day window)
- **Refunds:** Processed by Stripe

URLSnag does NOT:
- Handle payment disputes
- Process refunds
- Manage escrow
- Resolve chargebacks

## Security Considerations

1. **PCI Compliance:** Stripe handles all card data (no PCI burden on URLSnag)
2. **Escrow Protection:** Funds held in Stripe Connect until transfer completes
3. **Webhook Verification:** All webhooks verified with Stripe signature
4. **Environment Variables:** All secrets stored in `.env.local` (never committed)
5. **HTTPS Only:** All payment requests use HTTPS

## Testing

### Stripe Test Mode

Use these test card numbers:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **Requires Auth:** 4000 2500 0000 3155

Test expiry: Any future date
Test CVC: Any 3 digits

### Test Flow

1. Create a test domain listing
2. Submit test offer with test card
3. Verify payment appears in Stripe Dashboard
4. Check Firestore for updated offer status
5. Verify webhook received payment confirmation

## Monitoring

### Stripe Dashboard

Monitor:
- Payment volume and success rates
- Refund requests
- Dispute chargebacks
- Connect account payouts
- Failed payments

### Firestore

Monitor:
- Offer status distribution
- Payment details accuracy
- Fee calculations
- Payout amounts

### Logs

Monitor:
- Payment intent creation errors
- Webhook processing errors
- Stripe API errors
- Fee calculation discrepancies

## Compliance

### Tax Reporting

- Track all platform fees as revenue
- Transfer and CC fees are pass-through (not revenue)
- Generate tax reports from Firestore data
- File 1099s for sellers if applicable

### Terms of Service

See `docs/TERMS_OF_SERVICE_FEES.md` for complete legal language covering:
- Fee structure and timing
- Non-refundable fees
- Refund scenarios
- Escrow protection
- Dispute resolution
- Tax compliance

## Next Steps

1. **Set up Stripe account** (if not already done)
2. **Add environment variables** to `.env.local`
3. **Run `npm install`** to install Stripe dependencies
4. **Create API routes** for payment processing
5. **Update database schema** in Firestore
6. **Add seller fee approval** to listing creation form
7. **Test payment flow** with Stripe test cards
8. **Deploy to production** with live Stripe keys
9. **Monitor Stripe Dashboard** for payment activity

## Support

For issues:
- **Stripe Issues:** Contact Stripe support (stripe.com/support)
- **Payment Processing:** Check Stripe Dashboard logs
- **Firestore Issues:** Check Firebase Console
- **Code Issues:** Check application logs and error messages

## References

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
