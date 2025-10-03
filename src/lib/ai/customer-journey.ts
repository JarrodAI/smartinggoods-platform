/**
 * Customer Journey Automation Service
 * Manages automated customer journeys including welcome series, win-back campaigns, and special occasions
 */

import { redisService } from './redis-service';
import { workflowService } from './workflow-service';
import { campaignService } from './campaign-service';
import { smsService } from '../communications/sms-service';

export interface CustomerJourney {
  id: string;
  businessId: string;
  name: string;
  type: 'welcome_series' | 'winback_campaign' | 'birthday_series' | 'anniversary_series' | 'loyalty_journey' | 'reactivation';
  description: string;
  stages: JourneyStage[];
  triggers: {
    entry: JourneyTrigger;
    exit?: JourneyTrigger;
  };
  targeting: {
    segments: string[];
    conditions: any[];
  };
  analytics: {
    enrolled: number;
    completed: number;
    conversionRate: number;
    revenue: number;
    avgCompletionTime: number; // days
  };
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JourneyStage {
  id: string;
  name: string;
  order: number;
  delay: number; // hours after previous stage
  actions: JourneyAction[];
  conditions?: JourneyCondition[];
  exitCriteria?: JourneyCondition[];
}

export interface JourneyAction {
  type: 'send_email' | 'send_sms' | 'create_task' | 'apply_discount' | 'add_tag' | 'schedule_call' | 'send_gift';
  config: {
    template?: string;
    subject?: string;
    message?: string;
    discount?: {
      type: 'percentage' | 'fixed';
      value: number;
      code: string;
      expiry: number; // days
    };
    gift?: {
      type: string;
      value: number;
      description: string;
    };
    task?: {
      title: string;
      assignee: string;
      priority: 'low' | 'medium' | 'high';
    };
  };
}

export interface JourneyTrigger {
  event: 'customer_signup' | 'first_purchase' | 'no_activity' | 'birthday' | 'anniversary' | 'high_value' | 'churn_risk';
  conditions?: any[];
  timeframe?: number; // days
}

export interface JourneyCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface CustomerJourneyEnrollment {
  id: string;
  customerId: string;
  journeyId: string;
  businessId: string;
  currentStage: number;
  status: 'active' | 'completed' | 'paused' | 'exited';
  enrolledAt: Date;
  completedAt?: Date;
  stageHistory: Array<{
    stageId: string;
    enteredAt: Date;
    completedAt?: Date;
    actions: Array<{
      type: string;
      executedAt: Date;
      success: boolean;
      result?: any;
    }>;
  }>;
  metrics: {
    emailsOpened: number;
    linksClicked: number;
    conversions: number;
    revenue: number;
  };
}

export class CustomerJourneyService {
  private static instance: CustomerJourneyService;

  public static getInstance(): CustomerJourneyService {
    if (!CustomerJourneyService.instance) {
      CustomerJourneyService.instance = new CustomerJourneyService();
    }
    return CustomerJourneyService.instance;
  }

  /**
   * Create a new customer journey
   */
  async createJourney(journeyData: {
    businessId: string;
    name: string;
    type: string;
    stages: JourneyStage[];
    triggers: any;
    targeting: any;
  }): Promise<CustomerJourney> {
    try {
      const journeyId = `journey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const journey: CustomerJourney = {
        id: journeyId,
        businessId: journeyData.businessId,
        name: journeyData.name,
        type: journeyData.type as any,
        description: `Automated ${journeyData.type.replace('_', ' ')} journey`,
        stages: journeyData.stages,
        triggers: journeyData.triggers,
        targeting: journeyData.targeting,
        analytics: {
          enrolled: 0,
          completed: 0,
          conversionRate: 0,
          revenue: 0,
          avgCompletionTime: 0
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Cache journey
      await redisService.cacheAIResponse(
        `journey_${journeyId}`,
        journey,
        { prefix: 'ai:journeys', ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      // Add to business journeys list
      await this.addToBusinessJourneys(journeyData.businessId, journey);

      console.log(`🛤️ Created customer journey: ${journeyData.name}`);

      return journey;

    } catch (error) {
      console.error('Journey creation error:', error);
      throw new Error('Failed to create customer journey');
    }
  }

  /**
   * Create predefined welcome series journey
   */
  async createWelcomeSeriesJourney(businessId: string): Promise<CustomerJourney> {
    const stages: JourneyStage[] = [
      {
        id: 'welcome_immediate',
        name: 'Immediate Welcome',
        order: 1,
        delay: 0, // Immediate
        actions: [
          {
            type: 'send_email',
            config: {
              subject: 'Welcome to our salon family! 💅',
              message: 'Thank you for joining us! We\'re excited to help you look and feel amazing.'
            }
          }
        ]
      },
      {
        id: 'welcome_day2',
        name: 'Getting Started Guide',
        order: 2,
        delay: 48, // 2 days later
        actions: [
          {
            type: 'send_email',
            config: {
              subject: 'Your guide to our services ✨',
              message: 'Here\'s everything you need to know about our services and how to book your first appointment.'
            }
          }
        ]
      },
      {
        id: 'welcome_day7',
        name: 'First Visit Incentive',
        order: 3,
        delay: 168, // 7 days later
        actions: [
          {
            type: 'send_email',
            config: {
              subject: 'Special offer for your first visit! 🎉',
              message: 'Ready to experience our amazing services? Here\'s 20% off your first appointment!'
            }
          },
          {
            type: 'apply_discount',
            config: {
              discount: {
                type: 'percentage',
                value: 20,
                code: 'WELCOME20',
                expiry: 14
              }
            }
          }
        ]
      },
      {
        id: 'welcome_day14',
        name: 'Final Welcome Reminder',
        order: 4,
        delay: 336, // 14 days later
        actions: [
          {
            type: 'send_sms',
            config: {
              message: 'Don\'t miss out! Your 20% welcome discount expires soon. Book now! 💅'
            }
          }
        ]
      }
    ];

    return await this.createJourney({
      businessId,
      name: 'New Customer Welcome Series',
      type: 'welcome_series',
      stages,
      triggers: {
        entry: {
          event: 'customer_signup'
        }
      },
      targeting: {
        segments: ['new_customers'],
        conditions: []
      }
    });
  }

  /**
   * Create win-back campaign journey
   */
  async createWinBackJourney(businessId: string): Promise<CustomerJourney> {
    const stages: JourneyStage[] = [
      {
        id: 'winback_initial',
        name: 'We Miss You',
        order: 1,
        delay: 0,
        actions: [
          {
            type: 'send_email',
            config: {
              subject: 'We miss you! Come back and save 25% 💔',
              message: 'It\'s been a while since your last visit. We\'d love to welcome you back with a special offer!'
            }
          },
          {
            type: 'apply_discount',
            config: {
              discount: {
                type: 'percentage',
                value: 25,
                code: 'COMEBACK25',
                expiry: 21
              }
            }
          }
        ]
      },
      {
        id: 'winback_reminder',
        name: 'Reminder + Social Proof',
        order: 2,
        delay: 168, // 7 days later
        actions: [
          {
            type: 'send_email',
            config: {
              subject: 'See what you\'ve been missing! ✨',
              message: 'Check out the amazing transformations our other clients have been getting. Your discount is still waiting!'
            }
          }
        ]
      },
      {
        id: 'winback_final',
        name: 'Final Offer',
        order: 3,
        delay: 336, // 14 days later
        actions: [
          {
            type: 'send_sms',
            config: {
              message: 'Last chance! Your 25% comeback offer expires in 3 days. We\'d love to see you again! 💅'
            }
          }
        ]
      }
    ];

    return await this.createJourney({
      businessId,
      name: 'Win-Back Inactive Customers',
      type: 'winback_campaign',
      stages,
      triggers: {
        entry: {
          event: 'no_activity',
          timeframe: 90 // 90 days of inactivity
        }
      },
      targeting: {
        segments: ['inactive_customers'],
        conditions: [
          {
            field: 'last_visit_days',
            operator: 'greater_than',
            value: 90
          }
        ]
      }
    });
  }

  /**
   * Create birthday celebration journey
   */
  async createBirthdayJourney(businessId: string): Promise<CustomerJourney> {
    const stages: JourneyStage[] = [
      {
        id: 'birthday_week_before',
        name: 'Birthday Week Announcement',
        order: 1,
        delay: 0,
        actions: [
          {
            type: 'send_email',
            config: {
              subject: 'Your birthday week is coming up! 🎂',
              message: 'Get ready to celebrate! We have something special planned for your birthday week.'
            }
          }
        ]
      },
      {
        id: 'birthday_day',
        name: 'Happy Birthday Gift',
        order: 2,
        delay: 168, // 7 days later (birthday)
        actions: [
          {
            type: 'send_email',
            config: {
              subject: 'Happy Birthday! Here\'s your special gift 🎁',
              message: 'Happy Birthday! Enjoy a complimentary service on us to celebrate your special day!'
            }
          },
          {
            type: 'send_gift',
            config: {
              gift: {
                type: 'free_service',
                value: 50,
                description: 'Complimentary birthday service (up to $50 value)'
              }
            }
          }
        ]
      },
      {
        id: 'birthday_followup',
        name: 'Birthday Month Extension',
        order: 3,
        delay: 336, // 14 days after birthday
        actions: [
          {
            type: 'send_sms',
            config: {
              message: 'Hope you had an amazing birthday! Your birthday month isn\'t over - enjoy 15% off any service! 🎉'
            }
          },
          {
            type: 'apply_discount',
            config: {
              discount: {
                type: 'percentage',
                value: 15,
                code: 'BIRTHDAY15',
                expiry: 14
              }
            }
          }
        ]
      }
    ];

    return await this.createJourney({
      businessId,
      name: 'Birthday Celebration Series',
      type: 'birthday_series',
      stages,
      triggers: {
        entry: {
          event: 'birthday'
        }
      },
      targeting: {
        segments: ['all_customers'],
        conditions: [
          {
            field: 'has_birthday',
            operator: 'equals',
            value: true
          }
        ]
      }
    });
  }

  /**
   * Enroll customer in journey
   */
  async enrollCustomer(
    customerId: string,
    journeyId: string,
    businessId: string
  ): Promise<CustomerJourneyEnrollment> {
    try {
      const enrollmentId = `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const enrollment: CustomerJourneyEnrollment = {
        id: enrollmentId,
        customerId,
        journeyId,
        businessId,
        currentStage: 0,
        status: 'active',
        enrolledAt: new Date(),
        stageHistory: [],
        metrics: {
          emailsOpened: 0,
          linksClicked: 0,
          conversions: 0,
          revenue: 0
        }
      };

      // Cache enrollment
      await redisService.cacheAIResponse(
        `journey_enrollment_${enrollmentId}`,
        enrollment,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 } // 90 days
      );

      // Start journey execution
      await this.executeJourneyStage(enrollment);

      // Update journey analytics
      await this.updateJourneyAnalytics(journeyId, 'enrolled');

      console.log(`🎯 Enrolled customer ${customerId} in journey ${journeyId}`);

      return enrollment;

    } catch (error) {
      console.error('Customer enrollment error:', error);
      throw new Error('Failed to enroll customer in journey');
    }
  }

  /**
   * Execute journey stage
   */
  async executeJourneyStage(enrollment: CustomerJourneyEnrollment): Promise<void> {
    try {
      // Get journey details
      const journey = await redisService.getCachedAIResponse(
        `journey_${enrollment.journeyId}`,
        'ai:journeys'
      );

      if (!journey || !journey.active) {
        console.log('Journey not found or inactive');
        return;
      }

      const currentStage = journey.stages[enrollment.currentStage];
      if (!currentStage) {
        // Journey completed
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        await this.updateJourneyAnalytics(enrollment.journeyId, 'completed');
        return;
      }

      // Check stage conditions
      const conditionsMet = await this.evaluateStageConditions(
        currentStage.conditions || [],
        enrollment.customerId
      );

      if (!conditionsMet) {
        // Skip this stage
        enrollment.currentStage++;
        await this.executeJourneyStage(enrollment);
        return;
      }

      // Execute stage actions
      const stageExecution = {
        stageId: currentStage.id,
        enteredAt: new Date(),
        actions: []
      };

      for (const action of currentStage.actions) {
        try {
          const result = await this.executeJourneyAction(
            action,
            enrollment.customerId,
            enrollment.businessId
          );

          stageExecution.actions.push({
            type: action.type,
            executedAt: new Date(),
            success: true,
            result
          });

        } catch (actionError) {
          stageExecution.actions.push({
            type: action.type,
            executedAt: new Date(),
            success: false,
            result: { error: String(actionError) }
          });
        }
      }

      stageExecution.completedAt = new Date();
      enrollment.stageHistory.push(stageExecution as any);

      // Move to next stage
      enrollment.currentStage++;

      // Schedule next stage if there's a delay
      const nextStage = journey.stages[enrollment.currentStage];
      if (nextStage && nextStage.delay > 0) {
        // In a real implementation, this would use a job queue
        console.log(`⏰ Next stage scheduled in ${nextStage.delay} hours`);
      } else if (nextStage) {
        // Execute immediately
        await this.executeJourneyStage(enrollment);
      } else {
        // Journey completed
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        await this.updateJourneyAnalytics(enrollment.journeyId, 'completed');
      }

      // Update enrollment
      await redisService.cacheAIResponse(
        `journey_enrollment_${enrollment.id}`,
        enrollment,
        { prefix: `business_${enrollment.businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

    } catch (error) {
      console.error('Journey stage execution error:', error);
      enrollment.status = 'paused';
    }
  }

  /**
   * Execute journey action
   */
  private async executeJourneyAction(
    action: JourneyAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    switch (action.type) {
      case 'send_email':
        return await this.executeEmailAction(action, customerId, businessId);
      
      case 'send_sms':
        return await this.executeSMSAction(action, customerId, businessId);
      
      case 'apply_discount':
        return await this.executeDiscountAction(action, customerId, businessId);
      
      case 'send_gift':
        return await this.executeGiftAction(action, customerId, businessId);
      
      case 'create_task':
        return await this.executeTaskAction(action, customerId, businessId);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute email action
   */
  private async executeEmailAction(
    action: JourneyAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const campaign = await campaignService.generateCampaign({
        businessId,
        type: 'email',
        campaignType: 'retention',
        audience: { customerId },
        subject: action.config.subject || 'Message from your salon',
        prompt: action.config.message || 'Journey email message',
        personalization: {},
        abTest: false,
        userId: 'journey_system'
      });

      await campaignService.sendCampaign(campaign.id);
      return { success: true, campaignId: campaign.id };

    } catch (error) {
      console.error('Journey email action error:', error);
      throw error;
    }
  }

  /**
   * Execute SMS action
   */
  private async executeSMSAction(
    action: JourneyAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const customerPhone = `+1555000${customerId.slice(-4)}`;

      const result = await smsService.sendSMS({
        to: customerPhone,
        message: action.config.message || 'Journey SMS message',
        businessId
      });

      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('Journey SMS action error:', error);
      throw error;
    }
  }

  /**
   * Execute discount action
   */
  private async executeDiscountAction(
    action: JourneyAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const discount = {
        id: `journey_discount_${Date.now()}`,
        customerId,
        businessId,
        code: action.config.discount?.code || `JOURNEY${Date.now().toString().slice(-6)}`,
        type: action.config.discount?.type || 'percentage',
        value: action.config.discount?.value || 10,
        expiryDate: new Date(Date.now() + (action.config.discount?.expiry || 14) * 24 * 60 * 60 * 1000),
        used: false,
        createdAt: new Date()
      };

      await redisService.cacheAIResponse(
        `discount_${discount.id}`,
        discount,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      return { success: true, discountId: discount.id, code: discount.code };

    } catch (error) {
      console.error('Journey discount action error:', error);
      throw error;
    }
  }

  /**
   * Execute gift action
   */
  private async executeGiftAction(
    action: JourneyAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const gift = {
        id: `journey_gift_${Date.now()}`,
        customerId,
        businessId,
        type: action.config.gift?.type || 'service_credit',
        value: action.config.gift?.value || 25,
        description: action.config.gift?.description || 'Journey gift',
        redeemed: false,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        createdAt: new Date()
      };

      await redisService.cacheAIResponse(
        `gift_${gift.id}`,
        gift,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

      return { success: true, giftId: gift.id, gift };

    } catch (error) {
      console.error('Journey gift action error:', error);
      throw error;
    }
  }

  /**
   * Execute task action
   */
  private async executeTaskAction(
    action: JourneyAction,
    customerId: string,
    businessId: string
  ): Promise<any> {
    try {
      const task = {
        id: `journey_task_${Date.now()}`,
        title: action.config.task?.title || 'Follow up with customer',
        customerId,
        businessId,
        assignee: action.config.task?.assignee || 'system',
        priority: action.config.task?.priority || 'medium',
        status: 'pending',
        createdAt: new Date()
      };

      await redisService.cacheAIResponse(
        `task_${task.id}`,
        task,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      return { success: true, taskId: task.id };

    } catch (error) {
      console.error('Journey task action error:', error);
      throw error;
    }
  }

  /**
   * Evaluate stage conditions
   */
  private async evaluateStageConditions(
    conditions: JourneyCondition[],
    customerId: string
  ): Promise<boolean> {
    if (conditions.length === 0) return true;

    try {
      // For now, we'll implement basic condition evaluation
      // In a real implementation, this would check actual customer data
      
      for (const condition of conditions) {
        // Simulate condition evaluation
        const mockCustomerData = {
          total_spent: 500,
          visit_count: 5,
          last_visit_days: 30,
          engagement_score: 75
        };

        const actualValue = mockCustomerData[condition.field as keyof typeof mockCustomerData] || 0;
        
        switch (condition.operator) {
          case 'equals':
            if (actualValue !== condition.value) return false;
            break;
          case 'not_equals':
            if (actualValue === condition.value) return false;
            break;
          case 'greater_than':
            if (Number(actualValue) <= Number(condition.value)) return false;
            break;
          case 'less_than':
            if (Number(actualValue) >= Number(condition.value)) return false;
            break;
          case 'contains':
            if (!String(actualValue).includes(String(condition.value))) return false;
            break;
        }
      }

      return true;

    } catch (error) {
      console.error('Stage condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Get customer journeys
   */
  async getCustomerJourneys(
    businessId: string,
    filters: {
      type?: string;
      active?: boolean;
    } = {}
  ): Promise<CustomerJourney[]> {
    try {
      const businessJourneys = await redisService.getCachedAIResponse(
        `business_journeys_${businessId}`,
        'ai:journeys'
      ) || [];

      let filteredJourneys = businessJourneys;

      if (filters.type) {
        filteredJourneys = filteredJourneys.filter((j: CustomerJourney) => j.type === filters.type);
      }

      if (filters.active !== undefined) {
        filteredJourneys = filteredJourneys.filter((j: CustomerJourney) => j.active === filters.active);
      }

      return filteredJourneys;

    } catch (error) {
      console.error('Get customer journeys error:', error);
      return [];
    }
  }

  /**
   * Update journey analytics
   */
  private async updateJourneyAnalytics(journeyId: string, event: 'enrolled' | 'completed'): Promise<void> {
    try {
      const journey = await redisService.getCachedAIResponse(
        `journey_${journeyId}`,
        'ai:journeys'
      );

      if (journey) {
        if (event === 'enrolled') {
          journey.analytics.enrolled++;
        } else if (event === 'completed') {
          journey.analytics.completed++;
        }

        journey.analytics.conversionRate = journey.analytics.enrolled > 0 
          ? journey.analytics.completed / journey.analytics.enrolled 
          : 0;

        await redisService.cacheAIResponse(
          `journey_${journeyId}`,
          journey,
          { prefix: 'ai:journeys', ttl: 30 * 24 * 60 * 60 }
        );
      }

    } catch (error) {
      console.error('Update journey analytics error:', error);
    }
  }

  /**
   * Add journey to business journeys list
   */
  private async addToBusinessJourneys(businessId: string, journey: CustomerJourney): Promise<void> {
    try {
      const businessJourneys = await redisService.getCachedAIResponse(
        `business_journeys_${businessId}`,
        'ai:journeys'
      ) || [];

      businessJourneys.push(journey);

      await redisService.cacheAIResponse(
        `business_journeys_${businessId}`,
        businessJourneys,
        { prefix: 'ai:journeys', ttl: 30 * 24 * 60 * 60 }
      );

    } catch (error) {
      console.error('Add to business journeys error:', error);
    }
  }
}

export const customerJourneyService = CustomerJourneyService.getInstance();