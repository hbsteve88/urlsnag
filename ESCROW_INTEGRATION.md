# Escrow Integration Guide

## Overview
URLSNAG uses escrow services to protect both buyers and sellers in domain transactions. This guide explains how to integrate Escrow.com (recommended) into your platform.

---

## Why Escrow?

**Protects Buyers:**
- Funds held until domain transfer confirmed
- Dispute resolution if transfer fails
- Money-back guarantee if issues arise

**Protects Sellers:**
- Payment guaranteed before transfer
- Escrow verifies buyer's funds
- Professional dispute handling

**Protects URLSNAG:**
- Reduces fraud and chargebacks
- Professional transaction management
- Legal compliance and documentation

---

## Escrow.com Integration

### Step 1: Create Escrow.com Account

1. Go to [Escrow.com](https://www.escrow.com)
2. Sign up for a business account
3. Complete verification process
4. Get your API credentials

### Step 2: Get API Credentials

1. Log into Escrow.com dashboard
2. Go to Settings → API
3. Generate API key and secret
4. Add to your `.env.local`:

```
NEXT_PUBLIC_ESCROW_API_KEY=your_api_key
NEXT_PUBLIC_ESCROW_API_SECRET=your_api_secret
NEXT_PUBLIC_ESCROW_MERCHANT_ID=your_merchant_id
```

### Step 3: Implement Escrow Service

Create `/lib/escrow.ts`:

```typescript
import axios from 'axios'

const ESCROW_API_BASE = 'https://api.escrow.com/api/v1'

interface CreateEscrowParams {
  buyerEmail: string
  sellerEmail: string
  amount: number
  domain: string
  description: string
}

export const escrowService = {
  // Create new escrow transaction
  async createTransaction(params: CreateEscrowParams) {
    try {
      const response = await axios.post(
        `${ESCROW_API_BASE}/transactions`,
        {
          buyer_email: params.buyerEmail,
          seller_email: params.sellerEmail,
          amount: params.amount,
          item_name: params.domain,
          item_description: params.description,
          payment_method: 'wire_transfer',
          release_method: 'mutual_release',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESCROW_API_KEY}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error creating escrow transaction:', error)
      throw error
    }
  },

  // Get transaction status
  async getTransactionStatus(escrowId: string) {
    try {
      const response = await axios.get(
        `${ESCROW_API_BASE}/transactions/${escrowId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESCROW_API_KEY}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching escrow status:', error)
      throw error
    }
  },

  // Release funds to seller
  async releaseFunds(escrowId: string) {
    try {
      const response = await axios.post(
        `${ESCROW_API_BASE}/transactions/${escrowId}/release`,
        {},
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESCROW_API_KEY}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error releasing escrow funds:', error)
      throw error
    }
  },

  // Refund buyer
  async refundBuyer(escrowId: string, reason: string) {
    try {
      const response = await axios.post(
        `${ESCROW_API_BASE}/transactions/${escrowId}/refund`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_ESCROW_API_KEY}`,
          },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error refunding escrow:', error)
      throw error
    }
  },
}
```

---

## Transaction Flow

### Step 1: Buyer Makes Offer
```
Buyer → Makes Offer on Domain
        ↓
Seller → Accepts Offer
        ↓
Agreement Created (pending_agreement status)
```

### Step 2: Both Accept Agreement
```
Seller → Reviews & Accepts Agreement
         ↓
Buyer → Reviews & Accepts Agreement
        ↓
Transaction Status: pending_payment
```

### Step 3: Escrow Created
```
System → Creates Escrow Transaction
         ↓
Buyer → Funds Escrow Account
        ↓
Escrow Status: funded
```

### Step 4: Domain Transfer
```
Seller → Initiates Domain Transfer
         ↓
Buyer → Confirms Transfer Received
        ↓
Escrow Status: transferred
```

### Step 5: Funds Released
```
Escrow → Releases Funds to Seller
         ↓
Seller → Receives Payment
         ↓
Transaction Status: completed
```

---

## Firestore Security Rules for Transactions

Add these rules to your Firestore:

```javascript
// Transactions collection
match /transactions/{transactionId} {
  // Both parties can read their own transactions
  allow read: if request.auth.uid == resource.data.buyerId || 
                 request.auth.uid == resource.data.sellerId ||
                 request.auth.token.admin == true;
  
  // Only system can create (via backend)
  allow create: if false;
  
  // Only system can update (via backend)
  allow update: if false;
}

// Agreements collection
match /agreements/{agreementId} {
  // Both parties can read
  allow read: if request.auth.uid == resource.data.buyerId || 
                 request.auth.uid == resource.data.sellerId;
  
  // Both parties can update their acceptance
  allow update: if (request.auth.uid == resource.data.buyerId && 
                    request.resource.data.buyerAccepted == true) ||
                   (request.auth.uid == resource.data.sellerId && 
                    request.resource.data.sellerAccepted == true);
}
```

---

## Backend Implementation (Node.js/Express)

Create a backend endpoint to handle escrow creation:

```typescript
// pages/api/transactions/create-escrow.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'
import { escrowService } from '@/lib/escrow'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { transactionId, buyerEmail, sellerEmail, amount, domain } = req.body

    // Create escrow transaction
    const escrowData = await escrowService.createTransaction({
      buyerEmail,
      sellerEmail,
      amount,
      domain,
      description: `Domain purchase: ${domain}`,
    })

    // Update Firestore transaction with escrow ID
    await updateDoc(doc(db, 'transactions', transactionId), {
      escrowId: escrowData.id,
      escrowStatus: 'pending',
      escrowProvider: 'escrow.com',
    })

    res.status(200).json({
      success: true,
      escrowId: escrowData.id,
      escrowUrl: escrowData.url,
    })
  } catch (error) {
    console.error('Error creating escrow:', error)
    res.status(500).json({ error: 'Failed to create escrow transaction' })
  }
}
```

---

## Webhook Handling

Escrow.com sends webhooks when transaction status changes:

```typescript
// pages/api/webhooks/escrow.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { escrowId, status, transactionId } = req.body

    // Map escrow status to our status
    const statusMap: Record<string, string> = {
      pending: 'pending_payment',
      funded: 'in_transfer',
      transferred: 'in_transfer',
      completed: 'completed',
      disputed: 'disputed',
      refunded: 'disputed',
    }

    // Update transaction in Firestore
    await updateDoc(doc(db, 'transactions', transactionId), {
      escrowStatus: status,
      status: statusMap[status] || status,
    })

    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error processing escrow webhook:', error)
    res.status(500).json({ error: 'Failed to process webhook' })
  }
}
```

---

## Alternative Escrow Providers

### Sedo Escrow
- **Best for:** Domain-specific transactions
- **Fee:** ~2% of transaction
- **Integration:** Similar API structure
- **Website:** https://www.sedo.com

### PayPal Goods & Services
- **Best for:** Smaller transactions
- **Fee:** ~3% + fixed fee
- **Integration:** PayPal API
- **Website:** https://www.paypal.com

---

## Testing Escrow Integration

### Development Mode
1. Use Escrow.com sandbox environment
2. Create test transactions
3. Verify webhook handling
4. Test status updates

### Production Checklist
- [ ] Escrow API credentials configured
- [ ] Webhook endpoint live and tested
- [ ] Error handling implemented
- [ ] Logging enabled for debugging
- [ ] User notifications set up
- [ ] Dispute resolution process documented

---

## User Notifications

Send emails at each stage:

**Buyer:**
1. Offer accepted → "Escrow created, fund your account"
2. Funds received → "Waiting for seller to transfer domain"
3. Transfer confirmed → "Domain transfer in progress"
4. Complete → "Domain transfer complete!"

**Seller:**
1. Offer accepted → "Agreement pending"
2. Agreement accepted → "Waiting for buyer to fund escrow"
3. Funds received → "Please transfer domain now"
4. Complete → "Payment received! ($X.XX)"

---

## Troubleshooting

### Escrow Transaction Not Created
- Check API credentials in `.env.local`
- Verify email addresses are valid
- Check amount is positive number
- Review API response for errors

### Webhook Not Received
- Verify webhook URL is public and accessible
- Check firewall/security rules
- Enable webhook logging
- Test with Escrow.com webhook tester

### Funds Not Released
- Verify domain transfer confirmed
- Check escrow status in dashboard
- Ensure both parties accepted
- Contact Escrow.com support

---

## Resources

- [Escrow.com API Docs](https://www.escrow.com/api)
- [Sedo Escrow Integration](https://www.sedo.com)
- [Domain Transfer Best Practices](https://icann.org/resources/pages/transfer-2013-12-02-en)
