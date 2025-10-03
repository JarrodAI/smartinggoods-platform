/**
 * WebSocket Server - Real-time AI Chat Infrastructure
 * Handles instant AI conversations with session management
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { aiService } from '@/lib/ai/ai-service';
import { redisService } from '@/lib/ai/redis-service';

export interface ChatSession {
  sessionId: string;
  businessId: string;
  customerId?: string;
  socketId: string;
  lastActivity: Date;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    processingTime?: number;
  };
}

export class WebSocketChatServer {
  private io: SocketIOServer;
  private activeSessions: Map<string, ChatSession> = new Map();
  private socketToSession: Map<string, string> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      path: '/api/socket/chat'
    });

    this.setupEventHandlers();
    console.log('🚀 WebSocket Chat Server initialized');
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      // Handle chat session initialization
      socket.on('join_chat', async (data: {
        sessionId: string;
        businessId: string;
        customerId?: string;
        customerInfo?: any;
      }) => {
        try {
          await this.handleJoinChat(socket, data);
        } catch (error) {
          console.error('Join chat error:', error);
          socket.emit('error', { message: 'Failed to join chat session' });
        }
      });

      // Handle incoming chat messages
      socket.on('send_message', async (data: {
        sessionId: string;
        message: string;
        customerInfo?: any;
      }) => {
        try {
          await this.handleSendMessage(socket, data);
        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to process message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { sessionId: string }) => {
        socket.to(`session_${data.sessionId}`).emit('user_typing', {
          sessionId: data.sessionId,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data: { sessionId: string }) => {
        socket.to(`session_${data.sessionId}`).emit('user_typing', {
          sessionId: data.sessionId,
          isTyping: false
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });
    });
  }

  private async handleJoinChat(socket: any, data: {
    sessionId: string;
    businessId: string;
    customerId?: string;
    customerInfo?: any;
  }): Promise<void> {
    const { sessionId, businessId, customerId, customerInfo } = data;

    // Validate business configuration
    const businessConfig = aiService.getBusinessConfig(businessId);
    if (!businessConfig) {
      socket.emit('error', { 
        message: 'Business not configured for AI chat',
        code: 'BUSINESS_NOT_CONFIGURED'
      });
      return;
    }

    // Create or update chat session
    const chatSession: ChatSession = {
      sessionId,
      businessId,
      customerId,
      socketId: socket.id,
      lastActivity: new Date(),
      isActive: true
    };

    // Store session mappings
    this.activeSessions.set(sessionId, chatSession);
    this.socketToSession.set(socket.id, sessionId);

    // Join socket room for this session
    socket.join(`session_${sessionId}`);
    socket.join(`business_${businessId}`);

    // Get chat history
    const existingSession = await redisService.getAISession(sessionId);
    const chatHistory = existingSession?.messages || [];

    // Send welcome message and history
    socket.emit('chat_joined', {
      sessionId,
      businessId,
      customerId,
      chatHistory: chatHistory.slice(-20), // Last 20 messages
      timestamp: new Date().toISOString()
    });

    // Send initial AI greeting if no history
    if (chatHistory.length === 0) {
      await this.sendAIGreeting(socket, sessionId, businessId);
    }

    console.log(`✅ Chat session joined: ${sessionId} for business: ${businessId}`);
  }

  private async handleSendMessage(socket: any, data: {
    sessionId: string;
    message: string;
    customerInfo?: any;
  }): Promise<void> {
    const { sessionId, message, customerInfo } = data;
    const startTime = Date.now();

    // Get session info
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      socket.emit('error', { 
        message: 'Chat session not found',
        code: 'SESSION_NOT_FOUND'
      });
      return;
    }

    // Validate message
    if (!message || message.trim().length === 0) {
      socket.emit('error', { 
        message: 'Message cannot be empty',
        code: 'EMPTY_MESSAGE'
      });
      return;
    }

    if (message.length > 1000) {
      socket.emit('error', { 
        message: 'Message too long (max 1000 characters)',
        code: 'MESSAGE_TOO_LONG'
      });
      return;
    }

    // Create user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };

    // Broadcast user message to all clients in session
    this.io.to(`session_${sessionId}`).emit('message_received', userMessage);

    // Show AI typing indicator
    this.io.to(`session_${sessionId}`).emit('ai_typing', {
      sessionId,
      isTyping: true
    });

    try {
      // Generate AI response
      const aiResponse = await aiService.generateChatResponse(
        session.businessId,
        sessionId,
        message,
        customerInfo
      );

      const processingTime = Date.now() - startTime;

      // Create AI message
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        role: 'assistant',
        content: aiResponse.message,
        timestamp: new Date(),
        metadata: {
          intent: aiResponse.intent,
          confidence: aiResponse.confidence,
          processingTime
        }
      };

      // Stop typing indicator
      this.io.to(`session_${sessionId}`).emit('ai_typing', {
        sessionId,
        isTyping: false
      });

      // Send AI response
      this.io.to(`session_${sessionId}`).emit('message_received', aiMessage);

      // Handle special intents
      if (aiResponse.intent === 'booking' && aiResponse.bookingData) {
        this.io.to(`session_${sessionId}`).emit('booking_intent_detected', {
          sessionId,
          bookingData: aiResponse.bookingData,
          timestamp: new Date().toISOString()
        });
      }

      // Update session activity
      session.lastActivity = new Date();
      this.activeSessions.set(sessionId, session);

      console.log(`💬 AI response sent for session ${sessionId} (${processingTime}ms)`);

    } catch (error) {
      console.error('AI response error:', error);

      // Stop typing indicator
      this.io.to(`session_${sessionId}`).emit('ai_typing', {
        sessionId,
        isTyping: false
      });

      // Send error message
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        role: 'assistant',
        content: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment or contact us directly.',
        timestamp: new Date(),
        metadata: {
          intent: 'error',
          confidence: 0
        }
      };

      this.io.to(`session_${sessionId}`).emit('message_received', errorMessage);
    }
  }

  private async sendAIGreeting(socket: any, sessionId: string, businessId: string): Promise<void> {
    try {
      // Get business context for personalized greeting
      const businessContext = await redisService.getBusinessContext(businessId);
      
      const greetingMessage = businessContext 
        ? `Hello! Welcome to ${businessContext.businessName}! I'm here to help you with information about our services, pricing, and bookings. How can I assist you today?`
        : 'Hello! Welcome! I\'m here to help you with any questions about our services. How can I assist you today?';

      const aiGreeting: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        role: 'assistant',
        content: greetingMessage,
        timestamp: new Date(),
        metadata: {
          intent: 'greeting',
          confidence: 1.0
        }
      };

      socket.emit('message_received', aiGreeting);

      // Store greeting in session
      await redisService.updateAISession(sessionId, {
        role: 'assistant',
        content: greetingMessage
      });

    } catch (error) {
      console.error('Greeting error:', error);
    }
  }

  private handleDisconnect(socket: any): void {
    const sessionId = this.socketToSession.get(socket.id);
    
    if (sessionId) {
      const session = this.activeSessions.get(sessionId);
      
      if (session) {
        // Mark session as inactive
        session.isActive = false;
        session.lastActivity = new Date();
        this.activeSessions.set(sessionId, session);

        // Notify other clients in session
        socket.to(`session_${sessionId}`).emit('user_disconnected', {
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

      // Clean up mappings
      this.socketToSession.delete(socket.id);
    }

    console.log(`🔌 Client disconnected: ${socket.id}`);
  }

  // Admin methods for monitoring
  public getActiveSessionsCount(): number {
    return Array.from(this.activeSessions.values())
      .filter(session => session.isActive).length;
  }

  public getSessionsByBusiness(businessId: string): ChatSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.businessId === businessId && session.isActive);
  }

  public broadcastToBusinessSessions(businessId: string, event: string, data: any): void {
    this.io.to(`business_${businessId}`).emit(event, data);
  }

  // Cleanup inactive sessions
  public cleanupInactiveSessions(): void {
    const now = new Date();
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime();
      
      if (inactiveTime > maxInactiveTime) {
        this.activeSessions.delete(sessionId);
        this.socketToSession.delete(session.socketId);
        console.log(`🧹 Cleaned up inactive session: ${sessionId}`);
      }
    }
  }
}

// Singleton instance
let chatServer: WebSocketChatServer | null = null;

export function initializeChatServer(server: HTTPServer): WebSocketChatServer {
  if (!chatServer) {
    chatServer = new WebSocketChatServer(server);
    
    // Set up cleanup interval
    setInterval(() => {
      chatServer?.cleanupInactiveSessions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }
  
  return chatServer;
}

export function getChatServer(): WebSocketChatServer | null {
  return chatServer;
}