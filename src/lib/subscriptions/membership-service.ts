/**
 * Membership and Subscription Revenue Engine
 * Manages recurring billing, membership tiers, and retention automation
 */

import Stripe from 'stripe';
import { OpenAIService } from '../ai/openai-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface MembershipTier {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    websites: number;
    aiCredits: number;
    customDomains: number;
    storage: number; // GB
    bandwidth: number; // GB
  };
  popular?: boolean;
  stripePriceId: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  tierId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
  usage: {
    websites: number;
    aiCredits: number;
    customDomains: number;
    storage: number;
    bandwidth: number;
  };
  stripeSubscriptionId: string;
}

export interface UsageAlert {
  type: 'approaching_limit' | 'limit_exceeded' | 'upgrade_recommended';
  resource: 'websites' | 'aiCredits' | 'customDomains' | 'storage' | 'bandwidth';
  currentUsage: number;
  limit: number;
  percentage: number;
  recommendedAction: string;
}

export class MembershipService {
  private openai: OpenAIService;
  private membershipTiers: MembershipTier[] = [];

  constructor() {
    this.openai = new OpenAIService();
    this.initializeMembershipTiers();
  }

  /**
   * Initialize membership tiers
   */
  private initializeMembershipTiers(): void {
    this.membershipTiers = [
      {
        id: 'starter',
        name: 'Starter',
        price: 29,
        interval: 'month',
        features: [
          'AI-powered chatbot',
          'Basic content generation',
          'Email marketing automation',
          'Social media scheduling',
          'Basic analytics',
          'Email support'
        ],
        limits: {
          websites: 1,
          aiCredits: 1000,
          customDomains: 1,
          storage: 5,
          bandwidth: 50
        },
        stripePriceId: 'price_starter_monthly'
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 79,
        interval: 'month',
        features: [
          'Everything in Starter',
          'Advanced AI training',
          'SMS/MMS marketing',
          'Customer churn prediction',
          'Virtual try-on technology',
          'Google Ads automation',
          'Priority support'
        ],
        limits: {
          websites: 5,
          aiCredits: 5000,
          customDomains: 5,
          storage: 25,
          bandwidth: 250
        },
        popular: true,
        stripePriceId: 'price_professional_monthly'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199,
        interval: 'month',
        features: [
          'Everything in Professional',
          'Unlimited AI credits',
          'Advanced predictive analytics',
          'Facebook/Instagram ads automation',
          'Custom integrations',
          'White-label options',
          'Dedicated account manager',
          '24/7 phone support'
        ],
        limits: {
          websites: 25,
          aiCredits: -1, // Unlimited
          customDomains: 25,
          storage: 100,
          bandwidth: 1000
        },
        stripePriceId: 'price_enterprise_monthly'
      },
      {
        id: 'agency',
        name: 'Agency',
        price: 499,
        interval: 'month',
        features: [
          'Everything in Enterprise',
          'Unlimited websites',
          'Multi-client management',
          'Revenue sharing program',
          'Custom branding',
          'API access',
          'Reseller dashboard',
          'Training and certification'
        ],
        limits: {
          websites: -1, // Unlimited
          aiCredits: -1, // Unlimited
          customDomains: -1, // Unlimited
          storage: 500,
          bandwidth: 5000
        },
        stripePriceId: 'price_agency_monthly'
      }
    ];
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    customerId: string,
    tierId: string,
    paymentMethodId?: string,
    trialDays?: number
  ): Promise<Subscription> {
    try {
      const tier = this.membershipTiers.find(t => t.id === tierId);
      if (!tier) {
        throw new Error('Invalid membership tier');
      }

      // Create Stripe customer if not exists
      let stripeCustomer;
      try {
        stripeCustomer = await stripe.customers.retrieve(customerId);
      } catch (error) {
        // Customer doesn't exist, create new one
        stripeCustomer = await stripe.customers.create({
          id: customerId,
          metadata: { customerId }
        });
      }

      // Attach payment method if provided
      if (paymentMethodId) {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });

        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }

      // Create subscription
      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: tier.stripePriceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          tierId,
          customerId
        }
      };

      if (trialDays && trialDays > 0) {
        subscriptionParams.trial_period_days = trialDays;
      }

      const stripeSubscription = await stripe.subscriptions.create(subscriptionParams);

      const subscription: Subscription = {
        id: `sub_${Date.now()}`,
        customerId,
        tierId,
        status: stripeSubscription.status as Subscription['status'],
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : undefined,
        usage: {
          websites: 0,
          aiCredits: 0,
          customDomains: 0,
          storage: 0,
          bandwidth: 0
        },
        stripeSubscriptionId: stripeSubscription.id
      };

      // Store subscription in database (implement based on your database)
      await this.storeSubscription(subscription);

      // Send welcome email
      await this.sendWelcomeEmail(customerId, tier);

      return subscription;

    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw new Error('Subscription creation failed');
    }
  }

  /**
   * Update subscription tier
   */
  async updateSubscription(subscriptionId: string, newTierId: string): Promise<Subscription> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const newTier = this.membershipTiers.find(t => t.id === newTierId);
      if (!newTier) {
        throw new Error('Invalid membership tier');
      }

      // Update Stripe subscription
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          items: [{
            id: (await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId)).items.data[0].id,
            price: newTier.stripePriceId,
          }],
          proration_behavior: 'create_prorations',
        }
      );

      // Update local subscription
      subscription.tierId = newTierId;
      subscription.status = stripeSubscription.status as Subscription['status'];

      await this.updateStoredSubscription(subscription);

      // Send upgrade confirmation
      await this.sendUpgradeConfirmation(subscription.customerId, newTier);

      return subscription;

    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw new Error('Subscription update failed');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Subscription> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      if (immediately) {
        // Cancel immediately
        await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        subscription.status = 'canceled';
      } else {
        // Cancel at period end
        await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });
        subscription.cancelAtPeriodEnd = true;
      }

      await this.updateStoredSubscription(subscription);

      // Trigger retention campaign
      await this.triggerRetentionCampaign(subscription.customerId, 'cancellation');

      return subscription;

    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw new Error('Subscription cancellation failed');
    }
  }

  /**
   * Track usage for a subscription
   */
  async trackUsage(
    subscriptionId: string,
    resource: keyof Subscription['usage'],
    amount: number
  ): Promise<UsageAlert[]> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const tier = this.membershipTiers.find(t => t.id === subscription.tierId);
      if (!tier) {
        throw new Error('Membership tier not found');
      }

      // Update usage
      subscription.usage[resource] += amount;
      await this.updateStoredSubscription(subscription);

      // Check for usage alerts
      const alerts = this.checkUsageAlerts(subscription, tier);

      // Send alerts if necessary
      if (alerts.length > 0) {
        await this.sendUsageAlerts(subscription.customerId, alerts);
      }

      return alerts;

    } catch (error) {
      console.error('Failed to track usage:', error);
      throw new Error('Usage tracking failed');
    }
  }

  /**
   * Check for usage alerts
   */
  private checkUsageAlerts(subscription: Subscription, tier: MembershipTier): UsageAlert[] {
    const alerts: UsageAlert[] = [];

    Object.entries(subscription.usage).forEach(([resource, usage]) => {
      const limit = tier.limits[resource as keyof typeof tier.limits];
      
      // Skip unlimited resources
      if (limit === -1) return;

      const percentage = (usage / limit) * 100;

      if (percentage >= 100) {
        alerts.push({
          type: 'limit_exceeded',
          resource: resource as keyof Subscription['usage'],
          currentUsage: usage,
          limit,
          percentage,
          recommendedAction: 'Upgrade your plan to continue using this feature'
        });
      } else if (percentage >= 80) {
        alerts.push({
          type: 'approaching_limit',
          resource: resource as keyof Subscription['usage'],
          currentUsage: usage,
          limit,
          percentage,
          recommendedAction: 'Consider upgrading your plan to avoid interruptions'
        });
      } else if (percentage >= 60 && this.shouldRecommendUpgrade(subscription, tier)) {
        alerts.push({
          type: 'upgrade_recommended',
          resource: resource as keyof Subscription['usage'],
          currentUsage: usage,
          limit,
          percentage,
          recommendedAction: 'Upgrade now and save with our annual discount'
        });
      }
    });

    return alerts;
  }

  /**
   * Determine if upgrade should be recommended
   */
  private shouldRecommendUpgrade(subscription: Subscription, tier: MembershipTier): boolean {
    // Recommend upgrade if user is consistently using high percentage of resources
    const highUsageResources = Object.entries(subscription.usage).filter(([resource, usage]) => {
      const limit = tier.limits[resource as keyof typeof tier.limits];
      return limit !== -1 && (usage / limit) >= 0.6;
    });

    return highUsageResources.length >= 2;
  }

  /**
   * Generate retention offers
   */
  async generateRetentionOffer(customerId: string, reason: 'cancellation' | 'payment_failed' | 'downgrade'): Promise<{
    offers: Array<{
      type: 'discount' | 'free_months' | 'feature_unlock' | 'personal_support';
      description: string;
      value: number;
      duration: string;
      code?: string;
    }>;
    message: string;
  }> {
    try {
      const subscription = await this.getSubscriptionByCustomer(customerId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const tier = this.membershipTiers.find(t => t.id === subscription.tierId);
      if (!tier) {
        throw new Error('Membership tier not found');
      }

      const offers = [];

      // Generate personalized offers based on reason and tier
      if (reason === 'cancellation') {
        if (tier.id === 'starter') {
          offers.push({
            type: 'discount' as const,
            description: '50% off for the next 3 months',
            value: 50,
            duration: '3 months',
            code: `SAVE50_${Date.now()}`
          });
        } else {
          offers.push({
            type: 'free_months' as const,
            description: '2 months free if you stay',
            value: tier.price * 2,
            duration: '2 months'
          });
        }

        offers.push({
          type: 'personal_support' as const,
          description: 'Free 1-on-1 setup consultation',
          value: 200,
          duration: '1 session'
        });
      }

      if (reason === 'payment_failed') {
        offers.push({
          type: 'discount' as const,
          description: '25% off next payment',
          value: 25,
          duration: '1 month',
          code: `RETRY25_${Date.now()}`
        });
      }

      // Generate personalized message using AI
      const message = await this.generateRetentionMessage(customerId, reason, offers);

      return { offers, message };

    } catch (error) {
      console.error('Failed to generate retention offer:', error);
      throw new Error('Retention offer generation failed');
    }
  }

  /**
   * Generate personalized retention message
   */
  private async generateRetentionMessage(
    customerId: string,
    reason: string,
    offers: any[]
  ): Promise<string> {
    const prompt = `
Generate a personalized retention message for a customer who is ${reason === 'cancellation' ? 'canceling' : reason === 'payment_failed' ? 'having payment issues' : 'downgrading'} their subscription.

Available offers:
${offers.map(offer => `- ${offer.description} (${offer.type})`).join('\n')}

Create a warm, understanding message that:
1. Acknowledges their situation
2. Highlights the value they'll lose
3. Presents the offers naturally
4. Includes a clear call-to-action

Keep it under 150 words and make it feel personal, not corporate.
`;

    try {
      const response = await this.openai.generateCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a customer success specialist who writes empathetic, effective retention messages.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'gpt-4-turbo-preview',
        temperature: 0.7
      });

      return response.choices[0].message.content || 'We value your business and would love to keep you as a customer.';

    } catch (error) {
      console.error('Failed to generate retention message:', error);
      return 'We value your business and would love to keep you as a customer.';
    }
  }

  /**
   * Trigger retention campaign
   */
  private async triggerRetentionCampaign(customerId: string, trigger: string): Promise<void> {
    try {
      // Generate retention offer
      const retentionOffer = await this.generateRetentionOffer(customerId, trigger as any);

      // Send retention email
      await this.sendRetentionEmail(customerId, retentionOffer);

      // Schedule follow-up campaigns
      await this.scheduleFollowUpCampaigns(customerId, trigger);

    } catch (error) {
      console.error('Failed to trigger retention campaign:', error);
    }
  }

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    totalRevenue: number;
    activeSubscriptions: number;
    newSubscriptions: number;
    canceledSubscriptions: number;
    churnRate: number;
    averageRevenuePerUser: number;
    lifetimeValue: number;
    tierDistribution: { [tierId: string]: number };
    revenueByTier: { [tierId: string]: number };
    retentionRate: number;
    upgradeRate: number;
    downgradeRate: number;
  }> {
    // This would typically query your database for actual analytics
    // For now, returning mock data structure
    return {
      totalRevenue: 0,
      activeSubscriptions: 0,
      newSubscriptions: 0,
      canceledSubscriptions: 0,
      churnRate: 0,
      averageRevenuePerUser: 0,
      lifetimeValue: 0,
      tierDistribution: {},
      revenueByTier: {},
      retentionRate: 0,
      upgradeRate: 0,
      downgradeRate: 0
    };
  }

  /**
   * Get membership tiers
   */
  getMembershipTiers(): MembershipTier[] {
    return this.membershipTiers;
  }

  /**
   * Get tier by ID
   */
  getTier(tierId: string): MembershipTier | null {
    return this.membershipTiers.find(t => t.id === tierId) || null;
  }

  // Private helper methods (implement based on your database)
  private async storeSubscription(subscription: Subscription): Promise<void> {
    // Implement database storage
  }

  private async updateStoredSubscription(subscription: Subscription): Promise<void> {
    // Implement database update
  }

  private async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    // Implement database query
    return null;
  }

  private async getSubscriptionByCustomer(customerId: string): Promise<Subscription | null> {
    // Implement database query
    return null;
  }

  private async sendWelcomeEmail(customerId: string, tier: MembershipTier): Promise<void> {
    // Implement email sending
  }

  private async sendUpgradeConfirmation(customerId: string, tier: MembershipTier): Promise<void> {
    // Implement email sending
  }

  private async sendUsageAlerts(customerId: string, alerts: UsageAlert[]): Promise<void> {
    // Implement alert sending
  }

  private async sendRetentionEmail(customerId: string, offer: any): Promise<void> {
    // Implement retention email
  }

  private async scheduleFollowUpCampaigns(customerId: string, trigger: string): Promise<void> {
    // Implement campaign scheduling
  }
}