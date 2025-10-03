/**
 * AI Chat API - Handles real-time AI conversations
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
    const { businessId, sessionId, message, customerInfo } = body;

    // Validate required fields
    if (!businessId || !sessionId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, sessionId, message' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message too long (max 1000 characters)' },
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

    // Initialize AI service if needed
    await aiService.initialize();

    // Generate AI response
    const response = await aiService.generateChatResponse(
      businessId,
      sessionId,
      message.trim(),
      customerInfo
    );

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
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
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get chat history
    const { redisService } = await import('@/lib/ai/redis-service');
    const chatSession = await redisService.getAISession(sessionId);

    if (!chatSession) {
      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          messages: [],
          lastActivity: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: chatSession.sessionId,
        messages: chatSession.messages,
        lastActivity: chatSession.lastActivity
      }
    });

  } catch (error) {
    console.error('AI Chat History API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve chat history',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}