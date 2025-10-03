import Link from 'next/link'
import { Search, Book, Video, MessageCircle, Phone, Mail } from 'lucide-react'

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to create and manage your website
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Start Guide */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">New to SmartingGoods?</h2>
              <p className="text-blue-100 mb-4">
                Get your website up and running in just 10 minutes with our step-by-step guide.
              </p>
              <Link 
                href="/help/quick-start"
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Start Quick Guide
              </Link>
            </div>
            <div className="hidden md:block">
              <Video className="h-16 w-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTopics.map((topic, index) => (
              <Link
                key={index}
                href={topic.href}
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className="flex items-center mb-4">
                  <topic.icon className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{topic.description}</p>
                <div className="text-sm text-blue-600 font-medium">
                  {topic.articles} articles →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center mb-4">
                  <category.icon className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <Link
                        href={article.href}
                        className="text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={category.viewAllHref}
                  className="text-blue-600 font-medium mt-4 inline-block hover:text-blue-700"
                >
                  View all {category.title.toLowerCase()} articles →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Still Need Help?</h2>
            <p className="text-gray-600">
              Our support team is here to help you succeed. Choose the best way to reach us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">
                Get instant help from our support team
              </p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Chat
              </button>
              <p className="text-sm text-gray-500 mt-2">Available 9 AM - 6 PM EST</p>
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Mail className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">
                Send us a detailed message
              </p>
              <Link
                href="mailto:support@smartinggoods.com"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Send Email
              </Link>
              <p className="text-sm text-gray-500 mt-2">Response within 2 hours</p>
            </div>
            
            <div className="text-center p-6 border border-gray-200 rounded-lg">
              <Phone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
              <p className="text-gray-600 mb-4">
                Talk to a real person (Premium customers)
              </p>
              <Link
                href="/consultation"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-block"
              >
                Schedule Call
              </Link>
              <p className="text-sm text-gray-500 mt-2">Free 15-minute consultation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const popularTopics = [
  {
    icon: Book,
    title: "Getting Started",
    description: "Learn the basics of creating your first website",
    articles: "8",
    href: "/help/getting-started"
  },
  {
    icon: Video,
    title: "Template Customization",
    description: "How to customize your template with your business info",
    articles: "12",
    href: "/help/customization"
  },
  {
    icon: Search,
    title: "SEO & Marketing",
    description: "Get more customers with better search rankings",
    articles: "6",
    href: "/help/seo-marketing"
  }
]

const categories = [
  {
    icon: Book,
    title: "Getting Started",
    viewAllHref: "/help/getting-started",
    articles: [
      { title: "How to choose the right template", href: "/help/choosing-template" },
      { title: "Setting up your business information", href: "/help/business-info" },
      { title: "Customizing your website design", href: "/help/design-customization" },
      { title: "Publishing your website", href: "/help/publishing" }
    ]
  },
  {
    icon: Video,
    title: "Website Management",
    viewAllHref: "/help/management",
    articles: [
      { title: "Updating your content", href: "/help/updating-content" },
      { title: "Managing your services and pricing", href: "/help/services-pricing" },
      { title: "Adding photos and galleries", href: "/help/photos-galleries" },
      { title: "Setting up appointment booking", href: "/help/appointment-booking" }
    ]
  },
  {
    icon: Search,
    title: "SEO & Marketing",
    viewAllHref: "/help/seo-marketing",
    articles: [
      { title: "Optimizing for search engines", href: "/help/seo-optimization" },
      { title: "Setting up Google My Business", href: "/help/google-my-business" },
      { title: "Social media integration", href: "/help/social-media" },
      { title: "Tracking your website performance", href: "/help/analytics" }
    ]
  },
  {
    icon: MessageCircle,
    title: "Account & Billing",
    viewAllHref: "/help/account-billing",
    articles: [
      { title: "Managing your subscription", href: "/help/subscription" },
      { title: "Updating payment information", href: "/help/payment-info" },
      { title: "Connecting a custom domain", href: "/help/custom-domain" },
      { title: "Downloading your website", href: "/help/download-website" }
    ]
  }
]