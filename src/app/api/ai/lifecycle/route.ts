import { NextRequest, NextResponse } from 'next/server';
import { customerLifecycleService } from '@/lib/ai/customer-lifecycle';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'analyzeCustomer':
        const profile = await customerLifecycleService.analyzeCustomerLifecycle(
          params.customerId,
          params.businessId
        );
        return NextResponse.json({ profile });

      case 'predictChurn':
        const prediction = await customerLifecycleService.predictChurn(
          params.customerId,
          params.businessId
        );
        return NextResponse.json({ prediction });

      case 'createRetentionCampaign':
        const campaign = await customerLifecycleService.createRetentionCampaign(
          params.businessId,
          params.campaignData
        );
        return NextResponse.json({ campaign });

      case 'getAtRiskCustomers':
        const atRisk = await customerLifecycleService.getAtRiskCustomers(
          params.businessId,
          params.riskThreshold
        );
        return NextResponse.json({ customers: atRisk });

      case 'optimizeLifetimeValue':
        const optimization = await customerLifecycleService.optimizeCustomerValue(
          params.customerId,
          params.businessId
        );
        return NextResponse.json({ optimization });

      case 'setupAutomatedRetention':
        // Set up automated retention campaigns
        const campaigns = await customerLifecycleService.setupAutomatedRetention(
          params.businessId
        );
        return NextResponse.json({
          campaigns,
          message: 'Automated retention campaigns set up successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Lifecycle API error:', error);
    return NextResponse.json(
      { error: 'Failed to process lifecycle request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const customerId = searchParams.get('customerId');
  const type = searchParams.get('type'); // 'analytics', 'at-risk'

  try {
    if (!businessId) {
      return NextResponse.json({
        service: 'Customer Lifecycle Value Optimization',
        description: 'Predict customer lifetime value and implement retention strategies',
        endpoints: {
          analyzeCustomer: 'Analyze customer lifecycle and predict LTV',
          predictChurn: 'Predict churn probability and risk factors',
          createRetentionCampaign: 'Create targeted retention campaign',
          getAtRiskCustomers: 'Get list of at-risk customers',
          optimizeLifetimeValue: 'Get optimization strategies for customer',
          setupAutomatedRetention: 'Set up automated retention campaigns'
        },
        features: [
          'Lifetime value prediction',
          'Churn risk assessment',
          'Retention strategy recommendations',
          'Automated retention campaigns',
          'Customer segmentation',
          'Engagement tracking',
          'ROI optimization',
          'Personalized interventions'
        ]
      });
    }

    if (customerId) {
      const profile = await customerLifecycleService.analyzeCustomerLifecycle(
        customerId,
        businessId
      );
      return NextResponse.json({ profile });
    }

    if (type === 'at-risk') {
      const atRisk = await customerLifecycleService.getAtRiskCustomers(businessId, 0.7);
      return NextResponse.json({ customers: atRisk, count: atRisk.length });
    }

    if (type === 'analytics') {
      const analytics = await customerLifecycleService.getLifecycleAnalytics(businessId);
      return NextResponse.json({ analytics });
    }

    return NextResponse.json({
      businessId,
      message: 'Use POST endpoint with specific actions or add query parameters'
    });
  } catch (error) {
    console.error('Get lifecycle data error:', error);
    return NextResponse.json(
      { error: 'Failed to get lifecycle data' },
      { status: 500 }
    );
  }
}
