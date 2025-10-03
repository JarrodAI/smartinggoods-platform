/**
 * Social Media Automation Service
 * Handles content generation, image creation, and scheduling for social platforms
 */

import { openAIService } from './openai-service';
import { redisService } from './redis-service';

export interface SocialMediaPost {
  id: string;
  businessId: string;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  content: {
    text: string;
    hashtags: string[];
    mentions?: string[];
    cta?: string;
  };
  images: Array<{
    url: string;
    altText: string;
    generated: boolean;
  }>;
  scheduledDate: Date;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  publishedAt?: Date;
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
  createdAt: Date;
}

export interface ImageGenerationRequest {
  businessId: string;
  prompt: string;
  platform: string;
  style?: 'professional' | 'casual' | 'artistic' | 'modern';
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:5';
}

export interface SchedulePostRequest {
  businessId: string;
  platform: string;
  content: any;
  images: any[];
  scheduledDate: Date;
}

export class SocialMediaService {
  private static instance: SocialMediaService;

  public static getInstance(): SocialMediaService {
    if (!SocialMediaService.instance) {
      SocialMediaService.instance = new SocialMediaService();
    }
    return SocialMediaService.instance;
  }

  /**
   * Generate images for social media posts using DALL-E 3
   */
  async generateImages(
    businessId: string,
    contentText: string,
    platform: string,
    options: {
      count?: number;
      style?: string;
      includeText?: boolean;
    } = {}
  ): Promise<Array<{ url: string; altText: string; generated: boolean }>> {
    try {
      const { count = 1, style = 'professional', includeText = false } = options;

      // Get business context for image generation
      const businessContext = await redisService.getBusinessContext(businessId);
      
      // Build image generation prompt
      const imagePrompt = this.buildImagePrompt(
        contentText,
        businessContext,
        platform,
        style,
        includeText
      );

      const images = [];

      for (let i = 0; i < Math.min(count, 3); i++) {
        try {
          // Generate image using DALL-E 3
          const imageResponse = await openAIService.generateImage({
            prompt: imagePrompt,
            size: this.getImageSize(platform),
            quality: 'hd',
            style: 'natural'
          });

          if (imageResponse.url) {
            images.push({
              url: imageResponse.url,
              altText: this.generateAltText(contentText, businessContext),
              generated: true
            });
          }

        } catch (imageError) {
          console.error(`Image generation error ${i + 1}:`, imageError);
        }
      }

      // Cache generated images
      await redisService.cacheAIResponse(
        `social_images_${businessId}_${Date.now()}`,
        images,
        { prefix: 'ai:social', ttl: 24 * 60 * 60 } // 24 hours
      );

      return images;

    } catch (error) {
      console.error('Social media image generation error:', error);
      return [];
    }
  }

  /**
   * Schedule a social media post
   */
  async schedulePost(request: SchedulePostRequest): Promise<string> {
    try {
      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const post: SocialMediaPost = {
        id: postId,
        businessId: request.businessId,
        platform: request.platform as any,
        content: {
          text: request.content.body || request.content.text,
          hashtags: request.content.hashtags || [],
          mentions: request.content.mentions || [],
          cta: request.content.cta
        },
        images: request.images,
        scheduledDate: request.scheduledDate,
        status: 'scheduled',
        createdAt: new Date()
      };

      // Store scheduled post
      await redisService.cacheAIResponse(
        `scheduled_post_${postId}`,
        post,
        { prefix: 'ai:social', ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      // Add to business scheduled posts list
      const businessPosts = await this.getScheduledPosts(request.businessId) || [];
      businessPosts.push(post);
      
      await redisService.cacheAIResponse(
        `business_posts_${request.businessId}`,
        businessPosts,
        { prefix: 'ai:social', ttl: 30 * 24 * 60 * 60 }
      );

      console.log(`📅 Scheduled ${request.platform} post for ${request.scheduledDate}`);

      return postId;

    } catch (error) {
      console.error('Schedule post error:', error);
      throw new Error('Failed to schedule post');
    }
  }

  /**
   * Get scheduled posts for a business
   */
  async getScheduledPosts(
    businessId: string,
    filters: {
      platform?: string;
      status?: string;
      dateRange?: { start: Date; end: Date };
    } = {}
  ): Promise<SocialMediaPost[]> {
    try {
      const businessPosts = await redisService.getCachedAIResponse(
        `business_posts_${businessId}`,
        'ai:social'
      ) || [];

      let filteredPosts = businessPosts;

      // Apply filters
      if (filters.platform) {
        filteredPosts = filteredPosts.filter(post => post.platform === filters.platform);
      }

      if (filters.status) {
        filteredPosts = filteredPosts.filter(post => post.status === filters.status);
      }

      if (filters.dateRange) {
        filteredPosts = filteredPosts.filter(post => {
          const postDate = new Date(post.scheduledDate);
          return postDate >= filters.dateRange!.start && postDate <= filters.dateRange!.end;
        });
      }

      // Sort by scheduled date
      filteredPosts.sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );

      return filteredPosts;

    } catch (error) {
      console.error('Get scheduled posts error:', error);
      return [];
    }
  }

  /**
   * Reschedule a post
   */
  async reschedulePost(postId: string, newDate: Date): Promise<SocialMediaPost> {
    try {
      const post = await redisService.getCachedAIResponse(
        `scheduled_post_${postId}`,
        'ai:social'
      );

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.status !== 'scheduled') {
        throw new Error('Can only reschedule scheduled posts');
      }

      post.scheduledDate = newDate;

      // Update cached post
      await redisService.cacheAIResponse(
        `scheduled_post_${postId}`,
        post,
        { prefix: 'ai:social', ttl: 30 * 24 * 60 * 60 }
      );

      // Update business posts list
      await this.updateBusinessPostsList(post.businessId, postId, post);

      console.log(`📅 Rescheduled post ${postId} to ${newDate}`);

      return post;

    } catch (error) {
      console.error('Reschedule post error:', error);
      throw new Error('Failed to reschedule post');
    }
  }

  /**
   * Cancel a scheduled post
   */
  async cancelScheduledPost(postId: string): Promise<SocialMediaPost> {
    try {
      const post = await redisService.getCachedAIResponse(
        `scheduled_post_${postId}`,
        'ai:social'
      );

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.status !== 'scheduled') {
        throw new Error('Can only cancel scheduled posts');
      }

      post.status = 'cancelled';

      // Update cached post
      await redisService.cacheAIResponse(
        `scheduled_post_${postId}`,
        post,
        { prefix: 'ai:social', ttl: 30 * 24 * 60 * 60 }
      );

      // Update business posts list
      await this.updateBusinessPostsList(post.businessId, postId, post);

      console.log(`❌ Cancelled scheduled post ${postId}`);

      return post;

    } catch (error) {
      console.error('Cancel post error:', error);
      throw new Error('Failed to cancel post');
    }
  }

  /**
   * Publish a post immediately
   */
  async publishNow(postId: string): Promise<SocialMediaPost> {
    try {
      const post = await redisService.getCachedAIResponse(
        `scheduled_post_${postId}`,
        'ai:social'
      );

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.status !== 'scheduled') {
        throw new Error('Can only publish scheduled posts');
      }

      // In a real implementation, this would integrate with platform APIs
      // For now, we'll simulate publishing
      post.status = 'published';
      post.publishedAt = new Date();
      post.engagement = {
        likes: 0,
        shares: 0,
        comments: 0,
        clicks: 0
      };

      // Update cached post
      await redisService.cacheAIResponse(
        `scheduled_post_${postId}`,
        post,
        { prefix: 'ai:social', ttl: 30 * 24 * 60 * 60 }
      );

      // Update business posts list
      await this.updateBusinessPostsList(post.businessId, postId, post);

      console.log(`🚀 Published post ${postId} to ${post.platform}`);

      return post;

    } catch (error) {
      console.error('Publish post error:', error);
      throw new Error('Failed to publish post');
    }
  }

  /**
   * Generate content calendar for social media
   */
  async generateContentCalendar(
    businessId: string,
    options: {
      startDate: Date;
      endDate: Date;
      platforms: string[];
      postsPerWeek: number;
      themes?: string[];
    }
  ): Promise<{
    calendar: Array<{
      date: string;
      platform: string;
      content: any;
      theme: string;
    }>;
    totalPosts: number;
  }> {
    try {
      const calendar = [];
      const { startDate, endDate, platforms, postsPerWeek, themes = ['general'] } = options;

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalWeeks = Math.ceil(daysDiff / 7);
      const totalPosts = totalWeeks * postsPerWeek;
      const postsPerDay = postsPerWeek / 7;

      for (let day = 0; day < daysDiff; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + day);

        // Skip weekends for most businesses
        if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

        // Determine if we should post today
        if (Math.random() < postsPerDay) {
          const platform = platforms[Math.floor(Math.random() * platforms.length)];
          const theme = themes[Math.floor(Math.random() * themes.length)];
          
          // Generate themed content prompt
          const prompt = this.generateThemePrompt(theme, currentDate, platform);

          calendar.push({
            date: currentDate.toISOString().split('T')[0],
            platform,
            content: { prompt, theme },
            theme
          });
        }
      }

      return {
        calendar,
        totalPosts: calendar.length
      };

    } catch (error) {
      console.error('Content calendar generation error:', error);
      throw new Error('Failed to generate content calendar');
    }
  }

  /**
   * Build image generation prompt
   */
  private buildImagePrompt(
    contentText: string,
    businessContext: any,
    platform: string,
    style: string,
    includeText: boolean
  ): string {
    let prompt = `Create a ${style} image for a ${businessContext.industry} business`;
    
    if (businessContext.businessName) {
      prompt += ` called ${businessContext.businessName}`;
    }

    // Extract key concepts from content
    const concepts = this.extractImageConcepts(contentText);
    if (concepts.length > 0) {
      prompt += ` featuring ${concepts.slice(0, 3).join(', ')}`;
    }

    // Platform-specific adjustments
    switch (platform) {
      case 'instagram':
        prompt += ', vibrant colors, Instagram-worthy, high quality';
        break;
      case 'linkedin':
        prompt += ', professional, clean, business-appropriate';
        break;
      case 'facebook':
        prompt += ', engaging, social media friendly';
        break;
      case 'twitter':
        prompt += ', eye-catching, simple, clear';
        break;
    }

    // Style adjustments
    switch (style) {
      case 'professional':
        prompt += ', clean lines, minimal, corporate';
        break;
      case 'casual':
        prompt += ', relaxed, friendly, approachable';
        break;
      case 'artistic':
        prompt += ', creative, artistic, unique perspective';
        break;
      case 'modern':
        prompt += ', contemporary, sleek, trendy';
        break;
    }

    if (!includeText) {
      prompt += ', no text overlay, image only';
    }

    return prompt;
  }

  /**
   * Extract concepts for image generation
   */
  private extractImageConcepts(text: string): string[] {
    const concepts = [];
    const lowerText = text.toLowerCase();

    // Beauty/nail salon concepts
    if (lowerText.includes('nail') || lowerText.includes('manicure')) {
      concepts.push('beautiful nails', 'nail art', 'manicure');
    }
    if (lowerText.includes('spa') || lowerText.includes('relax')) {
      concepts.push('spa environment', 'relaxation', 'wellness');
    }
    if (lowerText.includes('color') || lowerText.includes('design')) {
      concepts.push('colorful designs', 'artistic patterns');
    }

    // General business concepts
    if (lowerText.includes('service') || lowerText.includes('quality')) {
      concepts.push('professional service', 'quality work');
    }
    if (lowerText.includes('customer') || lowerText.includes('client')) {
      concepts.push('happy customers', 'client satisfaction');
    }

    return concepts;
  }

  /**
   * Generate alt text for images
   */
  private generateAltText(contentText: string, businessContext: any): string {
    const businessType = businessContext.industry || 'business';
    const concepts = this.extractImageConcepts(contentText);
    
    if (concepts.length > 0) {
      return `${businessType} image featuring ${concepts.slice(0, 2).join(' and ')}`;
    }
    
    return `Professional ${businessType} image for social media`;
  }

  /**
   * Get appropriate image size for platform
   */
  private getImageSize(platform: string): '1024x1024' | '1792x1024' | '1024x1792' {
    switch (platform) {
      case 'instagram':
        return '1024x1024'; // Square format
      case 'twitter':
        return '1792x1024'; // Landscape
      case 'facebook':
        return '1792x1024'; // Landscape
      case 'linkedin':
        return '1792x1024'; // Landscape
      default:
        return '1024x1024';
    }
  }

  /**
   * Generate theme-based prompts
   */
  private generateThemePrompt(theme: string, date: Date, platform: string): string {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });

    const prompts: Record<string, string> = {
      'motivation': `Create a motivational ${dayOfWeek} post for ${platform}`,
      'tips': `Share a helpful beauty/wellness tip for ${dayOfWeek}`,
      'behind-scenes': `Show behind-the-scenes content from the salon`,
      'customer-spotlight': `Feature a customer transformation or testimonial`,
      'seasonal': `Create ${month}-themed content about seasonal services`,
      'promotion': `Announce a special offer or promotion`,
      'education': `Share educational content about nail care or beauty`,
      'general': `Create engaging ${dayOfWeek} content for ${platform}`
    };

    return prompts[theme] || prompts['general'];
  }

  /**
   * Update business posts list
   */
  private async updateBusinessPostsList(
    businessId: string,
    postId: string,
    updatedPost: SocialMediaPost
  ): Promise<void> {
    try {
      const businessPosts = await redisService.getCachedAIResponse(
        `business_posts_${businessId}`,
        'ai:social'
      ) || [];

      const postIndex = businessPosts.findIndex((p: SocialMediaPost) => p.id === postId);
      if (postIndex !== -1) {
        businessPosts[postIndex] = updatedPost;
        
        await redisService.cacheAIResponse(
          `business_posts_${businessId}`,
          businessPosts,
          { prefix: 'ai:social', ttl: 30 * 24 * 60 * 60 }
        );
      }

    } catch (error) {
      console.error('Update business posts list error:', error);
    }
  }
}

export const socialMediaService = SocialMediaService.getInstance();