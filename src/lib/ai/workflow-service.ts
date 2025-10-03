/**
 * Marketing Workflow Automation Service
 * Creates and manages automated marketing workflows with triggers, conditions, and actions
 */

import { redisService } from './redis-service';
import { campaignService } from './campaign-service';
import { smsService } from '../communications/sms-service';
import { customerLifecycleService } from './customer-lifecycle';

export interface WorkflowTrigger {
  type: 'customer_signup' | 'appointment_booked' | 'appointment_completed' | 'no_visit' | 'birthday' | 'anniversary' | 'cart_abandoned' | 'review_received' | 'churn_risk' | 'high_value_customer';
  conditions?: {
    timeframe?: number; // days
    value?: number;
    comparison?: 'greater_than' | 'less_than' | 'equals';
    customerSegment?: string;
  };
}

export interface WorkflowCondition {
  type: 'customer_attribute' | 'behavior' | 'time_based' | 'value_based';
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface WorkflowAction {
  type: 'send_email' | 'send_sms' | 'create_task' | 'update_customer' | 'add_tag' | 'send_notification' | 'schedule_followup' | 'apply_discount';
  delay?: number; // minutes
  config: {
    template?: string;
    subject?: string;
    message?: string;
    discount?: {
      type: 'percentage' | 'fixed';
      value: number;
      expiry: number; // days
    };
    task?: {
      title: string;
      description: string;
      assignee?: string;
      dueDate?: number; // days from now
    };
    tag?: string;
    notification?: {
      title: string;
      message: string;
      recipients: string[];
    };
  };
}

export interface MarketingWorkflow {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  active: boolean;
  analytics: {
    triggered: number;
    completed: number;
    conversionRate: number;
    revenue: number;
    lastTriggered?: Date;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  customerId: string;
  businessId: string;
  triggeredAt: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: number;
  steps: Array<{
    action: WorkflowAction;
    status: 'pending' | 'completed' | 'failed' | 'skipped';
    executedAt?: Date;
    result?: any;
    error?: string;
  }>;
  completedAt?: Date;
  result?: {
    success: boolean;
    conversions: number;
    revenue: number;
  };
}

export class WorkflowService {
  private static instance: WorkflowService;

  public static getInstance(): WorkflowService {
    if (!WorkflowService.instance) {
      WorkflowService.instance = new WorkflowService();
    }
    return WorkflowService.instance;
  }

  /**
   * Create a new marketing workflow
   */
  async createWorkflow(workflowData: {
    businessId: string;
    name: string;
    trigger: WorkflowTrigger;
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
    active: boolean;
    createdBy: string;
  }): Promise<MarketingWorkflow> {
    try {
      const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const workflow: MarketingWorkflow = {
        id: workflowId,
        businessId: workflowData.businessId,
        name: workflowData.name,
        description: `Automated workflow: ${workflowData.name}`,
        trigger: workflowData.trigger,
        conditions: workflowData.conditions,
        actions: workflowData.actions,
        active: workflowData.active,
        analytics: {
          triggered: 0,
          completed: 0,
          conversionRate: 0,
          revenue: 0
        },
        createdBy: workflowData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Cache workflow
      await redisService.cacheAIResponse(
        `workflow_${workflowId}`,
        workflow,
        { prefix: 'ai:workflows', ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      // Add to business workflows list
      await this.addToBusinessWorkflows(workflowData.businessId, workflow);

      console.log(`🔄 Created workflow: ${workflowData.name}`);

      return workflow;

    } catch (error) {
      console.error('Workflow creation error:', error);
      throw new Error('Failed to create workflow');
    }
  }

  /**
   * Trigger workflow execution
   */
  async triggerWorkflow(
    businessId: string,
    triggerType: string,
    customerId: string,
    triggerData: any = {}
  ): Promise<WorkflowExecution[]> {
    try {
      // Get active workflows for this trigger type
      const workflows = await this.getWorkflowsByTrigger(businessId, triggerType);
      const executions: WorkflowExecution[] = [];

      for (const workflow of workflows) {
        if (!workflow.active) continue;

        // Check if conditions are met
        const conditionsMet = await this.evaluateConditions(
          workflow.conditions,
          customerId,
          triggerData
        );

        if (conditionsMet) {
          const execution = await this.executeWorkflow(workflow, customerId, triggerData);
          executions.push(execution);

          // Update workflow analytics
          workflow.analytics.triggered++;
          workflow.analytics.lastTriggered = new Date();
          await this.updateWorkflow(workflow.id, { analytics: workflow.analytics });
        }
      }

      return executions;

    } catch (error) {
      console.error('Workflow trigger error:', error);
      return [];
    }
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: MarketingWorkflow,
    customerId: string,
    triggerData: any
  ): Promise<WorkflowExecution> {
    try {
      const executionId = `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const execution: WorkflowExecution = {
        id: executionId,
        workflowId: workflow.id,
        customerId,
        businessId: workflow.businessId,
        triggeredAt: new Date(),
        status: 'running',
        currentStep: 0,
        steps: workflow.actions.map(action => ({
          action,
          status: 'pending'
        }))
      };

      // Cache execution
      await redisService.cacheAIResponse(
        `workflow_execution_${executionId}`,
        execution,
        { prefix: 'ai:workflows', ttl: 7 * 24 * 60 * 60 } // 7 days
      );

      // Execute actions sequentially
      await this.executeWorkflowActions(execution, triggerData);

      return execution;

    } catch (error) {
      console.error('Workflow execution error:', error);
      throw new Error('Failed to execute workflow');
    }
  }

  /**
   * Execute workflow actions
   */
  private async executeWorkflowActions(
    execution: WorkflowExecution,
    triggerData: any
  ): Promise<void> {
    try {
      for (let i = 0; i < execution.steps.length; i++) {
        const step = execution.steps[i];
        execution.currentStep = i;

        // Apply delay if specified
        if (step.action.delay && step.action.delay > 0) {
          // In a real implementation, this would be handled by a job queue
          console.log(`⏰ Delaying action for ${step.action.delay} minutes`);
        }

        try {
          const result = await this.executeAction(
            step.action,
            execution.customerId,
            execution.businessId,
            triggerData
          );

          step.status = 'completed';
          step.executedAt = new Date();
          step.result = result;

        } catch (actionError) {
          step.status = 'failed';
          step.error = String(actionError);
          console.error(`Action failed:`, actionError);
        }

        // Update execution
        await redisService.cacheAIResponse(
          `workflow_execution_${execution.id}`,
          execution,
          { prefix: 'ai:workflows', ttl: 7 * 24 * 60 * 60 }
        );
      }

      // Mark execution as completed
      execution.status = 'completed';
      execution.completedAt = new Date();

      // Calculate results
      const successfulSteps = execution.steps.filter(s => s.status === 'completed').length;
      execution.result = {
        success: successfulSteps === execution.steps.length,
        conversions: 0, // Would be calculated based on actual conversions
        revenue: 0 // Would be calculated based on actual revenue
      };

      // Update workflow analytics
      await this.updateWorkflowAnalytics(execution.workflowId, execution.result);

    } catch (error) {
      execution.status = 'failed';
      console.error('Workflow actions execution error:', error);
    }
  }

  /**
   * Execute individual action
   */
  private async executeAction(
    action: WorkflowAction,
    customerId: string,
    businessId: string,
    triggerData: any
  ): Promise<any> {
    switch (action.type) {
      case 'send_email':
        return await this.executeEmailAction(action, customerId, businessId, triggerData);
      
      case 'send_sms':
        return await this.executeSMSAction(action, customerId, businessId, triggerData);
      
      case 'create_task':
        return await this.executeTaskAction(action, customerId, businessId);
      
      case 'update_customer':
        return await this.executeUpdateCustomerAction(action, customerId, businessId);
      
      case 'add_tag':
        return await this.executeAddTagAction(action, customerId, businessId);
      
      case 'apply_discount':
        return await this.executeDiscountAction(action, customerId, businessId);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute email action
   */
  private async executeEmailAction(
    action: WorkflowAction,
    customerId: string,
    businessId: string,
    triggerData: any
  ): Promise<any> {
    try {
      // Generate campaign for this customer
      const campaign = await campaignService.generateCampaign({
        businessId,
        type: 'email',
        campaignType: 'retention', // Default type
        audience: { customerId },
        subject: action.config.subject || 'Message from your salon',
        prompt: action.config.message || 'Automated workflow message',
        personalization: triggerData,
        abTest: false,
        userId: 'workflow_system'
      });

      // Send campaign
      await campaignService.sendCampaign(campaign.id);

      return { success: true, campaignId: campaign.id };

    } catch (error) {
      console.error('Email action execution error:', error);
      throw error;
    }
  }

  /**
   * Execute SMS action
   */
  private async executeSMSAction(
    action: WorkflowAction,
    customerId: string,
    businessId: string,
    triggerData: any
  ): Promise<any> {
    try {
      // Get customer phone number (would come from database)
      const customerPhone = `+1555000${customerId.slice(-4)}`;

      // Send SMS
      const result = await smsService.sendSMS({
        to: customerPhone,
        message: action.config.message || 'Automated message from your salon',
        businessId
      });

      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('SMS action execution error:', error);
      throw error;
    }
  }

  /**
   * Execute task creation action
   */
  private async executeTaskAction(
    action: WorkflowAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const task = {
        id: `task_${Date.now()}`,
        title: action.config.task?.title || 'Follow up with customer',
        description: action.config.task?.description || `Follow up with customer ${customerId}`,
        customerId,
        businessId,
        assignee: action.config.task?.assignee || 'system',
        dueDate: new Date(Date.now() + (action.config.task?.dueDate || 7) * 24 * 60 * 60 * 1000),
        status: 'pending',
        createdAt: new Date()
      };

      // Cache task
      await redisService.cacheAIResponse(
        `task_${task.id}`,
        task,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      return { success: true, taskId: task.id };

    } catch (error) {
      console.error('Task action execution error:', error);
      throw error;
    }
  }

  /**
   * Execute customer update action
   */
  private async executeUpdateCustomerAction(
    action: WorkflowAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      // Update customer profile (would update database)
      const updates = {
        lastWorkflowAction: new Date(),
        workflowTags: action.config.tag ? [action.config.tag] : []
      };

      // Cache update
      await redisService.cacheAIResponse(
        `customer_update_${customerId}`,
        updates,
        { prefix: `business_${businessId}`, ttl: 24 * 60 * 60 }
      );

      return { success: true, updates };

    } catch (error) {
      console.error('Customer update action execution error:', error);
      throw error;
    }
  }

  /**
   * Execute add tag action
   */
  private async executeAddTagAction(
    action: WorkflowAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const tag = action.config.tag || 'workflow_processed';

      // Add tag to customer (would update database)
      await redisService.cacheAIResponse(
        `customer_tag_${customerId}_${tag}`,
        { tag, addedAt: new Date() },
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      return { success: true, tag };

    } catch (error) {
      console.error('Add tag action execution error:', error);
      throw error;
    }
  }

  /**
   * Execute discount action
   */
  private async executeDiscountAction(
    action: WorkflowAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const discount = {
        id: `discount_${Date.now()}`,
        customerId,
        businessId,
        type: action.config.discount?.type || 'percentage',
        value: action.config.discount?.value || 10,
        expiryDate: new Date(Date.now() + (action.config.discount?.expiry || 14) * 24 * 60 * 60 * 1000),
        used: false,
        createdAt: new Date()
      };

      // Cache discount
      await redisService.cacheAIResponse(
        `discount_${discount.id}`,
        discount,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      return { success: true, discountId: discount.id, discount };

    } catch (error) {
      console.error('Discount action execution error:', error);
      throw error;
    }
  }

  /**
   * Get workflows by trigger type
   */
  private async getWorkflowsByTrigger(
    businessId: string,
    triggerType: string
  ): Promise<MarketingWorkflow[]> {
    try {
      const allWorkflows = await this.getWorkflows(businessId);
      return allWorkflows.filter(w => w.trigger.type === triggerType && w.active);

    } catch (error) {
      console.error('Get workflows by trigger error:', error);
      return [];
    }
  }

  /**
   * Evaluate workflow conditions
   */
  private async evaluateConditions(
    conditions: WorkflowCondition[],
    customerId: string,
    triggerData: any
  ): Promise<boolean> {
    if (conditions.length === 0) return true;

    try {
      // For now, we'll implement basic condition evaluation
      // In a real implementation, this would be more sophisticated
      
      for (const condition of conditions) {
        const result = await this.evaluateCondition(condition, customerId, triggerData);
        
        // For simplicity, we'll use AND logic for all conditions
        if (!result) return false;
      }

      return true;

    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Evaluate single condition
   */
  private async evaluateCondition(
    condition: WorkflowCondition,
    customerId: string,
    triggerData: any
  ): Promise<boolean> {
    try {
      let actualValue;

      // Get the actual value based on condition type
      switch (condition.type) {
        case 'customer_attribute':
          actualValue = triggerData[condition.field] || null;
          break;
        case 'behavior':
          actualValue = triggerData.behavior?.[condition.field] || null;
          break;
        case 'time_based':
          actualValue = new Date();
          break;
        case 'value_based':
          actualValue = triggerData.value || 0;
          break;
        default:
          return false;
      }

      // Evaluate condition
      switch (condition.operator) {
        case 'equals':
          return actualValue === condition.value;
        case 'not_equals':
          return actualValue !== condition.value;
        case 'greater_than':
          return Number(actualValue) > Number(condition.value);
        case 'less_than':
          return Number(actualValue) < Number(condition.value);
        case 'contains':
          return String(actualValue).includes(String(condition.value));
        case 'not_contains':
          return !String(actualValue).includes(String(condition.value));
        default:
          return false;
      }

    } catch (error) {
      console.error('Single condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Get workflows for a business
   */
  async getWorkflows(
    businessId: string,
    filters: {
      status?: string;
      triggerType?: string;
    } = {}
  ): Promise<MarketingWorkflow[]> {
    try {
      const businessWorkflows = await redisService.getCachedAIResponse(
        `business_workflows_${businessId}`,
        'ai:workflows'
      ) || [];

      let filteredWorkflows = businessWorkflows;

      if (filters.status) {
        const isActive = filters.status === 'active';
        filteredWorkflows = filteredWorkflows.filter((w: MarketingWorkflow) => w.active === isActive);
      }

      if (filters.triggerType) {
        filteredWorkflows = filteredWorkflows.filter((w: MarketingWorkflow) => w.trigger.type === filters.triggerType);
      }

      return filteredWorkflows;

    } catch (error) {
      console.error('Get workflows error:', error);
      return [];
    }
  }

  /**
   * Update workflow
   */
  async updateWorkflow(workflowId: string, updates: Partial<MarketingWorkflow>): Promise<MarketingWorkflow> {
    try {
      const workflow = await redisService.getCachedAIResponse(
        `workflow_${workflowId}`,
        'ai:workflows'
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Apply updates
      Object.assign(workflow, updates);
      workflow.updatedAt = new Date();

      // Cache updated workflow
      await redisService.cacheAIResponse(
        `workflow_${workflowId}`,
        workflow,
        { prefix: 'ai:workflows', ttl: 30 * 24 * 60 * 60 }
      );

      return workflow;

    } catch (error) {
      console.error('Update workflow error:', error);
      throw new Error('Failed to update workflow');
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowId: string): Promise<MarketingWorkflow> {
    return await this.updateWorkflow(workflowId, { active: true });
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(workflowId: string): Promise<MarketingWorkflow> {
    return await this.updateWorkflow(workflowId, { active: false });
  }

  /**
   * Test workflow
   */
  async testWorkflow(workflowId: string, testData: any = {}): Promise<any> {
    try {
      const workflow = await redisService.getCachedAIResponse(
        `workflow_${workflowId}`,
        'ai:workflows'
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Create test execution
      const testExecution = await this.executeWorkflow(
        workflow,
        testData.customerId || 'test_customer',
        testData
      );

      return {
        success: true,
        execution: testExecution,
        message: 'Workflow test completed successfully'
      };

    } catch (error) {
      console.error('Test workflow error:', error);
      return {
        success: false,
        error: String(error),
        message: 'Workflow test failed'
      };
    }
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    try {
      const workflow = await redisService.getCachedAIResponse(
        `workflow_${workflowId}`,
        'ai:workflows'
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      // Remove from business workflows list
      await this.removeFromBusinessWorkflows(workflow.businessId, workflowId);

      // Delete workflow cache
      await redisService.deleteCachedResponse(`workflow_${workflowId}`, 'ai:workflows');

    } catch (error) {
      console.error('Delete workflow error:', error);
      throw new Error('Failed to delete workflow');
    }
  }

  /**
   * Update workflow analytics
   */
  private async updateWorkflowAnalytics(workflowId: string, result: any): Promise<void> {
    try {
      const workflow = await redisService.getCachedAIResponse(
        `workflow_${workflowId}`,
        'ai:workflows'
      );

      if (workflow) {
        workflow.analytics.completed++;
        if (result.success) {
          workflow.analytics.revenue += result.revenue || 0;
        }
        workflow.analytics.conversionRate = workflow.analytics.completed / workflow.analytics.triggered;

        await this.updateWorkflow(workflowId, { analytics: workflow.analytics });
      }

    } catch (error) {
      console.error('Update workflow analytics error:', error);
    }
  }

  /**
   * Add workflow to business workflows list
   */
  private async addToBusinessWorkflows(businessId: string, workflow: MarketingWorkflow): Promise<void> {
    try {
      const businessWorkflows = await redisService.getCachedAIResponse(
        `business_workflows_${businessId}`,
        'ai:workflows'
      ) || [];

      businessWorkflows.push(workflow);

      await redisService.cacheAIResponse(
        `business_workflows_${businessId}`,
        businessWorkflows,
        { prefix: 'ai:workflows', ttl: 30 * 24 * 60 * 60 }
      );

    } catch (error) {
      console.error('Add to business workflows error:', error);
    }
  }

  /**
   * Remove workflow from business workflows list
   */
  private async removeFromBusinessWorkflows(businessId: string, workflowId: string): Promise<void> {
    try {
      const businessWorkflows = await redisService.getCachedAIResponse(
        `business_workflows_${businessId}`,
        'ai:workflows'
      ) || [];

      const filteredWorkflows = businessWorkflows.filter((w: MarketingWorkflow) => w.id !== workflowId);

      await redisService.cacheAIResponse(
        `business_workflows_${businessId}`,
        filteredWorkflows,
        { prefix: 'ai:workflows', ttl: 30 * 24 * 60 * 60 }
      );

    } catch (error) {
      console.error('Remove from business workflows error:', error);
    }
  }
}

export const workflowService = WorkflowService.getInstance();