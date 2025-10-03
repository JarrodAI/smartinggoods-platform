/**
 * Social Media Content Automation API
 * Generates and schedules social media content with image generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { contentGenerationService } from '@/lib/ai/content-generation';
import { socialMediaService } from '@/lib/ai/social-media-service';

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
      platforms,
      contentType,
      prompt,
      generateImages = false,
      schedule = false,
      scheduledDate
    } = body;

    // Validate required fields
    if (!businessId || !platforms || !Array.isArray(platforms) || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, platforms (array), prompt' },
        { status: 400 }
      );
    }

    // Generate content for each platform
    const results = [];
    
    for (const platform of platforms) {
      try {
        // Generate platform-specific content
        const content = await contentGenerationService.generateContent({
          businessId,
          type: 'social_post',
          platform,
          prompt,
          requirements: {
            length: platform === 'twitter' ? 'short' : 'medium',
            includeHashtags: true,
            includeCTA: true,
            includeEmojis: platform === 'instagram' || platform === 'facebook'
          }
        });

        // Generate images if requested
        let images = [];
        if (generateImages) {
          images = await socialMediaService.generateImages(
            businessId,
            content.content.body,
            platform
          );
        }

        // Schedule content if requested
        let scheduledId = null;
        if (schedule && scheduledDate) {
          scheduledId = await socialMediaService.schedulePost({
            businessId,
            platform,
            content: content.content,
            images,
            scheduledDate: new Date(scheduledDate)
          });
        }

        results.push({
          platform,
          content,
          images,
          scheduledId,
          success: true
        });

      } catch (error) {
        results.push({
          platform,
          error: String(error),
          success: false
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        businessId,
        results,
        totalPlatforms: platforms.length,
        successfulPosts: results.filter(r => r.success).length,
        failedPosts: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Social Media Automation API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate social media content',
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
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Get scheduled posts
    const scheduledPosts = await socialMediaService.getScheduledPosts(
      businessId,
      { platform, status }
    );

    return NextResponse.json({
      success: true,
      data: scheduledPosts
    });

  } catch (error) {
    console.error('Get Scheduled Posts API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch scheduled posts',
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
    const { scheduledId, action, newDate } = body;

    if (!scheduledId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: scheduledId, action' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'reschedule':
        if (!newDate) {
          return NextResponse.json(
            { error: 'New date is required for rescheduling' },
            { status: 400 }
          );
        }
        result = await socialMediaService.reschedulePost(scheduledId, new Date(newDate));
        break;
      
      case 'cancel':
        result = await socialMediaService.cancelScheduledPost(scheduledId);
        break;
      
      case 'publish_now':
        result = await socialMediaService.publishNow(scheduledId);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: reschedule, cancel, or publish_now' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Update Scheduled Post API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update scheduled post',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}