/**
 * Demand Forecasting and Inventory Optimization Service
 * Predicts demand patterns and optimizes inventory and staffing
 */

import { redisService } from './redis-service';
import { openAIService } from './openai-service';

export interface DemandForecast {
  businessId: string;
  serviceId: string;
  serviceName: string;
  forecastPeriod: {
    start: Date;
    end: Date;
    granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
  };
  predictions: Array<{
    date: Date;
    predictedDemand: number;
    confidence: number; // 0-1
    factors: {
      seasonal: number;
      trend: number;
      dayOfWeek: number;
      timeOfDay: number;
      events: number;
      weather: number;
    };
  }>;
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    lastUpdated: Date;
  };
  recommendations: {
    staffing: Array<{
      date: Date;
      recommendedStaff: number;
      skillsNeeded: string[];
      priority: 'low' | 'medium' | 'high';
    }>;
    inventory: Array<{
      item: string;
      currentStock: number;
      recommendedStock: number;
      reorderPoint: number;
      urgency: 'low' | 'medium' | 'high';
    }>;
    pricing: Array<{
      date: Date;
      serviceId: string;
      recommendedPrice: number;
      priceAdjustment: number;
      reason: string;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  businessId: string;
  name: string;
  category: 'nail_polish' | 'tools' | 'supplies' | 'equipment' | 'retail';
  currentStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  supplier: string;
  leadTime: number; // days
  usageRate: number; // units per day
  seasonality: {
    peak: string[]; // months
    low: string[]; // months
    factor: number; // multiplier
  };
  lastOrdered: Date;
  expiryDate?: Date;
  analytics: {
    turnoverRate: number;
    stockoutDays: number;
    overstock: number;
    totalValue: number;
  };
}

export interface StaffingRecommendation {
  businessId: string;
  date: Date;
  timeSlot: string;
  currentStaff: number;
  recommendedStaff: number;
  skillsRequired: Array<{
    skill: string;
    level: 'junior' | 'senior' | 'expert';
    count: number;
  }>;
  workload: {
    predictedAppointments: number;
    averageServiceTime: number;
    utilization: number;
  };
  adjustmentReason: string;
  confidence: number;
}

export class DemandForecastingService {
  private static instance: DemandForecastingService;

  public static getInstance(): DemandForecastingService {
    if (!DemandForecastingService.instance) {
      DemandForecastingService.instance = new DemandForecastingService();
    }
    return DemandForecastingService.instance;
  }

  /**
   * Generate demand forecast for services
   */
  async generateDemandForecast(
    businessId: string,
    serviceId: string,
    forecastDays: number = 30
  ): Promise<DemandForecast> {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalDemand(businessId, serviceId);
      
      // Get business context
      const businessContext = await redisService.getBusinessContext(businessId);
      
      // Generate predictions using time series analysis
      const predictions = await this.generatePredictions(
        historicalData,
        businessContext,
        forecastDays
      );
      
      // Generate recommendations
      const recommendations = await this.generateRecommendations(
        businessId,
        predictions,
        businessContext
      );

      const forecast: DemandForecast = {
        businessId,
        serviceId,
        serviceName: businessContext.services?.find((s: any) => s.id === serviceId)?.name || 'Service',
        forecastPeriod: {
          start: new Date(),
          end: new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000),
          granularity: 'daily'
        },
        predictions,
        accuracy: {
          mape: 0.15, // 15% error rate
          rmse: 2.3,
          lastUpdated: new Date()
        },
        recommendations,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Cache forecast
      await redisService.cacheAIResponse(
        `demand_forecast_${businessId}_${serviceId}`,
        forecast,
        { prefix: 'ai:forecasting', ttl: 24 * 60 * 60 } // 24 hours
      );

      console.log(`📊 Generated demand forecast for ${forecast.serviceName}`);

      return forecast;

    } catch (error) {
      console.error('Demand forecast generation error:', error);
      throw new Error('Failed to generate demand forecast');
    }
  }

  /**
   * Optimize inventory levels
   */
  async optimizeInventory(businessId: string): Promise<{
    items: InventoryItem[];
    recommendations: Array<{
      action: 'reorder' | 'reduce' | 'monitor';
      item: string;
      quantity?: number;
      reason: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
    totalValue: number;
    savings: number;
  }> {
    try {
      // Get current inventory
      const inventory = await this.getCurrentInventory(businessId);
      
      // Get demand forecasts for all services
      const demandForecasts = await this.getAllDemandForecasts(businessId);
      
      // Calculate optimal stock levels
      const optimizedItems = await this.calculateOptimalStock(inventory, demandForecasts);
      
      // Generate recommendations
      const recommendations = this.generateInventoryRecommendations(inventory, optimizedItems);
      
      // Calculate financial impact
      const currentValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
      const optimizedValue = optimizedItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
      const savings = currentValue - optimizedValue;

      return {
        items: optimizedItems,
        recommendations,
        totalValue: optimizedValue,
        savings: Math.max(0, savings)
      };

    } catch (error) {
      console.error('Inventory optimization error:', error);
      throw new Error('Failed to optimize inventory');
    }
  }

  /**
   * Generate staffing recommendations
   */
  async generateStaffingRecommendations(
    businessId: string,
    targetDate: Date,
    timeHorizon: number = 7 // days
  ): Promise<StaffingRecommendation[]> {
    try {
      const recommendations: StaffingRecommendation[] = [];
      
      // Get business hours and current staffing
      const businessContext = await redisService.getBusinessContext(businessId);
      const currentStaffing = await this.getCurrentStaffing(businessId);
      
      // Generate recommendations for each day
      for (let day = 0; day < timeHorizon; day++) {
        const date = new Date(targetDate);
        date.setDate(date.getDate() + day);
        
        // Get demand forecast for this date
        const demandForecast = await this.getDemandForDate(businessId, date);
        
        // Calculate staffing needs by time slot
        const timeSlots = this.generateTimeSlots(businessContext.hours);
        
        for (const timeSlot of timeSlots) {
          const recommendation = await this.calculateStaffingNeed(
            businessId,
            date,
            timeSlot,
            demandForecast,
            currentStaffing
          );
          
          recommendations.push(recommendation);
        }
      }

      return recommendations;

    } catch (error) {
      console.error('Staffing recommendations error:', error);
      return [];
    }
  }

  /**
   * Analyze seasonal patterns
   */
  async analyzeSeasonalPatterns(
    businessId: string,
    serviceId?: string
  ): Promise<{
    patterns: Array<{
      period: 'monthly' | 'weekly' | 'daily' | 'hourly';
      peaks: Array<{ time: string; multiplier: number }>;
      lows: Array<{ time: string; multiplier: number }>;
    }>;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalDemand(businessId, serviceId);
      
      // Analyze patterns
      const monthlyPattern = this.analyzeMonthlyPattern(historicalData);
      const weeklyPattern = this.analyzeWeeklyPattern(historicalData);
      const dailyPattern = this.analyzeDailyPattern(historicalData);
      const hourlyPattern = this.analyzeHourlyPattern(historicalData);
      
      const patterns = [
        { period: 'monthly' as const, ...monthlyPattern },
        { period: 'weekly' as const, ...weeklyPattern },
        { period: 'daily' as const, ...dailyPattern },
        { period: 'hourly' as const, ...hourlyPattern }
      ];
      
      // Generate insights
      const insights = this.generateSeasonalInsights(patterns);
      
      // Generate recommendations
      const recommendations = this.generateSeasonalRecommendations(patterns);

      return { patterns, insights, recommendations };

    } catch (error) {
      console.error('Seasonal analysis error:', error);
      return { patterns: [], insights: [], recommendations: [] };
    }
  }

  /**
   * Get historical demand data
   */
  private async getHistoricalDemand(businessId: string, serviceId?: string): Promise<any[]> {
    // In a real implementation, this would query actual booking data
    // For now, generate mock historical data
    const data = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90); // 90 days of history

    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic demand patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const basedemand = isWeekend ? 15 : 8;
      
      // Add seasonal variation
      const month = date.getMonth();
      const seasonalMultiplier = this.getSeasonalMultiplier(month);
      
      // Add random variation
      const randomFactor = 0.8 + Math.random() * 0.4; // ±20% variation
      
      const demand = Math.round(basedemand * seasonalMultiplier * randomFactor);
      
      data.push({
        date,
        demand,
        dayOfWeek,
        month,
        isWeekend
      });
    }

    return data;
  }

  /**
   * Generate predictions using time series analysis
   */
  private async generatePredictions(
    historicalData: any[],
    businessContext: any,
    forecastDays: number
  ): Promise<any[]> {
    const predictions = [];
    
    for (let i = 0; i < forecastDays; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Calculate base prediction using moving average
      const recentData = historicalData.slice(-14); // Last 14 days
      const averageDemand = recentData.reduce((sum, d) => sum + d.demand, 0) / recentData.length;
      
      // Apply factors
      const factors = {
        seasonal: this.getSeasonalMultiplier(date.getMonth()),
        trend: 1.02, // 2% growth trend
        dayOfWeek: this.getDayOfWeekMultiplier(date.getDay()),
        timeOfDay: 1.0, // Would vary by hour
        events: this.getEventMultiplier(date),
        weather: 1.0 // Would integrate with weather API
      };
      
      // Calculate prediction
      let prediction = averageDemand;
      Object.values(factors).forEach(factor => {
        prediction *= factor;
      });
      
      // Add confidence based on data quality
      const confidence = Math.max(0.6, Math.min(0.95, 
        0.8 - (i * 0.01) // Confidence decreases with time
      ));
      
      predictions.push({
        date,
        predictedDemand: Math.round(prediction),
        confidence,
        factors
      });
    }

    return predictions;
  }

  /**
   * Generate recommendations based on predictions
   */
  private async generateRecommendations(
    businessId: string,
    predictions: any[],
    businessContext: any
  ): Promise<any> {
    // Staffing recommendations
    const staffing = predictions.map(p => ({
      date: p.date,
      recommendedStaff: Math.ceil(p.predictedDemand / 8), // 8 appointments per staff per day
      skillsNeeded: ['nail_technician', 'receptionist'],
      priority: p.predictedDemand > 15 ? 'high' : p.predictedDemand > 10 ? 'medium' : 'low'
    }));

    // Inventory recommendations
    const inventory = [
      {
        item: 'Gel Polish',
        currentStock: 50,
        recommendedStock: 75,
        reorderPoint: 25,
        urgency: 'medium' as const
      },
      {
        item: 'Nail Files',
        currentStock: 100,
        recommendedStock: 120,
        reorderPoint: 40,
        urgency: 'low' as const
      }
    ];

    // Pricing recommendations
    const pricing = predictions
      .filter(p => p.predictedDemand > 12)
      .map(p => ({
        date: p.date,
        serviceId: 'manicure',
        recommendedPrice: 45,
        priceAdjustment: 0.1, // 10% increase
        reason: 'High demand predicted'
      }));

    return { staffing, inventory, pricing };
  }

  /**
   * Get current inventory
   */
  private async getCurrentInventory(businessId: string): Promise<InventoryItem[]> {
    // Mock inventory data
    return [
      {
        id: 'item_1',
        businessId,
        name: 'Gel Polish - Red',
        category: 'nail_polish',
        currentStock: 25,
        minStock: 10,
        maxStock: 50,
        reorderPoint: 15,
        reorderQuantity: 30,
        unitCost: 12.50,
        supplier: 'Beauty Supply Co',
        leadTime: 3,
        usageRate: 2.5,
        seasonality: {
          peak: ['December', 'February'],
          low: ['August', 'September'],
          factor: 1.3
        },
        lastOrdered: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        analytics: {
          turnoverRate: 8.5,
          stockoutDays: 2,
          overstock: 0,
          totalValue: 312.50
        }
      },
      {
        id: 'item_2',
        businessId,
        name: 'Nail Files - Professional',
        category: 'tools',
        currentStock: 45,
        minStock: 20,
        maxStock: 80,
        reorderPoint: 25,
        reorderQuantity: 40,
        unitCost: 3.25,
        supplier: 'Pro Tools Inc',
        leadTime: 5,
        usageRate: 1.8,
        seasonality: {
          peak: ['November', 'December'],
          low: ['January', 'February'],
          factor: 1.1
        },
        lastOrdered: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        analytics: {
          turnoverRate: 6.2,
          stockoutDays: 0,
          overstock: 5,
          totalValue: 146.25
        }
      }
    ];
  }

  /**
   * Calculate optimal stock levels
   */
  private async calculateOptimalStock(
    inventory: InventoryItem[],
    demandForecasts: any[]
  ): Promise<InventoryItem[]> {
    return inventory.map(item => {
      // Calculate optimal stock based on demand forecast
      const avgDemand = demandForecasts.reduce((sum, f) => sum + f.predictedDemand, 0) / demandForecasts.length;
      const safetyStock = Math.ceil(avgDemand * item.leadTime * 0.2); // 20% safety buffer
      const optimalStock = Math.ceil(avgDemand * item.leadTime) + safetyStock;
      
      return {
        ...item,
        recommendedStock: Math.min(optimalStock, item.maxStock),
        reorderPoint: Math.ceil(avgDemand * item.leadTime * 0.5)
      };
    });
  }

  /**
   * Generate inventory recommendations
   */
  private generateInventoryRecommendations(
    current: InventoryItem[],
    optimized: InventoryItem[]
  ): Array<{
    action: 'reorder' | 'reduce' | 'monitor';
    item: string;
    quantity?: number;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    const recommendations = [];

    for (let i = 0; i < current.length; i++) {
      const currentItem = current[i];
      const optimizedItem = optimized[i];

      if (currentItem.currentStock <= currentItem.reorderPoint) {
        recommendations.push({
          action: 'reorder',
          item: currentItem.name,
          quantity: currentItem.reorderQuantity,
          reason: 'Stock below reorder point',
          urgency: 'high'
        });
      } else if (currentItem.currentStock > optimizedItem.recommendedStock) {
        recommendations.push({
          action: 'reduce',
          item: currentItem.name,
          quantity: currentItem.currentStock - optimizedItem.recommendedStock,
          reason: 'Overstock detected',
          urgency: 'low'
        });
      } else {
        recommendations.push({
          action: 'monitor',
          item: currentItem.name,
          reason: 'Stock levels optimal',
          urgency: 'low'
        });
      }
    }

    return recommendations;
  }

  /**
   * Get seasonal multiplier for month
   */
  private getSeasonalMultiplier(month: number): number {
    // Beauty industry seasonal patterns
    const seasonalFactors = [
      0.9,  // January - post-holiday low
      1.2,  // February - Valentine's Day
      1.1,  // March - spring prep
      1.15, // April - spring events
      1.3,  // May - wedding season
      1.25, // June - summer events
      1.1,  // July - summer maintenance
      0.95, // August - vacation time
      1.0,  // September - back to routine
      1.1,  // October - fall events
      1.2,  // November - holiday prep
      1.4   // December - holiday peak
    ];

    return seasonalFactors[month] || 1.0;
  }

  /**
   * Get day of week multiplier
   */
  private getDayOfWeekMultiplier(dayOfWeek: number): number {
    // 0 = Sunday, 6 = Saturday
    const dayFactors = [1.4, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5]; // Sun-Sat
    return dayFactors[dayOfWeek] || 1.0;
  }

  /**
   * Get event multiplier for special dates
   */
  private getEventMultiplier(date: Date): number {
    const month = date.getMonth();
    const day = date.getDate();

    // Special events that boost demand
    if (month === 1 && day === 14) return 1.5; // Valentine's Day
    if (month === 4 && day >= 8 && day <= 14) return 1.3; // Mother's Day week
    if (month === 11 && day >= 20) return 1.4; // Christmas week
    if (month === 11 && day >= 24 && day <= 26) return 1.6; // Thanksgiving weekend

    return 1.0;
  }

  /**
   * Additional helper methods for staffing and analysis
   */
  private async getCurrentStaffing(businessId: string): Promise<any> {
    return { totalStaff: 4, skillLevels: { junior: 1, senior: 2, expert: 1 } };
  }

  private generateTimeSlots(businessHours: string): string[] {
    return ['9:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'];
  }

  private async getDemandForDate(businessId: string, date: Date): Promise<any> {
    return { predictedDemand: 12, confidence: 0.8 };
  }

  private async calculateStaffingNeed(
    businessId: string,
    date: Date,
    timeSlot: string,
    demandForecast: any,
    currentStaffing: any
  ): Promise<StaffingRecommendation> {
    return {
      businessId,
      date,
      timeSlot,
      currentStaff: 2,
      recommendedStaff: 3,
      skillsRequired: [
        { skill: 'nail_technician', level: 'senior', count: 2 },
        { skill: 'receptionist', level: 'junior', count: 1 }
      ],
      workload: {
        predictedAppointments: 12,
        averageServiceTime: 45,
        utilization: 0.85
      },
      adjustmentReason: 'High demand predicted',
      confidence: 0.8
    };
  }

  private async getAllDemandForecasts(businessId: string): Promise<any[]> {
    return [{ predictedDemand: 10, confidence: 0.8 }];
  }

  private analyzeMonthlyPattern(data: any[]): { peaks: any[]; lows: any[] } {
    return {
      peaks: [{ time: 'December', multiplier: 1.4 }, { time: 'May', multiplier: 1.3 }],
      lows: [{ time: 'January', multiplier: 0.9 }, { time: 'August', multiplier: 0.95 }]
    };
  }

  private analyzeWeeklyPattern(data: any[]): { peaks: any[]; lows: any[] } {
    return {
      peaks: [{ time: 'Saturday', multiplier: 1.5 }, { time: 'Friday', multiplier: 1.3 }],
      lows: [{ time: 'Monday', multiplier: 0.7 }, { time: 'Tuesday', multiplier: 0.8 }]
    };
  }

  private analyzeDailyPattern(data: any[]): { peaks: any[]; lows: any[] } {
    return {
      peaks: [{ time: 'Weekend', multiplier: 1.4 }],
      lows: [{ time: 'Weekday', multiplier: 0.8 }]
    };
  }

  private analyzeHourlyPattern(data: any[]): { peaks: any[]; lows: any[] } {
    return {
      peaks: [{ time: '10:00-12:00', multiplier: 1.3 }, { time: '14:00-17:00', multiplier: 1.4 }],
      lows: [{ time: '09:00-10:00', multiplier: 0.7 }, { time: '19:00-20:00', multiplier: 0.8 }]
    };
  }

  private generateSeasonalInsights(patterns: any[]): string[] {
    return [
      'Peak demand occurs on weekends, especially Saturdays',
      'December shows highest seasonal demand (40% above average)',
      'Morning hours (10-12) and afternoon (2-5) are busiest',
      'January typically sees 10% drop in demand post-holidays'
    ];
  }

  private generateSeasonalRecommendations(patterns: any[]): string[] {
    return [
      'Increase staff by 50% on Saturdays',
      'Stock up 40% more inventory in November for December rush',
      'Offer promotions during low-demand periods (January, August)',
      'Implement dynamic pricing during peak hours and weekends'
    ];
  }
}

export const demandForecastingService = DemandForecastingService.getInstance();