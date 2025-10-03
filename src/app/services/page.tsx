import Link from 'next/link'
import { ArrowRight, Laptop, Code, TrendingUp, Zap, MousePointer, CheckCircle, Check } from 'lucide-react'

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Digital Marketing Services That{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Drive Results
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              From stunning website design to AI-powered marketing automation, we provide everything your business needs to dominate online.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-8 rounded-lg text-lg"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Website Design */}
            <div className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Laptop className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Website Design</h3>
                <p className="text-muted-foreground">
                  Beautiful, conversion-focused websites that make your business stand out and turn visitors into customers.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Custom responsive design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Mobile-first approach</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SEO optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Fast loading speeds</span>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="text-3xl font-bold mb-2">$2,999</div>
                <p className="text-sm text-muted-foreground mb-4">Starting price</p>
                <Link 
                  href="/services/web-design"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Website Development */}
            <div className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Code className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Website Development</h3>
                <p className="text-muted-foreground">
                  Custom web applications and e-commerce solutions built with cutting-edge technology.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Custom functionality</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">E-commerce integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Database management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">API integrations</span>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="text-3xl font-bold mb-2">$4,999</div>
                <p className="text-sm text-muted-foreground mb-4">Starting price</p>
                <Link 
                  href="/services/web-development"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Online Marketing */}
            <div className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Online Marketing</h3>
                <p className="text-muted-foreground">
                  Comprehensive digital marketing strategies that drive traffic, leads, and sales.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SEO optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Google Ads management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Content marketing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Analytics & reporting</span>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="text-3xl font-bold mb-2">$1,999</div>
                <p className="text-sm text-muted-foreground mb-4">Per month</p>
                <Link 
                  href="/services/online-marketing"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* AI Social Media */}
            <div className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">AI Social Media</h3>
                <p className="text-muted-foreground">
                  AI-powered social media management that grows your audience and engagement automatically.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">AI content creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Automated posting</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Engagement optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Performance analytics</span>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="text-3xl font-bold mb-2">$799</div>
                <p className="text-sm text-muted-foreground mb-4">Per month</p>
                <Link 
                  href="/services/ai-social-media"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Domain Names */}
            <div className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <MousePointer className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Domain Names</h3>
                <p className="text-muted-foreground">
                  Find and secure the perfect domain name for your business with our domain services.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Domain search & registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">DNS management</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Domain transfers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Privacy protection</span>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="text-3xl font-bold mb-2">$12.99</div>
                <p className="text-sm text-muted-foreground mb-4">Per year</p>
                <Link 
                  href="/services/domain-names"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Hosting Services */}
            <div className="bg-card border rounded-xl p-8 hover:shadow-lg transition-all duration-300">
              <div className="mb-6">
                <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Hosting Services</h3>
                <p className="text-muted-foreground">
                  Fast, secure, and reliable hosting solutions that keep your website running smoothly.
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">99.9% uptime guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">SSL certificates included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Daily backups</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">24/7 support</span>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="text-3xl font-bold mb-2">$29.99</div>
                <p className="text-sm text-muted-foreground mb-4">Per month</p>
                <Link 
                  href="/services/hosting"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's discuss your project and create a custom solution that drives real results for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Get Free Consultation
            </Link>
            <Link 
              href="/templates"
              className="border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}