import Stripe from 'stripe'

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Calculate fees for a given amount
export const calculateFees = (amount: number) => {
  const platformFeePercent = 0.01 // 1%
  const platformFee = Math.round(amount * platformFeePercent * 100) / 100
  
  // Transfer fee (average estimate)
  const transferFee = 35
  
  // CC fee (2.9% + $0.30)
  const ccFeePercent = 0.029
  const ccFeeFixed = 0.30
  const ccFee = Math.round((amount + platformFee + transferFee) * ccFeePercent * 100) / 100 + ccFeeFixed
  
  const buyerTotal = amount + platformFee + transferFee + ccFee
  const sellerPayout = amount - platformFee
  
  return {
    salePrice: amount,
    platformFee,
    transferFee,
    ccFee,
    buyerTotal,
    sellerPayout,
  }
}

// Create a payment intent for an offer
export const createPaymentIntent = async (
  amount: number,
  currency: string,
  offerId: string,
  buyerId: string,
  sellerId: string,
  domain: string
) => {
  const fees = calculateFees(amount)
  
  // Amount in cents for Stripe
  const amountInCents = Math.round(fees.buyerTotal * 100)
  
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        offerId,
        buyerId,
        sellerId,
        domain,
        salePrice: amount.toString(),
        platformFee: fees.platformFee.toString(),
        transferFee: fees.transferFee.toString(),
        ccFee: fees.ccFee.toString(),
        sellerPayout: fees.sellerPayout.toString(),
      },
      description: `Domain purchase: ${domain}`,
      statement_descriptor: `URLSNAG ${domain}`,
    })
    
    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

// Create a transfer for seller payout (using Stripe Connect)
export const createSellerTransfer = async (
  amount: number,
  currency: string,
  stripeConnectAccountId: string,
  offerId: string,
  domain: string
) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      destination: stripeConnectAccountId,
      metadata: {
        offerId,
        domain,
        type: 'domain_sale_payout',
      },
      description: `Payout for domain sale: ${domain}`,
    })
    
    return transfer
  } catch (error) {
    console.error('Error creating seller transfer:', error)
    throw error
  }
}

// Retrieve payment intent details
export const getPaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw error
  }
}

// Refund a payment
export const refundPayment = async (paymentIntentId: string, reason: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: reason as 'duplicate' | 'fraudulent' | 'requested_by_customer',
      metadata: {
        reason,
      },
    })
    
    return refund
  } catch (error) {
    console.error('Error refunding payment:', error)
    throw error
  }
}

// Get Stripe Connect account details
export const getConnectAccount = async (accountId: string) => {
  try {
    const account = await stripe.accounts.retrieve(accountId)
    return account
  } catch (error) {
    console.error('Error retrieving Stripe Connect account:', error)
    throw error
  }
}

// Create Stripe Connect account for seller
export const createSellerConnectAccount = async (
  email: string,
  sellerId: string,
  businessName: string
) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      email,
      metadata: {
        sellerId,
        businessName,
      },
      business_type: 'individual',
      individual: {
        email,
      },
    })
    
    return account
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error)
    throw error
  }
}

// Create account link for seller onboarding
export const createAccountLink = async (accountId: string, refreshUrl: string, returnUrl: string) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: 'account_onboarding',
      refresh_url: refreshUrl,
      return_url: returnUrl,
    })
    
    return accountLink
  } catch (error) {
    console.error('Error creating account link:', error)
    throw error
  }
}
