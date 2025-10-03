'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Globe, 
  DollarSign, 
  TrendingUp, 
  Heart, 
  Star,
  Phone,
  Mail,
  Calendar,
  Award
} from 'lucide-react'

export default function SuccessMetricsPage() {
  const [metrics, setMetrics] = useState({
    totalCustomers: 0,
    activeWebsites: 0,
    customerRevenue: 0,
    customerSatisfaction: 0,
    websitesLaunched: 0,
    supportTickets: 0,
    successStories: 0,
    averageTimeToLaunch: 0
  })

  useEffect(() => {
    // Simulate loading metrics
    setMetrics({
      totalCustomers: 1247,
      activeWebsites: 1189,
      customerRevenue: 487650,
      customerSatisfaction: 4.8,
      websitesLaunched: 1356,
      supportTickets: 23,
      successStories: 89,
      averageTimeToLaunch: 18 // hours
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Success Metrics Dashboard</h1>
              <p className="text-gray-600 mt-2">Tracking how we're helping people build their dreams</p>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Heart className="h-6 w-6" />
              <span className="font-semibold">Helping People Succeed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Users}
            title="Total Customers"
            value={metrics.totalCustomers.toLocaleString()}
            subtitle="Small businesses helped"
            color="blue"
            trend="+12% this month"
          />
          <MetricCard
            icon={Globe}
            title="Active Websites"
            value={metrics.activeWebsites.toLocaleString()}
            subtitle="Websites currently live"
            color="green"
            trend="+8% this month"
          />
          <MetricCard
            icon={DollarSign}
            title="Customer Revenue"
            value={`$${(metrics.customerRevenue / 1000).toFixed(0)}K`}
            subtitle="Generated for customers"
            color="purple"
            trend="+23% this month"
          />
          <MetricCard
            icon={Star}
            title="Satisfaction Score"
            value={metrics.customerSatisfaction.toFixed(1)}
            subtitle="Out of 5.0 stars"
            color="yellow"
            trend="↑ 0.2 this month"
          />
        </div>

        {/* Impact Metrics */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Impact on Small Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.websitesLaunched}</div>
              <div className="text-gray-600">Websites Launched</div>
              <div className="text-sm text-green-600 mt-1">Average: {metrics.averageTimeToLaunch} hours to launch</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">73%</div>
              <div className="text-gray-600">Report Increased Sales</div>
              <div className="text-sm text-green-600 mt-1">Within 3 months of launch</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.successStories}</div>
              <div className="text-gray-600">Success Stories</div>
              <div className="text-sm text-green-600 mt-1">Documented customer wins</div>
            </div>
          </div>
        </div>

        {/* Customer Support Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Support</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Open Support Tickets</span>
                </div>
                <span className="font-semibold text-gray-900">{metrics.supportTickets}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Average Response Time</span>
                </div>
                <span className="font-semibold text-gray-900">1.2 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                  <span className="text-gray-700">Resolution Rate</span>
                </div>
                <span className="font-semibold text-gray-900">97.3%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Journey</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Trial to Paid Conversion</span>
                <span className="font-semibold text-green-600">28.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Monthly Churn Rate</span>
                <span className="font-semibold text-red-600">3.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Average Customer Lifetime</span>
                <span className="font-semibold text-gray-900">18 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Net Promoter Score</span>
                <span className="font-semibold text-green-600">67</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Success Stories */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {successStories.map((story, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <story.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{story.business}</div>
                    <div className="text-sm text-gray-600">{story.type}</div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{story.result}</p>
                <div className="text-sm text-green-600 font-medium">{story.metric}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals and Targets */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mt-8">
          <h2 className="text-2xl font-bold mb-6">Our Mission Goals for 2024</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">10,000</div>
              <div className="text-blue-100">Small Businesses Helped</div>
              <div className="text-sm text-blue-200 mt-1">Currently: {metrics.totalCustomers}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">$50M</div>
              <div className="text-blue-100">Revenue Generated for Customers</div>
              <div className="text-sm text-blue-200 mt-1">Currently: ${(metrics.customerRevenue / 1000000).toFixed(1)}M</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">25,000</div>
              <div className="text-blue-100">Jobs Supported</div>
              <div className="text-sm text-blue-200 mt-1">Through customer growth</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">500</div>
              <div className="text-blue-100">Communities Strengthened</div>
              <div className="text-sm text-blue-200 mt-1">Local business ecosystems</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: any
  title: string
  value: string
  subtitle: string
  color: 'blue' | 'green' | 'purple' | 'yellow'
  trend: string
}

function MetricCard({ icon: Icon, title, value, subtitle, color, trend }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-sm text-green-600 font-medium">{trend}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-gray-600 text-sm">{subtitle}</div>
    </div>
  )
}

const successStories = [
  {
    icon: Users,
    business: "Bella's Nail Spa",
    type: "Nail Salon",
    result: "Increased bookings by 150% after launching their website with online booking.",
    metric: "+150% bookings in 2 months"
  },
  {
    icon: Globe,
    business: "Downtown Fitness",
    type: "Gym",
    result: "Attracted 50+ new members through their professional website and class schedules.",
    metric: "+50 new members"
  },
  {
    icon: DollarSign,
    business: "Artisan Interiors",
    type: "Interior Design",
    result: "Won 3 high-end projects worth $75K total through their portfolio website.",
    metric: "+$75K in new projects"
  },
  {
    icon: Star,
    business: "Maria's Restaurant",
    type: "Restaurant",
    result: "Online orders increased 200% with their new menu and ordering system.",
    metric: "+200% online orders"
  },
  {
    icon: TrendingUp,
    business: "Elite Real Estate",
    type: "Real Estate",
    result: "Closed 5 luxury listings after showcasing properties on their new website.",
    metric: "5 luxury listings sold"
  },
  {
    icon: Heart,
    business: "Paws & Claws Vet",
    type: "Veterinary",
    result: "Appointment bookings up 80% with online scheduling and pet care tips.",
    metric: "+80% appointments"
  }
]