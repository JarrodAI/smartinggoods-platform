/**
 * Vector Database Service - Business Knowledge Storage
 * Stores and retrieves business-specific knowledge for AI context
 */

export interface VectorDocument {
  id: string;
  businessId: string;
  content: string;
  metadata: {
    type: 'service' | 'policy' | 'faq' | 'procedure' | 'knowledge';
    category?: string;
    lastUpdated: Date;
    importance: number; // 0-1 scale
  };
  embedding?: number[];
}

export interface SearchResult {
  document: VectorDocument;
  similarity: number;
}

export class VectorService {
  private static instance: VectorService;
  private documents: Map<string, VectorDocument[]> = new Map(); // businessId -> documents
  private embeddings: Map<string, number[]> = new Map(); // documentId -> embedding

  public static getInstance(): VectorService {
    if (!VectorService.instance) {
      VectorService.instance = new VectorService();
    }
    return VectorService.instance;
  }

  /**
   * Add business knowledge to vector database
   */
  async addBusinessKnowledge(
    businessId: string,
    documents: Omit<VectorDocument, 'id' | 'embedding'>[]
  ): Promise<void> {
    try {
      const businessDocs = this.documents.get(businessId) || [];
      
      for (const doc of documents) {
        const documentId = `${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate embedding for the document content
        const embedding = await this.generateEmbedding(doc.content);
        
        const vectorDoc: VectorDocument = {
          ...doc,
          id: documentId,
          businessId,
          embedding
        };

        businessDocs.push(vectorDoc);
        this.embeddings.set(documentId, embedding);
      }

      this.documents.set(businessId, businessDocs);
      console.log(`✅ Added ${documents.length} knowledge documents for business ${businessId}`);

    } catch (error) {
      console.error('Error adding business knowledge:', error);
      throw new Error('Failed to add business knowledge');
    }
  }

  /**
   * Search for relevant business knowledge
   */
  async searchBusinessKnowledge(
    businessId: string,
    query: string,
    limit: number = 5,
    minSimilarity: number = 0.7
  ): Promise<SearchResult[]> {
    try {
      const businessDocs = this.documents.get(businessId) || [];
      
      if (businessDocs.length === 0) {
        return [];
      }

      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Calculate similarities
      const results: SearchResult[] = [];
      
      for (const doc of businessDocs) {
        if (doc.embedding) {
          const similarity = this.calculateCosineSimilarity(queryEmbedding, doc.embedding);
          
          if (similarity >= minSimilarity) {
            results.push({
              document: doc,
              similarity
            });
          }
        }
      }

      // Sort by similarity (highest first) and limit results
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('Error searching business knowledge:', error);
      return [];
    }
  }

  /**
   * Update business knowledge
   */
  async updateBusinessKnowledge(
    businessId: string,
    documentId: string,
    updates: Partial<Omit<VectorDocument, 'id' | 'businessId'>>
  ): Promise<void> {
    try {
      const businessDocs = this.documents.get(businessId) || [];
      const docIndex = businessDocs.findIndex(doc => doc.id === documentId);
      
      if (docIndex === -1) {
        throw new Error('Document not found');
      }

      const existingDoc = businessDocs[docIndex];
      const updatedDoc = { ...existingDoc, ...updates };

      // Regenerate embedding if content changed
      if (updates.content && updates.content !== existingDoc.content) {
        updatedDoc.embedding = await this.generateEmbedding(updates.content);
        this.embeddings.set(documentId, updatedDoc.embedding);
      }

      businessDocs[docIndex] = updatedDoc;
      this.documents.set(businessId, businessDocs);

    } catch (error) {
      console.error('Error updating business knowledge:', error);
      throw new Error('Failed to update business knowledge');
    }
  }

  /**
   * Remove business knowledge
   */
  async removeBusinessKnowledge(businessId: string, documentId: string): Promise<void> {
    try {
      const businessDocs = this.documents.get(businessId) || [];
      const filteredDocs = businessDocs.filter(doc => doc.id !== documentId);
      
      this.documents.set(businessId, filteredDocs);
      this.embeddings.delete(documentId);

    } catch (error) {
      console.error('Error removing business knowledge:', error);
      throw new Error('Failed to remove business knowledge');
    }
  }

  /**
   * Get all business knowledge
   */
  async getBusinessKnowledge(businessId: string): Promise<VectorDocument[]> {
    return this.documents.get(businessId) || [];
  }

  /**
   * Initialize business knowledge from business data
   */
  async initializeBusinessKnowledge(businessData: {
    businessId: string;
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
  }): Promise<void> {
    try {
      const documents: Omit<VectorDocument, 'id' | 'embedding'>[] = [];

      // Add business overview
      documents.push({
        businessId: businessData.businessId,
        content: `${businessData.businessName} is a ${businessData.industry} business located at ${businessData.location}. Hours: ${businessData.hours}`,
        metadata: {
          type: 'knowledge',
          category: 'business_info',
          lastUpdated: new Date(),
          importance: 1.0
        }
      });

      // Add services
      for (const service of businessData.services) {
        documents.push({
          businessId: businessData.businessId,
          content: `Service: ${service.name}. Description: ${service.description}. Price: $${service.price}. Duration: ${service.duration} minutes.`,
          metadata: {
            type: 'service',
            category: service.name.toLowerCase().replace(/\s+/g, '_'),
            lastUpdated: new Date(),
            importance: 0.9
          }
        });
      }

      // Add policies
      for (const policy of businessData.policies) {
        documents.push({
          businessId: businessData.businessId,
          content: `Policy: ${policy}`,
          metadata: {
            type: 'policy',
            category: 'business_policy',
            lastUpdated: new Date(),
            importance: 0.8
          }
        });
      }

      // Add FAQs if provided
      if (businessData.faqs) {
        for (const faq of businessData.faqs) {
          documents.push({
            businessId: businessData.businessId,
            content: `Question: ${faq.question} Answer: ${faq.answer}`,
            metadata: {
              type: 'faq',
              category: 'customer_support',
              lastUpdated: new Date(),
              importance: 0.7
            }
          });
        }
      }

      await this.addBusinessKnowledge(businessData.businessId, documents);

    } catch (error) {
      console.error('Error initializing business knowledge:', error);
      throw new Error('Failed to initialize business knowledge');
    }
  }

  /**
   * Generate text embedding (simplified version)
   * In production, this would use OpenAI's embedding API
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // For now, we'll use a simple hash-based embedding
      // In production, replace this with OpenAI's text-embedding-ada-002
      
      const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
      const embedding = new Array(384).fill(0); // 384-dimensional embedding
      
      // Simple word-based embedding (this is a placeholder)
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const hash = this.simpleHash(word);
        
        for (let j = 0; j < embedding.length; j++) {
          embedding[j] += Math.sin(hash + j) * (1 / (i + 1));
        }
      }

      // Normalize the embedding
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return embedding.map(val => magnitude > 0 ? val / magnitude : 0);

    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return zero vector as fallback
      return new Array(384).fill(0);
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Simple hash function for words
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get business knowledge statistics
   */
  async getKnowledgeStats(businessId: string): Promise<{
    totalDocuments: number;
    documentsByType: Record<string, number>;
    lastUpdated: Date | null;
  }> {
    const businessDocs = this.documents.get(businessId) || [];
    
    const documentsByType: Record<string, number> = {};
    let lastUpdated: Date | null = null;

    for (const doc of businessDocs) {
      documentsByType[doc.metadata.type] = (documentsByType[doc.metadata.type] || 0) + 1;
      
      if (!lastUpdated || doc.metadata.lastUpdated > lastUpdated) {
        lastUpdated = doc.metadata.lastUpdated;
      }
    }

    return {
      totalDocuments: businessDocs.length,
      documentsByType,
      lastUpdated
    };
  }

  /**
   * Clear all business knowledge (for testing/reset)
   */
  async clearBusinessKnowledge(businessId: string): Promise<void> {
    const businessDocs = this.documents.get(businessId) || [];
    
    // Remove embeddings
    for (const doc of businessDocs) {
      this.embeddings.delete(doc.id);
    }

    // Clear documents
    this.documents.delete(businessId);
  }
}

export const vectorService = VectorService.getInstance();