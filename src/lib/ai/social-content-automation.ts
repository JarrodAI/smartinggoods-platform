/**
 * Social Media Content Automation System
 * Automated post generation with hashtags, image generation, and scheduling
 */

import { openAIService } from './openai-service';

interface SocialPost {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  content: string;
  hashtags: string[];
  imageUrl?: string;
  scheduledTime?: Date;
  status: 'draft' | 'scheduled' | 'published';
}

interface ContentGenerationOptions {
  businessType: string;
  tone: 'professional' | 'casual' | 'friendly' | 'promotional';
  topic?: string;
  includeImage: boolean;
  platforms: Array<'facebook' | 'instagram' | 'twitter' | 'linkedin'>;
}

class SocialContentAutomationService {
  /**
   * Generate social media posts for multiple platforms
   */
  async generateSocialPosts(
    businessId: string,
    options: ContentGenerationOptions
  ): Promise<SocialPost[]> {
    const posts: SocialPost[] = [];

    for (const platform of options.platforms) {
      const post = await this.generatePlatformPost(businessId, platform, options);
      posts.push(post);
    }

    return posts;
  }

  /**
   * Generate a post for a specific platform
   */
  private async generatePlatformPost(
    businessId: string,
    platform: string,
    options: ContentGenerationOptions
  ): Promise<SocialPost> {
    const characterLimits = {
      twitter: 280,
      facebook: 500,
      instagram: 2200,
      linkedin: 700
    };

    const prompt = `Generate a ${options.tone} social media post for ${platform} about ${options.topic || 'our services'}.
Business type: ${options.businessType}
Character limit: ${characterLimits[platform as keyof typeof characterLimits]}
Include relevant hashtags and call-to-action.`;

    const content = await openAIService.generateText(prompt, {
      maxTokens: 200,
      temperature: 0.8
    });

    const hashtags = this.extractHashtags(content);
    
    let imageUrl: string | undefined;
    if (options.includeImage) {
      imageUrl = await this.generateImage(options.topic || 'business service', options.businessType);
    }

    return {
      platform: platform as any,
      content: content.replace(/#\w+/g, '').trim(),
      hashtags,
      imageUrl,
      status: 'draft'
    };
  }

  /**
   * Generate image using DALL-E 3
   */
  private async generateImage(topic: string, businessType: string): Promise<string> {
    const prompt = `Professional, high-quality image for ${businessType} social media post about ${topic}. 
Modern, clean aesthetic, suitable for business marketing.`;

    try {
      const imageUrl = await openAIService.generateImage(prompt);
      return imageUrl;
    } catch (error) {
      console.error('Image generation failed:', error);
      return '';
    }
  }

  /**
   * Extract hashtags from content
   */
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#\w+/g;
    const matches = content.match(hashtagRegex) || [];
    return matches.map(tag => tag.substring(1));
  }

  /**
   * Generate hashtags for a topic
   */
  async generateHashtags(topic: string, businessType: string, count: number = 10): Promise<string[]> {
    const prompt = `Generate ${count} relevant, popular hashtags for a ${businessType} posting about ${topic}.
Return only the hashtags without the # symbol, one per line.`;

    const response = await openAIService.generateText(prompt, {
      maxTokens: 100,
      temperature: 0.7
    });

    return response.split('\n')
      .map(tag => tag.trim().replace('#', ''))
      .filter(tag => tag.length > 0)
      .slice(0, count);
  }

  /**
   * Schedule post for future publication
   */
  async schedulePost(post: SocialPost, scheduledTime: Date): Promise<SocialPost> {
    return {
      ...post,
      scheduledTime,
      status: 'scheduled'
    };
  }

  /**
   * Generate content calendar for a month
   */
  async generateContentCalendar(
    businessId: string,
    businessType: string,
    postsPerWeek: number = 3
  ): Promise<SocialPost[]> {
    const topics = await this.generateContentTopics(businessType, postsPerWeek * 4);
    const posts: SocialPost[] = [];

    for (let i = 0; i < topics.length; i++) {
      const daysFromNow = Math.floor(i / postsPerWeek) * 7 + (i % postsPerWeek) * 2;
      const scheduledTime = new Date();
      scheduledTime.setDate(scheduledTime.getDate() + daysFromNow);
      scheduledTime.setHours(10, 0, 0, 0); // 10 AM

      const post = await this.generatePlatformPost(businessId, 'instagram', {
        businessType,
        tone: 'friendly',
        topic: topics[i],
        includeImage: true,
        platforms: ['instagram']
      });

      posts.push(await this.schedulePost(post, scheduledTime));
    }

    return posts;
  }

  /**
   * Generate content topics for the business
   */
  private async generateContentTopics(businessType: string, count: number): Promise<string[]> {
    const prompt = `Generate ${count} engaging social media post topics for a ${businessType}.
Topics should be varied: promotional, educational, behind-the-scenes, customer testimonials, tips, etc.
Return only the topics, one per line.`;

    const response = await openAIService.generateText(prompt, {
      maxTokens: 300,
      temperature: 0.8
    });

    return response.split('\n')
      .map(topic => topic.trim().replace(/^\d+\.\s*/, ''))
      .filter(topic => topic.length > 0)
      .slice(0, count);
  }

  /**
   * Optimize post for engagement
   */
  async optimizeForEngagement(post: SocialPost): Promise<SocialPost> {
    const prompt = `Optimize this social media post for maximum engagement:
"${post.content}"

Make it more engaging while keeping the core message. Add emojis if appropriate.`;

    const optimizedContent = await openAIService.generateText(prompt, {
      maxTokens: 200,
      temperature: 0.7
    });

    return {
      ...post,
      content: optimizedContent
    };
  }

  /**
   * Generate A/B test variations
   */
  async generateABVariations(post: SocialPost, count: number = 2): Promise<SocialPost[]> {
    const variations: SocialPost[] = [post];

    for (let i = 0; i < count; i++) {
      const prompt = `Create a variation of this social media post with a different angle or hook:
"${post.content}"

Keep the core message but change the approach.`;

      const variantContent = await openAIService.generateText(prompt, {
        maxTokens: 200,
        temperature: 0.9
      });

      variations.push({
        ...post,
        content: variantContent
      });
    }

    return variations;
  }
}

export const socialContentAutomation = new SocialContentAutomationService();
export type { SocialPost, ContentGenerationOptions };