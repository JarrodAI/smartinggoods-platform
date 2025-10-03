/**
 * Advanced SMS/MMS Service - Rich Multimedia Messaging
 * Handles SMS, MMS, voice calls, and WhatsApp messaging via Twilio
 */

import twilio from 'twilio';
import { redisService } from '../ai/redis-service';

export interface SMSMessage {
  id: string;
  businessId: string;
  customerId: string;
  to: string;
  from: string;
  body: string;
  mediaUrls?: string[];
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  cost?: number;
  errorCode?: string;
  errorMessage?: string;
}

export interface MMSMessage extends SMSMessage {
  mediaUrls: string[];
  mediaTypes: string[];
  mediaSize: number;
}

export interface VoiceCall {
  id: string;
  businessId: string;
  customerId: string;
  to: string;
  from: string;
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'failed' | 'no-answer';
  duration?: number;
  recordingUrl?: string;
  cost?: number;
  timestamp: Date;
}

export interface WhatsAppMessage {
  id: string;
  businessId: string;
  customerId: string;
  to: string;
  from: string;
  body: string;
  mediaUrls?: string[];
  templateName?: string;
  templateParams?: string[];
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
}

export interface CommunicationCampaign {
  id: string;
  businessId: string;
  name: string;
  type: 'sms' | 'mms' | 'voice' | 'whatsapp';
  recipients: Array<{
    customerId: string;
    phone: string;
    name?: string;
    personalizations?: Record<string, string>;
  }>;
  content: {
    message: string;
    mediaUrls?: string[];
    voiceScript?: string;
    templateName?: string;
  };
  scheduling: {
    sendAt?: Date;
    timezone?: string;
    respectQuietHours: boolean;
    quietHours?: { start: string; end: string };
  };
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused';
  analytics: {
    sent: number;
    delivered: number;
    failed: number;
    responses: number;
    optOuts: number;
    cost: number;
  };
  createdAt: Date;
}

export class SMSService {
  private static instance: SMSService;
  private twilioClient: twilio.Twilio | null = null;
  private isInitialized = false;

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  /**
   * Initialize Twilio client
   */
  async initialize(): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;

      if (!accountSid || !authToken) {
        console.warn('⚠️ Twilio credentials not found, SMS service will use mock mode');
        this.isInitialized = false;
        return;
      }

      this.twilioClient = twilio(accountSid, authToken);
      
      // Test the connection
      await this.twilioClient.api.accounts(accountSid).fetch();
      
      this.isInitialized = true;
      console.log('✅ Twilio SMS service initialized successfully');

    } catch (error) {
      console.error('❌ Twilio initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Send SMS message
   */
  async sendSMS(
    businessId: string,
    to: string,
    message: string,
    options: {
      customerId?: string;
      from?: string;
      scheduledAt?: Date;
      trackClicks?: boolean;
      trackDelivery?: boolean;
    } = {}
  ): Promise<SMSMessage> {
    try {
      const messageId = `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fromNumber = options.from || process.env.TWILIO_PHONE_NUMBER || '+1234567890';

      let twilioMessage = null;
      let status: 'queued' | 'sent' | 'failed' = 'queued';
      let errorMessage = undefined;

      if (this.isInitialized && this.twilioClient) {
        try {
          // Add click tracking if enabled
          let processedMessage = message;
          if (options.trackClicks) {
            processedMessage = this.addClickTracking(message, businessId, messageId);
          }

          const twilioOptions: any = {
            body: processedMessage,
            from: fromNumber,
            to: to
          };

          // Schedule message if specified
          if (options.scheduledAt) {
            twilioOptions.sendAt = options.scheduledAt;
          }

          // Add delivery tracking
          if (options.trackDelivery) {
            twilioOptions.statusCallback = `${process.env.NEXTAUTH_URL}/api/communications/sms/webhook`;
          }

          twilioMessage = await this.twilioClient.messages.create(twilioOptions);
          status = 'sent';

        } catch (twilioError) {
          console.error('Twilio SMS error:', twilioError);
          status = 'failed';
          errorMessage = twilioError.toString();
        }
      } else {
        console.log(`📱 Mock SMS sent to ${to}: ${message}`);
        status = 'sent';
      }

      const smsMessage: SMSMessage = {
        id: messageId,
        businessId,
        customerId: options.customerId || 'unknown',
        to,
        from: fromNumber,
        body: message,
        status,
        direction: 'outbound',
        timestamp: new Date(),
        cost: twilioMessage?.price ? parseFloat(twilioMessage.price) : 0.01,
        errorMessage
      };

      // Store message
      await this.storeMessage(smsMessage);

      // Update campaign analytics if part of campaign
      await this.updateCampaignAnalytics(businessId, messageId, 'sent');

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'sms_sent',
        data: {
          messageId,
          to,
          length: message.length,
          cost: smsMessage.cost,
          status
        }
      });

      return smsMessage;

    } catch (error) {
      console.error('SMS sending error:', error);
      throw new Error('Failed to send SMS message');
    }
  }

  /**
   * Send MMS message with media
   */
  async sendMMS(
    businessId: string,
    to: string,
    message: string,
    mediaUrls: string[],
    options: {
      customerId?: string;
      from?: string;
      scheduledAt?: Date;
    } = {}
  ): Promise<MMSMessage> {
    try {
      const messageId = `mms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fromNumber = options.from || process.env.TWILIO_PHONE_NUMBER || '+1234567890';

      let twilioMessage = null;
      let status: 'queued' | 'sent' | 'failed' = 'queued';
      let errorMessage = undefined;

      if (this.isInitialized && this.twilioClient) {
        try {
          const twilioOptions: any = {
            body: message,
            from: fromNumber,
            to: to,
            mediaUrl: mediaUrls
          };

          if (options.scheduledAt) {
            twilioOptions.sendAt = options.scheduledAt;
          }

          twilioMessage = await this.twilioClient.messages.create(twilioOptions);
          status = 'sent';

        } catch (twilioError) {
          console.error('Twilio MMS error:', twilioError);
          status = 'failed';
          errorMessage = twilioError.toString();
        }
      } else {
        console.log(`📱 Mock MMS sent to ${to}: ${message} with ${mediaUrls.length} media files`);
        status = 'sent';
      }

      const mmsMessage: MMSMessage = {
        id: messageId,
        businessId,
        customerId: options.customerId || 'unknown',
        to,
        from: fromNumber,
        body: message,
        mediaUrls,
        mediaTypes: mediaUrls.map(url => this.getMediaType(url)),
        mediaSize: mediaUrls.length,
        status,
        direction: 'outbound',
        timestamp: new Date(),
        cost: twilioMessage?.price ? parseFloat(twilioMessage.price) : 0.05,
        errorMessage
      };

      // Store message
      await this.storeMessage(mmsMessage);

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'mms_sent',
        data: {
          messageId,
          to,
          mediaCount: mediaUrls.length,
          cost: mmsMessage.cost,
          status
        }
      });

      return mmsMessage;

    } catch (error) {
      console.error('MMS sending error:', error);
      throw new Error('Failed to send MMS message');
    }
  }

  /**
   * Make voice call
   */
  async makeVoiceCall(
    businessId: string,
    to: string,
    script: string,
    options: {
      customerId?: string;
      from?: string;
      record?: boolean;
      voiceUrl?: string;
    } = {}
  ): Promise<VoiceCall> {
    try {
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fromNumber = options.from || process.env.TWILIO_PHONE_NUMBER || '+1234567890';

      let twilioCall = null;
      let status: 'queued' | 'failed' = 'queued';
      let errorMessage = undefined;

      if (this.isInitialized && this.twilioClient) {
        try {
          const callOptions: any = {
            to: to,
            from: fromNumber,
            url: options.voiceUrl || `${process.env.NEXTAUTH_URL}/api/communications/voice/twiml`,
            method: 'POST'
          };

          if (options.record) {
            callOptions.record = true;
            callOptions.recordingStatusCallback = `${process.env.NEXTAUTH_URL}/api/communications/voice/recording`;
          }

          twilioCall = await this.twilioClient.calls.create(callOptions);

        } catch (twilioError) {
          console.error('Twilio voice call error:', twilioError);
          status = 'failed';
          errorMessage = twilioError.toString();
        }
      } else {
        console.log(`📞 Mock voice call to ${to}: ${script}`);
      }

      const voiceCall: VoiceCall = {
        id: callId,
        businessId,
        customerId: options.customerId || 'unknown',
        to,
        from: fromNumber,
        status,
        timestamp: new Date(),
        cost: 0.02 // Estimated cost per minute
      };

      // Store call record
      await redisService.cacheAIResponse(
        `voice_call_${callId}`,
        voiceCall,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'voice_call_initiated',
        data: {
          callId,
          to,
          status
        }
      });

      return voiceCall;

    } catch (error) {
      console.error('Voice call error:', error);
      throw new Error('Failed to initiate voice call');
    }
  }

  /**
   * Send WhatsApp message
   */
  async sendWhatsApp(
    businessId: string,
    to: string,
    message: string,
    options: {
      customerId?: string;
      mediaUrls?: string[];
      templateName?: string;
      templateParams?: string[];
    } = {}
  ): Promise<WhatsAppMessage> {
    try {
      const messageId = `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fromNumber = `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`;
      const toNumber = `whatsapp:${to}`;

      let twilioMessage = null;
      let status: 'queued' | 'sent' | 'failed' = 'queued';
      let errorMessage = undefined;

      if (this.isInitialized && this.twilioClient) {
        try {
          const messageOptions: any = {
            from: fromNumber,
            to: toNumber
          };

          if (options.templateName) {
            // Use WhatsApp template
            messageOptions.contentSid = options.templateName;
            if (options.templateParams) {
              messageOptions.contentVariables = JSON.stringify(
                options.templateParams.reduce((acc, param, index) => {
                  acc[`${index + 1}`] = param;
                  return acc;
                }, {} as Record<string, string>)
              );
            }
          } else {
            // Send regular message
            messageOptions.body = message;
            if (options.mediaUrls) {
              messageOptions.mediaUrl = options.mediaUrls;
            }
          }

          twilioMessage = await this.twilioClient.messages.create(messageOptions);
          status = 'sent';

        } catch (twilioError) {
          console.error('Twilio WhatsApp error:', twilioError);
          status = 'failed';
          errorMessage = twilioError.toString();
        }
      } else {
        console.log(`💬 Mock WhatsApp sent to ${to}: ${message}`);
        status = 'sent';
      }

      const whatsappMessage: WhatsAppMessage = {
        id: messageId,
        businessId,
        customerId: options.customerId || 'unknown',
        to,
        from: fromNumber,
        body: message,
        mediaUrls: options.mediaUrls,
        templateName: options.templateName,
        templateParams: options.templateParams,
        status,
        timestamp: new Date()
      };

      // Store message
      await redisService.cacheAIResponse(
        `whatsapp_${messageId}`,
        whatsappMessage,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'whatsapp_sent',
        data: {
          messageId,
          to,
          templateUsed: !!options.templateName,
          status
        }
      });

      return whatsappMessage;

    } catch (error) {
      console.error('WhatsApp sending error:', error);
      throw new Error('Failed to send WhatsApp message');
    }
  }

  /**
   * Create and execute communication campaign
   */
  async createCampaign(
    businessId: string,
    campaignData: Omit<CommunicationCampaign, 'id' | 'status' | 'analytics' | 'createdAt'>
  ): Promise<CommunicationCampaign> {
    try {
      const campaignId = `campaign_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const campaign: CommunicationCampaign = {
        id: campaignId,
        businessId,
        ...campaignData,
        status: 'draft',
        analytics: {
          sent: 0,
          delivered: 0,
          failed: 0,
          responses: 0,
          optOuts: 0,
          cost: 0
        },
        createdAt: new Date()
      };

      // Store campaign
      await redisService.cacheAIResponse(
        `campaign_${campaignId}`,
        campaign,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      console.log(`📢 Communication campaign created: ${campaign.name}`);

      return campaign;

    } catch (error) {
      console.error('Campaign creation error:', error);
      throw new Error('Failed to create communication campaign');
    }
  }

  /**
   * Execute communication campaign
   */
  async executeCampaign(campaignId: string): Promise<void> {
    try {
      const campaign = await this.getCampaign(campaignId);
      
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        throw new Error('Campaign cannot be executed in current status');
      }

      // Update status to sending
      campaign.status = 'sending';
      await this.updateCampaign(campaign);

      // Check if we should wait for scheduled time
      if (campaign.scheduling.sendAt && campaign.scheduling.sendAt > new Date()) {
        console.log(`📅 Campaign ${campaignId} scheduled for ${campaign.scheduling.sendAt}`);
        // In production, this would be handled by a job queue
        return;
      }

      // Send messages to all recipients
      for (const recipient of campaign.recipients) {
        try {
          // Check quiet hours
          if (campaign.scheduling.respectQuietHours && this.isQuietHours(campaign.scheduling.quietHours)) {
            console.log(`🔇 Skipping ${recipient.phone} due to quiet hours`);
            continue;
          }

          // Personalize message
          let personalizedMessage = campaign.content.message;
          if (recipient.personalizations) {
            for (const [key, value] of Object.entries(recipient.personalizations)) {
              personalizedMessage = personalizedMessage.replace(`{${key}}`, value);
            }
          }

          // Send based on campaign type
          switch (campaign.type) {
            case 'sms':
              await this.sendSMS(campaign.businessId, recipient.phone, personalizedMessage, {
                customerId: recipient.customerId
              });
              break;

            case 'mms':
              if (campaign.content.mediaUrls) {
                await this.sendMMS(campaign.businessId, recipient.phone, personalizedMessage, campaign.content.mediaUrls, {
                  customerId: recipient.customerId
                });
              }
              break;

            case 'whatsapp':
              await this.sendWhatsApp(campaign.businessId, recipient.phone, personalizedMessage, {
                customerId: recipient.customerId,
                mediaUrls: campaign.content.mediaUrls
              });
              break;

            case 'voice':
              if (campaign.content.voiceScript) {
                await this.makeVoiceCall(campaign.businessId, recipient.phone, campaign.content.voiceScript, {
                  customerId: recipient.customerId
                });
              }
              break;
          }

          campaign.analytics.sent++;

        } catch (recipientError) {
          console.error(`Failed to send to ${recipient.phone}:`, recipientError);
          campaign.analytics.failed++;
        }
      }

      // Update campaign status
      campaign.status = 'completed';
      await this.updateCampaign(campaign);

      console.log(`✅ Campaign ${campaignId} completed: ${campaign.analytics.sent} sent, ${campaign.analytics.failed} failed`);

    } catch (error) {
      console.error('Campaign execution error:', error);
      throw new Error('Failed to execute campaign');
    }
  }

  /**
   * Handle incoming SMS/MMS webhook
   */
  async handleIncomingMessage(webhookData: any): Promise<void> {
    try {
      const messageId = `incoming_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const incomingMessage: SMSMessage = {
        id: messageId,
        businessId: 'unknown', // Would need to determine from phone number
        customerId: 'unknown',
        to: webhookData.To,
        from: webhookData.From,
        body: webhookData.Body || '',
        mediaUrls: webhookData.MediaUrl0 ? [webhookData.MediaUrl0] : undefined,
        status: 'delivered',
        direction: 'inbound',
        timestamp: new Date()
      };

      // Store incoming message
      await this.storeMessage(incomingMessage);

      // Process auto-responses or forward to appropriate handler
      await this.processIncomingMessage(incomingMessage);

    } catch (error) {
      console.error('Incoming message handling error:', error);
    }
  }

  /**
   * Get campaign analytics
   */
  async getCampaignAnalytics(businessId: string, timeRange?: { start: Date; end: Date }): Promise<{
    totalCampaigns: number;
    totalMessagesSent: number;
    totalCost: number;
    averageDeliveryRate: number;
    averageResponseRate: number;
    topPerformingCampaigns: Array<{
      name: string;
      sent: number;
      deliveryRate: number;
      responseRate: number;
    }>;
  }> {
    try {
      // Get all campaigns for business
      // In production, this would query the database with time range filters
      
      return {
        totalCampaigns: 5,
        totalMessagesSent: 1250,
        totalCost: 62.50,
        averageDeliveryRate: 0.94,
        averageResponseRate: 0.12,
        topPerformingCampaigns: [
          {
            name: 'Welcome Series',
            sent: 300,
            deliveryRate: 0.96,
            responseRate: 0.18
          },
          {
            name: 'Birthday Offers',
            sent: 150,
            deliveryRate: 0.95,
            responseRate: 0.22
          }
        ]
      };

    } catch (error) {
      console.error('Campaign analytics error:', error);
      throw new Error('Failed to retrieve campaign analytics');
    }
  }

  /**
   * Store message in database/cache
   */
  private async storeMessage(message: SMSMessage | MMSMessage): Promise<void> {
    try {
      await redisService.cacheAIResponse(
        `message_${message.id}`,
        message,
        { prefix: `business_${message.businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );
    } catch (error) {
      console.error('Message storage error:', error);
    }
  }

  /**
   * Add click tracking to message
   */
  private addClickTracking(message: string, businessId: string, messageId: string): string {
    // Replace URLs with tracking URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.replace(urlRegex, (url) => {
      const trackingUrl = `${process.env.NEXTAUTH_URL}/api/communications/track/click?url=${encodeURIComponent(url)}&business=${businessId}&message=${messageId}`;
      return trackingUrl;
    });
  }

  /**
   * Get media type from URL
   */
  private getMediaType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'video';
      case 'mp3':
      case 'wav':
        return 'audio';
      case 'pdf':
        return 'document';
      default:
        return 'unknown';
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private isQuietHours(quietHours?: { start: string; end: string }): boolean {
    if (!quietHours) return false;

    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    
    const startTime = parseInt(quietHours.start.replace(':', ''));
    const endTime = parseInt(quietHours.end.replace(':', ''));

    if (startTime < endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Process incoming message for auto-responses
   */
  private async processIncomingMessage(message: SMSMessage): Promise<void> {
    try {
      // Check for opt-out keywords
      const optOutKeywords = ['STOP', 'UNSUBSCRIBE', 'QUIT', 'END', 'CANCEL'];
      if (optOutKeywords.some(keyword => message.body.toUpperCase().includes(keyword))) {
        await this.handleOptOut(message.from, message.businessId);
        return;
      }

      // Check for help keywords
      const helpKeywords = ['HELP', 'INFO', 'SUPPORT'];
      if (helpKeywords.some(keyword => message.body.toUpperCase().includes(keyword))) {
        await this.sendAutoResponse(message.from, message.businessId, 'help');
        return;
      }

      // Forward to AI chat system for intelligent response
      // This would integrate with the AI chat service

    } catch (error) {
      console.error('Incoming message processing error:', error);
    }
  }

  /**
   * Handle opt-out request
   */
  private async handleOptOut(phoneNumber: string, businessId: string): Promise<void> {
    try {
      // Add to opt-out list
      await redisService.cacheAIResponse(
        `optout_${phoneNumber}`,
        { phoneNumber, businessId, optedOutAt: new Date() },
        { prefix: `business_${businessId}`, ttl: 365 * 24 * 60 * 60 } // 1 year
      );

      // Send confirmation
      await this.sendSMS(businessId, phoneNumber, 'You have been unsubscribed from SMS messages. Reply START to resubscribe.');

    } catch (error) {
      console.error('Opt-out handling error:', error);
    }
  }

  /**
   * Send auto-response
   */
  private async sendAutoResponse(phoneNumber: string, businessId: string, type: string): Promise<void> {
    try {
      const responses = {
        help: 'For assistance, please call us or visit our website. Reply STOP to unsubscribe.',
        welcome: 'Welcome! We\'re excited to serve you. Reply HELP for assistance or STOP to unsubscribe.'
      };

      const message = responses[type] || responses.help;
      await this.sendSMS(businessId, phoneNumber, message);

    } catch (error) {
      console.error('Auto-response error:', error);
    }
  }

  /**
   * Get campaign by ID
   */
  private async getCampaign(campaignId: string): Promise<CommunicationCampaign | null> {
    try {
      // Extract business ID from campaign ID
      const businessId = campaignId.split('_')[1];
      return await redisService.getCachedAIResponse(`campaign_${campaignId}`, `business_${businessId}`);
    } catch (error) {
      console.error('Get campaign error:', error);
      return null;
    }
  }

  /**
   * Update campaign
   */
  private async updateCampaign(campaign: CommunicationCampaign): Promise<void> {
    try {
      await redisService.cacheAIResponse(
        `campaign_${campaign.id}`,
        campaign,
        { prefix: `business_${campaign.businessId}`, ttl: 30 * 24 * 60 * 60 }
      );
    } catch (error) {
      console.error('Update campaign error:', error);
    }
  }

  /**
   * Update campaign analytics
   */
  private async updateCampaignAnalytics(businessId: string, messageId: string, event: string): Promise<void> {
    try {
      // This would update campaign analytics based on message events
      // Implementation depends on how campaigns are tracked
    } catch (error) {
      console.error('Campaign analytics update error:', error);
    }
  }
}

export const smsService = SMSService.getInstance();