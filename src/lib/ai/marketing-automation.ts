/**
 * Marketing Automation Service - Automated Campaign Workflows
 * Creates and manages intelligent marketing campaigns
 */

import { openAIService } from './openai-service';
import { redisService } from './redis-service';

export interface MarketingTrigger {
  id: string;
  type: 'event' | 'schedule' | 'behavior' | 'date';
  event?: 'booking_completed' | 'customer_signup' | 'service_cancelled' | 'payment_received';
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  behavior?: {
    action: 'no_visit' | 'high_spending' | 'low_engagement' | 'frequent_cancellations';
    threshold: number;
    timeframe: number; // days
  };
  date?: {
    type: 'birthday' | 'anniversary' | 'holiday';
    offset: number; // days before/after
  };
}

export interface MarketingAction {
  id: string;
  type: 'email' | 'sms' | 'push' | 'social_post';
  template?: string;
  content?: {
    subject?: string;
    message: string;
    images?: string[];
    cta?: {
      text: string;
      url: string;
    };
  };
  personalization: {
    useCustomerName: boolean;
    useServiceHistory: boolean;
    useBrandVoice: boolean;
    includeRecommendations: boolean;
  };
  timing: {
    delay: number; // minutes after trigger
    sendTime?: string; // preferred send time
    timezone?: string;
  };
}

export interface WorkflowCondition {
  id: string;
  type: 'customer_segment' | 'purchase_history' | 'engagement_level' | 'custom';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  field: string;
}

export interface MarketingWorkflow {
  id: string;
  businessId: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  trigger: MarketingTrigger;
  conditions: WorkflowCondition[];
  actions: MarketingAction[];
  analytics: {
    triggered: number;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignExecution {
  workflowId: string;
  customerId: string;
  triggeredAt: Date;
  actions: Array<{
    actionId: string;
    status: 'pending' | 'sent' | 'failed';
    sentAt?: Date;
    error?: string;
  }>;
}

export interface MarketingInsights {
  totalWorkflows: number;
  activeWorkflows: number;
  totalCampaignsSent: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalRevenue: number;
  topPerformingWorkflows: Array<{
    name: string;
    conversionRate: number;
    revenue: number;
  }>;
  recommendations: string[];
}

export class MarketingAutomationService {
  private static instance: MarketingAutomationService;
  private workflows: Map<string, MarketingWorkflow> = new Map();
  private executions: Map<string, CampaignExecution[]> = new Map();

  public static getInstance(): MarketingAutomationService {
    if (!MarketingAutomationService.instance) {
      MarketingAutomationService.instance = new MarketingAutomationService();
    }
    return MarketingAutomationService.instance;
  }

  /**
   * Create a new marketing workflow
   */
  async createWorkflow(
    businessId: string,
    workflowData: Omit<MarketingWorkflow, 'id' | 'businessId' | 'analytics' | 'createdAt' | 'updatedAt'>
  ): Promise<MarketingWorkflow> {
    try {
      const workflowId = `workflow_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const workflow: MarketingWorkflow = {
        id: workflowId,
        businessId,
        ...workflowData,
        analytics: {
          triggered: 0,
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store workflow
      this.workflows.set(workflowId, workflow);
      await this.persistWorkflow(workflow);

      console.log(`📧 Marketing workflow created: ${workflow.name}`);

      return workflow;

    } catch (error) {
      console.error('Create workflow error:', error);
      throw new Error('Failed to create marketing workflow');
    }
  }

  /**
   * Create pre-built workflow templates
   */
  async createWelcomeSeriesWorkflow(businessId: string): Promise<MarketingWorkflow> {
    return this.createWorkflow(businessId, {
      name: 'New Customer Welcome Series',
      description: 'Automated welcome sequence for new customers',
      status: 'active',
      trigger: {
        id: 'welcome_trigger',
        type: 'event',
        event: 'customer_signup'
      },
      conditions: [],
      actions: [
        {
          id: 'welcome_email',
          type: 'email',
          content: {
            subject: 'Welcome to {business_name}! 🎉',
            message: 'Thank you for choosing us! Here\'s what to expect...',
            cta: {
              text: 'Book Your First Appointment',
              url: '/book'
            }
          },
          personalization: {
            useCustomerName: true,
            useServiceHistory: false,
            useBrandVoice: true,
            includeRecommendations: true
          },
          timing: {
            delay: 5, // 5 minutes after signup
            sendTime: '10:00'
          }
        },
        {
          id: 'welcome_sms',
          type: 'sms',
          content: {
            message: 'Hi {customer_name}! Welcome to {business_name}. Reply STOP to opt out.'
          },
          personalization: {
            useCustomerName: true,
            useServiceHistory: false,
            useBrandVoice: true,
            includeRecommendations: false
          },
          timing: {
            delay: 60, // 1 hour after signup
            sendTime: '10:00'
          }
        }
      ]
    });
  }

  async createWinBackWorkflow(businessId: string): Promise<MarketingWorkflow> {
    return this.createWorkflow(businessId, {
      name: 'Win-Back Campaign',
      description: 'Re-engage customers who haven\'t visited recently',
      status: 'active',
      trigger: {
        id: 'winback_trigger',
        type: 'behavior',
        behavior: {
          action: 'no_visit',
          threshold: 1, // 1 occurrence
          timeframe: 60 // 60 days
        }
      },
      conditions: [
        {
          id: 'previous_customer',
          type: 'purchase_history',
          operator: 'greater_than',
          value: 0,
          field: 'total_visits'
        }
      ],
      actions: [
        {
          id: 'winback_email',
          type: 'email',
          content: {
            subject: 'We miss you! Come back for 20% off 💅',
            message: 'It\'s been a while since your last visit. We\'d love to see you again!',
            cta: {
              text: 'Claim Your 20% Discount',
              url: '/book?discount=COMEBACK20'
            }
          },
          personalization: {
            useCustomerName: true,
            useServiceHistory: true,
            useBrandVoice: true,
            includeRecommendations: true
          },
          timing: {
            delay: 0,
            sendTime: '14:00'
          }
        }
      ]
    });
  }

  async createBirthdayWorkflow(businessId: string): Promise<MarketingWorkflow> {
    return this.createWorkflow(businessId, {
      name: 'Birthday Special Campaign',
      description: 'Send birthday offers to customers',
      status: 'active',
      trigger: {
        id: 'birthday_trigger',
        type: 'date',
        date: {
          type: 'birthday',
          offset: -7 // 7 days before birthday
        }
      },
      conditions: [],
      actions: [
        {
          id: 'birthday_email',
          type: 'email',
          content: {
            subject: '🎂 Happy Birthday {customer_name}! Special Gift Inside',
            message: 'Celebrate your special day with us! Enjoy a complimentary service.',
            cta: {
              text: 'Book Your Birthday Treat',
              url: '/book?promo=BIRTHDAY'
            }
          },
          personalization: {
            useCustomerName: true,
            useServiceHistory: true,
            useBrandVoice: true,
            includeRecommendations: true
          },
          timing: {
            delay: 0,
            sendTime: '09:00'
          }
        }
      ]
    });
  }

  /**
   * Execute workflow when triggered
   */
  async executeWorkflow(
    workflowId: string,
    customerId: string,
    triggerData?: any
  ): Promise<CampaignExecution> {
    try {
      const workflow = this.workflows.get(workflowId);
      
      if (!workflow || workflow.status !== 'active') {
        throw new Error('Workflow not found or inactive');
      }

      // Check conditions
      const conditionsMet = await this.evaluateConditions(workflow.conditions, customerId, workflow.businessId);
      
      if (!conditionsMet) {
        console.log(`Conditions not met for workflow ${workflowId}, customer ${customerId}`);
        return null;
      }

      // Create execution record
      const execution: CampaignExecution = {
        workflowId,
        customerId,
        triggeredAt: new Date(),
        actions: workflow.actions.map(action => ({
          actionId: action.id,
          status: 'pending'
        }))
      };

      // Store execution
      const businessExecutions = this.executions.get(workflow.businessId) || [];
      businessExecutions.push(execution);
      this.executions.set(workflow.businessId, businessExecutions);

      // Execute actions
      for (const action of workflow.actions) {
        try {
          await this.executeAction(action, customerId, workflow.businessId, triggerData);
          
          // Update execution status
          const actionExecution = execution.actions.find(a => a.actionId === action.id);
          if (actionExecution) {
            actionExecution.status = 'sent';
            actionExecution.sentAt = new Date();
          }

        } catch (actionError) {
          console.error(`Action execution failed: ${action.id}`, actionError);
          
          const actionExecution = execution.actions.find(a => a.actionId === action.id);
          if (actionExecution) {
            actionExecution.status = 'failed';
            actionExecution.error = actionError.toString();
          }
        }
      }

      // Update workflow analytics
      workflow.analytics.triggered++;
      workflow.analytics.sent += execution.actions.filter(a => a.status === 'sent').length;
      workflow.updatedAt = new Date();

      await this.persistWorkflow(workflow);

      console.log(`📧 Workflow executed: ${workflow.name} for customer ${customerId}`);

      return execution;

    } catch (error) {
      console.error('Workflow execution error:', error);
      throw new Error('Failed to execute workflow');
    }
  }

  /**
   * Execute individual marketing action
   */
  private async executeAction(
    action: MarketingAction,
    customerId: string,
    businessId: string,
    triggerData?: any
  ): Promise<void> {
    try {
      // Get customer and business data for personalization
      const [customerData, businessContext] = await Promise.all([
        this.getCustomerData(businessId, customerId),
        redisService.getBusinessContext(businessId)
      ]);

      // Generate personalized content
      const personalizedContent = await this.personalizeContent(
        action,
        customerData,
        businessContext,
        triggerData
      );

      // Send based on action type
      switch (action.type) {
        case 'email':
          await this.sendEmail(customerId, personalizedContent);
          break;
        
        case 'sms':
          await this.sendSMS(customerId, personalizedContent);
          break;
        
        case 'push':
          await this.sendPushNotification(customerId, personalizedContent);
          break;
        
        case 'social_post':
          await this.createSocialPost(businessId, personalizedContent);
          break;
      }

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'marketing_action_executed',
        data: {
          actionId: action.id,
          actionType: action.type,
          customerId,
          success: true
        }
      });

    } catch (error) {
      console.error('Action execution error:', error);
      
      await redisService.storeAIAnalytics(businessId, {
        type: 'marketing_action_failed',
        data: {
          actionId: action.id,
          actionType: action.type,
          customerId,
          error: error.toString()
        }
      });

      throw error;
    }
  }

  /**
   * Personalize content using AI
   */
  private async personalizeContent(
    action: MarketingAction,
    customerData: any,
    businessContext: any,
    triggerData?: any
  ): Promise<any> {
    try {
      let content = { ...action.content };

      if (action.personalization.useCustomerName && customerData?.name) {
        content.subject = content.subject?.replace('{customer_name}', customerData.name);
        content.message = content.message?.replace('{customer_name}', customerData.name);
      }

      if (businessContext?.businessName) {
        content.subject = content.subject?.replace('{business_name}', businessContext.businessName);
        content.message = content.message?.replace('{business_name}', businessContext.businessName);
      }

      // Use AI to enhance content if brand voice is enabled
      if (action.personalization.useBrandVoice && businessContext) {
        const enhancedContent = await openAIService.generateContent(
          action.type === 'email' ? 'email' : 'sms',
          businessContext,
          content.message,
          businessContext.brandVoice
        );

        content.message = enhancedContent.content;
        if (enhancedContent.subject) {
          content.subject = enhancedContent.subject;
        }
      }

      // Add service recommendations if enabled
      if (action.personalization.includeRecommendations && customerData?.serviceHistory) {
        const recommendations = await this.generateServiceRecommendations(
          businessContext,
          customerData
        );
        
        if (recommendations.length > 0) {
          content.message += `\n\nRecommended for you: ${recommendations.join(', ')}`;
        }
      }

      return content;

    } catch (error) {
      console.error('Content personalization error:', error);
      return action.content;
    }
  }

  /**
   * Evaluate workflow conditions
   */
  private async evaluateConditions(
    conditions: WorkflowCondition[],
    customerId: string,
    businessId: string
  ): Promise<boolean> {
    if (conditions.length === 0) return true;

    try {
      const customerData = await this.getCustomerData(businessId, customerId);

      for (const condition of conditions) {
        const fieldValue = this.getFieldValue(customerData, condition.field);
        const conditionMet = this.evaluateCondition(fieldValue, condition.operator, condition.value);
        
        if (!conditionMet) {
          return false;
        }
      }

      return true;

    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Get field value from customer data
   */
  private getFieldValue(customerData: any, field: string): any {
    const fields = field.split('.');
    let value = customerData;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    return value;
  }

  /**
   * Evaluate single condition
   */
  private evaluateCondition(fieldValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === expectedValue;
      case 'not_equals':
        return fieldValue !== expectedValue;
      case 'greater_than':
        return fieldValue > expectedValue;
      case 'less_than':
        return fieldValue < expectedValue;
      case 'contains':
        return Array.isArray(fieldValue) 
          ? fieldValue.includes(expectedValue)
          : String(fieldValue).includes(String(expectedValue));
      default:
        return false;
    }
  }

  /**
   * Send email (mock implementation)
   */
  private async sendEmail(customerId: string, content: any): Promise<void> {
    console.log(`📧 Sending email to customer ${customerId}:`, content.subject);
    // In production, integrate with email service (SendGrid, Resend, etc.)
  }

  /**
   * Send SMS (mock implementation)
   */
  private async sendSMS(customerId: string, content: any): Promise<void> {
    console.log(`📱 Sending SMS to customer ${customerId}:`, content.message);
    // In production, integrate with Twilio
  }

  /**
   * Send push notification (mock implementation)
   */
  private async sendPushNotification(customerId: string, content: any): Promise<void> {
    console.log(`🔔 Sending push notification to customer ${customerId}:`, content.message);
    // In production, integrate with push notification service
  }

  /**
   * Create social post (mock implementation)
   */
  private async createSocialPost(businessId: string, content: any): Promise<void> {
    console.log(`📱 Creating social post for business ${businessId}:`, content.message);
    // In production, integrate with social media APIs
  }

  /**
   * Generate service recommendations
   */
  private async generateServiceRecommendations(
    businessContext: any,
    customerData: any
  ): Promise<string[]> {
    try {
      if (!businessContext?.services || !customerData?.serviceHistory) {
        return [];
      }

      // Simple recommendation logic
      const recommendations = businessContext.services
        .filter(service => !customerData.serviceHistory.includes(service.name))
        .slice(0, 2)
        .map(service => service.name);

      return recommendations;

    } catch (error) {
      console.error('Service recommendations error:', error);
      return [];
    }
  }

  /**
   * Get customer data
   */
  private async getCustomerData(businessId: string, customerId: string): Promise<any> {
    try {
      // Mock customer data - in production, get from database
      return {
        id: customerId,
        name: 'Customer Name',
        email: 'customer@example.com',
        phone: '+1234567890',
        serviceHistory: ['Manicure', 'Pedicure'],
        totalVisits: 5,
        totalSpent: 250,
        lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        birthday: new Date('1990-06-15')
      };

    } catch (error) {
      console.error('Get customer data error:', error);
      return null;
    }
  }

  /**
   * Persist workflow to storage
   */
  private async persistWorkflow(workflow: MarketingWorkflow): Promise<void> {
    try {
      await redisService.cacheAIResponse(
        `workflow_${workflow.id}`,
        workflow,
        { prefix: `business_${workflow.businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );
    } catch (error) {
      console.error('Persist workflow error:', error);
    }
  }

  /**
   * Get marketing insights
   */
  async getMarketingInsights(businessId: string): Promise<MarketingInsights> {
    try {
      const businessWorkflows = Array.from(this.workflows.values())
        .filter(w => w.businessId === businessId);

      const totalSent = businessWorkflows.reduce((sum, w) => sum + w.analytics.sent, 0);
      const totalOpened = businessWorkflows.reduce((sum, w) => sum + w.analytics.opened, 0);
      const totalClicked = businessWorkflows.reduce((sum, w) => sum + w.analytics.clicked, 0);

      return {
        totalWorkflows: businessWorkflows.length,
        activeWorkflows: businessWorkflows.filter(w => w.status === 'active').length,
        totalCampaignsSent: totalSent,
        averageOpenRate: totalSent > 0 ? totalOpened / totalSent : 0,
        averageClickRate: totalOpened > 0 ? totalClicked / totalOpened : 0,
        totalRevenue: businessWorkflows.reduce((sum, w) => sum + w.analytics.revenue, 0),
        topPerformingWorkflows: businessWorkflows
          .sort((a, b) => b.analytics.revenue - a.analytics.revenue)
          .slice(0, 3)
          .map(w => ({
            name: w.name,
            conversionRate: w.analytics.sent > 0 ? w.analytics.converted / w.analytics.sent : 0,
            revenue: w.analytics.revenue
          })),
        recommendations: [
          'Set up win-back campaigns for inactive customers',
          'Create birthday special workflows',
          'Implement post-service review requests',
          'Add upselling campaigns for regular customers'
        ]
      };

    } catch (error) {
      console.error('Marketing insights error:', error);
      return {
        totalWorkflows: 0,
        activeWorkflows: 0,
        totalCampaignsSent: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        totalRevenue: 0,
        topPerformingWorkflows: [],
        recommendations: []
      };
    }
  }
}

export const marketingAutomationService = MarketingAutomationService.getInstance();