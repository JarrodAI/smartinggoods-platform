/**
 * AI Chat Component - Real-time AI conversation interface
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAIChat, type BookingData } from '@/hooks/useAIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface AIChatProps {
  businessId: string;
  customerId?: string;
  customerInfo?: any;
  className?: string;
  onBookingIntent?: (bookingData: BookingData) => void;
  onClose?: () => void;
  theme?: 'light' | 'dark';
}

export function AIChat({
  businessId,
  customerId,
  customerInfo,
  className = '',
  onBookingIntent,
  onClose,
  theme = 'light'
}: AIChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isConnected,
    isAITyping,
    connectionStatus,
    lastError,
    sendMessage,
    startTyping,
    stopTyping,
    retry,
    canSendMessage
  } = useAIChat({
    businessId,
    customerId,
    customerInfo,
    autoConnect: true,
    onBookingIntent,
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  // Handle input changes with typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    if (value.trim() && isConnected) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Handle message submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !canSendMessage) {
      return;
    }

    sendMessage(inputMessage);
    setInputMessage('');
    stopTyping();
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle key press events
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  // Get connection status display
  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <LoadingSpinner size="sm" />
            <span>Connecting...</span>
          </div>
        );
      case 'connected':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Connected</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Connection error</span>
            <Button
              size="sm"
              variant="outline"
              onClick={retry}
              className="ml-2 h-6 px-2 text-xs"
            >
              Retry
            </Button>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Disconnected</span>
          </div>
        );
    }
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-900 text-white border-gray-700'
    : 'bg-white text-gray-900 border-gray-200';

  return (
    <Card className={`flex flex-col h-96 ${themeClasses} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            {getConnectionStatus()}
          </div>
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && connectionStatus === 'connected' && (
          <div className="text-center text-gray-500 text-sm py-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-white text-lg">👋</span>
            </div>
            <p>Start a conversation with our AI assistant!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${
                  message.role === 'user' 
                    ? 'text-blue-100' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {formatTime(message.timestamp)}
                </span>
                
                {message.metadata?.confidence && (
                  <span className={`text-xs ml-2 ${
                    message.role === 'user' 
                      ? 'text-blue-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {Math.round(message.metadata.confidence * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isAITyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 max-w-[80%]">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {lastError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{lastError}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => {
              setIsInputFocused(false);
              stopTyping();
            }}
            placeholder={
              !isConnected 
                ? 'Connecting...' 
                : isAITyping 
                ? 'AI is responding...' 
                : 'Type your message...'
            }
            disabled={!canSendMessage}
            className="flex-1"
            maxLength={1000}
          />
          
          <Button
            type="submit"
            disabled={!canSendMessage || !inputMessage.trim()}
            className="px-4"
          >
            {isAITyping ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span>Send</span>
            )}
          </Button>
        </form>
        
        {inputMessage.length > 800 && (
          <p className="text-xs text-gray-500 mt-1">
            {1000 - inputMessage.length} characters remaining
          </p>
        )}
      </div>
    </Card>
  );
}