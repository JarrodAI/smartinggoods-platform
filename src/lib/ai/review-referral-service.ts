/**
 * Review and Referral Automation Service
 * Manages automated review requests, referral programs, and reputation management
 */

import { redisService } from './redis-service';
import { smsService } from '../communications/sms-service';
import { campaignService } from './campaign-service';

export interface ReviewRequest {
  id: string;
  customerId: string;
  businessId: string;
  appointmentId?: string;
  type: 'google' | 'facebook' | 'yelp' | 'internal';
  status: 'pending' | 'sent' | 'completed' | 'declined' | 'expired';
  sentAt?: Date;
  completedAt?: Date;
  rating?: number;
  reviewText?: string;
  platform?: string;
  incentive?: {
    type: 'discount' | 'points' | 'gift';
    value: number;
    claimed: boolean;
  };
  followUpSent: boolean;
  createdAt: Date;
}

export interface ReferralProgram {
  id: string;
  businessId: string;
  name: string;
  active: boolean;
  rewards: {
    referrer: {
      type: 'discount' | 'credit' | 'cash' | 'points';
      value: number;
      description: string;
    };
    referee: {
      type: 'discount' | 'credit' | 'cash' | 'points';
      value: number;
      description: string;
    };
  };
  conditions: {
    minSpend?: number;
    validityDays: number;
    maxRewards?: number;
    requiresCompletion: boolean;
  };
  analytics: {
    totalReferrals: number;
    successfulReferrals: number;
    conversionRate: number;
    revenue: number;
    rewardsPaid: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  businessId: string;
  programId: string;
  refereeEmail?: string;
  refereePhone?: string;
  refereeName?: string;
  status: 'pending' | 'registered' | 'completed' | 'rewarded' | 'expired';
  referralCode: string;
  sentAt: Date;
  registeredAt?: Date;
  completedAt?: Date;
  rewardedAt?: Date;
  appointmentValue?: number;
  rewards: {
    referrerReward?: {
      type: string;
      value: number;
      claimed: boolean;
      claimedAt?: Date;
    };
    refereeReward?: {
      type: string;
      value: number;
      claimed: boolean;
      claimedAt?: Date;
    };
  };
}

export interface ReputationAlert {
  id: string;
  businessId: string;
  type: 'negative_review' | 'review_response_needed' | 'rating_drop' | 'competitor_mention';
  platform: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actionRequired: string;
  resolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export class ReviewReferralService {
  private static instance: ReviewReferralService;

  public static getInstance(): ReviewReferralService {
    if (!ReviewReferralService.instance) {
      ReviewReferralService.instance = new ReviewReferralService();
    }
    return ReviewReferralService.instance;
  }

  /**
   * Send automated review request
   */
  async sendReviewRequest(
    customerId: string,
    businessId: string,
    appointmentId?: string,
    options: {
      platform?: 'google' | 'facebook' | 'yelp' | 'internal';
      delay?: number; // hours after appointment
      incentive?: { type: string; value: number };
    } = {}
  ): Promise<ReviewRequest> {
    try {
      const requestId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Get business context
      const businessContext = await redisService.getBusinessContext(businessId);
      const businessName = businessContext?.businessName || 'Your Salon';

      // Determine optimal timing (default: 2 hours after appointment)
      const optimalTiming = await this.calculateOptimalReviewTiming(customerId, businessId);
      const delay = options.delay || optimalTiming;

      const reviewRequest: ReviewRequest = {
        id: requestId,
        customerId,
        businessId,
        appointmentId,
        type: options.platform || 'google',
        status: 'pending',
        incentive: options.incentive,
        followUpSent: false,
        createdAt: new Date()
      };

      // Generate personalized review request message
      const message = await this.generateReviewRequestMessage(
        businessName,
        options.platform || 'google',
        options.incentive
      );

      // Schedule review request (in real implementation, would use job queue)
      if (delay > 0) {
        console.log(`⏰ Review request scheduled in ${delay} hours`);
        // Would schedule with job queue
      } else {
        // Send immediately
        await this.executeReviewRequest(reviewRequest, message);
      }

      // Cache review request
      await redisService.cacheAIResponse(
        `review_request_${requestId}`,
        reviewRequest,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'prediction',
        data: {
          action: 'review_request_created',
          customerId,
          platform: options.platform || 'google',
          hasIncentive: !!options.incentive
        }
      });

      return reviewRequest;

    } catch (error) {
      console.error('Review request creation error:', error);
      throw new Error('Failed to create review request');
    }
  }

  /**
   * Execute review request
   */
  private async executeReviewRequest(reviewRequest: ReviewRequest, message: string): Promise<void> {
    try {
      // Get customer contact info (would come from database)
      const customerPhone = `+1555000${reviewRequest.customerId.slice(-4)}`;

      // Send SMS review request
      await smsService.sendSMS({
        to: customerPhone,
        message,
        businessId: reviewRequest.businessId
      });

      // Update request status
      reviewRequest.status = 'sent';
      reviewRequest.sentAt = new Date();

      // Cache updated request
      await redisService.cacheAIResponse(
        `review_request_${reviewRequest.id}`,
        reviewRequest,
        { prefix: `business_${reviewRequest.businessId}`, ttl: 30 * 24 * 60 * 60 }
      );

      console.log(`📝 Review request sent to customer ${reviewRequest.customerId}`);

    } catch (error) {
      console.error('Review request execution error:', error);
      reviewRequest.status = 'pending'; // Retry later
    }
  }

  /**
   * Create referral program
   */
  async createReferralProgram(
    businessId: string,
    programData: {
      name: string;
      referrerReward: { type: string; value: number; description: string };
      refereeReward: { type: string; value: number; description: string };
      conditions: any;
    }
  ): Promise<ReferralProgram> {
    try {
      const programId = `referral_program_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const program: ReferralProgram = {
        id: programId,
        businessId,
        name: programData.name,
        active: true,
        rewards: {
          referrer: programData.referrerReward,
          referee: programData.refereeReward
        },
        conditions: {
          validityDays: 90,
          requiresCompletion: true,
          ...programData.conditions
        },
        analytics: {
          totalReferrals: 0,
          successfulReferrals: 0,
          conversionRate: 0,
          revenue: 0,
          rewardsPaid: 0
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Cache program
      await redisService.cacheAIResponse(
        `referral_program_${programId}`,
        program,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 } // 90 days
      );

      console.log(`🎁 Created referral program: ${programData.name}`);

      return program;

    } catch (error) {
      console.error('Referral program creation error:', error);
      throw new Error('Failed to create referral program');
    }
  }

  /**
   * Send referral invitation
   */
  async sendReferralInvitation(
    referrerId: string,
    businessId: string,
    programId: string,
    refereeContact: {
      email?: string;
      phone?: string;
      name?: string;
    }
  ): Promise<Referral> {
    try {
      const referralId = `referral_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const referralCode = `REF${Date.now().toString().slice(-6)}`;

      // Get program details
      const program = await redisService.getCachedAIResponse(
        `referral_program_${programId}`,
        `business_${businessId}`
      );

      if (!program || !program.active) {
        throw new Error('Referral program not found or inactive');
      }

      const referral: Referral = {
        id: referralId,
        referrerId,
        businessId,
        programId,
        refereeEmail: refereeContact.email,
        refereePhone: refereeContact.phone,
        refereeName: refereeContact.name,
        status: 'pending',
        referralCode,
        sentAt: new Date(),
        rewards: {}
      };

      // Generate referral message
      const message = await this.generateReferralMessage(program, referralCode, refereeContact.name);

      // Send referral invitation
      if (refereeContact.phone) {
        await smsService.sendSMS({
          to: refereeContact.phone,
          message,
          businessId
        });
      }

      if (refereeContact.email) {
        // Send email (would integrate with email service)
        console.log(`📧 Referral email sent to ${refereeContact.email}`);
      }

      // Cache referral
      await redisService.cacheAIResponse(
        `referral_${referralId}`,
        referral,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

      // Update program analytics
      program.analytics.totalReferrals++;
      await redisService.cacheAIResponse(
        `referral_program_${programId}`,
        program,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

      console.log(`🤝 Referral invitation sent with code: ${referralCode}`);

      return referral;

    } catch (error) {
      console.error('Referral invitation error:', error);
      throw new Error('Failed to send referral invitation');
    }
  }

  /**
   * Process referral completion
   */
  async processReferralCompletion(
    referralCode: string,
    appointmentValue: number,
    businessId: string
  ): Promise<{ referral: Referral; rewardsIssued: any[] }> {
    try {
      // Find referral by code
      const referrals = await this.getReferralsByCode(referralCode, businessId);
      const referral = referrals[0];

      if (!referral) {
        throw new Error('Referral not found');
      }

      if (referral.status !== 'registered') {
        throw new Error('Referral not in valid state for completion');
      }

      // Get program details
      const program = await redisService.getCachedAIResponse(
        `referral_program_${referral.programId}`,
        `business_${businessId}`
      );

      // Check if appointment meets minimum spend requirement
      if (program.conditions.minSpend && appointmentValue < program.conditions.minSpend) {
        throw new Error(`Appointment value must be at least $${program.conditions.minSpend}`);
      }

      // Mark referral as completed
      referral.status = 'completed';
      referral.completedAt = new Date();
      referral.appointmentValue = appointmentValue;

      const rewardsIssued = [];

      // Issue referrer reward
      if (program.rewards.referrer) {
        const referrerReward = await this.issueReward(
          referral.referrerId,
          program.rewards.referrer,
          businessId,
          'referrer'
        );

        referral.rewards.referrerReward = {
          type: program.rewards.referrer.type,
          value: program.rewards.referrer.value,
          claimed: false
        };

        rewardsIssued.push(referrerReward);
      }

      // Issue referee reward
      if (program.rewards.referee && referral.refereeId) {
        const refereeReward = await this.issueReward(
          referral.refereeId,
          program.rewards.referee,
          businessId,
          'referee'
        );

        referral.rewards.refereeReward = {
          type: program.rewards.referee.type,
          value: program.rewards.referee.value,
          claimed: false
        };

        rewardsIssued.push(refereeReward);
      }

      // Update referral
      await redisService.cacheAIResponse(
        `referral_${referral.id}`,
        referral,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

      // Update program analytics
      program.analytics.successfulReferrals++;
      program.analytics.revenue += appointmentValue;
      program.analytics.conversionRate = program.analytics.successfulReferrals / program.analytics.totalReferrals;

      await redisService.cacheAIResponse(
        `referral_program_${referral.programId}`,
        program,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

      console.log(`🎉 Referral completed: ${referralCode}, rewards issued`);

      return { referral, rewardsIssued };

    } catch (error) {
      console.error('Referral completion error:', error);
      throw new Error('Failed to process referral completion');
    }
  }

  /**
   * Monitor and respond to reviews
   */
  async monitorReviews(businessId: string): Promise<ReputationAlert[]> {
    try {
      const alerts: ReputationAlert[] = [];

      // Simulate review monitoring (would integrate with actual review platforms)
      const mockReviews = [
        {
          platform: 'google',
          rating: 2,
          text: 'Service was not great, waited too long',
          date: new Date()
        },
        {
          platform: 'facebook',
          rating: 5,
          text: 'Amazing experience! Highly recommend',
          date: new Date()
        }
      ];

      for (const review of mockReviews) {
        if (review.rating <= 3) {
          // Create alert for negative review
          const alert: ReputationAlert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            businessId,
            type: 'negative_review',
            platform: review.platform,
            severity: review.rating <= 2 ? 'high' : 'medium',
            message: `Negative ${review.rating}-star review on ${review.platform}: "${review.text}"`,
            actionRequired: 'Respond to review and address customer concerns',
            resolved: false,
            createdAt: new Date()
          };

          alerts.push(alert);

          // Cache alert
          await redisService.cacheAIResponse(
            `reputation_alert_${alert.id}`,
            alert,
            { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 }
          );

          // Generate suggested response
          const suggestedResponse = await this.generateReviewResponse(review, businessId);
          
          console.log(`🚨 Reputation alert created for negative review`);
          console.log(`💬 Suggested response: ${suggestedResponse}`);
        }
      }

      return alerts;

    } catch (error) {
      console.error('Review monitoring error:', error);
      return [];
    }
  }

  /**
   * Generate review response
   */
  async generateReviewResponse(
    review: { rating: number; text: string; platform: string },
    businessId: string
  ): Promise<string> {
    try {
      // Get business context
      const businessContext = await redisService.getBusinessContext(businessId);
      const businessName = businessContext?.businessName || 'Our Business';

      // Generate appropriate response based on rating
      if (review.rating <= 2) {
        return `Thank you for your feedback. We sincerely apologize that your experience at ${businessName} didn't meet your expectations. We take all feedback seriously and would love the opportunity to make this right. Please contact us directly so we can address your concerns and improve our service. We appreciate your patience and hope to serve you better in the future.`;
      } else if (review.rating === 3) {
        return `Thank you for taking the time to review ${businessName}. We appreciate your feedback and are always looking for ways to improve our service. If there's anything specific we can do better, please don't hesitate to reach out to us directly. We value your business and hope to exceed your expectations next time.`;
      } else {
        return `Thank you so much for your wonderful review! We're thrilled that you had a great experience at ${businessName}. Your kind words mean the world to our team. We look forward to welcoming you back soon!`;
      }

    } catch (error) {
      console.error('Review response generation error:', error);
      return 'Thank you for your review. We appreciate your feedback and look forward to serving you again.';
    }
  }

  /**
   * Calculate optimal review timing
   */
  private async calculateOptimalReviewTiming(customerId: string, businessId: string): Promise<number> {
    try {
      // Analyze customer behavior and industry best practices
      // For beauty services, optimal timing is typically 2-4 hours after appointment
      
      // Get customer profile (would come from database)
      const customerProfile = await redisService.getCachedAIResponse(
        `customer_profile_${customerId}`,
        `business_${businessId}`
      );

      // Default timing based on service type
      let optimalHours = 2;

      // Adjust based on customer preferences
      if (customerProfile?.preferences?.contactTime === 'evening') {
        optimalHours = 6; // Send in evening
      } else if (customerProfile?.preferences?.contactTime === 'next_day') {
        optimalHours = 24; // Send next day
      }

      return optimalHours;

    } catch (error) {
      console.error('Optimal timing calculation error:', error);
      return 2; // Default 2 hours
    }
  }

  /**
   * Generate review request message
   */
  private async generateReviewRequestMessage(
    businessName: string,
    platform: string,
    incentive?: { type: string; value: number }
  ): Promise<string> {
    let message = `Hi! Thank you for visiting ${businessName}! We hope you loved your experience. `;

    // Add platform-specific request
    switch (platform) {
      case 'google':
        message += `Would you mind leaving us a quick Google review? It really helps other customers find us! `;
        break;
      case 'facebook':
        message += `Could you share your experience on our Facebook page? We'd love to hear from you! `;
        break;
      case 'yelp':
        message += `We'd appreciate if you could leave us a Yelp review to help others discover us! `;
        break;
      default:
        message += `Would you mind sharing your experience in a quick review? `;
    }

    // Add incentive if provided
    if (incentive) {
      const incentiveText = incentive.type === 'discount' 
        ? `${incentive.value}% off your next visit`
        : `$${incentive.value} credit`;
      
      message += `As a thank you, we'll give you ${incentiveText} when you leave a review! `;
    }

    message += `Thank you! 💅✨`;

    return message;
  }

  /**
   * Generate referral message
   */
  private async generateReferralMessage(
    program: ReferralProgram,
    referralCode: string,
    refereeName?: string
  ): Promise<string> {
    const greeting = refereeName ? `Hi ${refereeName}!` : 'Hi there!';
    
    const referrerReward = program.rewards.referrer.type === 'discount' 
      ? `${program.rewards.referrer.value}% off`
      : `$${program.rewards.referrer.value}`;
    
    const refereeReward = program.rewards.referee.type === 'discount'
      ? `${program.rewards.referee.value}% off`
      : `$${program.rewards.referee.value}`;

    return `${greeting} A friend thought you'd love our salon! 💅 Book your first appointment with code ${referralCode} and get ${refereeReward} your first visit. Plus, your friend gets ${referrerReward} too! Book now and treat yourself! ✨`;
  }

  /**
   * Issue reward to customer
   */
  private async issueReward(
    customerId: string,
    reward: { type: string; value: number; description: string },
    businessId: string,
    rewardType: 'referrer' | 'referee'
  ): Promise<any> {
    try {
      const rewardId = `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const rewardRecord = {
        id: rewardId,
        customerId,
        businessId,
        type: reward.type,
        value: reward.value,
        description: reward.description,
        rewardType,
        claimed: false,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        createdAt: new Date()
      };

      // Cache reward
      await redisService.cacheAIResponse(
        `reward_${rewardId}`,
        rewardRecord,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

      // Send notification to customer
      const customerPhone = `+1555000${customerId.slice(-4)}`;
      const message = `🎉 Congratulations! You've earned ${reward.description}! Use it on your next visit. Expires in 90 days.`;

      await smsService.sendSMS({
        to: customerPhone,
        message,
        businessId
      });

      return rewardRecord;

    } catch (error) {
      console.error('Reward issuance error:', error);
      throw error;
    }
  }

  /**
   * Get referrals by code
   */
  private async getReferralsByCode(referralCode: string, businessId: string): Promise<Referral[]> {
    try {
      // In a real implementation, this would query the database
      // For now, we'll simulate finding referrals
      const mockReferral: Referral = {
        id: `referral_${Date.now()}`,
        referrerId: 'customer_123',
        refereeId: 'customer_456',
        businessId,
        programId: 'program_123',
        status: 'registered',
        referralCode,
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        registeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        rewards: {}
      };

      return [mockReferral];

    } catch (error) {
      console.error('Get referrals by code error:', error);
      return [];
    }
  }

  /**
   * Get review requests for business
   */
  async getReviewRequests(
    businessId: string,
    filters: {
      status?: string;
      platform?: string;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<ReviewRequest[]> {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      const mockRequests: ReviewRequest[] = [
        {
          id: 'review_1',
          customerId: 'customer_123',
          businessId,
          type: 'google',
          status: 'completed',
          sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          rating: 5,
          reviewText: 'Amazing service!',
          followUpSent: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        }
      ];

      return mockRequests.filter(request => {
        if (filters.status && request.status !== filters.status) return false;
        if (filters.platform && request.type !== filters.platform) return false;
        return true;
      });

    } catch (error) {
      console.error('Get review requests error:', error);
      return [];
    }
  }

  /**
   * Get referral analytics
   */
  async getReferralAnalytics(businessId: string, programId?: string): Promise<any> {
    try {
      if (programId) {
        const program = await redisService.getCachedAIResponse(
          `referral_program_${programId}`,
          `business_${businessId}`
        );
        return program?.analytics || {};
      }

      // Return aggregated analytics for all programs
      return {
        totalReferrals: 25,
        successfulReferrals: 18,
        conversionRate: 0.72,
        revenue: 3600,
        rewardsPaid: 450
      };

    } catch (error) {
      console.error('Get referral analytics error:', error);
      return {};
    }
  }
}

export const reviewReferralService = ReviewReferralService.getInstance();