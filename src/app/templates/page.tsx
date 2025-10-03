import Link from 'next/link'
import { Eye, Download, Star, Users } from 'lucide-react'

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Website Templates</h1>
            <p className="text-xl text-muted-foreground">
              Professional website templates ready to use for your business
            </p>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Nail Salon Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">💅</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Nail Salon & Spa</h3>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">
                  Free
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-yellow-100 text-yellow-800">
                  Featured
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/nail-salon/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/builder/nail-salon"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Nail Salon & Spa</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Elegant beauty salon website with appointment booking, service management, and admin dashboard. 
                Perfect for nail salons, spas, and beauty businesses.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Gallery
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Booking System
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  POS Integration
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>127 sites created</span>
                </div>
                <Link 
                  href="/templates/nail-salon"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Restaurant Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Restaurant & Cafe</h3>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs">
                  Popular
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/restaurant/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/signup/flow?template=restaurant"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Restaurant & Cafe</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Beautiful restaurant website with online menu, table reservations, and food delivery integration. 
                Perfect for restaurants, cafes, and food businesses.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Online Menu
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Reservations
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Delivery
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>89 sites created</span>
                </div>
                <Link 
                  href="/templates/restaurant"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Fitness Center Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">💪</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Fitness Center</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/fitness/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/signup/flow?template=fitness"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Fitness Center</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.7</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Dynamic fitness website with class schedules, membership plans, and trainer profiles. 
                Perfect for gyms, yoga studios, and fitness centers.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Class Schedule
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Memberships
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Trainers
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>64 sites created</span>
                </div>
                <Link 
                  href="/templates/fitness"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Retail Store Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">🛍️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Retail Store</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/retail/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/signup/flow?template=retail"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Retail Store</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.6</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern e-commerce website with product catalog, shopping cart, and inventory management. 
                Perfect for retail stores, boutiques, and online shops.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  E-commerce
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Inventory
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Payments
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>156 sites created</span>
                </div>
                <Link 
                  href="/templates/retail"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Beauty Salon Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-rose-100 to-pink-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">✨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Beauty Salon</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/beauty-salon/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/signup/flow?template=beauty-salon"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Beauty Salon</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Elegant beauty salon website with service booking, stylist profiles, and before/after galleries. 
                Perfect for hair salons, beauty parlors, and wellness centers.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Stylists
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Gallery
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Booking
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>93 sites created</span>
                </div>
                <Link 
                  href="/templates/beauty-salon"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Barbershop Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-500 rounded-lg flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">✂️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Barbershop</h3>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-amber-100 text-amber-800">
                  New
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/barbershop/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/builder/barbershop"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Barbershop</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Classic barbershop website with online booking, barber profiles, and service menu. 
                Perfect for traditional barbershops and men's grooming salons.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Barbers
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Walk-ins
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Hot Towel
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>45 sites created</span>
                </div>
                <Link 
                  href="/templates/barbershop"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Gym Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-blue-600 to-cyan-600 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">💪</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">Gym & Fitness</h3>
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-xs bg-blue-100 text-blue-800">
                  New
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/gym/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/builder/gym"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Gym & Fitness</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern fitness center website with class schedules, trainer profiles, and membership plans. 
                Perfect for gyms, fitness studios, and wellness centers.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Classes
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Trainers
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  24/7 Access
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>38 sites created</span>
                </div>
                <Link 
                  href="/templates/gym"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Professional Services Template */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-cyan-100 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                    <span className="text-2xl">💼</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Professional Services</h3>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Link 
                  href="/templates/professional/preview"
                  target="_blank"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
                <Link 
                  href="/signup/flow?template=professional"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Use Template
                </Link>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight text-xl">Professional Services</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>4.7</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Clean professional website with consultation booking, service packages, and client testimonials. 
                Perfect for consultants, lawyers, accountants, and service providers.
              </p>
            </div>
            
            <div className="p-6 pt-0">
              <div className="flex flex-wrap gap-1 mb-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Consultations
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Testimonials
                </div>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground text-xs">
                  Packages
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>78 sites created</span>
                </div>
                <Link 
                  href="/templates/professional"
                  className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}