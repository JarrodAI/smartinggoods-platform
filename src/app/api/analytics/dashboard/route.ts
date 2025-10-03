import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's websites
    const websites = await prisma.website.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        deploymentStatus: true,
        deploymentUrl: true,
        createdAt: true,
        deployedAt: true,
      }
    })

    // Get analytics data (mock data for now - replace with real analytics)
    const analytics = await prisma.analytics.findMany({
      where: {
        websiteId: { in: websites.map(w => w.id) },
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    })

    // Calculate totals
    const totalPageViews = analytics.reduce((sum, a) => sum + a.pageViews, 0)
    const totalUniqueVisits = analytics.reduce((sum, a) => sum + a.uniqueVisits, 0)
    const totalContactForms = analytics.reduce((sum, a) => sum + a.contactForms, 0)
    const totalPhoneClicks = analytics.reduce((sum, a) => sum + a.phoneClicks, 0)

    // Calculate previous period for comparison
    const previousAnalytics = await prisma.analytics.findMany({
      where: {
        websiteId: { in: websites.map(w => w.id) },
        date: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const previousPageViews = previousAnalytics.reduce((sum, a) => sum + a.pageViews, 0)
    const previousUniqueVisits = previousAnalytics.reduce((sum, a) => sum + a.uniqueVisits, 0)
    const previousContactForms = previousAnalytics.reduce((sum, a) => sum + a.contactForms, 0)

    return NextResponse.json({
      websites: {
        total: websites.length,
        deployed: websites.filter(w => w.deploymentStatus === 'deployed').length,
        draft: websites.filter(w => w.deploymentStatus === 'draft').length,
      },
      analytics: {
        pageViews: {
          current: totalPageViews,
          previous: previousPageViews,
          change: previousPageViews > 0 ? ((totalPageViews - previousPageViews) / previousPageViews) * 100 : 0
        },
        uniqueVisits: {
          current: totalUniqueVisits,
          previous: previousUniqueVisits,
          change: previousUniqueVisits > 0 ? ((totalUniqueVisits - previousUniqueVisits) / previousUniqueVisits) * 100 : 0
        },
        contactForms: {
          current: totalContactForms,
          previous: previousContactForms,
          change: previousContactForms > 0 ? ((totalContactForms - previousContactForms) / previousContactForms) * 100 : 0
        },
        phoneClicks: totalPhoneClicks,
      },
      recentWebsites: websites.slice(0, 5),
    })

  } catch (error) {
    console.error('Dashboard analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}