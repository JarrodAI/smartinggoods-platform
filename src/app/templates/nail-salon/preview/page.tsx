import Link from 'next/link'
import { Sparkles, Phone, MapPin, Clock, Star, Heart, Award, X } from 'lucide-react'

export default function NailSalonPreview() {
  return (
    <div className="min-h-screen bg-white">
      {/* Preview Banner */}
      <div className="sticky top-0 z-[100] bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-5 w-5 text-pink-200" />
              <div className="text-sm sm:text-base">
                <span className="font-medium">You're viewing a live preview of the Nail Salon template</span>
                <span className="hidden sm:inline text-pink-100 ml-2">Ready to create your own website?</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/signup/flow?template=nail-salon"
                className="inline-flex items-center justify-center whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 rounded-md px-3 bg-white text-pink-600 hover:bg-pink-50 font-medium"
              >
                Use This Template
              </Link>
              <button className="text-pink-200 hover:text-white transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="bg-pink-50 border-b border-pink-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-2 text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-pink-600">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2 text-pink-600">
                  <MapPin className="h-4 w-4" />
                  <span>123 Main St, City, State 12345</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-pink-600">
                <Clock className="h-4 w-4" />
                <span>Mon-Sat: 9AM-7PM</span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-pink-600">✨ Your Business</div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-sm font-medium transition-colors hover:text-pink-600 text-pink-600 border-b-2 border-pink-600 pb-1">
                Home
              </button>
              <button className="text-sm font-medium transition-colors hover:text-pink-600 text-gray-700">
                Services
              </button>
              <button className="text-sm font-medium transition-colors hover:text-pink-600 text-gray-700">
                Book Now
              </button>
              <button className="text-sm font-medium transition-colors hover:text-pink-600 text-gray-700">
                About
              </button>
              <button className="text-sm font-medium transition-colors hover:text-pink-600 text-gray-700">
                Contact
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/templates/nail-salon/preview/auth/login">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                  Sign In
                </button>
              </Link>
              <Link href="/templates/nail-salon/preview/auth/signup">
                <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-9 rounded-md px-3 bg-pink-600 hover:bg-pink-700">
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-gradient-to-r from-pink-100 to-purple-100 text-pink-800 border-pink-200 shadow-sm">
                    <Sparkles className="h-4 w-4 mr-1 animate-pulse" />
                    Premium Nail Care Experience
                  </div>
                  
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="text-gray-900">Welcome to</span>
                    <br />
                    <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Your Business
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                    Welcome to our business! We provide exceptional services to our valued customers.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="flex -space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm font-medium">4.9/5 Rating</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="h-5 w-5 text-pink-500" />
                    <span className="text-sm font-medium">5000+ Happy Clients</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Award className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-medium">Award Winning</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-12 rounded-lg px-8 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-lg">
                    Book Appointment
                  </button>
                  <button className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 rounded-lg px-8">
                    View Services
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                        <Sparkles className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Premium Services</h3>
                      <p className="text-gray-600">Professional nail care and beauty treatments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}