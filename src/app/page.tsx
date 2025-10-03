import Link from 'next/link'
import { ArrowRight, Laptop, Code, TrendingUp, Zap, MousePointer, CheckCircle } from 'lucide-react'
import ReviewsCarousel from '@/components/reviews-carousel'
import InteractiveBall from '@/components/3d/InteractiveBall'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-background -z-10"></div>
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-200/30 dark:bg-blue-900/10 blur-3xl"></div>
          <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full bg-purple-200/30 dark:bg-purple-900/10 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Intelligent Design{' '}
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  Ai Hosting System
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                We help businesses build and deploy cutting edge software technologies ( Android, iOS, Web Applications) with State of The Art Ai Coding IDE Baked into your VPS Server
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link 
                  href="/intelligent-system"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8"
                >
                  Inteligent System
                </Link>
              </div>
            </div>
            
            <div className="relative h-[500px] w-full">
              <div className="absolute w-full h-full">
                <div className="relative w-full h-full overflow-hidden rounded-2xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <InteractiveBall />
                  </div>
                  
                  <div className="absolute bottom-6 left-6 bg-white dark:bg-card p-4 rounded-lg shadow-lg z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Global Reach</p>
                        <p className="text-xs text-muted-foreground">Serving clients worldwide</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-6 right-6 bg-white dark:bg-card p-4 rounded-lg shadow-lg z-10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">International Growth</p>
                        <p className="text-xs text-muted-foreground">Expanding to new markets</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Digital Marketing Services</h2>
            <p className="text-muted-foreground text-lg">Comprehensive solutions to establish and grow your online presence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Website Design */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="mb-4">
                  <Laptop className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold">Website Design</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">Beautiful, responsive websites that convert visitors into customers.</p>
              </div>
              <div className="flex items-center p-6 pt-0">
                <Link href="/services/web-design" className="group flex items-center text-primary font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Website Development */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="mb-4">
                  <Code className="h-10 w-10 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold">Website Development</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">Custom web applications and e-commerce solutions built with modern technologies.</p>
              </div>
              <div className="flex items-center p-6 pt-0">
                <Link href="/services/web-development" className="group flex items-center text-primary font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Online Marketing */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="mb-4">
                  <TrendingUp className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-xl font-bold">Online Marketing</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">SEO, PPC, and content marketing strategies to drive targeted traffic.</p>
              </div>
              <div className="flex items-center p-6 pt-0">
                <Link href="/services/online-marketing" className="group flex items-center text-primary font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* AI Social Media */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="mb-4">
                  <Zap className="h-10 w-10 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold">AI Social Media</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">AI-powered social media management to grow your audience and engagement.</p>
              </div>
              <div className="flex items-center p-6 pt-0">
                <Link href="/services/ai-social-media" className="group flex items-center text-primary font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Domain Names */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="mb-4">
                  <MousePointer className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold">Domain Names</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">Find and secure the perfect domain name for your business.</p>
              </div>
              <div className="flex items-center p-6 pt-0">
                <Link href="/services/domain-names" className="group flex items-center text-primary font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Hosting Services */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="mb-4">
                  <CheckCircle className="h-10 w-10 text-teal-500" />
                </div>
                <h3 className="text-xl font-bold">Hosting Services</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-muted-foreground">Fast, secure, and reliable hosting for your website or application.</p>
              </div>
              <div className="flex items-center p-6 pt-0">
                <Link href="/services/hosting" className="group flex items-center text-primary font-medium">
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/services"
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 group"
            >
              View All Services
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsCarousel />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join 10,000+ successful business owners who chose SmartingGoods to grow their revenue and streamline operations.
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