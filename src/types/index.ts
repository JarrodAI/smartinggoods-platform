export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: 'USER' | 'ADMIN'
  businessName?: string
  businessType?: string
  subscriptionId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing'
  priceId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Website {
  id: string
  userId: string
  name: string
  domain?: string
  templateId: string
  customization: Record<string, any>
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  previewImage: string
  features: string[]
  price: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface AIChat {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface BusinessProfile {
  id: string
  userId: string
  businessName: string
  businessType: string
  description?: string
  address?: string
  phone?: string
  website?: string
  services: Service[]
  hours: BusinessHours
  socialMedia: SocialMedia
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  isActive: boolean
}

export interface BusinessHours {
  monday: DayHours
  tuesday: DayHours
  wednesday: DayHours
  thursday: DayHours
  friday: DayHours
  saturday: DayHours
  sunday: DayHours
}

export interface DayHours {
  isOpen: boolean
  openTime?: string
  closeTime?: string
}

export interface SocialMedia {
  facebook?: string
  instagram?: string
  twitter?: string
  tiktok?: string
  youtube?: string
}

export interface Campaign {
  id: string
  userId: string
  name: string
  type: 'email' | 'sms' | 'social'
  status: 'draft' | 'active' | 'paused' | 'completed'
  content: Record<string, any>
  targetAudience: string[]
  metrics: CampaignMetrics
  createdAt: Date
  updatedAt: Date
}

export interface CampaignMetrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  converted: number
  revenue: number
}

export interface Analytics {
  id: string
  userId: string
  period: string
  metrics: {
    visitors: number
    pageViews: number
    bounceRate: number
    avgSessionDuration: number
    conversions: number
    revenue: number
  }
  createdAt: Date
}

export interface Integration {
  id: string
  userId: string
  type: string
  name: string
  config: Record<string, any>
  isActive: boolean
  lastSync?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalCustomers: number
  activeSubscriptions: number
  conversionRate: number
  growthRate: number
  churnRate: number
}

export interface AIInsight {
  id: string
  type: 'opportunity' | 'warning' | 'recommendation'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  actionable: boolean
  createdAt: Date
}

export interface VirtualTryOn {
  id: string
  userId: string
  imageUrl: string
  designId: string
  resultUrl: string
  confidence: number
  createdAt: Date
}

export interface PredictiveModel {
  id: string
  type: 'churn' | 'demand' | 'revenue'
  accuracy: number
  lastTrained: Date
  predictions: Record<string, any>
}

export type SubscriptionTier = 'starter' | 'professional' | 'enterprise' | 'agency'

export type BusinessType = 
  | 'nail_salon'
  | 'hair_salon' 
  | 'spa'
  | 'beauty_salon'
  | 'barbershop'
  | 'massage_therapy'
  | 'fitness'
  | 'restaurant'
  | 'retail'
  | 'professional_services'
  | 'other'

export type CampaignType = 'welcome' | 'promotional' | 'retention' | 'winback' | 'birthday' | 'seasonal'

export type IntegrationType = 'pos' | 'scheduling' | 'crm' | 'accounting' | 'marketing' | 'communication'

export type AlertType = 'system' | 'business' | 'marketing' | 'financial'

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'