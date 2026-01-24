# URLSnag Terms of Service - Fees & Escrow

## Platform Fees

### Seller Platform Fee
- **Amount:** 1% of the final sale price
- **When Charged:** Upon successful payment by the buyer
- **Refundability:** Non-refundable
- **Purpose:** Platform operations, maintenance, and support
- **Approval:** Sellers must explicitly agree to this fee when listing a domain

### Buyer Fees
Buyers are responsible for the following fees in addition to the domain purchase price:

#### 1. Domain Transfer Fee
- **Amount:** $30-50 (estimated, varies by registrar)
- **Description:** ICANN transfer fee + registrar processing fee
- **Who Pays:** Buyer
- **Refundability:** Non-refundable if transfer is initiated

#### 2. Credit Card Processing Fee
- **Amount:** 2.9% + $0.30 (Stripe standard rates)
- **Description:** Payment processor fee for credit card transactions
- **Who Pays:** Buyer
- **Refundability:** Non-refundable

#### 3. Alternative Payment Methods
- **ACH Transfer:** 1% + $0.30 (lower fees available)
- **International Cards:** 3.5% + $0.30
- **American Express:** 3.5% + $0.30

## Fee Transparency

### Buyer Disclosure
Before completing payment, buyers will see:
- Domain sale price (agreed amount)
- URLSnag platform fee (1%)
- Estimated transfer fee
- Estimated credit card processing fee
- **Total amount due**
- Clear statement: "Seller receives full agreed amount minus 1% platform fee"
- Industry comparison chart showing URLSnag has the lowest fees

### Seller Disclosure
Before listing a domain, sellers will see:
- Platform fee amount in dollars (1% of expected sale price)
- Confirmation that they will receive the full agreed amount minus this fee
- Example: "If domain sells for $10,000, you receive $9,900 after 1% platform fee"
- Clear checkbox: "I agree to the 1% platform fee"

## Escrow & Payment Processing

### Payment Escrow
- **Provider:** Stripe Connect
- **Hold Duration:** 3-5 business days after domain transfer completion
- **Purpose:** Buyer protection and chargeback prevention
- **Release Condition:** Funds released to seller after chargeback window closes

### Payment Flow
1. Buyer submits offer with payment details
2. Seller accepts offer
3. Buyer completes payment through Stripe
4. Payment held in escrow
5. Domain transfer initiated
6. Upon successful transfer, funds released to seller
7. URLSnag platform fee (1%) retained by URLSnag

### Dispute Resolution
- **Responsibility:** Stripe handles all payment disputes and chargebacks
- **Support:** URLSnag does NOT handle payment disputes
- **Buyer Recourse:** Contact Stripe support directly for payment issues
- **Seller Recourse:** Contact Stripe support directly for non-payment issues
- **Chargeback Window:** Standard 60-180 days depending on card issuer

## Non-Refundable Fees

The following fees are **NON-REFUNDABLE** under all circumstances:

1. **URLSnag Platform Fee (1%)**
   - Charged upon successful payment
   - Non-refundable even if transfer fails
   - Non-refundable if buyer cancels after payment

2. **Credit Card Processing Fees**
   - Non-refundable
   - Retained by payment processor (Stripe)

3. **Domain Transfer Fees**
   - Non-refundable if transfer is initiated
   - Non-refundable if domain is already in transfer process

## Refundable Scenarios

Buyers may receive refunds in the following scenarios:

1. **Payment Not Completed**
   - If payment authorization fails, no charges apply
   - Buyer can retry payment

2. **Seller Does Not Accept Offer**
   - If seller rejects offer, no payment is charged
   - Offer expires after 30 days if not accepted

3. **Transfer Fails (Before Funds Released)**
   - If domain transfer fails before escrow release, buyer is refunded
   - Platform fee (1%) is NOT refunded
   - Transfer fee is NOT refunded
   - CC processing fee is NOT refunded
   - Only the domain purchase price is refunded

## Tax Compliance

### VAT/GST
- **EU Buyers:** VAT applied based on buyer location (17-27%)
- **Other Jurisdictions:** Local tax laws apply
- **Calculation:** Stripe's tax calculation API used for accuracy

### Tax Reporting
- URLSnag retains 1% platform fee as revenue
- Transfer and CC fees are pass-through (not revenue)
- All transactions tracked in Firestore for tax purposes

## Fee Modifications

- **Notice Period:** 30 days minimum notice before any fee changes
- **Existing Listings:** Fee changes do not apply to listings created before change date
- **New Listings:** New fee structure applies to all listings created after change date

## Seller Consent

By listing a domain on URLSnag, sellers explicitly agree to:
- 1% platform fee charged upon successful payment
- Fee is non-refundable
- Fee is deducted from sale price before payout
- Stripe handles all payment disputes (no URLSnag support for payment issues)
- Escrow hold period of 3-5 business days

## Buyer Consent

By submitting an offer and completing payment, buyers explicitly agree to:
- All fees disclosed in the payment breakdown
- Fees are non-refundable (except in specific scenarios listed above)
- Payment is held in Stripe escrow until domain transfer completes
- Stripe handles all payment disputes (no URLSnag support for payment issues)
- Chargeback window is standard 60-180 days

## Questions About Fees

For questions about:
- **Payment Processing:** Contact Stripe support (Stripe handles all payment issues)
- **Domain Transfer:** Contact your registrar or domain broker
- **Platform Policies:** Contact URLSnag support

URLSnag does NOT handle payment disputes or escrow issues - these are managed directly by Stripe.
