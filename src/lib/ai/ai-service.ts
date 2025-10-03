/**
 * AI Service - Main AI Infrastructure Coordinator
 * Orchestrates all AI services and provides unified interface
 */

import { openAIService, type BusinessContext, type ChatResponse } from './openai-service';
import { redisService } from './redis-service';
import { vectorService } from './vector-service';

export interface AIServiceConfig {
  businessId: string;
  enableCaching: boolean;
  enableVectorSearch: boolean;
  rateLimitPerHour: number;
}

export interface AIInitializationResult {
  success: boolean;
  services: {
    openai: boolean;
    redis: boolean;
    vector: boolean;
  };
  errors: string[];
}

export class AIService {
  private static instance: AIService;
  private initialized = false;
  private config: Map<string, AIServiceConfig> = new Map();

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Initialize AI infrastructure
   */
  async initialize(): Promise<AIInitializationResult> {
    if (this.initialized) {
      return {
        success: true,
        services: { openai: true, redis: true, vector: true },
        errors: []
      };
    }

    const result: AIInitializationResult = {
      success: false,
      services: { openai: false, redis: false, vector: false },
      errors: []
    };

    try {
      // Initialize Redis connection
      try {
        await redisService.connect();
        result.services.redis = true;
        console.log('✅ Redis service initialized');
      } catch (error) {
        result.errors.push(`Redis initialization failed: ${error}`);
        console.warn('⚠️ Redis service failed, using fallback');
      }

      // Test OpenAI connection
      try {
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY environment variable is required');
        }
        
        // Test with a simple completion
        await openAIService.generateChatResponse(
          [{ role: 'user', content: 'Hello' }],
          {
            businessId: 'test',
            businessName: 'Test Business',
            industry: 'test',
            services: [],
            policies: [],
            hours: '9-5',
            location: 'Test Location'
          }
        );
        
        result.services.openai = true;
        console.log('✅ OpenAI service initialized');
      } catch (error) {
        result.errors.push(`OpenAI initialization failed: ${error}`);
        console.error('❌ OpenAI service failed:', error);
      }

      // Initialize Vector service (always succeeds as it's in-memory)
      result.services.vector = true;
      console.log('✅ Vector service initialized');

      // Check if at least OpenAI is working
      result.success = result.services.openai;
      this.initialized = result.success;

      if (result.success) {
        console.log('🚀 AI Infrastructure initialized successfully!');
      } else {
        console.error('❌ AI Infrastructure initialization failed');
      }

      return result;

    } catch (error) {
      result.errors.push(`General initialization error: ${error}`);
      console.error('❌ AI Service initialization failed:', error);
      return result;
    }
  }

  /**
   * Configure AI for a specific business
   */
  async configureForBusiness(
    businessId: string,
    businessData: {
      businessName: string;
      industry: string;
      services: Array<{
        name: string;
        description: string;
        price: number;
        duration: number;
      }>;
      policies: string[];
      hours: string;
      location: string;
      faqs?: Array<{ question: string; answer: string }>;
    },
    config: Partial<AIServiceConfig> = {}
  ): Promise<void> {
    try {
      const aiConfig: AIServiceConfig = {
        businessId,
        enableCaching: config.enableCaching ?? true,
        enableVectorSearch: config.enableVectorSearch ?? true,
        rateLimitPerHour: config.rateLimitPerHour ?? 100
      };

      this.config.set(businessId, aiConfig);

      // Initialize vector knowledge base
      if (aiConfig.enableVectorSearch) {
        await vectorService.initializeBusinessKnowledge({
          businessId,
          ...businessData
        });
      }

      // Cache business context
      if (aiConfig.enableCaching) {
        const businessContext: BusinessContext = {
          businessId,
          businessName: businessData.businessName,
          industry: businessData.industry,
          services: businessData.services,
          policies: businessData.policies,
          hours: businessData.hours,
          location: businessData.location
        };

        await redisService.cacheBusinessContext(businessId, businessContext);
      }

      console.log(`✅ AI configured for business: ${businessData.businessName}`);

    } catch (error) {
      console.error(`❌ Failed to configure AI for business ${businessId}:`, error);
      throw new Error('Failed to configure AI for business');
    }
  }

  /**
   * Generate AI chat response with full context
   */
  async generateChatResponse(
    businessId: string,
    sessionId: string,
    message: string,
    customerInfo?: any
  ): Promise<ChatResponse & { sessionId: string }> {
    try {
      const config = this.config.get(businessId);
      if (!config) {
        throw new Error('Business not configured for AI');
      }

      // Check rate limit
      const rateLimit = await redisService.checkRateLimit(
        `chat:${businessId}`,
        config.rateLimitPerHour,
        3600
      );

      if (!rateLimit.allowed) {
        return {
          sessionId,
          message: 'I apologize, but we\'ve reached our chat limit for this hour. Please try again later or contact us directly.',
          intent: 'general',
          confidence: 0.0
        };
      }

      // Get business context
      let businessContext = await redisService.getBusinessContext(businessId);
      
      if (!businessContext) {
        // Fallback: create basic context (business should be reconfigured)
        businessContext = {
          businessId,
          businessName: 'Business',
          industry: 'service',
          services: [],
          policies: [],
          hours: '9-5',
          location: 'Local'
        };
      }

      // Get chat session history
      let session = await redisService.getAISession(sessionId);
      
      if (!session) {
        // Create new session
        session = {
          sessionId,
          businessId,
          customerId: customerInfo?.id,
          messages: [],
          context: { customerInfo },
          lastActivity: new Date()
        };
      }

      // Search for relevant knowledge if enabled
      let relevantKnowledge = '';
      if (config.enableVectorSearch) {
        const searchResults = await vectorService.searchBusinessKnowledge(
          businessId,
          message,
          3,
          0.7
        );

        if (searchResults.length > 0) {
          relevantKnowledge = searchResults
            .map(result => result.document.content)
            .join('\n');
        }
      }

      // Enhance business context with relevant knowledge
      if (relevantKnowledge) {
        businessContext.policies = [
          ...businessContext.policies,
          `Relevant information: ${relevantKnowledge}`
        ];
      }

      // Prepare messages for AI
      const messages = [
        ...session.messages.slice(-10), // Keep last 10 messages for context
        { role: 'user' as const, content: message }
      ];

      // Generate AI response
      const response = await openAIService.generateChatResponse(messages, businessContext);

      // Update session
      await redisService.updateAISession(sessionId, { role: 'user', content: message });
      await redisService.updateAISession(sessionId, { role: 'assistant', content: response.message });

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'chat_interaction',
        data: {
          sessionId,
          intent: response.intent,
          confidence: response.confidence,
          messageLength: message.length,
          responseLength: response.message.length,
          hadBookingIntent: !!response.bookingData
        }
      });

      return {
        ...response,
        sessionId
      };

    } catch (error) {
      console.error('AI chat response error:', error);
      
      // Store error analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'error',
        data: {
          error: error.toString(),
          context: 'chat_response',
          sessionId
        }
      });

      return {
        sessionId,
        message: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        intent: 'general',
        confidence: 0.0
      };
    }
  }

  /**
   * Generate marketing content
   */
  async generateMarketingContent(
    businessId: string,
    type: 'social_post' | 'email' | 'blog' | 'sms',
    prompt: string,
    options: {
      brandVoice?: {
        tone: string;
        vocabulary: string[];
        targetAudience: string;
      };
      useCache?: boolean;
    } = {}
  ): Promise<{
    content: string;
    hashtags?: string[];
    subject?: string;
  }> {
    try {
      const config = this.config.get(businessId);
      if (!config) {
        throw new Error('Business not configured for AI');
      }

      // Check cache if enabled
      if (options.useCache !== false && config.enableCaching) {
        const contentHash = this.generateContentHash(businessId, type, prompt);
        const cached = await redisService.getCachedContent(contentHash, type);
        
        if (cached) {
          return cached;
        }
      }

      // Get business context
      const businessContext = await redisService.getBusinessContext(businessId);
      if (!businessContext) {
        throw new Error('Business context not found');
      }

      // Generate content
      const result = await openAIService.generateContent(
        type,
        businessContext,
        prompt,
        options.brandVoice
      );

      // Cache result if enabled
      if (options.useCache !== false && config.enableCaching) {
        const contentHash = this.generateContentHash(businessId, type, prompt);
        await redisService.cacheGeneratedContent(contentHash, result, type);
      }

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'content_generation',
        data: {
          contentType: type,
          promptLength: prompt.length,
          contentLength: result.content.length,
          hasHashtags: !!result.hashtags,
          hashtagCount: result.hashtags?.length || 0
        }
      });

      return result;

    } catch (error) {
      console.error('Content generation error:', error);
      
      await redisService.storeAIAnalytics(businessId, {
        type: 'error',
        data: {
          error: error.toString(),
          context: 'content_generation',
          contentType: type
        }
      });

      throw new Error('Failed to generate content');
    }
  }

  /**
   * Get AI analytics for business
   */
  async getAIAnalytics(
    businessId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    totalInteractions: number;
    contentGenerated: number;
    errors: number;
    averageConfidence: number;
    topIntents: Array<{ intent: string; count: number }>;
  }> {
    try {
      const events = await redisService.getAIAnalytics(businessId, fromDate, toDate);
      
      const analytics = {
        totalInteractions: 0,
        contentGenerated: 0,
        errors: 0,
        averageConfidence: 0,
        topIntents: [] as Array<{ intent: string; count: number }>
      };

      const intentCounts: Record<string, number> = {};
      let totalConfidence = 0;
      let confidenceCount = 0;

      for (const event of events) {
        switch (event.type) {
          case 'chat_interaction':
            analytics.totalInteractions++;
            if (event.data.confidence) {
              totalConfidence += event.data.confidence;
              confidenceCount++;
            }
            if (event.data.intent) {
              intentCounts[event.data.intent] = (intentCounts[event.data.intent] || 0) + 1;
            }
            break;
          
          case 'content_generation':
            analytics.contentGenerated++;
            break;
          
          case 'error':
            analytics.errors++;
            break;
        }
      }

      analytics.averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
      analytics.topIntents = Object.entries(intentCounts)
        .map(([intent, count]) => ({ intent, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return analytics;

    } catch (error) {
      console.error('Analytics retrieval error:', error);
      throw new Error('Failed to retrieve AI analytics');
    }
  }

  /**
   * Health check for all AI services
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      openai: 'up' | 'down';
      redis: 'up' | 'down';
      vector: 'up' | 'down';
    };
    details: any;
  }> {
    const health = {
      status: 'healthy' as const,
      services: {
        openai: 'down' as const,
        redis: 'down' as const,
        vector: 'up' as const // Vector service is always up (in-memory)
      },
      details: {} as any
    };

    // Check OpenAI
    try {
      await openAIService.generateChatResponse(
        [{ role: 'user', content: 'test' }],
        {
          businessId: 'health-check',
          businessName: 'Test',
          industry: 'test',
          services: [],
          policies: [],
          hours: '24/7',
          location: 'Test'
        }
      );
      health.services.openai = 'up';
    } catch (error) {
      health.details.openai = error.toString();
    }

    // Check Redis
    const redisHealth = await redisService.healthCheck();
    health.services.redis = redisHealth.status === 'connected' ? 'up' : 'down';
    health.details.redis = redisHealth;

    // Determine overall status
    const upServices = Object.values(health.services).filter(status => status === 'up').length;
    
    if (upServices === 3) {
      health.status = 'healthy';
    } else if (upServices >= 2) {
      health.status = 'degraded';
    } else {
      health.status = 'unhealthy';
    }

    return health;
  }

  /**
   * Generate content hash for caching
   */
  private generateContentHash(businessId: string, type: string, prompt: string): string {
    const content = `${businessId}:${type}:${prompt}`;
    let hash = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get configuration for business
   */
  getBusinessConfig(businessId: string): AIServiceConfig | undefined {
    return this.config.get(businessId);
  }

  /**
   * Update business configuration
   */
  updateBusinessConfig(businessId: string, updates: Partial<AIServiceConfig>): void {
    const existing = this.config.get(businessId);
    if (existing) {
      this.config.set(businessId, { ...existing, ...updates });
    }
  }
}

export const aiService = AIService.getInstance();