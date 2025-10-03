import { NextRequest, NextResponse } from 'next/server';
import { socialContentAutomation } from '@/lib/ai/social-content-automation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, businessId, options } = body;

    switch (action) {
      case 'generate':
        const posts = await socialContentAutomation.generateSocialPosts(businessId, options);
        return NextResponse.json({ posts });

      case 'generateHashtags':
        const hashtags = await socialContentAutomation.generateHashtags(
          options.topic,
          options.businessType,
          options.count
        );
        return NextResponse.json({ hashtags });

      case 'generateCalendar':
        const calendar = await socialContentAutomation.generateContentCalendar(
          businessId,
          options.businessType,
          options.postsPerWeek
        );
        return NextResponse.json({ calendar });

      case 'optimize':
        const optimized = await socialContentAutomation.optimizeForEngagement(options.post);
        return NextResponse.json({ post: optimized });

      case 'abTest':
        const variations = await socialContentAutomation.generateABVariations(
          options.post,
          options.count
        );
        return NextResponse.json({ variations });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Social content automation error:', error);
    return NextResponse.json(
      { error: 'Failed to process social content request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    service: 'Social Content Automation',
    endpoints: {
      generate: 'Generate social media posts',
      generateHashtags: 'Generate relevant hashtags',
      generateCalendar: 'Create content calendar',
      optimize: 'Optimize post for engagement',
      abTest: 'Generate A/B test variations'
    }
  });
}