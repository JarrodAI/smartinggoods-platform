/**
 * AI Training Service - Business-Specific AI Training System
 * Trains AI models with business data for personalized responses
 */

import { openAIService } from './openai-service';
import { vectorService } from './vector-service';
import { redisService } from './redis-service';

export interface TrainingData {
    businessId: string;
    type: 'conversation' | 'faq' | 'policy' | 'service' | 'procedure';
    content: string;
    context?: string;
    tags?: string[];
    importance: number; // 0-1 scale
    lastUpdated: Date;
}

export interface BusinessProfile {
    businessId: string;
    businessName: string;
    industry: string;
    brandVoice: {
        tone: 'professional' | 'casual' | 'friendly' | 'authoritative';
        personality: string[];
        vocabulary: string[];
        avoidWords: string[];
    };
    services: Array<{
        name: string;
        description: string;
        price: number;
        duration: number;
        category: string;
        popularity: number;
    }>;
    policies: Array<{
        type: string;
        content: string;
        priority: number;
    }>;
    faqs: Array<{
        question: string;
        answer: string;
        category: string;
        frequency: number;
    }>;
    customerSegments: Array<{
        name: string;
        characteristics: string[];
        preferences: string[];
    }>;
}

export interface TrainingResult {
    success: boolean;
    businessId: string;
    documentsProcessed: number;
    knowledgeBaseSize: number;
    trainingTime: number;
    accuracy?: number;
    errors: string[];
}

export class AITrainingService {
    private static instance: AITrainingService;

    public static getInstance(): AITrainingService {
        if (!AITrainingService.instance) {
            AITrainingService.instance = new AITrainingService();
        }
        return AITrainingService.instance;
    }

    /**
     * Train AI with comprehensive business data
     */
    async trainBusinessAI(businessProfile: BusinessProfile): Promise<TrainingResult> {
        const startTime = Date.now();
        const result: TrainingResult = {
            success: false,
            businessId: businessProfile.businessId,
            documentsProcessed: 0,
            knowledgeBaseSize: 0,
            trainingTime: 0,
            errors: []
        };

        try {
            console.log(`🎓 Starting AI training for business: ${businessProfile.businessName}`);

            // Clear existing knowledge base
            await vectorService.clearBusinessKnowledge(businessProfile.businessId);

            // Prepare training documents
            const trainingDocuments = await this.prepareTrainingDocuments(businessProfile);

            // Add documents to vector database
            await vectorService.addBusinessKnowledge(
                businessProfile.businessId,
                trainingDocuments
            );

            // Generate and cache business context
            const businessContext = this.generateBusinessContext(businessProfile);
            await redisService.cacheBusinessContext(businessProfile.businessId, businessContext);

            // Train brand voice model
            await this.trainBrandVoice(businessProfile);

            // Generate conversation templates
            await this.generateConversationTemplates(businessProfile);

            // Create FAQ embeddings
            await this.processFAQs(businessProfile);

            // Generate service recommendations
            await this.generateServiceRecommendations(businessProfile);

            const endTime = Date.now();

            result.success = true;
            result.documentsProcessed = trainingDocuments.length;
            result.knowledgeBaseSize = trainingDocuments.length;
            result.trainingTime = endTime - startTime;

            console.log(`✅ AI training completed for ${businessProfile.businessName} in ${result.trainingTime}ms`);

            // Store training analytics
            await redisService.cacheAIResponse(
                `training_analytics_${businessProfile.businessId}`,
                {
                    type: 'training_completed',
                    documentsProcessed: result.documentsProcessed,
                    trainingTime: result.trainingTime,
                    businessName: businessProfile.businessName,
                    timestamp: new Date()
                },
                { prefix: 'ai:analytics', ttl: 30 * 24 * 60 * 60 } // 30 days
            );

            return result;

        } catch (error) {
            console.error('AI training error:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            result.errors.push(errorMessage);

            await redisService.cacheAIResponse(
                `training_error_${businessProfile.businessId}`,
                {
                    type: 'error',
                    error: errorMessage,
                    context: 'ai_training',
                    businessName: businessProfile.businessName,
                    timestamp: new Date()
                },
                { prefix: 'ai:analytics', ttl: 7 * 24 * 60 * 60 } // 7 days
            );

            return result;
        }
    }

    /**
     * Prepare training documents from business profile
     */
    private async prepareTrainingDocuments(profile: BusinessProfile): Promise<Array<Omit<any, 'id' | 'embedding'>>> {
        const documents = [];

        // Business overview
        documents.push({
            businessId: profile.businessId,
            content: `${profile.businessName} is a ${profile.industry} business. Brand voice: ${profile.brandVoice.tone}. Personality: ${profile.brandVoice.personality.join(', ')}.`,
            metadata: {
                type: 'knowledge',
                category: 'business_overview',
                lastUpdated: new Date(),
                importance: 1.0
            }
        });

        // Services with detailed information
        for (const service of profile.services) {
            documents.push({
                businessId: profile.businessId,
                content: `Service: ${service.name}. Description: ${service.description}. Price: $${service.price}. Duration: ${service.duration} minutes. Category: ${service.category}. This service is ${service.popularity > 0.7 ? 'very popular' : service.popularity > 0.4 ? 'moderately popular' : 'available'}.`,
                metadata: {
                    type: 'service',
                    category: service.category,
                    lastUpdated: new Date(),
                    importance: 0.9
                }
            });

            // Service upsell opportunities
            const relatedServices = profile.services.filter(s =>
                s.category === service.category && s.name !== service.name
            );

            if (relatedServices.length > 0) {
                documents.push({
                    businessId: profile.businessId,
                    content: `When customers book ${service.name}, suggest these complementary services: ${relatedServices.map(s => `${s.name} ($${s.price})`).join(', ')}.`,
                    metadata: {
                        type: 'procedure',
                        category: 'upselling',
                        lastUpdated: new Date(),
                        importance: 0.8
                    }
                });
            }
        }

        // Policies with context
        for (const policy of profile.policies) {
            documents.push({
                businessId: profile.businessId,
                content: `${policy.type} Policy: ${policy.content}`,
                metadata: {
                    type: 'policy',
                    category: policy.type.toLowerCase(),
                    lastUpdated: new Date(),
                    importance: policy.priority / 10 // Convert to 0-1 scale
                }
            });
        }

        // FAQs with enhanced context
        for (const faq of profile.faqs) {
            documents.push({
                businessId: profile.businessId,
                content: `Frequently Asked Question (${faq.category}): ${faq.question} Answer: ${faq.answer}`,
                metadata: {
                    type: 'faq',
                    category: faq.category,
                    lastUpdated: new Date(),
                    importance: Math.min(faq.frequency / 100, 1.0) // Normalize frequency
                }
            });
        }

        // Customer segment preferences
        for (const segment of profile.customerSegments) {
            documents.push({
                businessId: profile.businessId,
                content: `Customer Segment: ${segment.name}. Characteristics: ${segment.characteristics.join(', ')}. Preferences: ${segment.preferences.join(', ')}.`,
                metadata: {
                    type: 'knowledge',
                    category: 'customer_segments',
                    lastUpdated: new Date(),
                    importance: 0.7
                }
            });
        }

        // Brand voice guidelines
        documents.push({
            businessId: profile.businessId,
            content: `Brand Voice Guidelines: Tone should be ${profile.brandVoice.tone}. Use these words: ${profile.brandVoice.vocabulary.join(', ')}. Avoid these words: ${profile.brandVoice.avoidWords.join(', ')}. Personality traits: ${profile.brandVoice.personality.join(', ')}.`,
            metadata: {
                type: 'knowledge',
                category: 'brand_voice',
                lastUpdated: new Date(),
                importance: 0.9
            }
        });

        return documents;
    }

    /**
     * Generate business context for AI responses
     */
    private generateBusinessContext(profile: BusinessProfile): any {
        return {
            businessId: profile.businessId,
            businessName: profile.businessName,
            industry: profile.industry,
            services: profile.services.map(s => ({
                name: s.name,
                price: s.price,
                duration: s.duration,
                description: s.description
            })),
            policies: profile.policies.map(p => p.content),
            hours: '9 AM - 6 PM', // Default, should be configurable
            location: 'Local Area', // Default, should be configurable
            brandVoice: profile.brandVoice,
            topServices: profile.services
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 3)
                .map(s => s.name),
            averagePrice: profile.services.reduce((sum, s) => sum + s.price, 0) / profile.services.length
        };
    }

    /**
     * Train brand voice model
     */
    private async trainBrandVoice(profile: BusinessProfile): Promise<void> {
        try {
            // Generate sample content in brand voice
            const samplePrompts = [
                'Welcome message for new customers',
                'Booking confirmation message',
                'Service recommendation',
                'Thank you message after service'
            ];

            const brandVoiceSamples = [];

            for (const prompt of samplePrompts) {
                // Generate brand voice content using OpenAI
                const completion = await openAIService.generateChatResponse(
                    [{ role: 'user', content: prompt }],
                    this.generateBusinessContext(profile)
                );

                brandVoiceSamples.push({
                    prompt,
                    content: completion.message,
                    tone: profile.brandVoice.tone
                });
            }

            // Cache brand voice samples
            await redisService.cacheAIResponse(
                `brand_voice_${profile.businessId}`,
                brandVoiceSamples,
                { prefix: 'ai:training', ttl: 7 * 24 * 60 * 60 } // 7 days
            );

        } catch (error) {
            console.error('Brand voice training error:', error);
        }
    }

    /**
     * Generate conversation templates
     */
    private async generateConversationTemplates(profile: BusinessProfile): Promise<void> {
        try {
            const templates = {
                greeting: `Hello! Welcome to ${profile.businessName}! I'm here to help you with information about our ${profile.industry} services. How can I assist you today?`,

                serviceInquiry: `Great question! We offer several ${profile.industry} services. Our most popular ones are: ${profile.services.slice(0, 3).map(s => `${s.name} ($${s.price})`).join(', ')}. Which one interests you most?`,

                booking: `I'd be happy to help you book an appointment! To get started, could you let me know: 1) Which service you're interested in, 2) Your preferred date and time, and 3) Your contact information?`,

                pricing: `Our pricing varies by service. Here are our main services: ${profile.services.map(s => `${s.name}: $${s.price} (${s.duration} min)`).join(', ')}. All prices include our professional service guarantee!`,

                policies: `Here are our key policies: ${profile.policies.slice(0, 2).map(p => p.content).join(' ')} Is there a specific policy you'd like to know more about?`
            };

            // Cache conversation templates
            await redisService.cacheAIResponse(
                `conversation_templates_${profile.businessId}`,
                templates,
                { prefix: 'ai:training', ttl: 7 * 24 * 60 * 60 } // 7 days
            );

        } catch (error) {
            console.error('Conversation templates error:', error);
        }
    }

    /**
     * Process FAQs for quick retrieval
     */
    private async processFAQs(profile: BusinessProfile): Promise<void> {
        try {
            const processedFAQs = profile.faqs.map(faq => ({
                question: faq.question,
                answer: faq.answer,
                category: faq.category,
                keywords: this.extractKeywords(faq.question + ' ' + faq.answer),
                frequency: faq.frequency
            }));

            // Sort by frequency for quick access
            processedFAQs.sort((a, b) => b.frequency - a.frequency);

            // Cache processed FAQs
            await redisService.cacheAIResponse(
                `processed_faqs_${profile.businessId}`,
                processedFAQs,
                { prefix: 'ai:training', ttl: 7 * 24 * 60 * 60 } // 7 days
            );

        } catch (error) {
            console.error('FAQ processing error:', error);
        }
    }

    /**
     * Generate service recommendations
     */
    private async generateServiceRecommendations(profile: BusinessProfile): Promise<void> {
        try {
            const recommendations: Record<string, {
                upsells: Array<{ name: string; price: number; reason: string }>;
                crossSells: Array<{ name: string; price: number; reason: string }>;
            }> = {};

            for (const service of profile.services) {
                const relatedServices = profile.services
                    .filter(s => s.category === service.category && s.name !== service.name)
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 3);

                const complementaryServices = profile.services
                    .filter(s => s.category !== service.category)
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 2);

                recommendations[service.name] = {
                    upsells: relatedServices.map(s => ({
                        name: s.name,
                        price: s.price,
                        reason: `Popular ${service.category} add-on`
                    })),
                    crossSells: complementaryServices.map(s => ({
                        name: s.name,
                        price: s.price,
                        reason: `Customers who book ${service.name} often enjoy ${s.name}`
                    }))
                };
            }

            // Cache service recommendations
            await redisService.cacheAIResponse(
                `service_recommendations_${profile.businessId}`,
                recommendations,
                { prefix: 'ai:training', ttl: 7 * 24 * 60 * 60 } // 7 days
            );

        } catch (error) {
            console.error('Service recommendations error:', error);
        }
    }

    /**
     * Extract keywords from text
     */
    private extractKeywords(text: string): string[] {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);

        // Remove common stop words
        const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];

        return [...new Set(words.filter(word => !stopWords.includes(word)))];
    }

    /**
     * Update business training with new data
     */
    async updateBusinessTraining(
        businessId: string,
        updates: {
            services?: any[];
            policies?: any[];
            faqs?: any[];
            brandVoice?: any;
        }
    ): Promise<void> {
        try {
            // Get existing business context
            const existingContext = await redisService.getBusinessContext(businessId);

            if (!existingContext) {
                throw new Error('Business not found in training system');
            }

            // Update context with new data
            const updatedContext = {
                ...existingContext,
                ...updates,
                lastUpdated: new Date()
            };

            // Re-cache updated context
            await redisService.cacheBusinessContext(businessId, updatedContext);

            // Update vector database if services or policies changed
            if (updates.services || updates.policies || updates.faqs) {
                // This would require rebuilding the knowledge base
                // For now, we'll just update the cache
                console.log(`📚 Business training updated for ${businessId}`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Training update error:', errorMessage);
            throw new Error('Failed to update business training');
        }
    }

    /**
     * Get training statistics
     */
    async getTrainingStats(businessId: string): Promise<{
        knowledgeBaseSize: number;
        lastTrainingDate: Date | null;
        documentsCount: number;
        brandVoiceTrained: boolean;
        faqsProcessed: number;
    }> {
        try {
            const knowledgeStats = await vectorService.getKnowledgeStats(businessId);
            const businessContext = await redisService.getBusinessContext(businessId);
            const brandVoiceSamples = await redisService.getCachedAIResponse(
                `brand_voice_${businessId}`,
                'ai:training'
            );
            const processedFAQs = await redisService.getCachedAIResponse(
                `processed_faqs_${businessId}`,
                'ai:training'
            );

            return {
                knowledgeBaseSize: knowledgeStats.totalDocuments,
                lastTrainingDate: knowledgeStats.lastUpdated,
                documentsCount: knowledgeStats.totalDocuments,
                brandVoiceTrained: !!brandVoiceSamples,
                faqsProcessed: processedFAQs ? processedFAQs.length : 0
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Training stats error:', errorMessage);
            return {
                knowledgeBaseSize: 0,
                lastTrainingDate: null,
                documentsCount: 0,
                brandVoiceTrained: false,
                faqsProcessed: 0
            };
        }
    }
}

export const aiTrainingService = AITrainingService.getInstance();