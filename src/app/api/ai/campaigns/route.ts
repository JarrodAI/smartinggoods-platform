/**
 * Email and SMS Campaign Generation API
 * Creates personalized campaigns with A/B testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { campaignService } from '@/lib/ai/campaign-service';

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
    const { 
      businessId,
      type, // 'email' or 'sms'
      campaignType, // 'welcome', 'promotional', 'retention', 'winback'
      audience,
      subject,
      prompt,
      personalization = {},
      abTest = false,
      schedule = false,
      scheduledDate
    } = body;

    // Validate required fields
    if (!businessId || !type || !campaignType || !audience || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, type, campaignType, audience, prompt' },
        { status: 400 }
      );
    }

    // Generate campaign content
    const campaign = await campaignService.generateCampaign({
      businessId,
      type,
      campaignType,
      audience,
      subject,
      prompt,
      personalization,
      abTest,
      userId: session.user.id
    });

    // Schedule campaign if requested
    if (schedule && scheduledDate) {
      await campaignService.scheduleCampaign(campaign.id, new Date(scheduledDate));
    }

    return NextResponse.json({
      success: true,
      data: campaign
    });

  } catch (error) {
    console.error('Campaign Generation API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate campaign',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

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
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Get campaigns
    const campaigns = await campaignService.getCampaigns(businessId, { type, status });

    return NextResponse.json({
      success: true,
      data: campaigns
    });

  } catch (error) {
    console.error('Get Campaigns API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch campaigns',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { campaignId, action, data } = body;

    if (!campaignId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: campaignId, action' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'send':
        result = await campaignService.sendCampaign(campaignId);
        break;
      
      case 'pause':
        result = await campaignService.pauseCampaign(campaignId);
        break;
      
      case 'resume':
        result = await campaignService.resumeCampaign(campaignId);
        break;
      
      case 'update':
        result = await campaignService.updateCampaign(campaignId, data);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: send, pause, resume, or update' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Update Campaign API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update campaign',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}