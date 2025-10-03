import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { email, name, businessName } = await request.json()

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        businessName: businessName || '',
      },
    })

    return NextResponse.json({ customerId: customer.id })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { error: 'Error creating customer' },
      { status: 500 }
    )
  }
}