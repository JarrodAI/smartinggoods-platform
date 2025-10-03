/**
 * Customer Lifecycle Value Optimization Service
 * Predicts customer lifetime value and implements retention strategies
 */

import { redisService } from './redis-service';
import { openAIService } from './openai-service';

export interface CustomerLifecycleProfile {
  customerId: string;
  businessId: string;
  currentStage: 'new' | 'active' | 'at_risk' | 'churned' | 'won_back';
  lifetimeValue: {
    predicted: number;
    actual: number;
    potential: number;
  };
  churnRisk: {
    score: number; // 0-1
    factors: string[];
    nextAction: string;
    timeframe: number; // days until likely churn
  };
  engagement: {
    score: number; // 0-100
    trend: 'increasing' | 'stable' | 'decreasing';
    lastInteraction: Date;
    frequency: number; // visits per month
  };
  retention: {
    probability: number; // 0-1
    strategies: string[];
    recommendedActions: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: number;
      cost: number;
    }>;
  };
  segments: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChurnPrediction {
  customerId: string;
  churnProbability: number;
  timeToChurn: number; // days
  riskFactors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  preventionStrategies: Array<{
    strategy: string;
    successRate: number;
    cost: number;
    timeline: string;
  }>;
  recommendedActions: Array<{
    action: string;
    urgency: 'immediate' | 'within_week' | 'within_month';
    expectedOutcome: string;
  }>;
}

export interface RetentionCampaign {
  id: string;
  businessId: string;
  name: string;
  targetSegment: string;
  strategy: 'discount' | 'loyalty_points' | 'exclusive_access' | 'personal_outreach' | 'service_upgrade';
  content: {
    subject: string;
    message: string;
    offer?: {
      type: string;
      value: number;
      expiry: Date;
    };
  };
  targeting: {
    churnRiskMin: number;
    churnRiskMax: number;
    lifetimeValueMin: number;
    segments: string[];
  };
  performance: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
    roi: number;
  };
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
}

export class CustomerLifecycleService {
  private static instance: CustomerLifecycleService;

  public static getInstance(): CustomerLifecycleService {
    if (!CustomerLifecycleService.instance) {
      CustomerLifecycleService.instance = new CustomerLifecycleService();
    }
    return CustomerLifecycleService.instance;
  }

  /**
   * Calculate customer lifetime value prediction
   */
  async calculateLifetimeValue(
    businessId: string,
    customerId: string,
    customerData: {
      totalSpent: number;
      visitCount: number;
      averageTicket: number;
      daysSinceFirst: number;
      daysSinceLast: number;
      services: string[];
    }
  ): Promise<{
    predicted: number;
    actual: number;
    potential: number;
    confidence: number;
  }> {
    try {
      // Get business context for industry benchmarks
      const businessContext = await redisService.getBusinessContext(businessId);
      
      // Calculate actual LTV
      const actualLTV = customerData.totalSpent;
      
      // Calculate visit frequency
      const visitFrequency = customerData.visitCount / (customerData.daysSinceFirst / 30); // visits per month
      
      // Predict future value based on patterns
      let predictedLTV = actualLTV;
      
      // Base prediction on visit frequency and average ticket
      if (visitFrequency > 0) {
        const monthlyValue = visitFrequency * customerData.averageTicket;
        const projectedMonths = this.calculateProjectedLifespan(customerData, businessContext);
        predictedLTV = actualLTV + (monthlyValue * projectedMonths);
      }
      
      // Calculate potential LTV with optimization
      const potentialLTV = this.calculatePotentialValue(customerData, businessContext, predictedLTV);
      
      // Calculate confidence based on data quality
      const confidence = this.calculatePredictionConfidence(customerData);
      
      return {
        predicted: Math.round(predictedLTV),
        actual: Math.round(actualLTV),
        potential: Math.round(potentialLTV),
        confidence
      };

    } catch (error) {
      console.error('LTV calculation error:', error);
      return {
        predicted: customerData.totalSpent,
        actual: customerData.totalSpent,
        potential: customerData.totalSpent * 1.5,
        confidence: 0.3
      };
    }
  }

  /**
   * Predict customer churn risk
   */
  async predictChurnRisk(
    businessId: string,
    customerId: string,
    customerData: any
  ): Promise<ChurnPrediction> {
    try {
      // Calculate churn risk factors
      const riskFactors = this.analyzeChurnRiskFactors(customerData);
      
      // Calculate overall churn probability
      const churnProbability = this.calculateChurnProbability(riskFactors);
      
      // Estimate time to churn
      const timeToChurn = this.estimateTimeToChurn(customerData, churnProbability);
      
      // Generate prevention strategies
      const preventionStrategies = await this.generatePreventionStrategies(
        businessId,
        customerData,
        riskFactors
      );
      
      // Generate recommended actions
      const recommendedActions = this.generateRetentionActions(
        churnProbability,
        riskFactors,
        customerData
      );

      return {
        customerId,
        churnProbability,
        timeToChurn,
        riskFactors,
        preventionStrategies,
        recommendedActions
      };

    } catch (error) {
      console.error('Churn prediction error:', error);
      return {
        customerId,
        churnProbability: 0.5,
        timeToChurn: 90,
        riskFactors: [],
        preventionStrategies: [],
        recommendedActions: []
      };
    }
  }

  /**
   * Create customer lifecycle profile
   */
  async createLifecycleProfile(
    businessId: string,
    customerId: string,
    customerData: any
  ): Promise<CustomerLifecycleProfile> {
    try {
      // Calculate LTV
      const lifetimeValue = await this.calculateLifetimeValue(businessId, customerId, customerData);
      
      // Predict churn risk
      const churnPrediction = await this.predictChurnRisk(businessId, customerId, customerData);
      
      // Determine current stage
      const currentStage = this.determineCustomerStage(customerData, churnPrediction);
      
      // Calculate engagement metrics
      const engagement = this.calculateEngagementMetrics(customerData);
      
      // Generate retention strategies
      const retention = await this.generateRetentionStrategies(
        businessId,
        customerData,
        churnPrediction,
        lifetimeValue
      );
      
      // Determine customer segments
      const segments = this.determineCustomerSegments(customerData, lifetimeValue, churnPrediction);

      const profile: CustomerLifecycleProfile = {
        customerId,
        businessId,
        currentStage,
        lifetimeValue,
        churnRisk: {
          score: churnPrediction.churnProbability,
          factors: churnPrediction.riskFactors.map(f => f.factor),
          nextAction: churnPrediction.recommendedActions[0]?.action || 'Monitor engagement',
          timeframe: churnPrediction.timeToChurn
        },
        engagement,
        retention,
        segments,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Cache the profile
      await redisService.cacheAIResponse(
        `lifecycle_profile_${customerId}`,
        profile,
        { prefix: `business_${businessId}`, ttl: 7 * 24 * 60 * 60 } // 7 days
      );

      return profile;

    } catch (error) {
      console.error('Lifecycle profile creation error:', error);
      throw new Error('Failed to create lifecycle profile');
    }
  }

  /**
   * Generate automated retention campaign
   */
  async generateRetentionCampaign(
    businessId: string,
    targetSegment: string,
    strategy: string,
    customerProfiles: CustomerLifecycleProfile[]
  ): Promise<RetentionCampaign> {
    try {
      const campaignId = `retention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get business context
      const businessContext = await redisService.getBusinessContext(businessId);
      
      // Generate campaign content
      const content = await this.generateCampaignContent(
        businessContext,
        strategy,
        targetSegment,
        customerProfiles
      );
      
      // Calculate targeting criteria
      const targeting = this.calculateTargetingCriteria(customerProfiles);
      
      const campaign: RetentionCampaign = {
        id: campaignId,
        businessId,
        name: `${strategy} Campaign - ${targetSegment}`,
        targetSegment,
        strategy: strategy as any,
        content,
        targeting,
        performance: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
          roi: 0
        },
        status: 'draft',
        createdAt: new Date()
      };

      // Cache campaign
      await redisService.cacheAIResponse(
        `retention_campaign_${campaignId}`,
        campaign,
        { prefix: `business_${businessId}`, ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      return campaign;

    } catch (error) {
      console.error('Retention campaign generation error:', error);
      throw new Error('Failed to generate retention campaign');
    }
  }

  /**
   * Execute automated retention actions
   */
  async executeRetentionActions(
    businessId: string,
    customerId: string,
    actions: Array<{ action: string; urgency: string; expectedOutcome: string }>
  ): Promise<{ executed: number; results: any[] }> {
    try {
      const results = [];
      let executed = 0;

      for (const actionItem of actions) {
        try {
          const result = await this.executeRetentionAction(businessId, customerId, actionItem);
          results.push(result);
          executed++;
        } catch (error) {
          console.error(`Failed to execute action ${actionItem.action}:`, error);
          results.push({ action: actionItem.action, success: false, error: String(error) });
        }
      }

      // Store execution results
      await redisService.storeAIAnalytics(businessId, {
        type: 'prediction',
        data: {
          action: 'retention_actions_executed',
          customerId,
          actionsExecuted: executed,
          totalActions: actions.length,
          results
        }
      });

      return { executed, results };

    } catch (error) {
      console.error('Retention actions execution error:', error);
      return { executed: 0, results: [] };
    }
  }

  /**
   * Analyze churn risk factors
   */
  private analyzeChurnRiskFactors(customerData: any): Array<{
    factor: string;
    impact: number;
    description: string;
  }> {
    const factors = [];

    // Days since last visit
    if (customerData.daysSinceLast > 60) {
      factors.push({
        factor: 'long_absence',
        impact: Math.min(0.4, customerData.daysSinceLast / 150),
        description: `${customerData.daysSinceLast} days since last visit`
      });
    }

    // Declining visit frequency
    if (customerData.visitTrend === 'decreasing') {
      factors.push({
        factor: 'declining_frequency',
        impact: 0.3,
        description: 'Visit frequency has been declining'
      });
    }

    // Low engagement
    if (customerData.engagementScore < 30) {
      factors.push({
        factor: 'low_engagement',
        impact: 0.25,
        description: 'Low engagement with communications'
      });
    }

    // Price sensitivity
    if (customerData.priceComplains > 0) {
      factors.push({
        factor: 'price_sensitivity',
        impact: 0.2,
        description: 'Has expressed price concerns'
      });
    }

    // Service issues
    if (customerData.serviceIssues > 0) {
      factors.push({
        factor: 'service_issues',
        impact: 0.35,
        description: 'Has experienced service issues'
      });
    }

    return factors;
  }

  /**
   * Calculate churn probability
   */
  private calculateChurnProbability(riskFactors: Array<{ factor: string; impact: number }>): number {
    const baseRisk = 0.1; // 10% base churn rate
    const totalRiskImpact = riskFactors.reduce((sum, factor) => sum + factor.impact, 0);
    
    // Cap at 90% probability
    return Math.min(0.9, baseRisk + totalRiskImpact);
  }

  /**
   * Estimate time to churn
   */
  private estimateTimeToChurn(customerData: any, churnProbability: number): number {
    // Base timeline: 90 days
    let timeToChurn = 90;
    
    // Adjust based on churn probability
    if (churnProbability > 0.7) {
      timeToChurn = 30; // High risk: 30 days
    } else if (churnProbability > 0.5) {
      timeToChurn = 60; // Medium risk: 60 days
    }
    
    // Adjust based on last visit
    if (customerData.daysSinceLast > 90) {
      timeToChurn = Math.min(timeToChurn, 14); // Already at high risk
    }
    
    return timeToChurn;
  }

  /**
   * Generate prevention strategies
   */
  private async generatePreventionStrategies(
    businessId: string,
    customerData: any,
    riskFactors: any[]
  ): Promise<Array<{
    strategy: string;
    successRate: number;
    cost: number;
    timeline: string;
  }>> {
    const strategies = [];

    // Personalized discount
    if (riskFactors.some(f => f.factor === 'price_sensitivity')) {
      strategies.push({
        strategy: 'Personalized discount offer',
        successRate: 0.65,
        cost: customerData.averageTicket * 0.2,
        timeline: 'Immediate'
      });
    }

    // Service recovery
    if (riskFactors.some(f => f.factor === 'service_issues')) {
      strategies.push({
        strategy: 'Service recovery program',
        successRate: 0.75,
        cost: customerData.averageTicket * 0.5,
        timeline: '1-2 weeks'
      });
    }

    // Loyalty program
    if (customerData.lifetimeValue > 500) {
      strategies.push({
        strategy: 'VIP loyalty program invitation',
        successRate: 0.55,
        cost: 50,
        timeline: '1 week'
      });
    }

    // Personal outreach
    strategies.push({
      strategy: 'Personal check-in call',
      successRate: 0.45,
      cost: 25,
      timeline: 'Within 3 days'
    });

    return strategies;
  }

  /**
   * Generate retention actions
   */
  private generateRetentionActions(
    churnProbability: number,
    riskFactors: any[],
    customerData: any
  ): Array<{
    action: string;
    urgency: 'immediate' | 'within_week' | 'within_month';
    expectedOutcome: string;
  }> {
    const actions = [];

    if (churnProbability > 0.7) {
      actions.push({
        action: 'Send immediate retention offer',
        urgency: 'immediate',
        expectedOutcome: 'Prevent immediate churn'
      });
    }

    if (riskFactors.some(f => f.factor === 'long_absence')) {
      actions.push({
        action: 'Send "we miss you" campaign',
        urgency: 'within_week',
        expectedOutcome: 'Re-engage dormant customer'
      });
    }

    if (customerData.lifetimeValue > 300) {
      actions.push({
        action: 'Assign dedicated account manager',
        urgency: 'within_week',
        expectedOutcome: 'Improve customer experience'
      });
    }

    return actions;
  }

  /**
   * Calculate projected lifespan
   */
  private calculateProjectedLifespan(customerData: any, businessContext: any): number {
    // Industry average customer lifespan (months)
    const industryAverage = businessContext?.industry === 'beauty' ? 18 : 12;
    
    // Adjust based on customer behavior
    let projectedMonths = industryAverage;
    
    if (customerData.visitCount > 10) projectedMonths += 6;
    if (customerData.averageTicket > 100) projectedMonths += 3;
    if (customerData.daysSinceLast < 30) projectedMonths += 3;
    
    return Math.max(6, projectedMonths); // Minimum 6 months
  }

  /**
   * Calculate potential value with optimization
   */
  private calculatePotentialValue(customerData: any, businessContext: any, predictedLTV: number): number {
    let potential = predictedLTV;
    
    // Upselling potential
    if (customerData.services.length < 3) {
      potential *= 1.3; // 30% increase with cross-selling
    }
    
    // Frequency optimization
    if (customerData.visitCount / (customerData.daysSinceFirst / 30) < 1) {
      potential *= 1.2; // 20% increase with better retention
    }
    
    // Premium service potential
    if (customerData.averageTicket < 100) {
      potential *= 1.15; // 15% increase with upselling
    }
    
    return potential;
  }

  /**
   * Calculate prediction confidence
   */
  private calculatePredictionConfidence(customerData: any): number {
    let confidence = 0.5;
    
    if (customerData.visitCount > 5) confidence += 0.2;
    if (customerData.daysSinceFirst > 90) confidence += 0.2;
    if (customerData.services.length > 2) confidence += 0.1;
    
    return Math.min(0.95, confidence);
  }

  /**
   * Determine customer stage
   */
  private determineCustomerStage(customerData: any, churnPrediction: ChurnPrediction): 'new' | 'active' | 'at_risk' | 'churned' | 'won_back' {
    if (customerData.daysSinceLast > 180) return 'churned';
    if (churnPrediction.churnProbability > 0.6) return 'at_risk';
    if (customerData.daysSinceFirst < 90) return 'new';
    if (customerData.wasChurned && customerData.daysSinceLast < 60) return 'won_back';
    return 'active';
  }

  /**
   * Calculate engagement metrics
   */
  private calculateEngagementMetrics(customerData: any): {
    score: number;
    trend: 'increasing' | 'stable' | 'decreasing';
    lastInteraction: Date;
    frequency: number;
  } {
    const score = Math.max(0, Math.min(100, 
      (100 - customerData.daysSinceLast) + 
      (customerData.visitCount * 5) + 
      (customerData.engagementScore || 50)
    ));

    return {
      score,
      trend: customerData.visitTrend || 'stable',
      lastInteraction: new Date(Date.now() - (customerData.daysSinceLast * 24 * 60 * 60 * 1000)),
      frequency: customerData.visitCount / Math.max(1, customerData.daysSinceFirst / 30)
    };
  }

  /**
   * Generate retention strategies
   */
  private async generateRetentionStrategies(
    businessId: string,
    customerData: any,
    churnPrediction: ChurnPrediction,
    lifetimeValue: any
  ): Promise<{
    probability: number;
    strategies: string[];
    recommendedActions: Array<{
      action: string;
      priority: 'high' | 'medium' | 'low';
      expectedImpact: number;
      cost: number;
    }>;
  }> {
    const strategies = [];
    const recommendedActions = [];

    // High-value customer strategies
    if (lifetimeValue.predicted > 1000) {
      strategies.push('VIP treatment program', 'Dedicated account manager', 'Exclusive offers');
      recommendedActions.push({
        action: 'Enroll in VIP program',
        priority: 'high',
        expectedImpact: 0.3,
        cost: 100
      });
    }

    // At-risk customer strategies
    if (churnPrediction.churnProbability > 0.5) {
      strategies.push('Retention discount', 'Personal outreach', 'Service recovery');
      recommendedActions.push({
        action: 'Send retention offer',
        priority: 'high',
        expectedImpact: 0.4,
        cost: customerData.averageTicket * 0.2
      });
    }

    // General retention strategies
    strategies.push('Regular check-ins', 'Loyalty rewards', 'Birthday specials');
    recommendedActions.push({
      action: 'Schedule regular follow-up',
      priority: 'medium',
      expectedImpact: 0.15,
      cost: 25
    });

    return {
      probability: Math.max(0.1, 1 - churnPrediction.churnProbability),
      strategies,
      recommendedActions
    };
  }

  /**
   * Determine customer segments
   */
  private determineCustomerSegments(customerData: any, lifetimeValue: any, churnPrediction: ChurnPrediction): string[] {
    const segments = [];

    // Value segments
    if (lifetimeValue.predicted > 2000) segments.push('high_value');
    else if (lifetimeValue.predicted > 500) segments.push('medium_value');
    else segments.push('low_value');

    // Risk segments
    if (churnPrediction.churnProbability > 0.7) segments.push('high_risk');
    else if (churnPrediction.churnProbability > 0.4) segments.push('medium_risk');
    else segments.push('low_risk');

    // Frequency segments
    const frequency = customerData.visitCount / Math.max(1, customerData.daysSinceFirst / 30);
    if (frequency > 2) segments.push('frequent');
    else if (frequency > 0.5) segments.push('regular');
    else segments.push('occasional');

    return segments;
  }

  /**
   * Generate campaign content
   */
  private async generateCampaignContent(
    businessContext: any,
    strategy: string,
    targetSegment: string,
    customerProfiles: CustomerLifecycleProfile[]
  ): Promise<{
    subject: string;
    message: string;
    offer?: { type: string; value: number; expiry: Date };
  }> {
    const businessName = businessContext.businessName || 'Your Salon';
    
    const contentTemplates = {
      discount: {
        subject: `Special Offer Just for You - ${businessName}`,
        message: `We value your loyalty! Enjoy 20% off your next visit with us.`,
        offer: {
          type: 'percentage_discount',
          value: 20,
          expiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
        }
      },
      loyalty_points: {
        subject: `Your Loyalty Rewards Await - ${businessName}`,
        message: `Thank you for being a valued customer! You've earned special loyalty points.`,
        offer: {
          type: 'loyalty_points',
          value: 100,
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      },
      personal_outreach: {
        subject: `We Miss You at ${businessName}`,
        message: `It's been a while since your last visit. We'd love to welcome you back with a special offer.`
      }
    };

    return contentTemplates[strategy as keyof typeof contentTemplates] || contentTemplates.personal_outreach;
  }

  /**
   * Calculate targeting criteria
   */
  private calculateTargetingCriteria(customerProfiles: CustomerLifecycleProfile[]): {
    churnRiskMin: number;
    churnRiskMax: number;
    lifetimeValueMin: number;
    segments: string[];
  } {
    const churnRisks = customerProfiles.map(p => p.churnRisk.score);
    const lifetimeValues = customerProfiles.map(p => p.lifetimeValue.predicted);
    const allSegments = customerProfiles.flatMap(p => p.segments);

    return {
      churnRiskMin: Math.min(...churnRisks),
      churnRiskMax: Math.max(...churnRisks),
      lifetimeValueMin: Math.min(...lifetimeValues),
      segments: [...new Set(allSegments)]
    };
  }

  /**
   * Execute individual retention action
   */
  private async executeRetentionAction(
    businessId: string,
    customerId: string,
    action: { action: string; urgency: string; expectedOutcome: string }
  ): Promise<any> {
    // This would integrate with actual communication systems
    // For now, we'll simulate the execution
    
    const actionResults = {
      'Send immediate retention offer': { success: true, method: 'email', deliveredAt: new Date() },
      'Send "we miss you" campaign': { success: true, method: 'sms', deliveredAt: new Date() },
      'Assign dedicated account manager': { success: true, method: 'internal', assignedAt: new Date() }
    };

    return actionResults[action.action as keyof typeof actionResults] || { success: false, error: 'Unknown action' };
  }
}

export const customerLifecycleService = CustomerLifecycleService.getInstance();