/**
 * Marketing Workflow Automation API
 * Creates and manages automated marketing workflows with triggers and conditions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { workflowService } from '@/lib/ai/workflow-service';

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
      name,
      trigger,
      conditions,
      actions,
      active = true
    } = body;

    // Validate required fields
    if (!businessId || !name || !trigger || !actions) {
      return NextResponse.json(
        { error: 'Missing required fields: businessId, name, trigger, actions' },
        { status: 400 }
      );
    }

    // Create workflow
    const workflow = await workflowService.createWorkflow({
      businessId,
      name,
      trigger,
      conditions: conditions || [],
      actions,
      active,
      createdBy: session.user.id
    });

    return NextResponse.json({
      success: true,
      data: workflow
    });

  } catch (error) {
    console.error('Workflow Creation API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create workflow',
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
    const status = searchParams.get('status');
    const triggerType = searchParams.get('triggerType');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    // Get workflows
    const workflows = await workflowService.getWorkflows(businessId, { status, triggerType });

    return NextResponse.json({
      success: true,
      data: workflows
    });

  } catch (error) {
    console.error('Get Workflows API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch workflows',
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
    const { workflowId, action, updates } = body;

    if (!workflowId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: workflowId, action' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'activate':
        result = await workflowService.activateWorkflow(workflowId);
        break;
      
      case 'deactivate':
        result = await workflowService.deactivateWorkflow(workflowId);
        break;
      
      case 'update':
        result = await workflowService.updateWorkflow(workflowId, updates);
        break;
      
      case 'test':
        result = await workflowService.testWorkflow(workflowId, updates?.testData);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be: activate, deactivate, update, or test' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Update Workflow API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update workflow',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
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
    const workflowId = searchParams.get('workflowId');

    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    // Delete workflow
    await workflowService.deleteWorkflow(workflowId);

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    console.error('Delete Workflow API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to delete workflow',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}