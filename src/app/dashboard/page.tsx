'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  Globe, 
  Settings, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Edit3, 
  Plus,
  Calendar,
  MessageSquare,
  Star
} from 'lucide-react'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/dashboard/website/edit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Website
              </Link>
              <Link 
                href="/dashboard/website/preview"
                className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'overview' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('website')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'website' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Website
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Bookings
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'customers' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Customers
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-3 ${
                    activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">$12,847</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+12.5%</span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Website Visitors</p>
                        <p className="text-2xl font-bold text-gray-900">2,847</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+8.2%</span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">New Bookings</p>
                        <p className="text-2xl font-bold text-gray-900">127</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">+15.3%</span>
                      <span className="text-sm text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Customer Rating</p>
                        <p className="text-2xl font-bold text-gray-900">4.9</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm text-gray-600">Based on 284 reviews</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Sarah Johnson', service: 'Gel Manicure', time: '2:00 PM', status: 'confirmed' },
                        { name: 'Emily Davis', service: 'Pedicure', time: '3:30 PM', status: 'pending' },
                        { name: 'Jessica Wilson', service: 'Nail Art', time: '4:00 PM', status: 'confirmed' },
                      ].map((booking, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{booking.name}</p>
                            <p className="text-sm text-gray-600">{booking.service} - {booking.time}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
                    <div className="space-y-4">
                      {[
                        { name: 'Maria Garcia', rating: 5, comment: 'Amazing service! Love my new nails.' },
                        { name: 'Ashley Brown', rating: 5, comment: 'Professional and friendly staff.' },
                        { name: 'Lisa Chen', rating: 4, comment: 'Great experience, will come back!' },
                      ].map((review, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium">{review.name}</p>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'website' && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Website Management</h2>
                  <div className="flex gap-3">
                    <Link 
                      href="/dashboard/website/edit"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium"
                    >
                      Edit Content
                    </Link>
                    <Link 
                      href="/dashboard/website/preview"
                      className="border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium"
                    >
                      Preview
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Website Status</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Live & Active</span>
                    </div>
                    <p className="text-sm text-gray-600">Your website is live at: yoursite.smartinggoods.com</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">Performance</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Page Speed</span>
                        <span className="text-green-600 font-medium">95/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>SEO Score</span>
                        <span className="text-green-600 font-medium">88/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add more tab content as needed */}
          </div>
        </div>
      </div>
    </div>
  )
}