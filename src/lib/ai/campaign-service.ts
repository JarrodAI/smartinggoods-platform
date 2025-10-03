/**
 * Email and SMS Campaign Service
 * Generates personalized campaigns with A/B testing and automation
 */

import { openAIService } from './openai-service';
import { redisService } from './redis-service';
import { smsService } from '../communications/sms-service';

export interface Campaign {
  id: string;
  businessId: string;
  type: 'email' | 'sms';
  campaignType: 'welcome' | 'promotional' | 'retention' | 'winback' | 'birthday' | 'appointment_reminder';
  name: string;
  audience: {
    segmentId: string;
    criteria: any;
    size: number;
  };
  content: {
    subject?: string;
    body: string;
    preheader?: string;
    cta: string;
    personalization: Record<string, string>;
  };
  abTest?: {
    enabled: boolean;
    variants: Array<{
      id: string;
      name: string;
      content: any;
      percentage: number;
    }>;
    testMetric: 'open_rate' | 'click_rate' | 'conversion_rate';
    duration: number;
  };
  schedule: {
    type: 'immediate' | 'scheduled' | 'recurring';
    scheduledDate?: Date;
    recurring?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      interval: number;
      endDate?: Date;
    };
  };
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'completed';
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    unsubscribed: number;
    bounced: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  };
  createdAt: Date;
  sentAt?: Date;
}

export interface CampaignRequest {
  businessId: string;
  type: 'email' | 'sms';
  campaignType: string;
  audience: any;
  subject?: string;
  prompt: string;
  personalization: Record<string, string>;
  abTest: boolean;
  userId: string;
}

export class CampaignService {
  private static instance: CampaignService;

  public static getInstance(): CampaignService {
    if (!CampaignService.instance) {
      CampaignService.instance = new CampaignService();
    }
    return CampaignService.instance;
  }

  /**
   * Generate a new campaign
   */
  async generateCampaign(request: CampaignRequest): Promise<Campaign> {
    try {
      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get business context and brand voice
      const businessContext = await redisService.getBusinessContext(request.businessId);
      const brandVoice = await redisService.getCachedAIResponse(
        `brand_voice_${request.businessId}`,
        'ai:content'
      );

      // Generate campaign content
      const content = await this.generateCampaignContent(
        request,
        businessContext,
        brandVoice
      );

      // Create A/B test variants if requested
      let abTest;
      if (request.abTest) {
        abTest = await this.generateABTestVariants(content, request, businessContext, brandVoice);
      }

      // Get audience size
      const audienceSize = await this.getAudienceSize(request.businessId, request.audience);

      const campaign: Campaign = {
        id: campaignId,
        businessId: request.businessId,
        type: request.type,
        campaignType: request.campaignType as any,
        name: this.generateCampaignName(request.campaignType, request.type),
        audience: {
          segmentId: request.audience.segmentId || 'all',
          criteria: request.audience,
          size: audienceSize
        },
        content,
        abTest,
        schedule: {
          type: 'immediate'
        },
        status: 'draft',
        analytics: {
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          unsubscribed: 0,
          bounced: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0
        },
        createdAt: new Date()
      };

      // Cache campaign
      await redisService.cacheAIResponse(
        `campaign_${campaignId}`,
        campaign,
        { prefix: 'ai:campaigns', ttl: 30 * 24 * 60 * 60 }
      );

      console.log(`📧 Generated ${request.type} campaign: ${campaign.name}`);
      return campaign;

    } catch (error) {
      console.error('Campaign generation error:', error);
      throw new Error('Failed to generate campaign');
    }
  }

  /**
   * Generate campaign content
   */
  private async generateCampaignContent(
    request: CampaignRequest,
    businessContext: any,
    brandVoice: any
  ): Promise<any> {
    try {
      // Build campaign prompt
      const campaignPrompt = this.buildCampaignPrompt(
        request.campaignType,
        request.prompt,
        businessContext,
        request.type
      );

      // Generate content using AI
      const aiResponse = await openAIService.generateContent(
        request.type === 'email' ? 'email' : 'sms',
        businessContext,
        campaignPrompt,
        brandVoice
      );

      // Structure content based on type
      if (request.type === 'email') {
        return {
          subject: request.subject || this.generateSubject(request.campaignType, businessContext),
          body: aiResponse.content,
          preheader: this.generatePreheader(aiResponse.content),
          cta: this.extractCTA(aiResponse.content),
          personalization: request.personalization
        };
      } else {
        return {
          body: this.truncateForSMS(aiResponse.content),
          cta: this.extractCTA(aiResponse.content),
          personalization: request.personalization
        };
      }

    } catch (error) {
      console.error('Campaign content generation error:', error);
      throw new Error('Failed to generate campaign content');
    }
  }

  /**
   * Generate A/B test variants
   */
  private async generateABTestVariants(
    originalContent: any,
    request: CampaignRequest,
    businessContext: any,
    brandVoice: any
  ): Promise<any> {
    try {
      const variants = [
        {
          id: 'variant_a',
          name: 'Original',
          content: originalContent,
          percentage: 50
        }
      ];

      // Generate variant B
      const variantPrompt = `Create a variation of this ${request.type} campaign with a different approach: ${request.prompt}. Make it more ${this.getVariantStyle(request.campaignType)}.`;
      
      const variantResponse = await openAIService.generateContent(
        request.type === 'email' ? 'email' : 'sms',
        businessContext,
        variantPrompt,
        brandVoice
      );

      let variantContent;
      if (request.type === 'email') {
        variantContent = {
          subject: this.generateAlternativeSubject(originalContent.subject),
          body: variantResponse.content,
          preheader: this.generatePreheader(variantResponse.content),
          cta: this.extractCTA(variantResponse.content),
          personalization: request.personalization
        };
      } else {
        variantContent = {
          body: this.truncateForSMS(variantResponse.content),
          cta: this.extractCTA(variantResponse.content),
          personalization: request.personalization
        };
      }

      variants.push({
        id: 'variant_b',
        name: 'Alternative',
        content: variantContent,
        percentage: 50
      });

      return {
        enabled: true,
        variants,
        testMetric: request.type === 'email' ? 'open_rate' : 'click_rate',
        duration: 24
      };

    } catch (error) {
      console.error('A/B test variant generation error:', error);
      return undefined;
    }
  }

  /**
   * Schedule a campaign
   */
  async scheduleCampaign(campaignId: string, scheduledDate: Date): Promise<Campaign> {
    try {
      const campaign = await redisService.getCachedAIResponse(
        `campaign_${campaignId}`,
        'ai:campaigns'
      );

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.schedule = {
        type: 'scheduled',
        scheduledDate
      };
      campaign.status = 'scheduled';

      await redisService.cacheAIResponse(
        `campaign_${campaignId}`,
        campaign,
        { prefix: 'ai:campaigns', ttl: 30 * 24 * 60 * 60 }
      );

      return campaign;

    } catch (error) {
      console.error('Schedule campaign error:', error);
      throw new Error('Failed to schedule campaign');
    }
  }

  /**
   * Send a campaign
   */
  async sendCampaign(campaignId: string): Promise<Campaign> {
    try {
      const campaign = await redisService.getCachedAIResponse(
        `campaign_${campaignId}`,
        'ai:campaigns'
      );

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      campaign.status = 'sending';
      campaign.sentAt = new Date();

      // Get audience
      const audience = await this.getAudienceContacts(campaign.businessId, campaign.audience);

      // Send campaign
      if (campaign.abTest?.enabled) {
        await this.sendABTestCampaign(campaign, audience);
      } else {
        await this.sendRegularCampaign(campaign, audience);
      }

      campaign.status = 'sent';
      campaign.analytics.sent = audience.length;

      await redisService.cacheAIResponse(
        `campaign_${campaignId}`,
        campaign,
        { prefix: 'ai:campaigns', ttl: 30 * 24 * 60 * 60 }
      );

      return campaign;

    } catch (error) {
      console.error('Send campaign error:', error);
      throw new Error('Failed to send campaign');
    }
  }

  /**
   * Get campaigns for a business
   */
  async getCampaigns(
    businessId: string,
    filters: {
      type?: string;
      status?: string;
      campaignType?: string;
    } = {}
  ): Promise<Campaign[]> {
    try {
      const businessCampaigns = await redisService.getCachedAIResponse(
        `business_campaigns_${businessId}`,
        'ai:campaigns'
      ) || [];

      let filteredCampaigns = businessCampaigns;

      if (filters.type) {
        filteredCampaigns = filteredCampaigns.filter((c: Campaign) => c.type === filters.type);
      }

      if (filters.status) {
        filteredCampaigns = filteredCampaigns.filter((c: Campaign) => c.status === filters.status);
      }

      if (filters.campaignType) {
        filteredCampaigns = filteredCampaigns.filter((c: Campaign) => c.campaignType === filters.campaignType);
      }

      filteredCampaigns.sort((a: Campaign, b: Campaign) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return filteredCampaigns;

    } catch (error) {
      console.error('Get campaigns error:', error);
      return [];
    }
  }

  async pauseCampaign(campaignId: string): Promise<Campaign> {
    const campaign = await redisService.getCachedAIResponse(`campaign_${campaignId}`, 'ai:campaigns');
    if (!campaign) throw new Error('Campaign not found');
    
    campaign.status = 'paused';
    await redisService.cacheAIResponse(`campaign_${campaignId}`, campaign, { prefix: 'ai:campaigns', ttl: 30 * 24 * 60 * 60 });
    return campaign;
  }

  async resumeCampaign(campaignId: string): Promise<Campaign> {
    const campaign = await redisService.getCachedAIResponse(`campaign_${campaignId}`, 'ai:campaigns');
    if (!campaign) throw new Error('Campaign not found');
    
    campaign.status = campaign.schedule.type === 'scheduled' ? 'scheduled' : 'draft';
    await redisService.cacheAIResponse(`campaign_${campaignId}`, campaign, { prefix: 'ai:campaigns', ttl: 30 * 24 * 60 * 60 });
    return campaign;
  }

  async updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<Campaign> {
    const campaign = await redisService.getCachedAIResponse(`campaign_${campaignId}`, 'ai:campaigns');
    if (!campaign) throw new Error('Campaign not found');
    
    Object.assign(campaign, updates);
    await redisService.cacheAIResponse(`campaign_${campaignId}`, campaign, { prefix: 'ai:campaigns', ttl: 30 * 24 * 60 * 60 });
    return campaign;
  }

  private buildCampaignPrompt(campaignType: string, basePrompt: string, businessContext: any, messageType: string): string {
    let prompt = basePrompt;

    switch (campaignType) {
      case 'welcome':
        prompt += ' This is a welcome message for new customers. Make them feel valued and introduce key services.';
        break;
      case 'promotional':
        prompt += ' This is a promotional campaign. Focus on the offer and create urgency.';
        break;
      case 'retention':
        prompt += ' This is for existing customers to encourage repeat visits. Focus on loyalty and value.';
        break;
      case 'winback':
        prompt += ' This is to win back inactive customers. Acknowledge their absence and offer incentives.';
        break;
    }

    if (messageType === 'sms') {
      prompt += ' Keep it concise for SMS (under 160 characters). Include a clear call-to-action.';
    } else {
      prompt += ' Create engaging email content with a compelling subject line and clear call-to-action.';
    }

    return prompt;
  }

  private generateCampaignName(campaignType: string, messageType: string): string {
    const date = new Date().toLocaleDateString();
    const typeNames: Record<string, string> = {
      welcome: 'Welcome Series',
      promotional: 'Promotion',
      retention: 'Customer Retention',
      winback: 'Win-Back',
      birthday: 'Birthday Special',
      appointment_reminder: 'Appointment Reminder'
    };

    const typeName = typeNames[campaignType] || campaignType;
    return `${typeName} ${messageType.toUpperCase()} - ${date}`;
  }

  private generateSubject(campaignType: string, businessContext: any): string {
    const businessName = businessContext.businessName || 'Your Salon';
    
    const subjects: Record<string, string> = {
      welcome: `Welcome to ${businessName}! 💅`,
      promotional: `Special Offer from ${businessName} ✨`,
      retention: `We miss you at ${businessName}`,
      winback: `Come back to ${businessName} - Special offer inside`,
      birthday: `Happy Birthday from ${businessName}! 🎉`,
      appointment_reminder: `Appointment Reminder - ${businessName}`
    };

    return subjects[campaignType] || `Message from ${businessName}`;
  }

  private generatePreheader(content: string): string {
    const firstSentence = content.split('.')[0];
    return firstSentence.length > 50 ? 
      firstSentence.substring(0, 47) + '...' : 
      firstSentence;
  }

  private extractCTA(content: string): string {
    const ctaPatterns = [
      /book now/i,
      /schedule today/i,
      /call us/i,
      /visit us/i,
      /learn more/i,
      /get started/i,
      /claim offer/i
    ];

    for (const pattern of ctaPatterns) {
      const match = content.match(pattern);
      if (match) return match[0];
    }

    return 'Book Now';
  }

  private truncateForSMS(content: string): string {
    if (content.length <= 160) return content;

    const truncated = content.substring(0, 157);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 100 ? 
      truncated.substring(0, lastSpace) + '...' : 
      truncated + '...';
  }

  private getVariantStyle(campaignType: string): string {
    const styles: Record<string, string> = {
      welcome: 'personal and warm',
      promotional: 'urgent and exciting',
      retention: 'appreciative and exclusive',
      winback: 'apologetic and generous',
      birthday: 'celebratory and fun',
      appointment_reminder: 'helpful and informative'
    };

    return styles[campaignType] || 'engaging and friendly';
  }

  private generateAlternativeSubject(originalSubject: string): string {
    if (originalSubject.includes('!')) {
      return originalSubject.replace('!', ' ✨');
    }
    return originalSubject + ' 💫';
  }

  private async getAudienceSize(businessId: string, audience: any): Promise<number> {
    return Math.floor(Math.random() * 500) + 50;
  }

  private async getAudienceContacts(businessId: string, audience: any): Promise<any[]> {
    const size = audience.size;
    const contacts = [];
    
    for (let i = 0; i < size; i++) {
      contacts.push({
        id: `customer_${i}`,
        email: `customer${i}@example.com`,
        phone: `+1555000${String(i).padStart(4, '0')}`,
        name: `Customer ${i + 1}`
      });
    }
    
    return contacts;
  }

  private async sendRegularCampaign(campaign: Campaign, audience: any[]): Promise<void> {
    try {
      for (const contact of audience) {
        if (campaign.type === 'sms') {
          await smsService.sendSMS({
            to: contact.phone,
            message: this.personalizeCampaignContent(campaign.content.body, contact),
            businessId: campaign.businessId
          });
        }
      }
    } catch (error) {
      console.error('Send regular campaign error:', error);
    }
  }

  private async sendABTestCampaign(campaign: Campaign, audience: any[]): Promise<void> {
    try {
      const variants = campaign.abTest?.variants || [];
      
      for (let i = 0; i < audience.length; i++) {
        const contact = audience[i];
        const variantIndex = i % variants.length;
        const variant = variants[variantIndex];
        
        if (campaign.type === 'sms') {
          await smsService.sendSMS({
            to: contact.phone,
            message: this.personalizeCampaignContent(variant.content.body, contact),
            businessId: campaign.businessId
          });
        }
      }
    } catch (error) {
      console.error('Send A/B test campaign error:', error);
    }
  }

  private personalizeCampaignContent(content: string, contact: any): string {
    let personalizedContent = content;
    
    personalizedContent = personalizedContent.replace(/\{name\}/g, contact.name || 'Valued Customer');
    personalizedContent = personalizedContent.replace(/\{first_name\}/g, contact.name?.split(' ')[0] || 'there');
    
    return personalizedContent;
  }
}

export const campaignService = CampaignService.getInstance();