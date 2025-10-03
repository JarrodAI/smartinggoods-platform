/**
 * Google Ads Automation Service
 * Manages Google Ads campaigns, keywords, and optimization
 */

import { GoogleAdsApi, Customer, Campaign, AdGroup, Ad, Keyword } from 'google-ads-api';

export interface GoogleAdsConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  customerId: string;
  developerToken: string;
}

export interface CampaignConfig {
  name: string;
  budget: number;
  targetLocation: string;
  businessType: string;
  services: string[];
  keywords: string[];
  adCopy: {
    headlines: string[];
    descriptions: string[];
    finalUrl: string;
  };
}

export interface CampaignPerformance {
  campaignId: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
}

export class GoogleAdsService {
  private client: GoogleAdsApi;
  private customerId: string;

  constructor(config: GoogleAdsConfig) {
    this.client = new GoogleAdsApi({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      developer_token: config.developerToken
    });
    this.customerId = config.customerId;
  }

  /**
   * Create a new Google Ads campaign
   */
  async createCampaign(config: CampaignConfig): Promise<string> {
    try {
      const customer = this.client.Customer({
        customer_id: this.customerId,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
      });

      // Create campaign
      const campaign = {
        name: config.name,
        status: 'ENABLED',
        advertising_channel_type: 'SEARCH',
        campaign_budget: {
          amount_micros: config.budget * 1000000, // Convert to micros
          delivery_method: 'STANDARD'
        },
        network_settings: {
          target_google_search: true,
          target_search_network: true,
          target_content_network: false,
          target_partner_search_network: false
        },
        geo_target_type_setting: {
          positive_geo_target_type: 'PRESENCE_OR_INTEREST',
          negative_geo_target_type: 'PRESENCE'
        }
      };

      const campaignOperation = {
        create: campaign
      };

      const response = await customer.campaigns.create([campaignOperation]);
      const campaignId = response.results[0].resource_name.split('/')[3];

      // Create ad groups and ads
      await this.createAdGroups(customer, campaignId, config);

      // Set up location targeting
      await this.setupLocationTargeting(customer, campaignId, config.targetLocation);

      return campaignId;

    } catch (error) {
      console.error('Failed to create Google Ads campaign:', error);
      throw new Error('Campaign creation failed');
    }
  }

  /**
   * Create ad groups with keywords and ads
   */
  private async createAdGroups(
    customer: Customer,
    campaignId: string,
    config: CampaignConfig
  ): Promise<void> {
    for (const service of config.services) {
      const adGroupName = `${service} - Ad Group`;
      
      // Create ad group
      const adGroup = {
        name: adGroupName,
        status: 'ENABLED',
        type: 'SEARCH_STANDARD',
        campaign: `customers/${this.customerId}/campaigns/${campaignId}`,
        cpc_bid_micros: 2000000 // $2.00 default bid
      };

      const adGroupOperation = {
        create: adGroup
      };

      const adGroupResponse = await customer.adGroups.create([adGroupOperation]);
      const adGroupId = adGroupResponse.results[0].resource_name.split('/')[5];

      // Create keywords for this ad group
      await this.createKeywords(customer, adGroupId, service, config.keywords);

      // Create responsive search ads
      await this.createResponsiveSearchAds(customer, adGroupId, config.adCopy, service);
    }
  }

  /**
   * Create keywords for an ad group
   */
  private async createKeywords(
    customer: Customer,
    adGroupId: string,
    service: string,
    baseKeywords: string[]
  ): Promise<void> {
    const serviceKeywords = this.generateServiceKeywords(service, baseKeywords);
    
    const keywordOperations = serviceKeywords.map(keyword => ({
      create: {
        ad_group: `customers/${this.customerId}/adGroups/${adGroupId}`,
        status: 'ENABLED',
        keyword: {
          text: keyword.text,
          match_type: keyword.matchType
        },
        cpc_bid_micros: keyword.bidMicros
      }
    }));

    await customer.adGroupCriteria.create(keywordOperations);
  }

  /**
   * Generate service-specific keywords
   */
  private generateServiceKeywords(service: string, baseKeywords: string[]): Array<{
    text: string;
    matchType: 'EXACT' | 'PHRASE' | 'BROAD';
    bidMicros: number;
  }> {
    const keywords = [];
    const serviceLower = service.toLowerCase();

    // Exact match keywords (highest bid)
    keywords.push({
      text: serviceLower,
      matchType: 'EXACT' as const,
      bidMicros: 3000000 // $3.00
    });

    // Phrase match keywords
    baseKeywords.forEach(keyword => {
      keywords.push({
        text: `${serviceLower} ${keyword}`,
        matchType: 'PHRASE' as const,
        bidMicros: 2500000 // $2.50
      });
    });

    // Broad match keywords (lower bid)
    const broadKeywords = [
      `best ${serviceLower}`,
      `${serviceLower} near me`,
      `professional ${serviceLower}`,
      `${serviceLower} salon`,
      `${serviceLower} spa`,
      `book ${serviceLower}`,
      `${serviceLower} appointment`
    ];

    broadKeywords.forEach(keyword => {
      keywords.push({
        text: keyword,
        matchType: 'BROAD' as const,
        bidMicros: 2000000 // $2.00
      });
    });

    return keywords;
  }

  /**
   * Create responsive search ads
   */
  private async createResponsiveSearchAds(
    customer: Customer,
    adGroupId: string,
    adCopy: CampaignConfig['adCopy'],
    service: string
  ): Promise<void> {
    const responsiveSearchAd = {
      ad_group: `customers/${this.customerId}/adGroups/${adGroupId}`,
      status: 'ENABLED',
      ad: {
        type: 'RESPONSIVE_SEARCH_AD',
        final_urls: [adCopy.finalUrl],
        responsive_search_ad: {
          headlines: adCopy.headlines.map(headline => ({
            text: headline.replace('{service}', service),
            pinned_field: null
          })),
          descriptions: adCopy.descriptions.map(description => ({
            text: description.replace('{service}', service),
            pinned_field: null
          })),
          path1: service.toLowerCase().replace(/\s+/g, '-'),
          path2: 'book-now'
        }
      }
    };

    const adOperation = {
      create: responsiveSearchAd
    };

    await customer.adGroupAds.create([adOperation]);
  }

  /**
   * Set up location targeting
   */
  private async setupLocationTargeting(
    customer: Customer,
    campaignId: string,
    targetLocation: string
  ): Promise<void> {
    // This would typically involve geocoding the location
    // and setting up proper location criteria
    // For now, we'll use a simplified approach

    const locationCriteria = {
      campaign: `customers/${this.customerId}/campaigns/${campaignId}`,
      location: {
        geo_target_constant: this.getLocationConstant(targetLocation)
      },
      bid_modifier: 1.0
    };

    const locationOperation = {
      create: locationCriteria
    };

    await customer.campaignCriteria.create([locationOperation]);
  }

  /**
   * Get location constant for targeting
   */
  private getLocationConstant(location: string): string {
    // This would typically use the Google Ads API to find location constants
    // For now, return a default value
    const locationMap: { [key: string]: string } = {
      'new york': 'geoTargetConstants/1023191',
      'los angeles': 'geoTargetConstants/1023230',
      'chicago': 'geoTargetConstants/1023065',
      'houston': 'geoTargetConstants/1023618',
      'phoenix': 'geoTargetConstants/1023140'
    };

    return locationMap[location.toLowerCase()] || 'geoTargetConstants/2840'; // Default to USA
  }

  /**
   * Get campaign performance data
   */
  async getCampaignPerformance(campaignId: string, dateRange: string = 'LAST_30_DAYS'): Promise<CampaignPerformance> {
    try {
      const customer = this.client.Customer({
        customer_id: this.customerId,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
      });

      const query = `
        SELECT 
          campaign.id,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions_from_interactions_rate,
          metrics.value_per_conversion
        FROM campaign 
        WHERE campaign.id = ${campaignId}
        AND segments.date DURING ${dateRange}
      `;

      const response = await customer.query(query);
      const data = response[0];

      return {
        campaignId,
        impressions: data.metrics.impressions || 0,
        clicks: data.metrics.clicks || 0,
        cost: (data.metrics.cost_micros || 0) / 1000000,
        conversions: data.metrics.conversions || 0,
        ctr: data.metrics.ctr || 0,
        cpc: (data.metrics.average_cpc || 0) / 1000000,
        conversionRate: data.metrics.conversions_from_interactions_rate || 0,
        roas: data.metrics.value_per_conversion || 0
      };

    } catch (error) {
      console.error('Failed to get campaign performance:', error);
      throw new Error('Performance data retrieval failed');
    }
  }

  /**
   * Optimize campaign based on performance
   */
  async optimizeCampaign(campaignId: string): Promise<{
    optimizations: string[];
    estimatedImpact: string;
  }> {
    try {
      const performance = await this.getCampaignPerformance(campaignId);
      const optimizations: string[] = [];

      // Analyze performance and suggest optimizations
      if (performance.ctr < 0.02) {
        optimizations.push('Improve ad copy to increase click-through rate');
      }

      if (performance.conversionRate < 0.05) {
        optimizations.push('Optimize landing page for better conversions');
      }

      if (performance.cpc > 5.00) {
        optimizations.push('Reduce keyword bids to lower cost per click');
      }

      if (performance.impressions < 1000) {
        optimizations.push('Increase budget or expand keyword targeting');
      }

      // Apply automatic optimizations
      await this.applyAutomaticOptimizations(campaignId, performance);

      return {
        optimizations,
        estimatedImpact: this.calculateEstimatedImpact(optimizations)
      };

    } catch (error) {
      console.error('Campaign optimization failed:', error);
      throw new Error('Optimization failed');
    }
  }

  /**
   * Apply automatic optimizations
   */
  private async applyAutomaticOptimizations(
    campaignId: string,
    performance: CampaignPerformance
  ): Promise<void> {
    const customer = this.client.Customer({
      customer_id: this.customerId,
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN
    });

    // Auto-adjust bids based on performance
    if (performance.ctr > 0.05 && performance.conversionRate > 0.1) {
      // Increase bids for high-performing keywords
      await this.adjustKeywordBids(customer, campaignId, 1.2);
    } else if (performance.ctr < 0.02) {
      // Decrease bids for low-performing keywords
      await this.adjustKeywordBids(customer, campaignId, 0.8);
    }

    // Pause low-performing keywords
    if (performance.ctr < 0.01 && performance.cost > 100) {
      await this.pauseLowPerformingKeywords(customer, campaignId);
    }
  }

  /**
   * Adjust keyword bids
   */
  private async adjustKeywordBids(
    customer: Customer,
    campaignId: string,
    multiplier: number
  ): Promise<void> {
    // Get all keywords for the campaign
    const query = `
      SELECT 
        ad_group_criterion.resource_name,
        ad_group_criterion.cpc_bid_micros
      FROM ad_group_criterion 
      WHERE campaign.id = ${campaignId}
      AND ad_group_criterion.type = 'KEYWORD'
      AND ad_group_criterion.status = 'ENABLED'
    `;

    const keywords = await customer.query(query);

    const operations = keywords.map((keyword: any) => ({
      update: {
        resource_name: keyword.ad_group_criterion.resource_name,
        cpc_bid_micros: Math.round(keyword.ad_group_criterion.cpc_bid_micros * multiplier)
      },
      update_mask: {
        paths: ['cpc_bid_micros']
      }
    }));

    if (operations.length > 0) {
      await customer.adGroupCriteria.update(operations);
    }
  }

  /**
   * Pause low-performing keywords
   */
  private async pauseLowPerformingKeywords(
    customer: Customer,
    campaignId: string
  ): Promise<void> {
    const query = `
      SELECT 
        ad_group_criterion.resource_name,
        metrics.clicks,
        metrics.cost_micros,
        metrics.ctr
      FROM ad_group_criterion 
      WHERE campaign.id = ${campaignId}
      AND ad_group_criterion.type = 'KEYWORD'
      AND ad_group_criterion.status = 'ENABLED'
      AND metrics.ctr < 0.01
      AND metrics.cost_micros > 50000000
    `;

    const lowPerformingKeywords = await customer.query(query);

    const operations = lowPerformingKeywords.map((keyword: any) => ({
      update: {
        resource_name: keyword.ad_group_criterion.resource_name,
        status: 'PAUSED'
      },
      update_mask: {
        paths: ['status']
      }
    }));

    if (operations.length > 0) {
      await customer.adGroupCriteria.update(operations);
    }
  }

  /**
   * Calculate estimated impact of optimizations
   */
  private calculateEstimatedImpact(optimizations: string[]): string {
    const impactMap: { [key: string]: number } = {
      'click-through rate': 15,
      'conversions': 25,
      'cost per click': 20,
      'impressions': 30
    };

    let totalImpact = 0;
    optimizations.forEach(opt => {
      Object.keys(impactMap).forEach(key => {
        if (opt.toLowerCase().includes(key)) {
          totalImpact += impactMap[key];
        }
      });
    });

    if (totalImpact > 50) return 'High impact expected (50%+ improvement)';
    if (totalImpact > 25) return 'Medium impact expected (25-50% improvement)';
    if (totalImpact > 10) return 'Low impact expected (10-25% improvement)';
    return 'Minimal impact expected (<10% improvement)';
  }

  /**
   * Generate campaign report
   */
  async generateCampaignReport(campaignId: string): Promise<{
    performance: CampaignPerformance;
    insights: string[];
    recommendations: string[];
    forecast: {
      nextMonthClicks: number;
      nextMonthCost: number;
      nextMonthConversions: number;
    };
  }> {
    const performance = await this.getCampaignPerformance(campaignId);
    const insights = this.generateInsights(performance);
    const recommendations = this.generateRecommendations(performance);
    const forecast = this.generateForecast(performance);

    return {
      performance,
      insights,
      recommendations,
      forecast
    };
  }

  /**
   * Generate performance insights
   */
  private generateInsights(performance: CampaignPerformance): string[] {
    const insights: string[] = [];

    if (performance.ctr > 0.05) {
      insights.push('Excellent click-through rate indicates strong ad relevance');
    } else if (performance.ctr < 0.02) {
      insights.push('Low click-through rate suggests ad copy needs improvement');
    }

    if (performance.conversionRate > 0.1) {
      insights.push('High conversion rate shows effective landing page');
    } else if (performance.conversionRate < 0.05) {
      insights.push('Low conversion rate indicates landing page optimization needed');
    }

    if (performance.roas > 4) {
      insights.push('Strong return on ad spend - consider increasing budget');
    } else if (performance.roas < 2) {
      insights.push('Low ROAS - review targeting and bidding strategy');
    }

    return insights;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(performance: CampaignPerformance): string[] {
    const recommendations: string[] = [];

    if (performance.ctr < 0.03) {
      recommendations.push('Test new ad headlines and descriptions');
      recommendations.push('Add more relevant keywords');
    }

    if (performance.conversionRate < 0.08) {
      recommendations.push('Optimize landing page load speed');
      recommendations.push('Improve call-to-action buttons');
    }

    if (performance.cpc > 3) {
      recommendations.push('Review and optimize keyword match types');
      recommendations.push('Add negative keywords to reduce irrelevant clicks');
    }

    return recommendations;
  }

  /**
   * Generate performance forecast
   */
  private generateForecast(performance: CampaignPerformance): {
    nextMonthClicks: number;
    nextMonthCost: number;
    nextMonthConversions: number;
  } {
    // Simple linear projection based on current performance
    const growthFactor = 1.1; // Assume 10% growth

    return {
      nextMonthClicks: Math.round(performance.clicks * growthFactor),
      nextMonthCost: Math.round(performance.cost * growthFactor * 100) / 100,
      nextMonthConversions: Math.round(performance.conversions * growthFactor * 10) / 10
    };
  }
}