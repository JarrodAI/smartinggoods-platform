import Link from 'next/link'
import { 
  Zap, 
  Globe, 
  Smartphone, 
  CreditCard, 
  MessageSquare, 
  BarChart3,
  Shield,
  Rocket,
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  TrendingUp
} from 'lucide-react'

export default function BuiltWithMePage() {
  const integrations = [
    { name: 'Stripe', category: 'Payments', icon: '💳', status: 'active' },
    { name: 'Google Analytics', category: 'Analytics', icon: '📊', status: 'active' },
    { name: 'Mailchimp', category: 'Email', icon: '📧', status: 'active' },
    { name: 'Twilio', category: 'SMS', icon: '📱', status: 'active' },
    { name: 'Facebook Pixel', category: 'Advertising', icon: '📈', status: 'active' },
    { name: 'Google My Business', category: 'Reviews', icon: '⭐', status: 'active' },
    { name: 'Calendly', category: 'Booking', icon: '📅', status: 'active' },
    { name: 'Trustpilot', category: 'Reviews', icon: '🏆', status: 'active' },
    { name: 'Intercom', category: 'Support', icon: '💬', status: 'active' },
    { name: 'Cloudflare', category: 'Security', icon: '🛡️', status: 'active' },
    { name: 'AWS S3', category: 'Storage', icon: '☁️', status: 'active' },
    { name: 'SendGrid', category: 'Email', icon: '✉️', status: 'active' }
  ]

  const features = [
    {
      title: 'Lightning-Fast Performance',
      description: 'AVIF video backgrounds, edge computing, and sub-1-second load times',
      icon: <Zap className="w-8 h-8" />,
      color: 'yellow'
    },
    {
      title: 'Global Reach',
      description: 'CDN distribution, multi-language support, and international payments',
      icon: <Globe className="w-8 h-8" />,
      color: 'blue'
    },
    {
      title: 'Mobile-First Design',
      description: 'Responsive templates optimized for all devices and screen sizes',
      icon: <Smartphone className="w-8 h-8" />,
      color: 'green'
    },
    {
      title: 'Advanced Payment Processing',
      description: '0% credit card fees, crypto payments, and automated billing',
      icon: <CreditCard className="w-8 h-8" />,
      color: 'purple'
    },
    {
      title: 'Omnichannel Communication',
      description: 'SMS, email, push notifications, and live chat integration',
      icon: <MessageSquare className="w-8 h-8" />,
      color: 'pink'
    },
    {
      title: 'Business Intelligence',
      description: 'Advanced analytics, predictive insights, and ROI tracking',
      icon: <BarChart3 className="w-8 h-8" />,
      color: 'indigo'
    }
  ]

  const stats = [
    { label: 'Active Integrations', value: '50+', icon: <Zap className="w-6 h-6" /> },
    { label: 'Business Templates', value: '25+', icon: <Globe className="w-6 h-6" /> },
    { label: 'Happy Customers', value: '10,000+', icon: <Users className="w-6 h-6" /> },
    { label: 'Average ROI Increase', value: '300%', icon: <TrendingUp className="w-6 h-6" /> }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border mb-8">
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Built with cutting-edge technology</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Built With{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                SmartingGoods
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover the powerful technology stack and integrations that make SmartingGoods 
              the fastest, most comprehensive business platform available.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/templates"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-8 rounded-lg"
              >
                Explore Templates
              </Link>
              <Link 
                href="/contact"
                className="border border-input hover:bg-accent font-medium py-3 px-8 rounded-lg"
              >
                Get Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powered by Advanced Technology
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Every feature is built with performance, scalability, and user experience in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-lg transition-all duration-300">
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${
                    feature.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                    feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    feature.color === 'green' ? 'bg-green-100 text-green-600' :
                    feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    feature.color === 'pink' ? 'bg-pink-100 text-pink-600' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                50+ Premium Integrations
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with all the tools your business already uses, plus discover new ones that will accelerate your growth.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {integrations.map((integration, index) => (
                <div key={index} className="bg-card rounded-lg p-4 border hover:shadow-md transition-all duration-300 text-center">
                  <div className="text-2xl mb-2">{integration.icon}</div>
                  <h4 className="font-semibold text-sm mb-1">{integration.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{integration.category}</p>
                  <div className="flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 ml-1">Active</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Don't see the integration you need? We add new ones every month.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
              >
                Request Integration
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Performance That Beats the Competition
              </h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Our platform delivers Shopify-level performance with advanced features that set your business apart.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">&lt;1s</div>
                <p className="text-lg opacity-90">Page Load Time</p>
                <p className="text-sm opacity-75">Faster than 95% of websites</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">99.99%</div>
                <p className="text-lg opacity-90">Uptime Guarantee</p>
                <p className="text-sm opacity-75">4 minutes downtime/month max</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">95+</div>
                <p className="text-lg opacity-90">PageSpeed Score</p>
                <p className="text-sm opacity-75">Google Core Web Vitals optimized</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">0%</div>
                <p className="text-lg opacity-90">Credit Card Fees</p>
                <p className="text-sm opacity-75">Legal loophole + cash back</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built on Modern Technology
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We use the latest technologies to ensure your business stays ahead of the curve.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4">Frontend Technology</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Next.js 14 with App Router
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    TypeScript for type safety
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Tailwind CSS for styling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    AVIF image/video optimization
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4">Backend & Database</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    PostgreSQL database
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Redis caching layer
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    API-first architecture
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Microservices design
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-xl p-6 border">
                <h3 className="text-xl font-bold mb-4">Security & Performance</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    SSL encryption everywhere
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    DDoS protection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Edge computing deployment
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automated backups
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Real Results for Real Businesses
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our platform doesn't just look good - it delivers measurable business growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-2">400%</div>
                <p className="text-muted-foreground">Average Booking Increase</p>
                <p className="text-sm text-muted-foreground mt-2">Nail salons & spas</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-2">250%</div>
                <p className="text-muted-foreground">Revenue Growth</p>
                <p className="text-sm text-muted-foreground mt-2">Fitness centers</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-2">300%</div>
                <p className="text-muted-foreground">Online Orders Increase</p>
                <p className="text-sm text-muted-foreground mt-2">Restaurants</p>
              </div>
              
              <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <div className="text-4xl font-bold text-primary mb-2">180%</div>
                <p className="text-muted-foreground">Client Acquisition</p>
                <p className="text-sm text-muted-foreground mt-2">Professional services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Success Story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join the thousands of business owners who chose SmartingGoods to transform their digital presence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/templates"
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg"
            >
              Start Building
            </Link>
            <Link 
              href="/contact"
              className="border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-8 rounded-lg"
            >
              Talk to Expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}