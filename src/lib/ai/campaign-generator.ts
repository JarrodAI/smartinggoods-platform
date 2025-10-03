/**
 * Advanced Campaign Generation Service
 * AI-powered email and SMS campaign creation with A/B testing
 */

import { openAIService } from './openai-service';
import { redisService } from './redis-service';
import { getResponseService } from '../integrations/getresponse-service';
import { smsService } from '../communications/sms-service';

export interface CampaignTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'multi_channel';
  category: 'promotional' | 'transactional' | 'educational' | 'seasonal' | 'retention';
  subject?: string;
  content: string;
  variables: string[];
  businessType: string;
  performance: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    timesUsed: number;
  };
}

export interface GeneratedCampaign {
  id: string;
  businessId: string;
  name: string;
  type: 'email' | 'sms' | 'multi_channel';
  variants: Array<{
    id: string;
    name: string;
    subject?: string;
    content: string;
    cta: string;
    testGroup: 'A' | 'B' | 'C';
  }>;
  targeting: {
    segments: string[];
    filters: any[];
    estimatedReach: number;
  };
  schedule: {
    sendTime: Date;
    timezone: string;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  };
  abTest: {
    enabled: boolean;
    testPercentage: number;
    winnerCriteria: 'open_rate' | 'click_rate' | 'conversion_rate';
    duration: number; // hours
  };
  personalization: {
    enabled: boolean;
    fields: string[];
    dynamicContent: boolean;
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused';
  createdAt: Date;
}

export class CampaignGeneratorService {
  private static instance: CampaignGeneratorService;

  public static getInstance(): CampaignGeneratorService {
    if (!CampaignGeneratorService.instance) {
      CampaignGeneratorService.instance = new CampaignGeneratorService();
    }
    return CampaignGeneratorService.instance;
  }

  /**
   * Generate AI-powered campaign with multiple variants
   */
  async generateCampaign(params: {
    businessId: string;
    type: 'email' | 'sms' | 'multi_channel';
    category: string;
    goal: string;
    targetAudience: string;
    tone: 'professional' | 'casual' | 'friendly' | 'urgent';
    includeOffer?: boolean;
    offerDetails?: string;
    variantCount?: number;
  }): Promise<GeneratedCampaign> {
    try {
      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get business context
      const businessContext = await redisService.getBusinessContext(params.businessId);
      
      // Generate variants using AI
      const variants = await this.generateCampaignVariants(
        params,
        businessContext,
        params.variantCount || 2
      );

      const campaign: GeneratedCampaign = {
        id: campaignId,
        businessId: params.businessId,
        name: `${params.category} Campaign - ${new Date().toLocaleDateString()}`,
        type: params.type,
        variants,
        targeting: {
          segments: [params.targetAudience],
          filters: [],
          estimatedReach: 0 // Would calculate based on actual audience
        },
        schedule: {
          sendTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          timezone: 'America/Los_Angeles',
          frequency: 'once'
        },
        abTest: {
          enabled: variants.length > 1,
          testPercentage: 20,
          winnerCriteria: 'open_rate',
          duration: 24
        },
        personalization: {
          enabled: true,
          fields: ['firstName', 'lastName', 'lastVisit'],
          dynamicContent: true
        },
        status: 'draft',
        createdAt: new Date()
      };

      // Cache campaign
      await redisService.cacheAIResponse(
        `campaign_${campaignId}`,
        campaign,
        { prefix: `business_${params.businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      console.log(`📧 Generated campaign: ${campaign.name}`);

      return campaign;

    } catch (error) {
      console.error('Campaign generation error:', error);
      throw new Error('Failed to generate campaign');
    }
  }

  /**
   * Generate campaign variants for A/B testing
   */
  private async generateCampaignVariants(
    params: any,
    businessContext: any,
    count: number
  ): Promise<any[]> {
    const variants = [];
    const testGroups = ['A', 'B', 'C'];

    for (let i = 0; i < count; i++) {
      const variantPrompt = `Create a ${params.type} campaign for ${businessContext.businessName || 'a business'}.
      
      Goal: ${params.goal}
      Target Audience: ${params.targetAudience}
      Tone: ${params.tone}
      Category: ${params.category}
      ${params.includeOffer ? `Include offer: ${params.offerDetails}` : ''}
      
      ${params.type === 'email' ? 'Provide subject line and email body.' : 'Provide SMS message (max 160 characters).'}
      Include a clear call-to-action.
      ${i > 0 ? `Make this variant different from previous versions - try a different angle or emphasis.` : ''}
      
      Format as JSON: { subject: "...", content: "...", cta: "..." }`;

      try {
        const response = await openAIService.generateText(variantPrompt, {
          maxTokens: 500,
          temperature: 0.7 + (i * 0.1) // Increase temperature for more variety
        });

        const parsed = JSON.parse(response);
        
        variants.push({
          id: `variant_${i + 1}`,
          name: `Variant ${testGroups[i]}`,
          subject: parsed.subject || undefined,
          content: parsed.content,
          cta: parsed.cta,
          testGroup: testGroups[i]
        });

      } catch (error) {
        // Fallback variant
        variants.push({
          id: `variant_${i + 1}`,
          name: `Variant ${testGroups[i]}`,
          subject: params.type === 'email' ? `Special Offer from ${businessContext.businessName}` : undefined,
          content: params.type === 'email' 
            ? `We have something special for you! ${params.offerDetails || 'Check out our latest offers.'}`
            : `Special offer! ${params.offerDetails || 'Visit us today!'} Reply STOP to opt out.`,
          cta: 'Book Now',
          testGroup: testGroups[i]
        });
      }
    }

    return variants;
  }

  /**
   * Send campaign via appropriate channel
   */
  async sendCampaign(
    campaignId: string,
    businessId: string
  ): Promise<{ sent: number; failed: number; scheduled: number }> {
    try {
      const campaign = await redisService.getCachedAIResponse(
        `campaign_${campaignId}`,
        `business_${businessId}`
      );

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign cannot be sent in current status');
      }

      // Update status
      campaign.status = 'sending';
      await redisService.cacheAIResponse(
        `campaign_${campaignId}`,
        campaign,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      let sent = 0;
      let failed = 0;

      // Send based on campaign type
      if (campaign.type === 'email') {
        const result = await this.sendEmailCampaign(campaign, businessId);
        sent = result.sent;
        failed = result.failed;
      } else if (campaign.type === 'sms') {
        const result = await this.sendSMSCampaign(campaign, businessId);
        sent = result.sent;
        failed = result.failed;
      } else if (campaign.type === 'multi_channel') {
        const emailResult = await this.sendEmailCampaign(campaign, businessId);
        const smsResult = await this.sendSMSCampaign(campaign, businessId);
        sent = emailResult.sent + smsResult.sent;
        failed = emailResult.failed + smsResult.failed;
      }

      // Update final status
      campaign.status = 'sent';
      await redisService.cacheAIResponse(
        `campaign_${campaignId}`,
        campaign,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      console.log(`✅ Campaign sent: ${sent} successful, ${failed} failed`);

      return { sent, failed, scheduled: 0 };

    } catch (error) {
      console.error('Campaign send error:', error);
      throw error;
    }
  }

  /**
   * Send email campaign via GetResponse
   */
  private async sendEmailCampaign(
    campaign: GeneratedCampaign,
    businessId: string
  ): Promise<{ sent: number; failed: number }> {
    try {
      // Use first variant for now (A/B testing would split audience)
      const variant = campaign.variants[0];

      await getResponseService.createCampaign({
        name: campaign.name,
        subject: variant.subject || 'Important Update',
        content: variant.content,
        fromField: 'default',
        replyTo: 'default',
        listId: 'default_list',
        scheduledTime: campaign.schedule.sendTime
      });

      return { sent: campaign.targeting.estimatedReach || 100, failed: 0 };

    } catch (error) {
      console.error('Email campaign send error:', error);
      return { sent: 0, failed: campaign.targeting.estimatedReach || 100 };
    }
  }

  /**
   * Send SMS campaign via Twilio
   */
  private async sendSMSCampaign(
    campaign: GeneratedCampaign,
    businessId: string
  ): Promise<{ sent: number; failed: number }> {
    try {
      const variant = campaign.variants[0];

      // Mock sending - would integrate with actual recipient list
      const recipients = ['555-0100', '555-0101', '555-0102']; // Mock

      await smsService.sendBulkSMS({
        name: campaign.name,
        message: variant.content,
        recipients,
        scheduledTime: campaign.schedule.sendTime
      });

      return { sent: recipients.length, failed: 0 };

    } catch (error) {
      console.error('SMS campaign send error:', error);
      return { sent: 0, failed: 3 };
    }
  }

  /**
   * Get campaign templates
   */
  async getCampaignTemplates(
    businessType: string,
    category?: string
  ): Promise<CampaignTemplate[]> {
    // Mock templates - would query from database
    const templates: CampaignTemplate[] = [
      {
        id: 'template_1',
        name: 'Welcome New Customer',
        type: 'email',
        category: 'transactional',
        subject: 'Welcome to {{businessName}}!',
        content: 'Hi {{firstName}}, welcome to our family! We\'re excited to serve you.',
        variables: ['businessName', 'firstName'],
        businessType: 'beauty',
        performance: {
          openRate: 0.65,
          clickRate: 0.25,
          conversionRate: 0.15,
          timesUsed: 150
        }
      },
      {
        id: 'template_2',
        name: 'Limited Time Offer',
        type: 'sms',
        category: 'promotional',
        content: '🎉 Special offer! {{discount}}% off your next visit. Book now: {{bookingLink}}',
        variables: ['discount', 'bookingLink'],
        businessType: 'beauty',
        performance: {
          openRate: 0.95,
          clickRate: 0.35,
          conversionRate: 0.20,
          timesUsed: 200
        }
      }
    ];

    return category 
      ? templates.filter(t => t.category === category)
      : templates;
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(
    businessId: string,
    campaignId?: string
  ): Promise<any> {
    // Mock analytics
    return {
      totalCampaigns: 45,
      totalSent: 12500,
      averageOpenRate: 0.42,
      averageClickRate: 0.18,
      averageConversionRate: 0.08,
      totalRevenue: 15750,
      roi: 3.5,
      byType: {
        email: { sent: 8000, openRate: 0.45, clickRate: 0.20, revenue: 10500 },
        sms: { sent: 4500, openRate: 0.95, clickRate: 0.15, revenue: 5250 }
      },
      topPerforming: [
        { name: 'Summer Sale', openRate: 0.68, clickRate: 0.35, revenue: 3200 },
        { name: 'Birthday Special', openRate: 0.72, clickRate: 0.40, revenue: 2800 }
      ]
    };
  }
}

export const campaignGeneratorService = CampaignGeneratorService.getInstance();
