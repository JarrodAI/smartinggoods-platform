/**
 * Predictive Analytics API - Business Intelligence & Forecasting
 * Provides AI-powered insights and predictions for business optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { predictiveAnalyticsService } from '@/lib/ai/predictive-analytics';

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
    const { businessId, analysisType, data, timeframe } = body;

    if (!businessId || !analysisType) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, analysisType' },
        { status: 400 }
      );
    }

    let result;

    switch (analysisType) {
      case 'churn_prediction':
        result = await predictiveAnalyticsService.predictCustomerChurn(
          businessId,
          data?.customerId,
          timeframe || 30
        );
        break;

      case 'demand_forecast':
        result = await predictiveAnalyticsService.forecastDemand(
          businessId,
          data?.serviceId,
          timeframe || 30
        );
        break;

      case 'revenue_prediction':
        result = await predictiveAnalyticsService.predictRevenue(
          businessId,
          timeframe || 30
        );
        break;

      case 'customer_lifetime_value':
        result = await predictiveAnalyticsService.calculateCustomerLifetimeValue(
          businessId,
          data?.customerId
        );
        break;

      case 'optimal_pricing':
        result = await predictiveAnalyticsService.optimizePricing(
          businessId,
          data?.serviceId,
          data?.currentPrice
        );
        break;

      case 'inventory_optimization':
        result = await predictiveAnalyticsService.optimizeInventory(
          businessId,
          data?.productId,
          timeframe || 30
        );
        break;

      case 'staff_optimization':
        result = await predictiveAnalyticsService.optimizeStaffing(
          businessId,
          timeframe || 7
        );
        break;

      case 'marketing_roi':
        result = await predictiveAnalyticsService.predictMarketingROI(
          businessId,
          data?.campaignType,
          data?.budget
        );
        break;

      default:
        return NextResponse.json(
          { error: `Invalid analysis type: ${analysisType}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      analysisType,
      businessId,
      data: result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Predictive Analytics API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Predictive analysis failed',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// Get comprehensive business analytics dashboard
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

    // Generate comprehensive analytics dashboard
    const [
      churnRisk,
      demandForecast,
      revenuePrediction,
      customerInsights,
      operationalMetrics,
      marketingInsights
    ] = await Promise.all([
      predictiveAnalyticsService.getChurnRiskSummary(businessId),
      predictiveAnalyticsService.getDemandForecast(businessId, timeframe),
      predictiveAnalyticsService.getRevenueForecast(businessId, timeframe),
      predictiveAnalyticsService.getCustomerInsights(businessId),
      predictiveAnalyticsService.getOperationalMetrics(businessId),
      predictiveAnalyticsService.getMarketingInsights(businessId, timeframe)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        businessId,
        timeframe,
        dashboard: {
          churnRisk,
          demandForecast,
          revenuePrediction,
          customerInsights,
          operationalMetrics,
          marketingInsights
        },
        summary: {
          totalCustomers: customerInsights.totalCustomers,
          churnRiskCustomers: churnRisk.highRiskCustomers,
          predictedRevenue: revenuePrediction.predictedRevenue,
          growthRate: revenuePrediction.growthRate,
          topRecommendations: [
            ...churnRisk.recommendations.slice(0, 2),
            ...demandForecast.recommendations.slice(0, 2),
            ...marketingInsights.recommendations.slice(0, 1)
          ]
        },
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Analytics Dashboard API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate analytics dashboard',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}