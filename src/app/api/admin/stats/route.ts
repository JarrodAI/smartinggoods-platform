import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get overall platform statistics
    const [
      totalUsers,
      activeSubscriptions,
      totalWebsites,
      deployedWebsites,
      totalRevenue,
      recentSignups,
      popularTemplates
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active subscriptions
      prisma.user.count({
        where: {
          subscriptionStatus: 'active'
        }
      }),
      
      // Total websites
      prisma.website.count(),
      
      // Deployed websites
      prisma.website.count({
        where: {
          deploymentStatus: 'deployed'
        }
      }),
      
      // Total revenue (sum of successful payments)
      prisma.payment.aggregate({
        where: {
          status: 'succeeded'
        },
        _sum: {
          amount: true
        }
      }),
      
      // Recent signups (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Popular templates
      prisma.template.findMany({
        select: {
          name: true,
          type: true,
          usageCount: true,
          rating: true
        },
        orderBy: {
          usageCount: 'desc'
        },
        take: 5
      })
    ])

    // Calculate growth metrics
    const previousMonthUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    })

    const userGrowth = previousMonthUsers > 0 
      ? ((recentSignups - previousMonthUsers) / previousMonthUsers) * 100 
      : 0

    // Get recent activity
    const recentWebsites = await prisma.website.findMany({
      select: {
        id: true,
        name: true,
        deploymentStatus: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            businessName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      overview: {
        totalUsers,
        activeSubscriptions,
        totalWebsites,
        deployedWebsites,
        totalRevenue: totalRevenue._sum.amount || 0,
        recentSignups,
        userGrowth: Math.round(userGrowth * 100) / 100
      },
      popularTemplates,
      recentActivity: recentWebsites,
      metrics: {
        conversionRate: totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0,
        deploymentRate: totalWebsites > 0 ? (deployedWebsites / totalWebsites) * 100 : 0,
        averageRevenue: activeSubscriptions > 0 ? (totalRevenue._sum.amount || 0) / activeSubscriptions : 0
      }
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    )
  }
}