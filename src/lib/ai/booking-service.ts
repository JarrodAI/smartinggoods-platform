/**
 * AI Booking Service - Intent Recognition & Calendar Integration
 * Handles booking requests and calendar management
 */

import { openAIService } from './openai-service';
import { redisService } from './redis-service';

export interface BookingIntent {
  confidence: number;
  service?: string;
  serviceId?: string;
  preferredDate?: string;
  preferredTime?: string;
  duration?: number;
  customerInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  specialRequests?: string[];
  isUrgent?: boolean;
  flexibility?: 'strict' | 'flexible' | 'very_flexible';
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  serviceId?: string;
  staffMember?: string;
  price?: number;
}

export interface BookingAvailability {
  date: string;
  slots: TimeSlot[];
  totalAvailable: number;
  recommendedSlots: TimeSlot[];
}

export interface BookingConfirmation {
  bookingId: string;
  businessId: string;
  customerId?: string;
  service: {
    name: string;
    price: number;
    duration: number;
  };
  appointment: {
    date: string;
    startTime: string;
    endTime: string;
  };
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

export class AIBookingService {
  private static instance: AIBookingService;

  public static getInstance(): AIBookingService {
    if (!AIBookingService.instance) {
      AIBookingService.instance = new AIBookingService();
    }
    return AIBookingService.instance;
  }

  /**
   * Analyze message for booking intent
   */
  async analyzeBookingIntent(
    businessId: string,
    message: string,
    conversationHistory?: string[]
  ): Promise<BookingIntent> {
    try {
      // Get business context for services
      const businessContext = await redisService.getBusinessContext(businessId);
      
      if (!businessContext) {
        throw new Error('Business context not found');
      }

      // Create analysis prompt
      const analysisPrompt = `
        Analyze this customer message for booking intent. Business services: ${businessContext.services.map(s => `${s.name} ($${s.price}, ${s.duration}min)`).join(', ')}
        
        Customer message: "${message}"
        ${conversationHistory ? `Previous messages: ${conversationHistory.slice(-3).join(' | ')}` : ''}
        
        Extract booking information and return JSON with:
        {
          "confidence": 0.0-1.0,
          "service": "exact service name or null",
          "preferredDate": "date mentioned or null",
          "preferredTime": "time mentioned or null", 
          "customerName": "name if mentioned",
          "customerPhone": "phone if mentioned",
          "customerEmail": "email if mentioned",
          "specialRequests": ["any special requests"],
          "isUrgent": boolean,
          "flexibility": "strict|flexible|very_flexible"
        }
      `;

      // Use OpenAI to analyze intent
      const completion = await openAIService.generateChatResponse(
        [{ role: 'user', content: analysisPrompt }],
        businessContext
      );

      // Parse the response
      let intentData: any = {};
      try {
        // Extract JSON from response
        const jsonMatch = completion.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          intentData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Failed to parse booking intent JSON:', parseError);
      }

      // Map service name to service details
      let serviceDetails = null;
      if (intentData.service) {
        serviceDetails = businessContext.services.find(s => 
          s.name.toLowerCase().includes(intentData.service.toLowerCase()) ||
          intentData.service.toLowerCase().includes(s.name.toLowerCase())
        );
      }

      const bookingIntent: BookingIntent = {
        confidence: intentData.confidence || 0,
        service: serviceDetails?.name,
        serviceId: serviceDetails?.name?.toLowerCase().replace(/\s+/g, '_'),
        preferredDate: this.parseDate(intentData.preferredDate),
        preferredTime: this.parseTime(intentData.preferredTime),
        duration: serviceDetails?.duration,
        customerInfo: {
          name: intentData.customerName,
          phone: intentData.customerPhone,
          email: intentData.customerEmail
        },
        specialRequests: intentData.specialRequests || [],
        isUrgent: intentData.isUrgent || false,
        flexibility: intentData.flexibility || 'flexible'
      };

      // Store intent for analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'booking_intent_detected',
        data: {
          message,
          intent: bookingIntent,
          confidence: bookingIntent.confidence
        }
      });

      return bookingIntent;

    } catch (error) {
      console.error('Booking intent analysis error:', error);
      return {
        confidence: 0,
        flexibility: 'flexible'
      };
    }
  }

  /**
   * Get available time slots for booking
   */
  async getAvailableSlots(
    businessId: string,
    serviceId: string,
    date: string,
    duration: number = 60
  ): Promise<BookingAvailability> {
    try {
      // For now, generate mock availability
      // In production, this would integrate with actual calendar systems
      const targetDate = new Date(date);
      const slots: TimeSlot[] = [];

      // Generate slots from 9 AM to 6 PM
      for (let hour = 9; hour < 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = new Date(targetDate);
          startTime.setHours(hour, minute, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + duration);

          // Mock availability (80% chance of being available)
          const available = Math.random() > 0.2;

          slots.push({
            startTime,
            endTime,
            available,
            serviceId,
            staffMember: 'Available Staff',
            price: await this.getServicePrice(businessId, serviceId)
          });
        }
      }

      const availableSlots = slots.filter(slot => slot.available);
      
      // Recommend best slots (mid-morning and early afternoon)
      const recommendedSlots = availableSlots.filter(slot => {
        const hour = slot.startTime.getHours();
        return (hour >= 10 && hour <= 11) || (hour >= 14 && hour <= 15);
      }).slice(0, 3);

      return {
        date,
        slots: availableSlots,
        totalAvailable: availableSlots.length,
        recommendedSlots
      };

    } catch (error) {
      console.error('Availability check error:', error);
      return {
        date,
        slots: [],
        totalAvailable: 0,
        recommendedSlots: []
      };
    }
  }

  /**
   * Create booking confirmation
   */
  async createBooking(
    businessId: string,
    bookingData: {
      serviceId: string;
      date: string;
      startTime: string;
      customerInfo: {
        name: string;
        phone: string;
        email?: string;
      };
      specialRequests?: string[];
    }
  ): Promise<BookingConfirmation> {
    try {
      // Get service details
      const businessContext = await redisService.getBusinessContext(businessId);
      const service = businessContext?.services.find(s => 
        s.name.toLowerCase().replace(/\s+/g, '_') === bookingData.serviceId
      );

      if (!service) {
        throw new Error('Service not found');
      }

      // Generate booking ID
      const bookingId = `booking_${businessId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Calculate end time
      const startDateTime = new Date(`${bookingData.date}T${bookingData.startTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + service.duration);

      const booking: BookingConfirmation = {
        bookingId,
        businessId,
        service: {
          name: service.name,
          price: service.price,
          duration: service.duration
        },
        appointment: {
          date: bookingData.date,
          startTime: bookingData.startTime,
          endTime: endDateTime.toTimeString().slice(0, 5)
        },
        customer: bookingData.customerInfo,
        status: 'pending',
        createdAt: new Date()
      };

      // Store booking in Redis
      await redisService.cacheAIResponse(
        bookingId,
        booking,
        { prefix: 'bookings', ttl: 30 * 24 * 60 * 60 } // 30 days
      );

      // Store analytics
      await redisService.storeAIAnalytics(businessId, {
        type: 'booking_created',
        data: {
          bookingId,
          service: service.name,
          date: bookingData.date,
          customerName: bookingData.customerInfo.name
        }
      });

      console.log(`📅 Booking created: ${bookingId} for ${service.name}`);

      return booking;

    } catch (error) {
      console.error('Booking creation error:', error);
      throw new Error('Failed to create booking');
    }
  }

  /**
   * Generate booking suggestions based on intent
   */
  async generateBookingSuggestions(
    businessId: string,
    intent: BookingIntent
  ): Promise<{
    suggestions: string[];
    availableDates: string[];
    recommendedServices: string[];
    nextSteps: string[];
  }> {
    try {
      const businessContext = await redisService.getBusinessContext(businessId);
      const suggestions: string[] = [];
      const availableDates: string[] = [];
      const recommendedServices: string[] = [];
      const nextSteps: string[] = [];

      // Service suggestions
      if (!intent.service && businessContext?.services) {
        const topServices = businessContext.services
          .slice(0, 3)
          .map(s => s.name);
        
        recommendedServices.push(...topServices);
        suggestions.push(`I'd be happy to help you book an appointment! Our most popular services are: ${topServices.join(', ')}. Which one interests you?`);
      }

      // Date suggestions
      if (!intent.preferredDate) {
        const today = new Date();
        for (let i = 1; i <= 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          availableDates.push(date.toISOString().split('T')[0]);
        }
        
        suggestions.push(`What day works best for you? I have availability this week and next week.`);
      }

      // Time suggestions
      if (intent.service && intent.preferredDate && !intent.preferredTime) {
        suggestions.push(`Great choice on ${intent.service}! What time would you prefer? I have morning slots (10 AM - 12 PM) and afternoon slots (2 PM - 5 PM) available.`);
      }

      // Contact info collection
      if (intent.service && intent.preferredDate && intent.preferredTime) {
        if (!intent.customerInfo?.name) {
          nextSteps.push('collect_name');
          suggestions.push(`Perfect! To complete your booking for ${intent.service} on ${intent.preferredDate} at ${intent.preferredTime}, I'll need your name.`);
        } else if (!intent.customerInfo?.phone) {
          nextSteps.push('collect_phone');
          suggestions.push(`Thanks ${intent.customerInfo.name}! I just need your phone number to confirm your appointment.`);
        } else {
          nextSteps.push('confirm_booking');
          suggestions.push(`Excellent! Let me confirm your appointment: ${intent.service} on ${intent.preferredDate} at ${intent.preferredTime} for ${intent.customerInfo.name}. Shall I book this for you?`);
        }
      }

      return {
        suggestions,
        availableDates,
        recommendedServices,
        nextSteps
      };

    } catch (error) {
      console.error('Booking suggestions error:', error);
      return {
        suggestions: ['I\'d be happy to help you book an appointment! What service are you interested in?'],
        availableDates: [],
        recommendedServices: [],
        nextSteps: ['collect_service']
      };
    }
  }

  /**
   * Parse date from natural language
   */
  private parseDate(dateString?: string): string | undefined {
    if (!dateString) return undefined;

    const today = new Date();
    const lower = dateString.toLowerCase();

    // Handle relative dates
    if (lower.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    
    if (lower.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    if (lower.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }

    // Try to parse as date
    try {
      const parsed = new Date(dateString);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
    } catch (error) {
      // Ignore parsing errors
    }

    return undefined;
  }

  /**
   * Parse time from natural language
   */
  private parseTime(timeString?: string): string | undefined {
    if (!timeString) return undefined;

    const lower = timeString.toLowerCase();

    // Handle common time formats
    const timePatterns = [
      /(\d{1,2}):(\d{2})\s*(am|pm)/i,
      /(\d{1,2})\s*(am|pm)/i,
      /(\d{1,2}):(\d{2})/
    ];

    for (const pattern of timePatterns) {
      const match = lower.match(pattern);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3];

        if (period) {
          if (period.toLowerCase() === 'pm' && hours !== 12) {
            hours += 12;
          } else if (period.toLowerCase() === 'am' && hours === 12) {
            hours = 0;
          }
        }

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }

    // Handle relative times
    if (lower.includes('morning')) return '10:00';
    if (lower.includes('afternoon')) return '14:00';
    if (lower.includes('evening')) return '17:00';

    return undefined;
  }

  /**
   * Get service price
   */
  private async getServicePrice(businessId: string, serviceId: string): Promise<number> {
    try {
      const businessContext = await redisService.getBusinessContext(businessId);
      const service = businessContext?.services.find(s => 
        s.name.toLowerCase().replace(/\s+/g, '_') === serviceId
      );
      return service?.price || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId: string): Promise<BookingConfirmation | null> {
    try {
      return await redisService.getCachedAIResponse(bookingId, 'bookings');
    } catch (error) {
      console.error('Get booking error:', error);
      return null;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: 'pending' | 'confirmed' | 'cancelled'
  ): Promise<boolean> {
    try {
      const booking = await this.getBooking(bookingId);
      if (!booking) return false;

      booking.status = status;
      
      await redisService.cacheAIResponse(
        bookingId,
        booking,
        { prefix: 'bookings', ttl: 30 * 24 * 60 * 60 }
      );

      return true;
    } catch (error) {
      console.error('Update booking status error:', error);
      return false;
    }
  }
}

export const aiBookingService = AIBookingService.getInstance();