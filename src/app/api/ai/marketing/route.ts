/**
 * Marketing Automation API - Automated Campaign Workflows
 * Creates and manages intelligent marketing campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketingAutomationService } from '@/lib/ai/marketing-automation';

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
      case 'create_workflow':
        result = await marketingAutomationService.createWorkflow(
          businessId,
          data.name,
          data.triggers,
          data.actions,
          data.conditions
        );
        break;

      case 'trigger_campaign':
        result = await marketingAutomationService.triggerCampaign(
          businessId,
          data.customerId,
          data.event,
          data.eventData
        );
        break;

      case 'get_workflows':
        result = await marketingAutomationService.getWorkflows(businessId);
        break;

      case 'update_workflow':
        result = await marketingAutomationService.updateWorkflow(
          data.workflowId,
          data.updates
        );
        break;

      case 'delete_workflow':
        result = await marketingAutomationService.deleteWorkflow(data.workflowId);
        break;

      case 'get_campaign_stats':
        result = await marketingAutomationService.getCampaignStats(
          businessId,
          data.timeframe
        );
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
      data: result
    });

  } catch (error) {
    console.error('Marketing Automation API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Marketing automation operation failed',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}

// Get marketing automation status and analytics
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

    const [workflows, stats, activeWorkflows] = await Promise.all([
      marketingAutomationService.getWorkflows(businessId),
      marketingAutomationService.getCampaignStats(businessId, 30),
      marketingAutomationService.getActiveWorkflows(businessId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        workflows,
        stats,
        activeWorkflows,
        summary: {
          totalWorkflows: workflows.length,
          activeWorkflows: activeWorkflows.length,
          totalCampaigns: stats.totalCampaigns,
          totalEngagement: stats.totalEngagement,
          conversionRate: stats.conversionRate
        }
      }
    });

  } catch (error) {
    console.error('Marketing Automation Status API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get marketing automation status',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
}