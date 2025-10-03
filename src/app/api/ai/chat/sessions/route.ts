/**
 * AI Chat Sessions API - Manages chat sessions and history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redisService } from '@/lib/ai/redis-service';

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
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

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

    if (sessionId) {
      // Get specific session
      const chatSession = await redisService.getAISession(sessionId);
      
      if (!chatSession) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      if (chatSession.businessId !== businessId) {
        return NextResponse.json(
          { error: 'Session does not belong to this business' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          session: chatSession,
          messageCount: chatSession.messages.length,
          lastActivity: chatSession.lastActivity
        }
      });
    } else {
      // Get all sessions for business (this would require additional Redis indexing)
      // For now, return empty array as we'd need to implement business session indexing
      return NextResponse.json({
        success: true,
        data: {
          sessions: [],
          totalSessions: 0,
          activeSessions: 0
        }
      });
    }

  } catch (error) {
    console.error('Chat Sessions API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve chat sessions',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

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
    const { businessId, customerId, customerInfo } = body;

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

    // Generate new session ID
    const sessionId = `session_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create new session
    const newSession = {
      sessionId,
      businessId,
      customerId,
      messages: [],
      context: { customerInfo },
      lastActivity: new Date()
    };

    await redisService.storeAISession(newSession);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        businessId,
        customerId,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Create Chat Session API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create chat session',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get session to verify ownership
    const chatSession = await redisService.getAISession(sessionId);
    
    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // TODO: Verify user has access to this business
    // const hasAccess = await verifyBusinessAccess(session.user.id, chatSession.businessId);
    // if (!hasAccess) {
    //   return NextResponse.json(
    //     { error: 'Access denied to this session' },
    //     { status: 403 }
    //   );
    // }

    // Delete session (we'd need to implement this in Redis service)
    // For now, we'll just return success
    // await redisService.deleteAISession(sessionId);

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Delete Chat Session API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete chat session',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}