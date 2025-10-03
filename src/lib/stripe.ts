import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function createCheckoutSession({
  priceId,
  customerId,
  successUrl,
  cancelUrl,
  mode = 'subscription'
}: {
  priceId: string
  customerId: string
  successUrl: string
  cancelUrl: string
  mode?: 'subscription' | 'payment'
}) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })
}

export async function createCustomer({
  email,
  name,
  businessName
}: {
  email: string
  name: string
  businessName?: string
}) {
  return await stripe.customers.create({
    email,
    name,
    metadata: {
      businessName: businessName || '',
    },
  })
}

export async function getCustomerSubscriptions(customerId: string) {
  return await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
  })
}

export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId)
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}