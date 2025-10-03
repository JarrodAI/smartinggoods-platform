/**
 * AI Training API - Business-Specific AI Training Management
 * Manages AI model training with business data for personalized responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiTrainingService } from '@/lib/ai/training-service';

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
    const { businessId, action, data } = body;

    if (!businessId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, action' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'train_business_ai':
        if (!data.businessProfile) {
          return NextResponse.json(
            { error: 'Missing businessProfile data for training' },
            { status: 400 }
          );
        }
        result = await aiTrainingService.trainBusinessAI(data.businessProfile);
        break;

      case 'update_training':
        if (!data.updates) {
          return NextResponse.json(
            { error: 'Missing updates data' },
            { status: 400 }
          );
        }
        await aiTrainingService.updateBusinessTraining(businessId, data.updates);
        result = { success: true, message: 'Training updated successfully' };
        break;

      case 'get_training_stats':
        result = await aiTrainingService.getTrainingStats(businessId);
        break;

      case 'retrain_model':
        // Trigger a complete retraining with updated data
        const businessProfile = data.businessProfile;
        if (!businessProfile) {
          return NextResponse.json(
            { error: 'Missing businessProfile for retraining' },
            { status: 400 }
          );
        }
        result = await aiTrainingService.trainBusinessAI(businessProfile);
        break;

      default:
        return NextResponse.json(
          { error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      businessId,
      data: result,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Training API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'AI training operation failed',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// Get training status and analytics
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
        { error: 'Missing businessId parameter' },
        { status: 400 }
      );
    }

    const trainingStats = await aiTrainingService.getTrainingStats(businessId);

    return NextResponse.json({
      success: true,
      data: {
        businessId,
        training: trainingStats,
        status: {
          isTrained: trainingStats.knowledgeBaseSize > 0,
          needsRetraining: trainingStats.lastTrainingDate && 
            (Date.now() - trainingStats.lastTrainingDate.getTime()) > (30 * 24 * 60 * 60 * 1000), // 30 days
          trainingHealth: trainingStats.brandVoiceTrained && trainingStats.faqsProcessed > 0 ? 'good' : 'needs_improvement'
        },
        recommendations: [
          ...(trainingStats.knowledgeBaseSize === 0 ? ['Complete initial AI training with business data'] : []),
          ...(trainingStats.faqsProcessed === 0 ? ['Add FAQ data to improve customer support'] : []),
          ...(!trainingStats.brandVoiceTrained ? ['Train brand voice for consistent messaging'] : []),
          ...(trainingStats.documentsCount < 10 ? ['Add more business content for better AI responses'] : [])
        ],
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Training Status API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get AI training status',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}