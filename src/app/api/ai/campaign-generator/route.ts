import { NextRequest, NextResponse } from 'next/server';
import { campaignGeneratorService } from '@/lib/ai/campaign-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generate':
        const campaign = await campaignGeneratorService.generateCampaign(params);
        return NextResponse.json({ campaign });

      case 'send':
        const result = await campaignGeneratorService.sendCampaign(
          params.campaignId,
          params.businessId
        );
        return NextResponse.json({ result });

      case 'getTemplates':
        const templates = await campaignGeneratorService.getCampaignTemplates(
          params.businessType,
          params.category
        );
        return NextResponse.json({ templates });

      case 'quickCampaign':
        // Generate and send a campaign in one step
        const quickCampaign = await campaignGeneratorService.generateCampaign({
          businessId: params.businessId,
          type: params.type || 'email',
          category: params.category || 'promotional',
          goal: params.goal || 'Drive bookings',
          targetAudience: params.targetAudience || 'all_customers',
          tone: params.tone || 'friendly',
          includeOffer: params.includeOffer !== false,
          offerDetails: params.offerDetails || '20% off your next visit',
          variantCount: 2
        });

        return NextResponse.json({
          campaign: quickCampaign,
          message: 'Campaign generated and ready to send'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Campaign generator API error:', error);
    return NextResponse.json(
      { error: 'Failed to process campaign request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const type = searchParams.get('type'); // 'analytics', 'templates'

  try {
    if (!businessId) {
      return NextResponse.json({
        service: 'Advanced Campaign Generation',
        description: 'AI-powered email and SMS campaign creation with A/B testing',
        endpoints: {
          generate: 'Generate AI-powered campaign with variants',
          send: 'Send campaign via email or SMS',
          getTemplates: 'Get pre-built campaign templates',
          quickCampaign: 'Generate campaign with default settings'
        },
        features: [
          'AI-powered content generation',
          'A/B testing with multiple variants',
          'Multi-channel campaigns (email + SMS)',
          'Personalization and dynamic content',
          'Campaign templates library',
          'Automated scheduling',
          'Performance analytics',
          'Audience segmentation'
        ]
      });
    }

    if (type === 'analytics') {
      const analytics = await campaignGeneratorService.getCampaignAnalytics(businessId);
      return NextResponse.json({ analytics });
    }

    if (type === 'templates') {
      const templates = await campaignGeneratorService.getCampaignTemplates('beauty');
      return NextResponse.json({ templates });
    }

    return NextResponse.json({
      businessId,
      message: 'Use POST endpoint with specific actions for campaign operations'
    });
  } catch (error) {
    console.error('Get campaign data error:', error);
    return NextResponse.json(
      { error: 'Failed to get campaign data' },
      { status: 500 }
    );
  }
}
