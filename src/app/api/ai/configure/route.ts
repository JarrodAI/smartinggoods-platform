/**
 * AI Configuration API - Sets up AI for businesses
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/lib/ai/ai-service';

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
      businessData,
      aiConfig = {}
    } = body;

    // Validate required fields
    if (!businessId || !businessData) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, businessData' },
        { status: 400 }
      );
    }

    // Validate business data structure
    const requiredFields = ['businessName', 'industry', 'services', 'policies', 'hours', 'location'];
    for (const field of requiredFields) {
      if (!businessData[field]) {
        return NextResponse.json(
          { error: `Missing required business data field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate services array
    if (!Array.isArray(businessData.services) || businessData.services.length === 0) {
      return NextResponse.json(
        { error: 'Business must have at least one service' },
        { status: 400 }
      );
    }

    // Validate service structure
    for (const service of businessData.services) {
      if (!service.name || !service.description || typeof service.price !== 'number' || typeof service.duration !== 'number') {
        return NextResponse.json(
          { error: 'Invalid service structure. Each service must have name, description, price, and duration' },
          { status: 400 }
        );
      }
    }

    // TODO: Verify user has access to this business
    // const hasAccess = await verifyBusinessAccess(session.user.id, businessId);
    // if (!hasAccess) {
    //   return NextResponse.json(
    //     { error: 'Access denied to this business' },
    //     { status: 403 }
    //   );
    // }

    // Initialize AI service if needed
    const initResult = await aiService.initialize();
    
    if (!initResult.success) {
      return NextResponse.json(
        { 
          error: 'AI service initialization failed',
          details: initResult.errors
        },
        { status: 503 }
      );
    }

    // Configure AI for the business
    await aiService.configureForBusiness(businessId, businessData, aiConfig);

    // Get configuration summary
    const config = aiService.getBusinessConfig(businessId);

    return NextResponse.json({
      success: true,
      data: {
        businessId,
        businessName: businessData.businessName,
        aiConfig: config,
        servicesConfigured: businessData.services.length,
        policiesConfigured: businessData.policies.length,
        faqsConfigured: businessData.faqs?.length || 0,
        configuredAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Configuration API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to configure AI for business',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
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

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID required' },
        { status: 400 }
      );
    }

    // TODO: Verify user has access to this business
    // const hasAccess = await verifyBusinessAccess(session.user.id, businessId);
    // if (!hasAccess) {
    //   return NextResponse.json(
    //     { error: 'Access denied to this business' },
    //     { status: 403 }
    //   );
    // }

    // Get current configuration
    const config = aiService.getBusinessConfig(businessId);
    
    if (!config) {
      return NextResponse.json(
        { error: 'Business not configured for AI' },
        { status: 404 }
      );
    }

    // Get knowledge base statistics
    const { vectorService } = await import('@/lib/ai/vector-service');
    const knowledgeStats = await vectorService.getKnowledgeStats(businessId);

    return NextResponse.json({
      success: true,
      data: {
        businessId,
        aiConfig: config,
        knowledgeBase: knowledgeStats,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Configuration Get API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve AI configuration',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
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
    const { businessId, updates } = body;

    if (!businessId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, updates' },
        { status: 400 }
      );
    }

    // TODO: Verify user has access to this business
    // const hasAccess = await verifyBusinessAccess(session.user.id, businessId);
    // if (!hasAccess) {
    //   return NextResponse.json(
    //     { error: 'Access denied to this business' },
    //     { status: 403 }
    //   );
    // }

    // Update configuration
    aiService.updateBusinessConfig(businessId, updates);

    const updatedConfig = aiService.getBusinessConfig(businessId);

    return NextResponse.json({
      success: true,
      data: {
        businessId,
        aiConfig: updatedConfig,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Configuration Update API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update AI configuration',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}