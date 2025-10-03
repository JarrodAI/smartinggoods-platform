import { NextRequest, NextResponse } from 'next/server';
import { localSEOService } from '@/lib/seo/local-seo-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'setupProfile':
        const profile = await localSEOService.setupLocalSEOProfile(
          params.businessId,
          params.businessData
        );
        return NextResponse.json({ profile });

      case 'generateContent':
        const content = await localSEOService.generateSEOContent(
          params.businessId,
          params.contentType,
          params.topic,
          params.targetKeywords
        );
        return NextResponse.json({ content });

      case 'keywordResearch':
        const research = await localSEOService.performLocalKeywordResearch(
          params.businessId,
          params.location,
          params.industry
        );
        return NextResponse.json({ research });

      case 'updateGMB':
        const updated = await localSEOService.updateGoogleMyBusinessListing(
          params.businessId,
          params.updates
        );
        return NextResponse.json({ success: updated });

      case 'generateReport':
        const report = await localSEOService.generateLocalSEOReport(params.businessId);
        return NextResponse.json({ report });

      case 'setupComplete':
        // Complete SEO setup for a business
        const setupProfile = await localSEOService.setupLocalSEOProfile(
          params.businessId,
          params.businessData
        );

        // Generate initial content pieces
        const contentPieces = [];
        const topics = [
          'Ultimate Guide to Our Services',
          'Why Choose Us',
          'Customer Success Stories'
        ];

        for (const topic of topics) {
          const piece = await localSEOService.generateSEOContent(
            params.businessId,
            'blog_post',
            topic,
            setupProfile.contentStrategy.keywords.slice(0, 3)
          );
          contentPieces.push(piece);
        }

        return NextResponse.json({
          profile: setupProfile,
          content: contentPieces,
          message: 'Local SEO setup complete with initial content'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Local SEO API error:', error);
    return NextResponse.json(
      { error: 'Failed to process local SEO request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const type = searchParams.get('type'); // 'profile', 'report', 'keywords'

  try {
    if (!businessId) {
      return NextResponse.json({
        service: 'Local SEO and Content Marketing Automation',
        description: 'Automated Google My Business management, local listings, and SEO-optimized content generation',
        endpoints: {
          setupProfile: 'Set up complete local SEO profile',
          generateContent: 'Generate SEO-optimized content',
          keywordResearch: 'Perform local keyword research',
          updateGMB: 'Update Google My Business listing',
          generateReport: 'Generate comprehensive SEO report',
          setupComplete: 'Complete SEO setup with initial content'
        },
        features: [
          'Google My Business integration',
          'Multi-platform local listings',
          'Local keyword research',
          'SEO-optimized content generation',
          'Automated GMB posts',
          'Local ranking tracking',
          'Competitor analysis',
          'Content performance analytics',
          'Schema markup generation',
          'Citation building'
        ]
      });
    }

    if (type === 'report') {
      const report = await localSEOService.generateLocalSEOReport(businessId);
      return NextResponse.json({ report });
    }

    // Return basic info
    return NextResponse.json({
      businessId,
      message: 'Use POST endpoint with specific actions for SEO operations'
    });
  } catch (error) {
    console.error('Get local SEO data error:', error);
    return NextResponse.json(
      { error: 'Failed to get local SEO data' },
      { status: 500 }
    );
  }
}
