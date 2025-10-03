/**
 * AI-Powered Upselling and Cross-Selling Service
 * Intelligent product/service recommendations based on customer behavior and preferences
 */

import { redisService } from './redis-service';
import { openAIService } from './openai-service';

export interface UpsellRecommendation {
  id: string;
  customerId: string;
  businessId: string;
  type: 'upsell' | 'cross_sell' | 'bundle';
  primaryService: {
    id: string;
    name: string;
    price: number;
  };
  recommendedServices: Array<{
    id: string;
    name: string;
    price: number;
    reason: string;
    confidence: number;
    discount?: number;
  }>;
  totalValue: number;
  potentialRevenue: number;
  context: string;
  timing: 'booking' | 'checkout' | 'post_service' | 'email' | 'sms';
  createdAt: Date;
  expiresAt: Date;
}

export interface ServiceBundle {
  id: string;
  businessId: string;
  name: string;
  description: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  bundlePrice: number;
  savings: number;
  savingsPercentage: number;
  popularity: number;
  active: boolean;
}

export interface CustomerPurchaseHistory {
  customerId: string;
  purchases: Array<{
    serviceId: string;
    serviceName: string;
    price: number;
    date: Date;
    frequency: number;
  }>;
  totalSpent: number;
  averageTicket: number;
  preferredServices: string[];
  lastPurchaseDate: Date;
}

export class UpsellService {
  private static instance: UpsellService;

  public static getInstance(): UpsellService {
    if (!UpsellService.instance) {
      UpsellService.instance = new UpsellService();
    }
    return UpsellService.instance;
  }

  /**
   * Generate AI-powered upsell recommendations
   */
  async generateRecommendations(
    customerId: string,
    businessId: string,
    currentService: { id: string; name: string; price: number },
    context: {
      timing: 'booking' | 'checkout' | 'post_service' | 'email' | 'sms';
      customerHistory?: CustomerPurchaseHistory;
      sessionData?: any;
    }
  ): Promise<UpsellRecommendation> {
    try {
      // Get customer purchase history
      const history = context.customerHistory || await this.getCustomerHistory(customerId, businessId);
      
      // Get available services
      const availableServices = await this.getAvailableServices(businessId);
      
      // Get business context
      const businessContext = await redisService.getBusinessContext(businessId);
      
      // Use AI to generate intelligent recommendations
      const aiRecommendations = await this.generateAIRecommendations(
        currentService,
        availableServices,
        history,
        businessContext,
        context.timing
      );

      const recommendationId = `upsell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const recommendation: UpsellRecommendation = {
        id: recommendationId,
        customerId,
        businessId,
        type: this.determineRecommendationType(currentService, aiRecommendations),
        primaryService: currentService,
        recommendedServices: aiRecommendations,
        totalValue: currentService.price + aiRecommendations.reduce((sum, s) => sum + s.price, 0),
        potentialRevenue: aiRecommendations.reduce((sum, s) => sum + s.price, 0),
        context: this.generateRecommendationContext(context.timing, aiRecommendations),
        timing: context.timing,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Cache recommendation
      await redisService.cacheAIResponse(
        `upsell_${recommendationId}`,
        recommendation,
        { prefix: `business_${businessId}`, ttl: 24 * 60 * 60 }
      );

      // Track analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'upsell',
        data: {
          recommendationId,
          customerId,
          timing: context.timing,
          potentialRevenue: recommendation.potentialRevenue
        }
      });

      console.log(`💰 Generated upsell recommendation: ${recommendationId}`);

      return recommendation;

    } catch (error) {
      console.error('Upsell recommendation error:', error);
      throw new Error('Failed to generate upsell recommendations');
    }
  }

  /**
   * Create optimized service bundles
   */
  async createServiceBundle(
    businessId: string,
    bundleData: {
      name: string;
      description: string;
      serviceIds: string[];
      discountPercentage: number;
    }
  ): Promise<ServiceBundle> {
    try {
      const bundleId = `bundle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get service details
      const services = await this.getServicesByIds(businessId, bundleData.serviceIds);
      
      // Calculate pricing
      const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
      const bundlePrice = totalPrice * (1 - bundleData.discountPercentage / 100);
      const savings = totalPrice - bundlePrice;

      const bundle: ServiceBundle = {
        id: bundleId,
        businessId,
        name: bundleData.name,
        description: bundleData.description,
        services,
        bundlePrice,
        savings,
        savingsPercentage: bundleData.discountPercentage,
        popularity: 0,
        active: true
      };

      // Cache bundle
      await redisService.cacheAIResponse(
        `bundle_${bundleId}`,
        bundle,
        { prefix: `business_${businessId}`, ttl: 90 * 24 * 60 * 60 }
      );

      console.log(`📦 Created service bundle: ${bundleData.name}`);

      return bundle;

    } catch (error) {
      console.error('Bundle creation error:', error);
      throw new Error('Failed to create service bundle');
    }
  }

  /**
   * Get smart bundle recommendations based on customer behavior
   */
  async getSmartBundles(
    customerId: string,
    businessId: string
  ): Promise<ServiceBundle[]> {
    try {
      // Get customer history
      const history = await this.getCustomerHistory(customerId, businessId);
      
      // Get all available bundles
      const allBundles = await this.getAllBundles(businessId);
      
      // Filter and rank bundles based on customer preferences
      const rankedBundles = allBundles
        .filter(bundle => {
          // Check if bundle contains services customer has used
          const hasPreferredService = bundle.services.some(s => 
            history.preferredServices.includes(s.id)
          );
          return hasPreferredService || bundle.popularity > 50;
        })
        .sort((a, b) => b.savings - a.savings);

      return rankedBundles.slice(0, 3); // Top 3 bundles

    } catch (error) {
      console.error('Smart bundles error:', error);
      return [];
    }
  }

  /**
   * Track upsell conversion
   */
  async trackConversion(
    recommendationId: string,
    accepted: boolean,
    revenue?: number
  ): Promise<void> {
    try {
      const recommendation = await redisService.getCachedAIResponse(
        `upsell_${recommendationId}`,
        `business_${recommendation?.businessId}`
      );

      if (recommendation) {
        await redisService.storeAIAnalytics(recommendation.businessId, {
          type: 'upsell_conversion',
          data: {
            recommendationId,
            accepted,
            revenue: revenue || 0,
            timing: recommendation.timing,
            type: recommendation.type
          }
        });

        console.log(`📊 Tracked upsell conversion: ${accepted ? 'Accepted' : 'Declined'}`);
      }

    } catch (error) {
      console.error('Conversion tracking error:', error);
    }
  }

  /**
   * Get upsell analytics
   */
  async getUpsellAnalytics(businessId: string): Promise<{
    totalRecommendations: number;
    acceptanceRate: number;
    averageUpsellValue: number;
    totalRevenue: number;
    byTiming: Record<string, any>;
    byType: Record<string, any>;
  }> {
    try {
      // Mock analytics - would integrate with actual analytics service
      return {
        totalRecommendations: 150,
        acceptanceRate: 0.35, // 35%
        averageUpsellValue: 45,
        totalRevenue: 2362.50,
        byTiming: {
          booking: { recommendations: 60, acceptanceRate: 0.42, revenue: 1134 },
          checkout: { recommendations: 50, acceptanceRate: 0.38, revenue: 855 },
          post_service: { recommendations: 25, acceptanceRate: 0.20, revenue: 225 },
          email: { recommendations: 15, acceptanceRate: 0.13, revenue: 148.50 }
        },
        byType: {
          upsell: { recommendations: 80, acceptanceRate: 0.40, revenue: 1440 },
          cross_sell: { recommendations: 50, acceptanceRate: 0.32, revenue: 720 },
          bundle: { recommendations: 20, acceptanceRate: 0.25, revenue: 202.50 }
        }
      };

    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async generateAIRecommendations(
    currentService: any,
    availableServices: any[],
    history: CustomerPurchaseHistory,
    businessContext: any,
    timing: string
  ): Promise<any[]> {
    try {
      const prompt = `As an expert sales consultant for ${businessContext.businessName || 'a business'}, 
      recommend complementary services for a customer who is ${timing === 'booking' ? 'booking' : 'considering'} 
      "${currentService.name}" (${currentService.price}).
      
      Customer history: ${history.preferredServices.join(', ') || 'New customer'}
      Average ticket: $${history.averageTicket || 0}
      
      Available services: ${availableServices.map(s => `${s.name} ($${s.price})`).join(', ')}
      
      Provide 2-3 recommendations with reasons. Format as JSON array with: name, price, reason, confidence (0-1).`;

      const response = await openAIService.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.7
      });

      // Parse AI response
      try {
        const recommendations = JSON.parse(response);
        return recommendations.map((rec: any) => ({
          id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: rec.name,
          price: rec.price,
          reason: rec.reason,
          confidence: rec.confidence || 0.8
        }));
      } catch {
        // Fallback to rule-based recommendations
        return this.getRuleBasedRecommendations(currentService, availableServices, history);
      }

    } catch (error) {
      console.error('AI recommendation error:', error);
      return this.getRuleBasedRecommendations(currentService, availableServices, history);
    }
  }

  private getRuleBasedRecommendations(
    currentService: any,
    availableServices: any[],
    history: CustomerPurchaseHistory
  ): any[] {
    // Simple rule-based fallback
    const recommendations = availableServices
      .filter(s => s.id !== currentService.id)
      .filter(s => s.price <= currentService.price * 1.5)
      .slice(0, 2)
      .map(s => ({
        id: s.id,
        name: s.name,
        price: s.price,
        reason: `Frequently purchased together with ${currentService.name}`,
        confidence: 0.7
      }));

    return recommendations;
  }

  private determineRecommendationType(
    currentService: any,
    recommendations: any[]
  ): 'upsell' | 'cross_sell' | 'bundle' {
    if (recommendations.length > 2) return 'bundle';
    
    const hasHigherPrice = recommendations.some(r => r.price > currentService.price);
    return hasHigherPrice ? 'upsell' : 'cross_sell';
  }

  private generateRecommendationContext(timing: string, recommendations: any[]): string {
    const contexts = {
      booking: `Complete your experience with ${recommendations[0]?.name}`,
      checkout: `Before you go, consider adding ${recommendations[0]?.name}`,
      post_service: `Loved your service? Try ${recommendations[0]?.name} next time`,
      email: `Special offer: Add ${recommendations[0]?.name} to your next visit`,
      sms: `💅 Enhance your next visit with ${recommendations[0]?.name}`
    };

    return contexts[timing as keyof typeof contexts] || contexts.booking;
  }

  private async getCustomerHistory(
    customerId: string,
    businessId: string
  ): Promise<CustomerPurchaseHistory> {
    // Mock customer history - would integrate with actual database
    return {
      customerId,
      purchases: [],
      totalSpent: 250,
      averageTicket: 50,
      preferredServices: [],
      lastPurchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    };
  }

  private async getAvailableServices(businessId: string): Promise<any[]> {
    // Mock services - would integrate with actual service catalog
    return [
      { id: 'service_1', name: 'Premium Manicure', price: 45 },
      { id: 'service_2', name: 'Gel Polish', price: 25 },
      { id: 'service_3', name: 'Nail Art', price: 35 },
      { id: 'service_4', name: 'Hand Massage', price: 20 },
      { id: 'service_5', name: 'Paraffin Treatment', price: 15 }
    ];
  }

  private async getServicesByIds(businessId: string, serviceIds: string[]): Promise<any[]> {
    const allServices = await this.getAvailableServices(businessId);
    return allServices.filter(s => serviceIds.includes(s.id));
  }

  private async getAllBundles(businessId: string): Promise<ServiceBundle[]> {
    // Mock bundles - would query from cache/database
    return [];
  }
}

export const upsellService = UpsellService.getInstance();
