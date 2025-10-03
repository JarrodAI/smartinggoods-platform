/**
 * AI Health Check API - Monitors AI service status
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai/ai-service';

export async function GET(request: NextRequest) {
  try {
    // Perform comprehensive health check
    const healthStatus = await aiService.healthCheck();

    // Determine HTTP status code based on health
    let statusCode = 200;
    if (healthStatus.status === 'degraded') {
      statusCode = 206; // Partial Content
    } else if (healthStatus.status === 'unhealthy') {
      statusCode = 503; // Service Unavailable
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...healthStatus
    }, { status: statusCode });

  } catch (error) {
    console.error('AI Health Check Error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: 503 });
  }
}

// Detailed health check with authentication
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDetails = searchParams.get('details') === 'true';

    // Basic health check
    const healthStatus = await aiService.healthCheck();

    let response: any = {
      success: true,
      timestamp: new Date().toISOString(),
      ...healthStatus
    };

    // Add detailed information if requested
    if (includeDetails) {
      try {
        // Get Redis health details
        const { redisService } = await import('@/lib/ai/redis-service');
        const redisHealth = await redisService.healthCheck();

        // Check environment variables
        const envCheck = {
          openai: !!process.env.OPENAI_API_KEY,
          redis: !!(process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL),
          twilio: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
        };

        response.details = {
          ...response.details,
          redis: redisHealth,
          environment: envCheck,
          nodeVersion: process.version,
          platform: process.platform,
          uptime: process.uptime()
        };

      } catch (detailError) {
        response.details = {
          ...response.details,
          detailError: detailError.toString()
        };
      }
    }

    // Determine HTTP status code
    let statusCode = 200;
    if (healthStatus.status === 'degraded') {
      statusCode = 206;
    } else if (healthStatus.status === 'unhealthy') {
      statusCode = 503;
    }

    return NextResponse.json(response, { status: statusCode });

  } catch (error) {
    console.error('Detailed AI Health Check Error:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      error: 'Detailed health check failed',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    }, { status: 503 });
  }
}