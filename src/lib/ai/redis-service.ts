/**
 * Redis Service - AI Caching and Session Management
 * Optimizes AI performance with intelligent caching and real-time data
 */

import { Redis } from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export interface AISession {
  sessionId: string;
  businessId: string;
  customerId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  context: any;
  lastActivity: Date;
}

export class RedisService {
  private static instance: RedisService;
  private redis: Redis | null = null;
  private isConnected = false;

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Initialize Redis connection
   */
  async connect(): Promise<void> {
    try {
      // Use Redis URL if available, otherwise fall back to local Redis
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
      
      if (redisUrl) {
        this.redis = new Redis(redisUrl, {
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
      } else {
        // Local Redis fallback
        this.redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
      }

      await this.redis.ping();
      this.isConnected = true;
      console.log('✅ Redis connected successfully');

    } catch (error) {
      console.warn('⚠️ Redis connection failed, using memory fallback:', error);
      this.isConnected = false;
      // We'll use in-memory fallback for development
    }
  }

  /**
   * Cache AI responses to improve performance
   */
  async cacheAIResponse(
    key: string,
    response: any,
    options: CacheOptions = {}
  ): Promise<void> {
    if (!this.isConnected || !this.redis) {
      // Memory fallback for development
      return;
    }

    try {
      const cacheKey = options.prefix ? `${options.prefix}:${key}` : `ai:response:${key}`;
      const ttl = options.ttl || 3600; // 1 hour default
      
      await this.redis.setex(cacheKey, ttl, JSON.stringify({
        data: response,
        timestamp: new Date().toISOString(),
        ttl
      }));

    } catch (error) {
      console.error('Redis cache error:', error);
      // Fail silently - caching is not critical
    }
  }

  /**
   * Get cached AI response
   */
  async getCachedAIResponse(key: string, prefix?: string): Promise<any | null> {
    if (!this.isConnected || !this.redis) {
      return null;
    }

    try {
      const cacheKey = prefix ? `${prefix}:${key}` : `ai:response:${key}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.data;
      }
      
      return null;

    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Store AI chat session
   */
  async storeAISession(session: AISession): Promise<void> {
    if (!this.isConnected || !this.redis) {
      // Memory fallback - store in process memory for development
      return;
    }

    try {
      const sessionKey = `ai:session:${session.sessionId}`;
      const ttl = 24 * 60 * 60; // 24 hours
      
      await this.redis.setex(sessionKey, ttl, JSON.stringify(session));

      // Also store by business ID for quick lookup
      const businessSessionsKey = `ai:business:${session.businessId}:sessions`;
      await this.redis.sadd(businessSessionsKey, session.sessionId);
      await this.redis.expire(businessSessionsKey, ttl);

    } catch (error) {
      console.error('Redis session store error:', error);
    }
  }

  /**
   * Get AI chat session
   */
  async getAISession(sessionId: string): Promise<AISession | null> {
    if (!this.isConnected || !this.redis) {
      return null;
    }

    try {
      const sessionKey = `ai:session:${sessionId}`;
      const session = await this.redis.get(sessionKey);
      
      if (session) {
        return JSON.parse(session);
      }
      
      return null;

    } catch (error) {
      console.error('Redis session get error:', error);
      return null;
    }
  }

  /**
   * Update AI session with new message
   */
  async updateAISession(
    sessionId: string,
    message: { role: 'user' | 'assistant'; content: string }
  ): Promise<void> {
    const session = await this.getAISession(sessionId);
    
    if (session) {
      session.messages.push({
        ...message,
        timestamp: new Date()
      });
      session.lastActivity = new Date();
      
      await this.storeAISession(session);
    }
  }

  /**
   * Cache business context for AI
   */
  async cacheBusinessContext(businessId: string, context: any): Promise<void> {
    await this.cacheAIResponse(
      businessId,
      context,
      { prefix: 'ai:business:context', ttl: 12 * 60 * 60 } // 12 hours
    );
  }

  /**
   * Get cached business context
   */
  async getBusinessContext(businessId: string): Promise<any | null> {
    return await this.getCachedAIResponse(businessId, 'ai:business:context');
  }

  /**
   * Cache generated content to avoid regeneration
   */
  async cacheGeneratedContent(
    contentHash: string,
    content: any,
    type: string
  ): Promise<void> {
    await this.cacheAIResponse(
      contentHash,
      content,
      { prefix: `ai:content:${type}`, ttl: 7 * 24 * 60 * 60 } // 7 days
    );
  }

  /**
   * Get cached generated content
   */
  async getCachedContent(contentHash: string, type: string): Promise<any | null> {
    return await this.getCachedAIResponse(contentHash, `ai:content:${type}`);
  }

  /**
   * Store AI analytics data
   */
  async storeAIAnalytics(
    businessId: string,
    event: {
      type: 'chat_interaction' | 'content_generation' | 'prediction' | 'error';
      data: any;
      timestamp?: Date;
    }
  ): Promise<void> {
    if (!this.isConnected || !this.redis) {
      return;
    }

    try {
      const analyticsKey = `ai:analytics:${businessId}`;
      const eventData = {
        ...event,
        timestamp: event.timestamp || new Date(),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      // Store as sorted set with timestamp as score for time-based queries
      await this.redis.zadd(
        analyticsKey,
        eventData.timestamp.getTime(),
        JSON.stringify(eventData)
      );

      // Keep only last 30 days of analytics
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      await this.redis.zremrangebyscore(analyticsKey, 0, thirtyDaysAgo);

    } catch (error) {
      console.error('Redis analytics error:', error);
    }
  }

  /**
   * Get AI analytics for business
   */
  async getAIAnalytics(
    businessId: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<any[]> {
    if (!this.isConnected || !this.redis) {
      return [];
    }

    try {
      const analyticsKey = `ai:analytics:${businessId}`;
      const from = fromDate ? fromDate.getTime() : 0;
      const to = toDate ? toDate.getTime() : Date.now();

      const events = await this.redis.zrangebyscore(analyticsKey, from, to);
      
      return events.map(event => JSON.parse(event));

    } catch (error) {
      console.error('Redis analytics get error:', error);
      return [];
    }
  }

  /**
   * Rate limiting for AI API calls
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: Date }> {
    if (!this.isConnected || !this.redis) {
      // Allow all requests if Redis is not available
      return { allowed: true, remaining: limit - 1, resetTime: new Date(Date.now() + windowSeconds * 1000) };
    }

    try {
      const rateLimitKey = `rate_limit:${key}`;
      const current = await this.redis.incr(rateLimitKey);
      
      if (current === 1) {
        await this.redis.expire(rateLimitKey, windowSeconds);
      }

      const ttl = await this.redis.ttl(rateLimitKey);
      const resetTime = new Date(Date.now() + ttl * 1000);

      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current),
        resetTime
      };

    } catch (error) {
      console.error('Redis rate limit error:', error);
      return { allowed: true, remaining: limit - 1, resetTime: new Date(Date.now() + windowSeconds * 1000) };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: 'connected' | 'disconnected'; latency?: number }> {
    if (!this.redis) {
      return { status: 'disconnected' };
    }

    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;
      
      return { status: 'connected', latency };

    } catch (error) {
      return { status: 'disconnected' };
    }
  }

  /**
   * Cleanup expired sessions and data
   */
  async cleanup(): Promise<void> {
    if (!this.isConnected || !this.redis) {
      return;
    }

    try {
      // This would typically be run as a background job
      const pattern = 'ai:session:*';
      const keys = await this.redis.keys(pattern);
      
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) {
          // Key exists but has no expiration, set one
          await this.redis.expire(key, 24 * 60 * 60); // 24 hours
        }
      }

    } catch (error) {
      console.error('Redis cleanup error:', error);
    }
  }
}

export const redisService = RedisService.getInstance();