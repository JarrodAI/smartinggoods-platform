import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const templates = await prisma.template.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
        ...(featured === 'true' && { isFeatured: true })
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        category: true,
        features: true,
        pricing: true,
        usageCount: true,
        rating: true,
        reviewCount: true,
        isFeatured: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { usageCount: 'desc' }
      ]
    })

    return NextResponse.json({ templates })

  } catch (error) {
    console.error('Templates list error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, type, description, category, features, pricing } = await request.json()

    const template = await prisma.template.create({
      data: {
        name,
        type,
        description,
        category,
        features,
        pricing,
        isActive: true,
        isFeatured: false,
        usageCount: 0,
        rating: 0,
        reviewCount: 0,
      }
    })

    return NextResponse.json({ template })

  } catch (error) {
    console.error('Template creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}