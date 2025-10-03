/**
 * AI Revenue Optimization Service - Smart Upselling & Cross-selling
 * Maximizes revenue through intelligent recommendations
 */

import { redisService } from './redis-service';
import { openAIService } from './openai-service';

export interface CustomerProfile {
  customerId: string;
  businessId: string;
  demographics?: {
    age?: number;
    gender?: string;
    location?: string;
  };
  preferences: {
    priceRange: 'budget' | 'mid' | 'premium';
    serviceTypes: string[];
    frequency: 'first_time' | 'occasional' | 'regular' | 'vip';
  };
  history: {
    totalSpent: number;
    averageTicket: number;
    lastVisit?: Date;
    favoriteServices: string[];
    seasonalPatterns: string[];
  };
  behavior: {
    bookingPattern: 'spontaneous' | 'planned' | 'routine';
    pricesensitivity: 'high' | 'medium' | 'low';
    loyaltyScore: number; // 0-100
  };
}

export interface RevenueRecommendation {
  type: 'upsell' | 'cross_sell' | 'bundle' | 'membership';
  confidence: number;
  service: {
    name: string;
    price: number;
    originalPrice?: number;
    discount?: number;
  };
  reasoning: string;
  expectedRevenue: number;
  conversionProbability: number;
  timing: 'immediate' | 'during_service' | 'post_service' | 'next_visit';
}

export interface DynamicPricing {
  serviceId: string;
  basePrice: number;
  dynamicPrice: number;
  adjustment: number;
  factors: {
    demand: number;
    timeOfDay: number;
    dayOfWeek: number;
    seasonality: number;
    inventory: number;
  };
  reasoning: string;
}

export interface RevenueInsights {
  totalRevenue: number;
  averageTicket: number;
  upsellSuccess: number;
  crossSellSuccess: number;
  topPerformingServices: string[];
  revenueGrowth: number;
  optimizationOpportunities: string[];
}

export class RevenueOptimizationService {
  private static instance: RevenueOptimizationService;

  public static getInstance(): RevenueOptimizationService {
    if (!RevenueOptimizationService.instance) {
      RevenueOptimizationService.instance = new RevenueOptimizationService();
    }
    return RevenueOptimizationService.instance;
  }

  /**
   * Generate personalized upsell recommendations
   */
  async generateUpsellRecommendations(
    businessId: string,
    customerId: string,
    currentService: string,
    sessionContext?: any
  ): Promise<RevenueRecommendation[]> {
    try {
      // Get customer profile and business context
      const [customerProfile, businessContext] = await Promise.all([
        this.getCustomerProfile(businessId, customerId),
        redisService.getBusinessContext(businessId)
      ]);

      if (!businessContext) {
        throw new Error('Business context not found');
      }

      const recommendations: RevenueRecommendation[] = [];
      const currentServiceData = businessContext.services.find(s => s.name === currentService);

      if (!currentServiceData) {
        return recommendations;
      }

      // 1. Service Upgrades (Upsells)
      const upgrades = this.findServiceUpgrades(businessContext.services, currentServiceData, customerProfile);
      recommendations.push(...upgrades);

      // 2. Complementary Services (Cross-sells)
      const crossSells = this.findComplementaryServices(businessContext.services, currentServiceData, customerProfile);
      recommendations.push(...crossSells);

      // 3. Service Bundles
      const bundles = this.generateServiceBundles(businessContext.services, currentServiceData, customerProfile);
      recommendations.push(...bundles);

      // 4. Membership Opportunities
      if (customerProfile?.behavior.loyaltyScore > 60) {
        const membership = this.generateMembershipOffer(businessContext, customerProfile);
        if (membership) recommendations.push(membership);
      }

      // Sort by expected revenue and confidence
      recommendations.sort((a, b) => 
        (b.expectedRevenue * b.confidence) - (a.expectedRevenue * a.confidence)
      );

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'prediction',
        data: {
          action: 'upsell_recommendations_generated',
          customerId,
          currentService,
          recommendationsCount: recommendations.length,
          totalExpectedRevenue: recommendations.reduce((sum, r) => sum + r.expectedRevenue, 0)
        }
      });

      return recommendations.slice(0, 5); // Top 5 recommendations

    } catch (error) {
      console.error('Upsell recommendations error:', error);
      return [];
    }
  }

  /**
   * Calculate dynamic pricing for services
   */
  async calculateDynamicPricing(
    businessId: string,
    serviceId: string,
    context: {
      timeOfDay: number; // 0-23
      dayOfWeek: number; // 0-6
      currentDemand: number; // 0-1
      inventoryLevel: number; // 0-1
    }
  ): Promise<DynamicPricing> {
    try {
      const businessContext = await redisService.getBusinessContext(businessId);
      const service = businessContext?.services.find((s: any) => 
        s.name.toLowerCase().replace(/\s+/g, '_') === serviceId
      );

      if (!service) {
        throw new Error('Service not found');
      }

      const basePrice = service.price;
      let adjustment = 0;

      // Time of day factor (peak hours cost more)
      const timeAdjustment = this.calculateTimeAdjustment(context.timeOfDay);
      
      // Day of week factor (weekends cost more)
      const dayAdjustment = this.calculateDayAdjustment(context.dayOfWeek);
      
      // Demand factor (high demand = higher prices)
      const demandAdjustment = context.currentDemand * 0.2; // Up to 20% increase
      
      // Inventory factor (low availability = higher prices)
      const inventoryAdjustment = (1 - context.inventoryLevel) * 0.15; // Up to 15% increase

      // Seasonality (would need historical data)
      const seasonalityAdjustment = this.calculateSeasonalityAdjustment();

      adjustment = timeAdjustment + dayAdjustment + demandAdjustment + inventoryAdjustment + seasonalityAdjustment;

      // Cap adjustment at ±30%
      adjustment = Math.max(-0.3, Math.min(0.3, adjustment));

      const dynamicPrice = Math.round(basePrice * (1 + adjustment));

      const factors = {
        demand: context.currentDemand,
        timeOfDay: timeAdjustment,
        dayOfWeek: dayAdjustment,
        seasonality: seasonalityAdjustment,
        inventory: inventoryAdjustment
      };

      const reasoning = this.generatePricingReasoning(adjustment, factors);

      return {
        serviceId,
        basePrice,
        dynamicPrice,
        adjustment,
        factors,
        reasoning
      };

    } catch (error) {
      console.error('Dynamic pricing error:', error);
      return {
        serviceId,
        basePrice: 0,
        dynamicPrice: 0,
        adjustment: 0,
        factors: { demand: 0, timeOfDay: 0, dayOfWeek: 0, seasonality: 0, inventory: 0 },
        reasoning: 'Pricing calculation failed'
      };
    }
  }

  /**
   * Generate AI-powered revenue insights
   */
  async generateRevenueInsights(
    businessId: string,
    timeframe: 'week' | 'month' | 'quarter' = 'month'
  ): Promise<RevenueInsights> {
    try {
      // Get analytics data
      const analyticsData = await redisService.getAIAnalytics(businessId);
      
      // Calculate metrics (mock data for now)
      const insights: RevenueInsights = {
        totalRevenue: 15000, // Would calculate from actual bookings
        averageTicket: 85,
        upsellSuccess: 0.35, // 35% success rate
        crossSellSuccess: 0.28, // 28% success rate
        topPerformingServices: ['Gel Manicure', 'Pedicure Deluxe', 'Nail Art'],
        revenueGrowth: 0.15, // 15% growth
        optimizationOpportunities: [
          'Increase upselling during peak hours',
          'Bundle complementary services',
          'Implement dynamic pricing for weekends',
          'Create loyalty program for regular customers'
        ]
      };

      // Store insights
      await redisService.cacheAIResponse(
        `revenue_insights_${businessId}`,
        insights,
        { prefix: 'ai:insights', ttl: 24 * 60 * 60 } // 24 hours
      );

      return insights;

    } catch (error) {
      console.error('Revenue insights error:', error);
      return {
        totalRevenue: 0,
        averageTicket: 0,
        upsellSuccess: 0,
        crossSellSuccess: 0,
        topPerformingServices: [],
        revenueGrowth: 0,
        optimizationOpportunities: []
      };
    }
  }

  /**
   * Find service upgrades (upsells)
   */
  private findServiceUpgrades(
    services: any[],
    currentService: any,
    customerProfile?: CustomerProfile
  ): RevenueRecommendation[] {
    const upgrades: RevenueRecommendation[] = [];

    // Find services in same category with higher price
    const sameCategory = services.filter((s: any) => 
      s.category === currentService.category && 
      s.price > currentService.price
    );

    for (const upgrade of sameCategory.slice(0, 2)) {
      const priceIncrease = upgrade.price - currentService.price;
      const confidence = this.calculateUpsellConfidence(upgrade, currentService, customerProfile);

      upgrades.push({
        type: 'upsell',
        confidence,
        service: {
          name: upgrade.name,
          price: upgrade.price,
          originalPrice: currentService.price
        },
        reasoning: `Upgrade to ${upgrade.name} for enhanced experience with premium features`,
        expectedRevenue: priceIncrease,
        conversionProbability: confidence,
        timing: 'immediate'
      });
    }

    return upgrades;
  }

  /**
   * Find complementary services (cross-sells)
   */
  private findComplementaryServices(
    services: any[],
    currentService: any,
    customerProfile?: CustomerProfile
  ): RevenueRecommendation[] {
    const crossSells: RevenueRecommendation[] = [];

    // Define service relationships
    const serviceRelationships: Record<string, string[]> = {
      'manicure': ['pedicure', 'nail_art', 'hand_treatment'],
      'pedicure': ['manicure', 'foot_massage', 'callus_treatment'],
      'nail_art': ['gel_polish', 'nail_strengthening'],
      'facial': ['eyebrow_shaping', 'lip_treatment', 'skin_analysis']
    };

    const currentCategory = currentService.category?.toLowerCase();
    const relatedCategories = serviceRelationships[currentCategory] || [];

    for (const category of relatedCategories) {
      const relatedService = services.find((s: any) => 
        s.category?.toLowerCase().includes(category) ||
        s.name.toLowerCase().includes(category)
      );

      if (relatedService) {
        const confidence = this.calculateCrossSellConfidence(relatedService, currentService, customerProfile);

        crossSells.push({
          type: 'cross_sell',
          confidence,
          service: {
            name: relatedService.name,
            price: relatedService.price
          },
          reasoning: `Perfect complement to ${currentService.name} - customers often book both together`,
          expectedRevenue: relatedService.price,
          conversionProbability: confidence,
          timing: 'during_service'
        });
      }
    }

    return crossSells.slice(0, 3);
  }

  /**
   * Generate service bundles
   */
  private generateServiceBundles(
    services: any[],
    currentService: any,
    customerProfile?: CustomerProfile
  ): RevenueRecommendation[] {
    const bundles: RevenueRecommendation[] = [];

    // Create popular bundles
    const popularBundles = [
      {
        name: 'Complete Nail Care Package',
        services: ['manicure', 'pedicure', 'nail_art'],
        discount: 0.15
      },
      {
        name: 'Luxury Spa Experience',
        services: ['manicure', 'pedicure', 'hand_massage'],
        discount: 0.20
      }
    ];

    for (const bundle of popularBundles) {
      const bundleServices = services.filter((s: any) => 
        bundle.services.some(bs => s.name.toLowerCase().includes(bs))
      );

      if (bundleServices.length >= 2) {
        const totalPrice = bundleServices.reduce((sum, s: any) => sum + s.price, 0);
        const discountedPrice = Math.round(totalPrice * (1 - bundle.discount));
        const savings = totalPrice - discountedPrice;

        bundles.push({
          type: 'bundle',
          confidence: 0.6,
          service: {
            name: bundle.name,
            price: discountedPrice,
            originalPrice: totalPrice,
            discount: savings
          },
          reasoning: `Save $${savings} with our ${bundle.name} - includes ${bundleServices.map(s => s.name).join(', ')}`,
          expectedRevenue: discountedPrice - currentService.price,
          conversionProbability: 0.6,
          timing: 'immediate'
        });
      }
    }

    return bundles;
  }

  /**
   * Generate membership offer
   */
  private generateMembershipOffer(
    businessContext: any,
    customerProfile?: CustomerProfile
  ): RevenueRecommendation | null {
    if (!customerProfile || customerProfile.behavior.loyaltyScore < 60) {
      return null;
    }

    const monthlyValue = customerProfile.history.averageTicket * 2; // Assume 2 visits per month
    const membershipPrice = Math.round(monthlyValue * 0.8); // 20% discount

    return {
      type: 'membership',
      confidence: 0.7,
      service: {
        name: 'VIP Monthly Membership',
        price: membershipPrice,
        originalPrice: monthlyValue,
        discount: monthlyValue - membershipPrice
      },
      reasoning: `Based on your visit frequency, save ${Math.round(((monthlyValue - membershipPrice) / monthlyValue) * 100)}% with our VIP membership`,
      expectedRevenue: membershipPrice * 12, // Annual value
      conversionProbability: 0.7,
      timing: 'post_service'
    };
  }

  /**
   * Calculate upsell confidence
   */
  private calculateUpsellConfidence(
    upgrade: any,
    current: any,
    customerProfile?: CustomerProfile
  ): number {
    let confidence = 0.5; // Base confidence

    if (customerProfile) {
      // Price sensitivity
      if (customerProfile.preferences.priceRange === 'premium') {
        confidence += 0.3;
      } else if (customerProfile.preferences.priceRange === 'budget') {
        confidence -= 0.2;
      }

      // Loyalty score
      confidence += (customerProfile.behavior.loyaltyScore / 100) * 0.2;

      // Historical spending
      const priceIncrease = upgrade.price - current.price;
      if (priceIncrease <= customerProfile.history.averageTicket * 0.5) {
        confidence += 0.1;
      }
    }

    return Math.max(0.1, Math.min(0.9, confidence));
  }

  /**
   * Calculate cross-sell confidence
   */
  private calculateCrossSellConfidence(
    crossSell: any,
    current: any,
    customerProfile?: CustomerProfile
  ): number {
    let confidence = 0.4; // Base confidence for cross-sells

    if (customerProfile) {
      // Service preferences
      if (customerProfile.preferences.serviceTypes.includes(crossSell.category)) {
        confidence += 0.2;
      }

      // Frequency (regular customers more likely to add services)
      if (customerProfile.preferences.frequency === 'regular' || customerProfile.preferences.frequency === 'vip') {
        confidence += 0.15;
      }

      // Price sensitivity
      if (crossSell.price <= customerProfile.history.averageTicket * 0.7) {
        confidence += 0.1;
      }
    }

    return Math.max(0.1, Math.min(0.8, confidence));
  }

  /**
   * Calculate time-based pricing adjustment
   */
  private calculateTimeAdjustment(hour: number): number {
    // Peak hours: 10 AM - 2 PM and 5 PM - 7 PM
    if ((hour >= 10 && hour <= 14) || (hour >= 17 && hour <= 19)) {
      return 0.1; // 10% increase
    }
    // Off-peak hours: before 9 AM and after 8 PM
    if (hour < 9 || hour > 20) {
      return -0.05; // 5% decrease
    }
    return 0;
  }

  /**
   * Calculate day-based pricing adjustment
   */
  private calculateDayAdjustment(dayOfWeek: number): number {
    // Weekend premium (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 0.15; // 15% weekend premium
    }
    // Friday premium
    if (dayOfWeek === 5) {
      return 0.05; // 5% Friday premium
    }
    return 0;
  }

  /**
   * Calculate seasonality adjustment
   */
  private calculateSeasonalityAdjustment(): number {
    const month = new Date().getMonth();
    
    // Holiday seasons (November, December, May)
    if (month === 10 || month === 11 || month === 4) {
      return 0.1; // 10% holiday premium
    }
    
    // Summer season (June, July, August)
    if (month >= 5 && month <= 7) {
      return 0.05; // 5% summer premium
    }
    
    return 0;
  }

  /**
   * Generate pricing reasoning
   */
  private generatePricingReasoning(adjustment: number, factors: any): string {
    if (adjustment === 0) {
      return 'Standard pricing applies';
    }

    const reasons = [];
    
    if (factors.timeOfDay > 0) reasons.push('peak hours');
    if (factors.dayOfWeek > 0) reasons.push('weekend/Friday premium');
    if (factors.demand > 0.7) reasons.push('high demand');
    if (factors.inventory < 0.3) reasons.push('limited availability');
    if (factors.seasonality > 0) reasons.push('seasonal premium');

    const direction = adjustment > 0 ? 'increased' : 'decreased';
    const percentage = Math.abs(Math.round(adjustment * 100));

    return `Price ${direction} by ${percentage}% due to: ${reasons.join(', ')}`;
  }

  /**
   * Get or create customer profile
   */
  private async getCustomerProfile(businessId: string, customerId: string): Promise<CustomerProfile | null> {
    try {
      // Try to get existing profile
      const cached = await redisService.getCachedAIResponse(
        `customer_profile_${customerId}`,
        `business_${businessId}`
      );

      if (cached) {
        return cached;
      }

      // Create default profile for new customers
      const defaultProfile: CustomerProfile = {
        customerId,
        businessId,
        preferences: {
          priceRange: 'mid',
          serviceTypes: [],
          frequency: 'first_time'
        },
        history: {
          totalSpent: 0,
          averageTicket: 0,
          favoriteServices: [],
          seasonalPatterns: []
        },
        behavior: {
          bookingPattern: 'planned',
          pricesensitivity: 'medium',
          loyaltyScore: 0
        }
      };

      // Cache the profile
      await redisService.cacheAIResponse(
        `customer_profile_${customerId}`,
        defaultProfile,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      return defaultProfile;

    } catch (error) {
      console.error('Customer profile error:', error);
      return null;
    }
  }
}

export const revenueOptimizationService = RevenueOptimizationService.getInstance();