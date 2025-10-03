import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContentGenerationService } from '@/lib/ai/content-generation';

const contentService = new ContentGenerationService();

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
    const { action, ...params } = body;

    switch (action) {
      case 'generate_content':
        const content = await contentService.generateContent({
          businessId: session.user.id,
          ...params
        });
        return NextResponse.json({ success: true, content });

      case 'generate_variations':
        const variations = await contentService.generateContentVariations(
          { businessId: session.user.id, ...params },
          params.count || 3
        );
        return NextResponse.json({ success: true, variations });

      case 'generate_calendar':
        const calendar = await contentService.generateContentCalendar(
          session.user.id,
          params.days || 30,
          params.postsPerDay || 1
        );
        return NextResponse.json({ success: true, calendar });

      case 'generate_email_campaign':
        const emailCampaign = await contentService.generateEmailCampaign(
          session.user.id,
          params.campaignType,
          params.customerSegment
        );
        return NextResponse.json({ success: true, campaign: emailCampaign });

      case 'generate_sms_campaign':
        const smsCampaign = await contentService.generateSMSCampaign(
          session.user.id,
          params.campaignType,
          params.customerName
        );
        return NextResponse.json({ success: true, campaign: smsCampaign });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Content generation API error:', error);
    return NextResponse.json(
      { error: 'Content generation failed' },
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
    const action = searchParams.get('action');

    switch (action) {
      case 'content_templates':
        // Return available content templates
        const templates = {
          social_post: [
            'Service Highlight',
            'Behind the Scenes',
            'Customer Testimonial',
            'Educational Tip',
            'Seasonal Promotion',
            'Before & After',
            'Team Spotlight'
          ],
          email: [
            'Welcome Series',
            'Promotional Campaign',
            'Newsletter',
            'Win-back Campaign',
            'Birthday Special',
            'Appointment Reminder',
            'Follow-up Survey'
          ],
          sms: [
            'Appointment Reminder',
            'Promotional Offer',
            'Birthday Greeting',
            'Follow-up Message',
            'Booking Confirmation',
            'Last-minute Availability',
            'Loyalty Reward'
          ]
        };
        return NextResponse.json({ success: true, templates });

      case 'content_performance':
        // Return content performance metrics (mock data for now)
        const performance = {
          totalPosts: 45,
          avgEngagement: 8.5,
          topPerformingType: 'behind_the_scenes',
          bestPostingTime: '2:00 PM',
          bestPlatform: 'instagram',
          monthlyGrowth: 15.3
        };
        return NextResponse.json({ success: true, performance });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Content API GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content data' },
      { status: 500 }
    );
  }
}