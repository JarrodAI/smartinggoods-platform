/**
 * AI Content Generation Service
 * Generates brand-consistent content for social media, emails, and marketing
 */

import { OpenAIService } from './openai-service';
import { VectorService } from './vector-service';

export interface ContentGenerationRequest {
  businessId: string;
  contentType: 'social_post' | 'email' | 'sms' | 'blog_post' | 'ad_copy';
  platform?: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok';
  topic?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'promotional' | 'educational';
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  callToAction?: string;
  targetAudience?: string;
}

export interface GeneratedContent {
  content: string;
  hashtags?: string[];
  suggestedImages?: string[];
  scheduledTime?: Date;
  platform?: string;
  engagement_score?: number;
}

export class ContentGenerationService {
  private openai: OpenAIService;
  private vectorService: VectorService;

  constructor() {
    this.openai = new OpenAIService();
    this.vectorService = new VectorService();
  }

  /**
   * Generate content based on business context and requirements
   */
  async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    try {
      // Get business context from vector database
      const businessContext = await this.vectorService.searchSimilar(
        `business_profile_${request.businessId}`,
        'business_info',
        5
      );

      // Build content generation prompt
      const prompt = this.buildContentPrompt(request, businessContext);

      // Generate content using OpenAI
      const response = await this.openai.generateCompletion({
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(request.contentType)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'gpt-4-turbo-preview',
        temperature: 0.7,
        max_tokens: this.getMaxTokens(request.length || 'medium')
      });

      // Parse and format the generated content
      const generatedContent = this.parseGeneratedContent(
        response.choices[0].message.content || '',
        request
      );

      // Store generated content for learning
      await this.storeGeneratedContent(request.businessId, request, generatedContent);

      return generatedContent;

    } catch (error) {
      console.error('Content generation error:', error);
      throw new Error('Failed to generate content');
    }
  }

  /**
   * Generate multiple content variations for A/B testing
   */
  async generateContentVariations(
    request: ContentGenerationRequest,
    count: number = 3
  ): Promise<GeneratedContent[]> {
    const variations: GeneratedContent[] = [];

    for (let i = 0; i < count; i++) {
      const variation = await this.generateContent({
        ...request,
        tone: this.getVariationTone(i)
      });
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Generate social media content calendar
   */
  async generateContentCalendar(
    businessId: string,
    days: number = 30,
    postsPerDay: number = 1
  ): Promise<GeneratedContent[]> {
    const calendar: GeneratedContent[] = [];
    const topics = await this.generateContentTopics(businessId, days * postsPerDay);

    for (let day = 0; day < days; day++) {
      for (let post = 0; post < postsPerDay; post++) {
        const topicIndex = day * postsPerDay + post;
        const scheduledTime = new Date();
        scheduledTime.setDate(scheduledTime.getDate() + day);
        scheduledTime.setHours(this.getOptimalPostTime(day % 7), 0, 0, 0);

        const content = await this.generateContent({
          businessId,
          contentType: 'social_post',
          platform: this.getOptimalPlatform(day % 7),
          topic: topics[topicIndex],
          tone: this.getOptimalTone(day % 7),
          includeHashtags: true,
          includeEmojis: true
        });

        content.scheduledTime = scheduledTime;
        calendar.push(content);
      }
    }

    return calendar;
  }

  /**
   * Generate email campaign content
   */
  async generateEmailCampaign(
    businessId: string,
    campaignType: 'welcome' | 'promotional' | 'newsletter' | 'winback',
    customerSegment?: string
  ): Promise<{
    subject: string;
    preheader: string;
    content: string;
    callToAction: string;
  }> {
    const businessContext = await this.vectorService.searchSimilar(
      `business_profile_${businessId}`,
      'business_info',
      3
    );

    const prompt = `
Generate an email campaign for a ${businessContext[0]?.content || 'business'}.

Campaign Type: ${campaignType}
Customer Segment: ${customerSegment || 'general'}

Requirements:
- Compelling subject line (under 50 characters)
- Engaging preheader text (under 90 characters)
- Personalized email content (200-400 words)
- Clear call-to-action
- Brand-consistent tone

Format as JSON with: subject, preheader, content, callToAction
`;

    const response = await this.openai.generateCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an expert email marketing copywriter. Generate high-converting email campaigns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4-turbo-preview',
      temperature: 0.7
    });

    try {
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Failed to parse email campaign JSON:', error);
      throw new Error('Failed to generate email campaign');
    }
  }

  /**
   * Generate SMS/MMS campaign content
   */
  async generateSMSCampaign(
    businessId: string,
    campaignType: 'promotional' | 'reminder' | 'followup' | 'birthday',
    customerName?: string
  ): Promise<{
    message: string;
    mediaUrl?: string;
    timing: 'immediate' | 'scheduled';
    scheduledTime?: Date;
  }> {
    const businessContext = await this.vectorService.searchSimilar(
      `business_profile_${businessId}`,
      'business_info',
      2
    );

    const prompt = `
Generate an SMS campaign for a ${businessContext[0]?.content || 'business'}.

Campaign Type: ${campaignType}
Customer Name: ${customerName || '[Customer Name]'}

Requirements:
- Keep under 160 characters
- Include clear call-to-action
- Personalized and engaging
- Include opt-out option
- Brand-consistent tone

Format as JSON with: message, mediaUrl (if applicable), timing, scheduledTime
`;

    const response = await this.openai.generateCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are an expert SMS marketing specialist. Generate high-converting SMS campaigns.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4-turbo-preview',
      temperature: 0.7
    });

    try {
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Failed to parse SMS campaign JSON:', error);
      throw new Error('Failed to generate SMS campaign');
    }
  }

  /**
   * Build content generation prompt with business context
   */
  private buildContentPrompt(
    request: ContentGenerationRequest,
    businessContext: any[]
  ): string {
    const context = businessContext.map(item => item.content).join('\n');
    
    return `
Generate ${request.contentType} content for this business:

Business Context:
${context}

Requirements:
- Content Type: ${request.contentType}
- Platform: ${request.platform || 'general'}
- Topic: ${request.topic || 'general business promotion'}
- Tone: ${request.tone || 'professional'}
- Length: ${request.length || 'medium'}
- Include Hashtags: ${request.includeHashtags ? 'Yes' : 'No'}
- Include Emojis: ${request.includeEmojis ? 'Yes' : 'No'}
- Call to Action: ${request.callToAction || 'Book now or contact us'}
- Target Audience: ${request.targetAudience || 'potential customers'}

Generate engaging, brand-consistent content that drives customer action.
`;
  }

  /**
   * Get system prompt for different content types
   */
  private getSystemPrompt(contentType: string): string {
    const prompts = {
      social_post: 'You are a social media expert who creates engaging, viral-worthy posts that drive customer engagement and bookings.',
      email: 'You are an email marketing specialist who writes compelling email campaigns with high open and click-through rates.',
      sms: 'You are an SMS marketing expert who creates concise, action-driving text messages that convert customers.',
      blog_post: 'You are a content marketing specialist who writes informative, SEO-optimized blog posts that establish authority.',
      ad_copy: 'You are a digital advertising copywriter who creates high-converting ad copy that drives clicks and conversions.'
    };

    return prompts[contentType as keyof typeof prompts] || prompts.social_post;
  }

  /**
   * Parse generated content and extract components
   */
  private parseGeneratedContent(
    content: string,
    request: ContentGenerationRequest
  ): GeneratedContent {
    const result: GeneratedContent = {
      content: content.trim()
    };

    // Extract hashtags if requested
    if (request.includeHashtags) {
      const hashtagMatches = content.match(/#\w+/g);
      if (hashtagMatches) {
        result.hashtags = hashtagMatches;
        // Remove hashtags from main content
        result.content = content.replace(/#\w+/g, '').trim();
      }
    }

    // Calculate engagement score based on content characteristics
    result.engagement_score = this.calculateEngagementScore(content, request);

    return result;
  }

  /**
   * Calculate predicted engagement score
   */
  private calculateEngagementScore(content: string, request: ContentGenerationRequest): number {
    let score = 50; // Base score

    // Length optimization
    if (request.contentType === 'social_post') {
      const length = content.length;
      if (length >= 100 && length <= 200) score += 10;
      if (length > 300) score -= 10;
    }

    // Emoji usage
    if (request.includeEmojis && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content)) {
      score += 5;
    }

    // Question marks (engagement)
    if (content.includes('?')) score += 5;

    // Call to action
    if (request.callToAction || content.toLowerCase().includes('book') || content.toLowerCase().includes('call')) {
      score += 10;
    }

    // Hashtag optimization
    if (request.includeHashtags) {
      const hashtagCount = (content.match(/#\w+/g) || []).length;
      if (hashtagCount >= 3 && hashtagCount <= 7) score += 5;
      if (hashtagCount > 10) score -= 5;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  /**
   * Store generated content for learning and optimization
   */
  private async storeGeneratedContent(
    businessId: string,
    request: ContentGenerationRequest,
    content: GeneratedContent
  ): Promise<void> {
    try {
      await this.vectorService.storeEmbedding(
        `generated_content_${businessId}_${Date.now()}`,
        content.content,
        'generated_content',
        {
          businessId,
          contentType: request.contentType,
          platform: request.platform,
          engagementScore: content.engagement_score,
          createdAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Failed to store generated content:', error);
    }
  }

  /**
   * Generate content topics for calendar planning
   */
  private async generateContentTopics(businessId: string, count: number): Promise<string[]> {
    const businessContext = await this.vectorService.searchSimilar(
      `business_profile_${businessId}`,
      'business_info',
      3
    );

    const prompt = `
Generate ${count} diverse content topics for a ${businessContext[0]?.content || 'business'}.

Topics should include:
- Service highlights
- Behind-the-scenes content
- Customer testimonials
- Educational content
- Seasonal promotions
- Industry trends
- Tips and tutorials

Return as a JSON array of topic strings.
`;

    const response = await this.openai.generateCompletion({
      messages: [
        {
          role: 'system',
          content: 'You are a content strategist who creates diverse, engaging content topics.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'gpt-4-turbo-preview',
      temperature: 0.8
    });

    try {
      return JSON.parse(response.choices[0].message.content || '[]');
    } catch (error) {
      console.error('Failed to parse topics JSON:', error);
      return Array.from({ length: count }, (_, i) => `Content topic ${i + 1}`);
    }
  }

  /**
   * Get variation tone for A/B testing
   */
  private getVariationTone(index: number): 'professional' | 'casual' | 'friendly' | 'promotional' {
    const tones: ('professional' | 'casual' | 'friendly' | 'promotional')[] = ['professional', 'casual', 'friendly', 'promotional'];
    return tones[index % tones.length];
  }

  /**
   * Get optimal posting time based on day of week
   */
  private getOptimalPostTime(dayOfWeek: number): number {
    // Optimal posting hours by day of week
    const optimalHours = [10, 11, 14, 15, 13, 12, 16]; // Sun-Sat
    return optimalHours[dayOfWeek];
  }

  /**
   * Get optimal platform based on day of week
   */
  private getOptimalPlatform(dayOfWeek: number): 'facebook' | 'instagram' | 'twitter' | 'linkedin' {
    const platforms: ('facebook' | 'instagram' | 'twitter' | 'linkedin')[] = [
      'facebook', 'instagram', 'facebook', 'instagram', 'linkedin', 'instagram', 'facebook'
    ];
    return platforms[dayOfWeek];
  }

  /**
   * Get optimal tone based on day of week
   */
  private getOptimalTone(dayOfWeek: number): 'professional' | 'casual' | 'friendly' | 'promotional' {
    const tones: ('professional' | 'casual' | 'friendly' | 'promotional')[] = [
      'casual', 'professional', 'friendly', 'promotional', 'professional', 'casual', 'friendly'
    ];
    return tones[dayOfWeek];
  }

  /**
   * Get max tokens based on content length
   */
  private getMaxTokens(length: string): number {
    const tokenLimits = {
      short: 150,
      medium: 300,
      long: 600
    };
    return tokenLimits[length as keyof typeof tokenLimits] || 300;
  }
}

// Export service instance
export const contentGenerationService = new ContentGenerationService()