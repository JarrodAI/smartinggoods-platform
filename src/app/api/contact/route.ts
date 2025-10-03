import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message, source } = await request.json()

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Save contact form submission
    const contactForm = await prisma.contactForm.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
        source: source || 'website',
        status: 'new'
      }
    })

    // TODO: Send notification email to admin
    // TODO: Send auto-reply email to customer
    // TODO: Add to CRM system

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.',
      id: contactForm.id
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}