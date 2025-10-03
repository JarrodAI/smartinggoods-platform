/**
 * OpenAI Service - Core AI Infrastructure
 * Handles all OpenAI API interactions for the SmartingGoods AI-powered platform
 */

import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface BusinessContext {
  businessId: string;
  businessName: string;
  industry: string;
  services: Array<{
    name: string;
    price: number;
    duration: number;
    description: string;
  }>;
  policies: string[];
  hours: string;
  location: string;
}

export interface ChatResponse {
  message: string;
  intent?: 'booking' | 'inquiry' | 'support' | 'general';
  confidence: number;
  suggestedActions?: string[];
  bookingData?: {
    service?: string;
    preferredDate?: string;
    preferredTime?: string;
    customerInfo?: any;
  };
}

export class OpenAIService {
  private static instance: OpenAIService;
  
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Generate AI chatbot response with business context
   */
  async generateChatResponse(
    messages: AIMessage[],
    businessContext: BusinessContext
  ): Promise<ChatResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(businessContext);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 500,
        functions: [
          {
            name: 'extract_booking_intent',
            description: 'Extract booking information from customer message',
            parameters: {
              type: 'object',
              properties: {
                service: { type: 'string', description: 'Requested service' },
                preferredDate: { type: 'string', description: 'Preferred date' },
                preferredTime: { type: 'string', description: 'Preferred time' },
                customerName: { type: 'string', description: 'Customer name' },
                customerPhone: { type: 'string', description: 'Customer phone' },
                customerEmail: { type: 'string', description: 'Customer email' }
              }
            }
          }
        ],
        function_call: 'auto'
      });

      const response = completion.choices[0];
      let bookingData = undefined;

      // Check if AI detected booking intent
      if (response.message.function_call) {
        try {
          bookingData = JSON.parse(response.message.function_call.arguments);
        } catch (e) {
          console.error('Error parsing booking data:', e);
        }
      }

      return {
        message: response.message.content || 'I apologize, but I need a moment to process that. Could you please try again?',
        intent: bookingData ? 'booking' : this.detectIntent(response.message.content || ''),
        confidence: 0.85, // TODO: Implement actual confidence scoring
        bookingData
      };

    } catch (error) {
      console.error('OpenAI API Error:', error);
      return {
        message: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment or contact us directly.',
        intent: 'general',
        confidence: 0.0
      };
    }
  }

  /**
   * Generate marketing content with brand voice
   */
  async generateContent(
    type: 'social_post' | 'email' | 'blog' | 'sms',
    businessContext: BusinessContext,
    prompt: string,
    brandVoice?: {
      tone: string;
      vocabulary: string[];
      targetAudience: string;
    }
  ): Promise<{
    content: string;
    hashtags?: string[];
    subject?: string;
  }> {
    try {
      const contentPrompt = this.buildContentPrompt(type, businessContext, prompt, brandVoice);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: contentPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      });

      const response = completion.choices[0].message.content || '';
      
      // Parse response for different content types
      if (type === 'social_post') {
        const lines = response.split('\n');
        const content = lines.filter(line => !line.startsWith('#')).join('\n').trim();
        const hashtags = lines.filter(line => line.startsWith('#')).map(line => line.trim());
        
        return { content, hashtags };
      }
      
      if (type === 'email') {
        const lines = response.split('\n');
        const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
        const subject = subjectLine ? subjectLine.replace(/subject:/i, '').trim() : undefined;
        const content = lines.filter(line => !line.toLowerCase().includes('subject:')).join('\n').trim();
        
        return { content, subject };
      }

      return { content: response };

    } catch (error) {
      console.error('Content generation error:', error);
      throw new Error('Failed to generate content');
    }
  }

  /**
   * Analyze customer data for insights
   */
  async generateBusinessInsights(
    businessData: {
      customers: any[];
      services: any[];
      revenue: any[];
      bookings: any[];
    }
  ): Promise<{
    insights: Array<{
      type: 'opportunity' | 'risk' | 'trend';
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      actions: string[];
    }>;
  }> {
    try {
      const analysisPrompt = `
        Analyze this business data and provide actionable insights:
        
        Customer Count: ${businessData.customers.length}
        Services Offered: ${businessData.services.length}
        Recent Bookings: ${businessData.bookings.length}
        
        Provide 3-5 specific, actionable insights in JSON format with:
        - type: opportunity, risk, or trend
        - title: Brief insight title
        - description: Detailed explanation
        - impact: high, medium, or low
        - actions: Array of specific recommended actions
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a business intelligence analyst specializing in small business optimization.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content || '{}';
      
      try {
        const insights = JSON.parse(response);
        return { insights: insights.insights || [] };
      } catch (e) {
        // Fallback if JSON parsing fails
        return {
          insights: [{
            type: 'opportunity',
            title: 'Business Analysis Available',
            description: 'AI analysis is ready to provide insights based on your business data.',
            impact: 'medium',
            actions: ['Review customer patterns', 'Optimize service offerings', 'Improve booking flow']
          }]
        };
      }

    } catch (error) {
      console.error('Business insights error:', error);
      throw new Error('Failed to generate business insights');
    }
  }

  /**
   * Build system prompt for chatbot
   */
  private buildSystemPrompt(context: BusinessContext): string {
    return `
You are an AI assistant for ${context.businessName}, a ${context.industry} business. 

BUSINESS INFORMATION:
- Services: ${context.services.map(s => `${s.name} ($${s.price}, ${s.duration} min): ${s.description}`).join('; ')}
- Hours: ${context.hours}
- Location: ${context.location}
- Policies: ${context.policies.join('; ')}

INSTRUCTIONS:
1. Be friendly, professional, and helpful
2. Always provide accurate pricing and service information
3. For booking requests, gather: service, preferred date/time, customer name, phone, email
4. If you can't help, offer to connect them with a human
5. Promote services naturally when relevant
6. Keep responses concise but informative

BOOKING PROCESS:
When someone wants to book:
1. Confirm the service they want
2. Ask for their preferred date and time
3. Collect their contact information
4. Confirm availability (you'll check the calendar)
5. Provide next steps

Remember: You represent ${context.businessName} and should maintain their professional image while being conversational and helpful.
    `.trim();
  }

  /**
   * Build content generation prompt
   */
  private buildContentPrompt(
    type: string,
    context: BusinessContext,
    prompt: string,
    brandVoice?: any
  ): string {
    const basePrompt = `
You are creating ${type} content for ${context.businessName}, a ${context.industry} business.

BUSINESS CONTEXT:
- Services: ${context.services.map(s => s.name).join(', ')}
- Location: ${context.location}
- Target Audience: ${brandVoice?.targetAudience || 'Local customers interested in ' + context.industry}

BRAND VOICE: ${brandVoice?.tone || 'Professional yet friendly'}
    `;

    switch (type) {
      case 'social_post':
        return basePrompt + `
Create an engaging social media post. Include:
- Compelling copy that drives engagement
- Relevant hashtags (separate lines starting with #)
- Call-to-action for bookings
- Keep it under 280 characters for the main content
        `;
      
      case 'email':
        return basePrompt + `
Create a professional email campaign. Include:
- Subject: [compelling subject line]
- Personalized greeting
- Clear value proposition
- Strong call-to-action
- Professional closing
        `;
      
      case 'sms':
        return basePrompt + `
Create a concise SMS message (under 160 characters):
- Clear, direct message
- Include call-to-action
- Mention business name
- Add booking link placeholder: [BOOK_NOW]
        `;
      
      default:
        return basePrompt + 'Create engaging, professional content that drives customer action.';
    }
  }

  /**
   * Detect intent from message content
   */
  private detectIntent(content: string): 'booking' | 'inquiry' | 'support' | 'general' {
    const bookingKeywords = ['book', 'appointment', 'schedule', 'reserve', 'available'];
    const inquiryKeywords = ['price', 'cost', 'how much', 'what', 'when', 'where'];
    const supportKeywords = ['help', 'problem', 'issue', 'cancel', 'reschedule'];

    const lowerContent = content.toLowerCase();

    if (bookingKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'booking';
    }
    if (supportKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'support';
    }
    if (inquiryKeywords.some(keyword => lowerContent.includes(keyword))) {
      return 'inquiry';
    }

    return 'general';
  }
}

export const openAIService = OpenAIService.getInstance();