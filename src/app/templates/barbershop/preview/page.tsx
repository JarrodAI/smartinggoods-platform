import Link from 'next/link'
import { Calendar, Phone, Mail, MapPin, Star, Clock, Scissors } from 'lucide-react'

export default function BarbershopPreview() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white border-b-4 border-amber-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
                <Scissors className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Classic Cuts Barbershop</h1>
                <p className="text-sm text-gray-400">Traditional Barbering Since 2010</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#services" className="hover:text-amber-500 transition">Services</a>
              <a href="#barbers" className="hover:text-amber-500 transition">Our Barbers</a>
              <a href="#gallery" className="hover:text-amber-500 transition">Gallery</a>
              <a href="#contact" className="hover:text-amber-500 transition">Contact</a>
            </nav>
            <Link 
              href="/builder/barbershop"
              className="bg-amber-500 text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-amber-400 transition"
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-3xl px-4">
            <div className="inline-block mb-6">
              <div className="flex items-center gap-3 bg-amber-500 px-6 py-2 rounded-full">
                <Scissors className="w-6 h-6 text-gray-900" />
                <span className="font-bold text-gray-900">WALK-INS WELCOME</span>
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Classic Cuts,<br />Modern Style
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Expert barbering services in a traditional atmosphere
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/builder/barbershop"
                className="bg-amber-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition"
              >
                Book Appointment
              </Link>
              <Link 
                href="#services"
                className="bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Scissors className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Master Barbers</h3>
              <p className="text-gray-600">Skilled professionals with years of experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Premium Service</h3>
              <p className="text-gray-600">Hot towel shaves and luxury treatments</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Walk-Ins Welcome</h3>
              <p className="text-gray-600">No appointment needed, but booking recommended</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Easy Booking</h3>
              <p className="text-gray-600">Book online or call us anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Traditional barbering with modern techniques</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Classic Haircut', price: '$35', icon: '✂️', desc: 'Traditional cut with hot towel finish' },
              { name: 'Beard Trim & Shape', price: '$25', icon: '🪒', desc: 'Professional beard grooming' },
              { name: 'Hot Towel Shave', price: '$45', icon: '🔥', desc: 'Luxury straight razor shave' },
              { name: 'Haircut & Beard Combo', price: '$55', icon: '💈', desc: 'Complete grooming package' },
              { name: 'Kids Haircut', price: '$25', icon: '👦', desc: 'Ages 12 and under' },
              { name: 'Senior Haircut', price: '$30', icon: '👴', desc: 'Ages 65 and over' }
            ].map((service, i) => (
              <div key={i} className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition border-t-4 border-amber-500">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <p className="text-3xl font-bold text-amber-600">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers */}
      <section id="barbers" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Master Barbers</h2>
            <p className="text-xl text-gray-600">Experienced professionals dedicated to your style</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Mike Johnson', role: 'Master Barber', years: '15 Years Experience' },
              { name: 'Tony Martinez', role: 'Senior Barber', years: '12 Years Experience' },
              { name: 'James Wilson', role: 'Barber', years: '8 Years Experience' },
              { name: 'Chris Anderson', role: 'Barber', years: '6 Years Experience' }
            ].map((barber, i) => (
              <div key={i} className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900">{barber.name}</h3>
                <p className="text-amber-600 font-bold">{barber.role}</p>
                <p className="text-gray-600">{barber.years}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Work</h2>
            <p className="text-xl text-gray-600">See the quality cuts we deliver</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready for a Fresh Cut?</h2>
          <p className="text-xl mb-8 text-gray-300">Walk in or book your appointment today</p>
          <Link 
            href="/builder/barbershop"
            className="bg-amber-500 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-amber-400 transition inline-block"
          >
            Book Your Appointment
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Visit Us</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Address</p>
                    <p className="text-gray-600">456 Main Street, Brooklyn, NY 11201</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Phone</p>
                    <p className="text-gray-600">(555) 987-6543</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Email</p>
                    <p className="text-gray-600">info@classiccuts.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Hours</p>
                    <p className="text-gray-600">Mon-Fri: 9AM-7PM</p>
                    <p className="text-gray-600">Saturday: 8AM-6PM</p>
                    <p className="text-gray-600">Sunday: 10AM-4PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Online</h3>
              <p className="text-gray-600 mb-6">Reserve your spot with your favorite barber</p>
              <div className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border" />
                <input type="tel" placeholder="Phone" className="w-full px-4 py-3 rounded-lg border" />
                <select className="w-full px-4 py-3 rounded-lg border">
                  <option>Select Service</option>
                  <option>Classic Haircut</option>
                  <option>Beard Trim & Shape</option>
                  <option>Hot Towel Shave</option>
                  <option>Haircut & Beard Combo</option>
                  <option>Kids Haircut</option>
                </select>
                <select className="w-full px-4 py-3 rounded-lg border">
                  <option>Select Barber</option>
                  <option>Mike Johnson</option>
                  <option>Tony Martinez</option>
                  <option>James Wilson</option>
                  <option>Chris Anderson</option>
                </select>
                <Link 
                  href="/builder/barbershop"
                  className="w-full bg-amber-500 text-gray-900 px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition block text-center"
                >
                  Request Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t-4 border-amber-500">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
              <Scissors className="w-5 h-5 text-gray-900" />
            </div>
            <span className="text-xl font-bold">Classic Cuts Barbershop</span>
          </div>
          <p className="text-gray-400 mb-4">Traditional Barbering Since 2010</p>
          <p className="text-gray-500 text-sm">© 2025 Classic Cuts Barbershop. All rights reserved.</p>
          <div className="mt-6">
            <Link 
              href="/builder/barbershop"
              className="text-amber-500 hover:text-amber-400 transition"
            >
              Build Your Own Barbershop Website →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
