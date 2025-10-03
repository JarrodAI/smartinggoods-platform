/**
 * AI Chat Hook - React hook for real-time AI conversations
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

export interface BookingData {
  service?: string;
  preferredDate?: string;
  preferredTime?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isAITyping: boolean;
  isUserTyping: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastError?: string;
}

export interface UseAIChatOptions {
  businessId: string;
  customerId?: string;
  customerInfo?: any;
  autoConnect?: boolean;
  onBookingIntent?: (bookingData: BookingData) => void;
  onError?: (error: string) => void;
}

export function useAIChat(options: UseAIChatOptions) {
  const {
    businessId,
    customerId,
    customerInfo,
    autoConnect = true,
    onBookingIntent,
    onError
  } = options;

  // Generate session ID
  const sessionId = useRef<string>(
    `session_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Socket connection
  const socket = useRef<Socket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const maxReconnectAttempts = 5;

  // Chat state
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isAITyping: false,
    isUserTyping: false,
    connectionStatus: 'disconnected'
  });

  // Typing timeout
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  const connect = useCallback(() => {
    if (socket.current?.connected) {
      return;
    }

    setChatState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;
    
    socket.current = io(socketUrl, {
      path: '/api/socket/chat',
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000
    });

    // Connection events
    socket.current.on('connect', () => {
      console.log('🔌 Connected to AI chat server');
      reconnectAttempts.current = 0;
      
      setChatState(prev => ({
        ...prev,
        isConnected: true,
        connectionStatus: 'connected',
        lastError: undefined
      }));

      // Join chat session
      socket.current?.emit('join_chat', {
        sessionId: sessionId.current,
        businessId,
        customerId,
        customerInfo
      });
    });

    socket.current.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from AI chat server:', reason);
      
      setChatState(prev => ({
        ...prev,
        isConnected: false,
        connectionStatus: 'disconnected',
        isAITyping: false
      }));
    });

    socket.current.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      reconnectAttempts.current++;
      
      const errorMessage = reconnectAttempts.current >= maxReconnectAttempts
        ? 'Unable to connect to chat server. Please refresh the page.'
        : 'Connection error. Retrying...';

      setChatState(prev => ({
        ...prev,
        connectionStatus: 'error',
        lastError: errorMessage
      }));

      onError?.(errorMessage);
    });

    // Chat events
    socket.current.on('chat_joined', (data: {
      sessionId: string;
      businessId: string;
      customerId?: string;
      chatHistory: ChatMessage[];
      timestamp: string;
    }) => {
      console.log('✅ Joined chat session:', data.sessionId);
      
      setChatState(prev => ({
        ...prev,
        messages: data.chatHistory.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    });

    socket.current.on('message_received', (message: ChatMessage) => {
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          ...message,
          timestamp: new Date(message.timestamp)
        }]
      }));
    });

    socket.current.on('ai_typing', (data: { sessionId: string; isTyping: boolean }) => {
      setChatState(prev => ({
        ...prev,
        isAITyping: data.isTyping
      }));
    });

    socket.current.on('user_typing', (data: { sessionId: string; isTyping: boolean }) => {
      setChatState(prev => ({
        ...prev,
        isUserTyping: data.isTyping
      }));
    });

    socket.current.on('booking_intent_detected', (data: {
      sessionId: string;
      bookingData: BookingData;
      timestamp: string;
    }) => {
      console.log('📅 Booking intent detected:', data.bookingData);
      onBookingIntent?.(data.bookingData);
    });

    socket.current.on('error', (error: { message: string; code?: string }) => {
      console.error('💬 Chat error:', error);
      
      setChatState(prev => ({
        ...prev,
        lastError: error.message
      }));

      onError?.(error.message);
    });

    socket.current.on('pong', (data: { timestamp: string }) => {
      // Handle ping/pong for connection health
      console.log('🏓 Pong received');
    });

  }, [businessId, customerId, customerInfo, onBookingIntent, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
    }
    
    setChatState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected',
      isAITyping: false,
      isUserTyping: false
    }));
  }, []);

  // Send message
  const sendMessage = useCallback((message: string) => {
    if (!socket.current?.connected) {
      onError?.('Not connected to chat server');
      return;
    }

    if (!message.trim()) {
      onError?.('Message cannot be empty');
      return;
    }

    socket.current.emit('send_message', {
      sessionId: sessionId.current,
      message: message.trim(),
      customerInfo
    });
  }, [customerInfo, onError]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (!socket.current?.connected) return;

    socket.current.emit('typing_start', {
      sessionId: sessionId.current
    });

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeout.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, []);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (!socket.current?.connected) return;

    socket.current.emit('typing_stop', {
      sessionId: sessionId.current
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = null;
    }
  }, []);

  // Ping server for connection health
  const ping = useCallback(() => {
    if (socket.current?.connected) {
      socket.current.emit('ping');
    }
  }, []);

  // Clear chat history
  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: []
    }));
  }, []);

  // Retry connection
  const retry = useCallback(() => {
    disconnect();
    setTimeout(() => {
      reconnectAttempts.current = 0;
      connect();
    }, 1000);
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  // Health check interval
  useEffect(() => {
    if (!chatState.isConnected) return;

    const healthInterval = setInterval(() => {
      ping();
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(healthInterval);
  }, [chatState.isConnected, ping]);

  return {
    // State
    ...chatState,
    sessionId: sessionId.current,
    
    // Actions
    connect,
    disconnect,
    sendMessage,
    startTyping,
    stopTyping,
    clearMessages,
    retry,
    ping,
    
    // Computed
    hasMessages: chatState.messages.length > 0,
    lastMessage: chatState.messages[chatState.messages.length - 1],
    canSendMessage: chatState.isConnected && !chatState.isAITyping
  };
}