/**
 * Predictive Analytics Service
 * Implements customer churn prediction, demand forecasting, and business intelligence
 */

import { OpenAIService } from './openai-service';
import { VectorService } from './vector-service';

export interface CustomerData {
  id: string;
  businessId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  registrationDate: Date;
  lastVisit: Date;
  totalSpent: number;
  visitCount: number;
  averageSpend: number;
  preferredServices: string[];
  communicationPreference: 'email' | 'sms' | 'both';
  birthDate?: Date;
  loyaltyPoints: number;
  referralCount: number;
  cancelationCount: number;
  noShowCount: number;
  reviewsGiven: number;
  averageRating: number;
}

export interface ChurnPrediction {
  customerId: string;
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  churnProbability: number;
  riskFactors: string[];
  recommendedActions: string[];
  estimatedLTV: number;
  daysUntilChurn: number;
  retentionStrategies: RetentionStrategy[];
}

export interface RetentionStrategy {
  type: 'discount' | 'loyalty_bonus' | 'personal_outreach' | 'service_upgrade' | 'referral_incentive';
  description: string;
  expectedImpact: number;
  cost: number;
  timeline: string;
}

export interface DemandForecast {
  serviceId: string;
  serviceName: string;
  forecastPeriod: 'week' | 'month' | 'quarter';
  predictedDemand: number;
  confidence: number;
  seasonalFactors: {
    factor: number;
    reason: string;
  }[];
  recommendedCapacity: number;
  revenueProjection: number;
  staffingNeeds: number;
}

export interface BusinessInsights {
  period: string;
  totalRevenue: number;
  customerCount: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
  churnRate: number;
  growthRate: number;
  topServices: {
    name: string;
    revenue: number;
    bookings: number;
    growth: number;
  }[];
  customerSegments: {
    segment: string;
    count: number;
    revenue: number;
    characteristics: string[];
  }[];
  recommendations: string[];
  alerts: {
    type: 'warning' | 'opportunity' | 'critical';
    message: string;
    action: string;
  }[];
}

export class PredictiveAnalyticsService {
  private openai: OpenAIService;
  private vectorService: VectorService;

  constructor() {
    this.openai = new OpenAIService();
    this.vectorService = new VectorService();
  }

  /**
   * Predict customer churn risk
   */
  async predictCustomerChurn(customerId: string): Promise<ChurnPrediction> {
    try {
      const customer = await this.getCustomerData(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const churnProbability = this.calculateChurnProbability(customer);
      const riskLevel = this.determineRiskLevel(churnProbability);
      const riskFactors = this.identifyRiskFactors(customer);
      const recommendedActions = await this.generateRetentionActions(customer, riskLevel);
      const estimatedLTV = this.calculateLifetimeValue(customer);
      const daysUntilChurn = this.estimateDaysUntilChurn(customer, churnProbability);
      const retentionStrategies = await this.generateRetentionStrategies(customer, riskLevel);

      return {
        customerId,
        churnRisk: riskLevel,
        churnProbability,
        riskFactors,
        recommendedActions,
        estimatedLTV,
        daysUntilChurn,
        retentionStrategies
      };

    } catch (error) {
      console.error('Churn prediction error:', error);
      throw new Error('Failed to predict customer churn');
    }
  }

  /**
   * Batch predict churn for all customers
   */
  async batchPredictChurn(businessId: string): Promise<ChurnPrediction[]> {
    const customers = await this.getBusinessCustomers(businessId);
    const predictions: ChurnPrediction[] = [];

    for (const customer of customers) {
      try {
        const prediction = await this.predictCustomerChurn(customer.id);
        predictions.push(prediction);
      } catch (error) {
        console.error(`Failed to predict churn for customer ${customer.id}:`, error);
      }
    }

    return predictions.sort((a, b) => b.churnProbability - a.churnProbability);
  }

  /**
   * Forecast demand for services
   */
  async forecastDemand(
    businessId: string,
    serviceId: string,
    period: 'week' | 'month' | 'quarter'
  ): Promise<DemandForecast> {
    try {
      const historicalData = await this.getHistoricalBookingData(businessId, serviceId);
      const seasonalFactors = this.analyzeSeasonalFactors(historicalData, period);
      const trendAnalysis = this.analyzeTrends(historicalData);
      
      const baseDemand = this.calculateBaseDemand(historicalData, period);
      const seasonalAdjustment = seasonalFactors.reduce((acc, factor) => acc * factor.factor, 1);
      const trendAdjustment = trendAnalysis.growthRate;
      
      const predictedDemand = Math.round(baseDemand * seasonalAdjustment * (1 + trendAdjustment));
      const confidence = this.calculateForecastConfidence(historicalData, period);
      
      const service = await this.getServiceData(serviceId);
      const revenueProjection = predictedDemand * (service?.price || 0);
      const staffingNeeds = Math.ceil(predictedDemand * (service?.duration || 60) / (8 * 60)); // 8-hour workday

      return {
        serviceId,
        serviceName: service?.name || 'Unknown Service',
        forecastPeriod: period,
        predictedDemand,
        confidence,
        seasonalFactors,
        recommendedCapacity: Math.ceil(predictedDemand * 1.2), // 20% buffer
        revenueProjection,
        staffingNeeds
      };

    } catch (error) {
      console.error('Demand forecasting error:', error);
      throw new Error('Failed to forecast demand');
    }
  }

  /**
   * Generate comprehensive business insights
   */
  async generateBusinessInsights(
    businessId: string,
    period: string = 'month'
  ): Promise<BusinessInsights> {
    try {
      const businessData = await this.getBusinessAnalyticsData(businessId, period);
      const customerData = await this.getBusinessCustomers(businessId);
      const churnPredictions = await this.batchPredictChurn(businessId);
      
      const insights = await this.analyzeBusinessPerformance(businessData, customerData, churnPredictions);
      const recommendations = await this.generateBusinessRecommendations(insights);
      const alerts = this.generateBusinessAlerts(insights);

      return {
        period,
        totalRevenue: businessData.totalRevenue,
        customerCount: customerData.length,
        averageOrderValue: businessData.totalRevenue / businessData.totalBookings,
        customerLifetimeValue: this.calculateAverageLTV(customerData),
        churnRate: this.calculateChurnRate(churnPredictions),
        growthRate: businessData.growthRate,
        topServices: businessData.topServices,
        customerSegments: this.segmentCustomers(customerData),
        recommendations,
        alerts
      };

    } catch (error) {
      console.error('Business insights generation error:', error);
      throw new Error('Failed to generate business insights');
    }
  }

  /**
   * Calculate churn probability using multiple factors
   */
  private calculateChurnProbability(customer: CustomerData): number {
    let score = 0;
    let maxScore = 0;

    // Days since last visit (weight: 30%)
    const daysSinceLastVisit = Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastVisit > 90) score += 30;
    else if (daysSinceLastVisit > 60) score += 20;
    else if (daysSinceLastVisit > 30) score += 10;
    maxScore += 30;

    // Visit frequency (weight: 25%)
    const daysSinceRegistration = Math.floor((Date.now() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24));
    const visitFrequency = customer.visitCount / (daysSinceRegistration / 30); // visits per month
    if (visitFrequency < 0.5) score += 25;
    else if (visitFrequency < 1) score += 15;
    else if (visitFrequency < 2) score += 5;
    maxScore += 25;

    // Spending behavior (weight: 20%)
    const recentSpendingTrend = this.calculateSpendingTrend(customer);
    if (recentSpendingTrend < -0.3) score += 20;
    else if (recentSpendingTrend < -0.1) score += 10;
    maxScore += 20;

    // Engagement indicators (weight: 15%)
    if (customer.cancelationCount > customer.visitCount * 0.2) score += 8;
    if (customer.noShowCount > customer.visitCount * 0.1) score += 7;
    maxScore += 15;

    // Satisfaction indicators (weight: 10%)
    if (customer.averageRating < 3.5) score += 10;
    else if (customer.averageRating < 4.0) score += 5;
    maxScore += 10;

    return Math.min(score / maxScore, 1);
  }

  /**
   * Determine risk level based on churn probability
   */
  private determineRiskLevel(probability: number): 'low' | 'medium' | 'high' | 'critical' {
    if (probability >= 0.8) return 'critical';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Identify specific risk factors for a customer
   */
  private identifyRiskFactors(customer: CustomerData): string[] {
    const factors: string[] = [];

    const daysSinceLastVisit = Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastVisit > 90) factors.push('No visit in over 3 months');
    else if (daysSinceLastVisit > 60) factors.push('No visit in over 2 months');

    if (customer.cancelationCount > customer.visitCount * 0.2) {
      factors.push('High cancellation rate');
    }

    if (customer.noShowCount > customer.visitCount * 0.1) {
      factors.push('Frequent no-shows');
    }

    if (customer.averageRating < 3.5) {
      factors.push('Low satisfaction ratings');
    }

    const spendingTrend = this.calculateSpendingTrend(customer);
    if (spendingTrend < -0.2) {
      factors.push('Declining spending pattern');
    }

    if (customer.visitCount < 3 && daysSinceLastVisit > 30) {
      factors.push('New customer with low engagement');
    }

    return factors;
  }

  /**
   * Generate retention actions using AI
   */
  private async generateRetentionActions(
    customer: CustomerData,
    riskLevel: string
  ): Promise<string[]> {
    const prompt = `
Generate retention actions for a ${riskLevel} churn risk customer:

Customer Profile:
- Total visits: ${customer.visitCount}
- Total spent: $${customer.totalSpent}
- Average spend: $${customer.averageSpend}
- Days since last visit: ${Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24))}
- Preferred services: ${customer.preferredServices.join(', ')}
- Communication preference: ${customer.communicationPreference}

Generate 3-5 specific, actionable retention strategies.
`;

    try {
      const response = await this.openai.generateCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a customer retention specialist. Generate specific, actionable retention strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'gpt-4-turbo-preview',
        temperature: 0.7
      });

      const actions = response.choices[0].message.content?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];

      return actions.slice(0, 5);

    } catch (error) {
      console.error('Failed to generate retention actions:', error);
      return [
        'Send personalized discount offer',
        'Schedule follow-up call',
        'Invite to loyalty program',
        'Offer service upgrade',
        'Request feedback survey'
      ];
    }
  }

  /**
   * Generate retention strategies with cost/benefit analysis
   */
  private async generateRetentionStrategies(
    customer: CustomerData,
    riskLevel: string
  ): Promise<RetentionStrategy[]> {
    const strategies: RetentionStrategy[] = [];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      strategies.push({
        type: 'discount',
        description: `Offer 25% discount on next ${customer.preferredServices[0] || 'service'}`,
        expectedImpact: 0.7,
        cost: customer.averageSpend * 0.25,
        timeline: 'Immediate'
      });

      strategies.push({
        type: 'personal_outreach',
        description: 'Personal call from salon manager to address concerns',
        expectedImpact: 0.6,
        cost: 15, // Staff time cost
        timeline: '1-2 days'
      });
    }

    if (customer.loyaltyPoints > 0) {
      strategies.push({
        type: 'loyalty_bonus',
        description: 'Double loyalty points on next visit',
        expectedImpact: 0.4,
        cost: customer.averageSpend * 0.1,
        timeline: 'Next visit'
      });
    }

    strategies.push({
      type: 'service_upgrade',
      description: 'Complimentary upgrade to premium service',
      expectedImpact: 0.5,
      cost: 20,
      timeline: 'Next booking'
    });

    if (customer.referralCount === 0) {
      strategies.push({
        type: 'referral_incentive',
        description: 'Refer a friend and both get 20% off',
        expectedImpact: 0.3,
        cost: customer.averageSpend * 0.4, // Potential cost for two discounts
        timeline: '1 month'
      });
    }

    return strategies;
  }

  /**
   * Calculate customer lifetime value
   */
  private calculateLifetimeValue(customer: CustomerData): number {
    const monthsSinceRegistration = Math.max(1, Math.floor((Date.now() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const monthlySpend = customer.totalSpent / monthsSinceRegistration;
    const estimatedLifetimeMonths = this.estimateCustomerLifetime(customer);
    
    return Math.round(monthlySpend * estimatedLifetimeMonths);
  }

  /**
   * Estimate customer lifetime in months
   */
  private estimateCustomerLifetime(customer: CustomerData): number {
    // Base lifetime estimation on visit frequency and satisfaction
    const visitFrequency = customer.visitCount / Math.max(1, Math.floor((Date.now() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
    const satisfactionMultiplier = Math.max(0.5, customer.averageRating / 5);
    
    let baseLifetime = 24; // 2 years base
    
    if (visitFrequency > 2) baseLifetime *= 1.5;
    else if (visitFrequency < 0.5) baseLifetime *= 0.6;
    
    return Math.round(baseLifetime * satisfactionMultiplier);
  }

  /**
   * Calculate spending trend
   */
  private calculateSpendingTrend(customer: CustomerData): number {
    // Simplified trend calculation
    // In a real implementation, this would analyze historical spending data
    const recentSpendingRatio = customer.averageSpend / Math.max(1, customer.totalSpent / customer.visitCount);
    return (recentSpendingRatio - 1);
  }

  /**
   * Estimate days until churn
   */
  private estimateDaysUntilChurn(customer: CustomerData, churnProbability: number): number {
    const daysSinceLastVisit = Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    const averageVisitInterval = Math.max(30, Math.floor((Date.now() - customer.registrationDate.getTime()) / (1000 * 60 * 60 * 24)) / customer.visitCount);
    
    const expectedNextVisit = averageVisitInterval - daysSinceLastVisit;
    const churnMultiplier = 1 / Math.max(0.1, 1 - churnProbability);
    
    return Math.max(0, Math.round(expectedNextVisit * churnMultiplier));
  }

  /**
   * Analyze seasonal factors for demand forecasting
   */
  private analyzeSeasonalFactors(historicalData: any[], period: string): { factor: number; reason: string }[] {
    // Simplified seasonal analysis
    // In a real implementation, this would use time series analysis
    
    const currentMonth = new Date().getMonth();
    const factors: { factor: number; reason: string }[] = [];

    // Holiday seasons
    if ([10, 11].includes(currentMonth)) {
      factors.push({ factor: 1.3, reason: 'Holiday season increase' });
    }

    // Summer season
    if ([5, 6, 7].includes(currentMonth)) {
      factors.push({ factor: 1.2, reason: 'Summer season boost' });
    }

    // Wedding season
    if ([4, 5, 8, 9].includes(currentMonth)) {
      factors.push({ factor: 1.15, reason: 'Wedding season' });
    }

    // Back to school
    if ([7, 8].includes(currentMonth)) {
      factors.push({ factor: 1.1, reason: 'Back to school preparations' });
    }

    return factors.length > 0 ? factors : [{ factor: 1.0, reason: 'No significant seasonal factors' }];
  }

  /**
   * Analyze trends in historical data
   */
  private analyzeTrends(historicalData: any[]): { growthRate: number; trend: 'increasing' | 'decreasing' | 'stable' } {
    // Simplified trend analysis
    if (historicalData.length < 2) {
      return { growthRate: 0, trend: 'stable' };
    }

    const recent = historicalData.slice(-3).reduce((sum, item) => sum + item.bookings, 0) / 3;
    const older = historicalData.slice(0, 3).reduce((sum, item) => sum + item.bookings, 0) / 3;
    
    const growthRate = older > 0 ? (recent - older) / older : 0;
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (growthRate > 0.1) trend = 'increasing';
    else if (growthRate < -0.1) trend = 'decreasing';

    return { growthRate, trend };
  }

  /**
   * Calculate base demand from historical data
   */
  private calculateBaseDemand(historicalData: any[], period: string): number {
    if (historicalData.length === 0) return 0;
    
    const totalBookings = historicalData.reduce((sum, item) => sum + item.bookings, 0);
    return Math.round(totalBookings / historicalData.length);
  }

  /**
   * Calculate forecast confidence based on data quality
   */
  private calculateForecastConfidence(historicalData: any[], period: string): number {
    if (historicalData.length < 3) return 0.3;
    if (historicalData.length < 6) return 0.6;
    if (historicalData.length < 12) return 0.8;
    return 0.9;
  }

  /**
   * Segment customers based on behavior and value
   */
  private segmentCustomers(customers: CustomerData[]): BusinessInsights['customerSegments'] {
    const segments = {
      champions: { count: 0, revenue: 0, characteristics: ['High value', 'High frequency', 'High satisfaction'] },
      loyalists: { count: 0, revenue: 0, characteristics: ['High frequency', 'Good satisfaction', 'Medium value'] },
      potential: { count: 0, revenue: 0, characteristics: ['High value', 'Low frequency', 'Recent customers'] },
      atrisk: { count: 0, revenue: 0, characteristics: ['Declining frequency', 'Medium value', 'Needs attention'] },
      lost: { count: 0, revenue: 0, characteristics: ['No recent visits', 'High churn risk', 'Win-back needed'] }
    };

    customers.forEach(customer => {
      const daysSinceLastVisit = Math.floor((Date.now() - customer.lastVisit.getTime()) / (1000 * 60 * 60 * 24));
      const isHighValue = customer.totalSpent > 500;
      const isHighFrequency = customer.visitCount > 5;
      const isHighSatisfaction = customer.averageRating > 4.0;
      const isRecent = daysSinceLastVisit < 60;

      if (isHighValue && isHighFrequency && isHighSatisfaction) {
        segments.champions.count++;
        segments.champions.revenue += customer.totalSpent;
      } else if (isHighFrequency && isHighSatisfaction) {
        segments.loyalists.count++;
        segments.loyalists.revenue += customer.totalSpent;
      } else if (isHighValue && isRecent) {
        segments.potential.count++;
        segments.potential.revenue += customer.totalSpent;
      } else if (daysSinceLastVisit > 90) {
        segments.lost.count++;
        segments.lost.revenue += customer.totalSpent;
      } else {
        segments.atrisk.count++;
        segments.atrisk.revenue += customer.totalSpent;
      }
    });

    return Object.entries(segments).map(([segment, data]) => ({
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      ...data
    }));
  }

  /**
   * Generate business recommendations using AI
   */
  private async generateBusinessRecommendations(insights: any): Promise<string[]> {
    const prompt = `
Analyze this business performance data and generate actionable recommendations:

Revenue: $${insights.totalRevenue}
Customer Count: ${insights.customerCount}
Average Order Value: $${insights.averageOrderValue}
Churn Rate: ${insights.churnRate}%
Growth Rate: ${insights.growthRate}%

Generate 5 specific, actionable business recommendations to improve performance.
`;

    try {
      const response = await this.openai.generateCompletion({
        messages: [
          {
            role: 'system',
            content: 'You are a business consultant specializing in service-based businesses. Generate specific, actionable recommendations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'gpt-4-turbo-preview',
        temperature: 0.7
      });

      const recommendations = response.choices[0].message.content?.split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^\d+\.\s*/, '').trim()) || [];

      return recommendations.slice(0, 5);

    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return [
        'Focus on customer retention programs',
        'Optimize pricing strategy',
        'Improve service quality',
        'Expand marketing efforts',
        'Enhance customer experience'
      ];
    }
  }

  /**
   * Generate business alerts based on performance metrics
   */
  private generateBusinessAlerts(insights: any): BusinessInsights['alerts'] {
    const alerts: BusinessInsights['alerts'] = [];

    if (insights.churnRate > 15) {
      alerts.push({
        type: 'critical',
        message: 'High customer churn rate detected',
        action: 'Implement immediate retention strategies'
      });
    }

    if (insights.growthRate < 0) {
      alerts.push({
        type: 'warning',
        message: 'Negative growth trend',
        action: 'Review marketing and service quality'
      });
    }

    if (insights.averageOrderValue < 50) {
      alerts.push({
        type: 'opportunity',
        message: 'Low average order value',
        action: 'Consider upselling and service bundling'
      });
    }

    return alerts;
  }

  /**
   * Calculate average customer lifetime value
   */
  private calculateAverageLTV(customers: CustomerData[]): number {
    if (customers.length === 0) return 0;
    
    const totalLTV = customers.reduce((sum, customer) => sum + this.calculateLifetimeValue(customer), 0);
    return Math.round(totalLTV / customers.length);
  }

  /**
   * Calculate churn rate from predictions
   */
  private calculateChurnRate(predictions: ChurnPrediction[]): number {
    if (predictions.length === 0) return 0;
    
    const highRiskCount = predictions.filter(p => p.churnRisk === 'high' || p.churnRisk === 'critical').length;
    return Math.round((highRiskCount / predictions.length) * 100);
  }

  // Mock data methods (replace with actual database queries)
  private async getCustomerData(customerId: string): Promise<CustomerData | null> {
    // Mock implementation - replace with actual database query
    return null;
  }

  private async getBusinessCustomers(businessId: string): Promise<CustomerData[]> {
    // Mock implementation - replace with actual database query
    return [];
  }

  private async getHistoricalBookingData(businessId: string, serviceId: string): Promise<any[]> {
    // Mock implementation - replace with actual database query
    return [];
  }

  private async getServiceData(serviceId: string): Promise<any> {
    // Mock implementation - replace with actual database query
    return null;
  }

  private async getBusinessAnalyticsData(businessId: string, period: string): Promise<any> {
    // Mock implementation - replace with actual database query
    return {
      totalRevenue: 0,
      totalBookings: 0,
      growthRate: 0,
      topServices: []
    };
  }

  private async analyzeBusinessPerformance(businessData: any, customerData: any[], churnPredictions: any[]): Promise<any> {
    // Mock implementation - replace with actual analysis
    return businessData;
  }
}

// Export service instance
export const predictiveAnalyticsService = new PredictiveAnalyticsService()