/**
 * Revenue Optimization API - AI-Powered Revenue Enhancement
 * Provides intelligent upselling, cross-selling, and pricing optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revenueOptimizationService } from '@/lib/ai/revenue-optimization';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { businessId, action, data } = body;

    if (!businessId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, action' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'get_upsell_recommendations':
        result = await revenueOptimizationService.getUpsellRecommendations(
          businessId,
          data.customerId,
          data.currentService,
          data.customerHistory
        );
        break;

      case 'get_cross_sell_recommendations':
        result = await revenueOptimizationService.getCrossSellRecommendations(
          businessId,
          data.customerId,
          data.currentServices,
          data.customerProfile
        );
        break;

      case 'optimize_pricing':
        result = await revenueOptimizationService.optimizePricing(
          businessId,
          data.serviceId,
          data.currentPrice,
          data.demandData
        );
        break;

      case 'create_bundle':
        result = await revenueOptimizationService.createServiceBundle(
          businessId,
          data.services,
          data.targetMargin,
          data.customerSegment
        );
        break;

      case 'calculate_clv':
        result = await revenueOptimizationService.calculateCustomerLifetimeValue(
          businessId,
          data.customerId,
          data.timeframe
        );
        break;

      case 'optimize_inventory':
        result = await revenueOptimizationService.optimizeInventoryPricing(
          businessId,
          data.productId,
          data.stockLevel,
          data.demandForecast
        );
        break;

      case 'dynamic_pricing':
        result = await revenueOptimizationService.getDynamicPricing(
          businessId,
          data.serviceId,
          data.timeSlot,
          data.demandLevel
        );
        break;

      case 'retention_strategy':
        result = await revenueOptimizationService.getRetentionStrategy(
          businessId,
          data.customerId,
          data.churnRisk
        );
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      businessId,
      data: result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Revenue Optimization API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Revenue optimization operation failed',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// Get comprehensive revenue optimization dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');
    const timeframe = parseInt(searchParams.get('timeframe') || '30');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing businessId parameter' },
        { status: 400 }
      );
    }

    // Generate comprehensive revenue optimization insights
    const [
      revenueMetrics,
      upsellOpportunities,
      pricingOptimization,
      customerSegments,
      bundleRecommendations,
      retentionInsights
    ] = await Promise.all([
      revenueOptimizationService.getRevenueMetrics(businessId, timeframe),
      revenueOptimizationService.getUpsellOpportunities(businessId),
      revenueOptimizationService.getPricingOptimization(businessId),
      revenueOptimizationService.getCustomerSegments(businessId),
      revenueOptimizationService.getBundleRecommendations(businessId),
      revenueOptimizationService.getRetentionInsights(businessId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        businessId,
        timeframe,
        dashboard: {
          revenueMetrics,
          upsellOpportunities,
          pricingOptimization,
          customerSegments,
          bundleRecommendations,
          retentionInsights
        },
        summary: {
          currentRevenue: revenueMetrics.currentRevenue,
          projectedRevenue: revenueMetrics.projectedRevenue,
          revenueGrowth: revenueMetrics.growthRate,
          upsellPotential: upsellOpportunities.totalPotential,
          averageOrderValue: revenueMetrics.averageOrderValue,
          customerLifetimeValue: revenueMetrics.averageCustomerLifetimeValue,
          topRecommendations: [
            ...upsellOpportunities.recommendations.slice(0, 2),
            ...pricingOptimization.recommendations.slice(0, 2),
            ...retentionInsights.recommendations.slice(0, 1)
          ]
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Revenue Optimization Dashboard API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate revenue optimization dashboard',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}