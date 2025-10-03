import { NextRequest, NextResponse } from 'next/server';
import { upsellService } from '@/lib/ai/upsell-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generateRecommendations':
        const recommendations = await upsellService.generateRecommendations(
          params.customerId,
          params.businessId,
          params.currentService,
          params.context
        );
        return NextResponse.json({ recommendations });

      case 'createBundle':
        const bundle = await upsellService.createServiceBundle(
          params.businessId,
          params.bundleData
        );
        return NextResponse.json({ bundle });

      case 'getSmartBundles':
        const bundles = await upsellService.getSmartBundles(
          params.customerId,
          params.businessId
        );
        return NextResponse.json({ bundles });

      case 'trackConversion':
        await upsellService.trackConversion(
          params.recommendationId,
          params.accepted,
          params.revenue
        );
        return NextResponse.json({ success: true });

      case 'setupDefaultBundles':
        // Create default bundles for a business
        const defaultBundles = [
          {
            name: 'Complete Nail Care Package',
            description: 'Everything you need for perfect nails',
            serviceIds: ['service_1', 'service_2', 'service_3'],
            discountPercentage: 15
          },
          {
            name: 'Luxury Spa Experience',
            description: 'Pamper yourself with our premium services',
            serviceIds: ['service_1', 'service_4', 'service_5'],
            discountPercentage: 20
          },
          {
            name: 'Quick Refresh',
            description: 'Perfect for busy schedules',
            serviceIds: ['service_2', 'service_4'],
            discountPercentage: 10
          }
        ];

        const createdBundles = [];
        for (const bundleData of defaultBundles) {
          const created = await upsellService.createServiceBundle(
            params.businessId,
            bundleData
          );
          createdBundles.push(created);
        }

        return NextResponse.json({
          bundles: createdBundles,
          message: 'Default bundles created successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Upsell API error:', error);
    return NextResponse.json(
      { error: 'Failed to process upsell request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const type = searchParams.get('type'); // 'analytics'

  try {
    if (!businessId) {
      return NextResponse.json({
        service: 'AI-Powered Upselling and Cross-Selling',
        description: 'Intelligent product/service recommendations to maximize revenue',
        endpoints: {
          generateRecommendations: 'Generate AI-powered upsell recommendations',
          createBundle: 'Create optimized service bundles',
          getSmartBundles: 'Get personalized bundle recommendations',
          trackConversion: 'Track upsell acceptance and revenue',
          setupDefaultBundles: 'Set up default service bundles'
        },
        features: [
          'AI-powered recommendation engine',
          'Customer behavior analysis',
          'Dynamic service bundling',
          'Context-aware suggestions (booking, checkout, post-service)',
          'Conversion tracking and analytics',
          'Revenue optimization',
          'Personalized recommendations',
          'Bundle discount optimization'
        ]
      });
    }

    if (type === 'analytics') {
      const analytics = await upsellService.getUpsellAnalytics(businessId);
      return NextResponse.json({ analytics });
    }

    return NextResponse.json({
      businessId,
      message: 'Use POST endpoint with specific actions for upsell operations'
    });
  } catch (error) {
    console.error('Get upsell data error:', error);
    return NextResponse.json(
      { error: 'Failed to get upsell data' },
      { status: 500 }
    );
  }
}
