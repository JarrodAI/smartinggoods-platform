import Link from 'next/link'
import { Calendar, Phone, Mail, MapPin, Star, Clock, Award } from 'lucide-react'

export default function BeautySalonPreview() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Glamour Beauty Salon</h1>
                <p className="text-sm text-rose-100">Where Beauty Meets Excellence</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#services" className="hover:text-rose-200 transition">Services</a>
              <a href="#stylists" className="hover:text-rose-200 transition">Our Team</a>
              <a href="#gallery" className="hover:text-rose-200 transition">Gallery</a>
              <a href="#contact" className="hover:text-rose-200 transition">Contact</a>
            </nav>
            <Link 
              href="/builder/beauty-salon"
              className="bg-white text-rose-600 px-6 py-2 rounded-full font-semibold hover:bg-rose-50 transition"
            >
              Book Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-3xl px-4">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Transform Your Look,<br />Elevate Your Confidence
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Expert hair styling, coloring, and beauty treatments in a luxurious setting
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/builder/beauty-salon"
                className="bg-rose-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-700 transition"
              >
                Book Appointment
              </Link>
              <Link 
                href="#services"
                className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition border-2 border-rose-600"
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
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Expert Stylists</h3>
              <p className="text-gray-600">Certified professionals with 10+ years experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Products</h3>
              <p className="text-gray-600">Only the finest salon-grade products</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Flexible Hours</h3>
              <p className="text-gray-600">Open 7 days a week for your convenience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
              <p className="text-gray-600">Book online 24/7 or call us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600">Comprehensive beauty treatments tailored to you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Hair Styling & Cuts', price: 'From $65', icon: '💇‍♀️', desc: 'Expert cuts, styling, and blowouts' },
              { name: 'Hair Coloring', price: 'From $120', icon: '🎨', desc: 'Full color, highlights, balayage' },
              { name: 'Hair Treatments', price: 'From $80', icon: '✨', desc: 'Deep conditioning, keratin, repair' },
              { name: 'Makeup Services', price: 'From $75', icon: '💄', desc: 'Special occasion and bridal makeup' },
              { name: 'Facial Treatments', price: 'From $90', icon: '🧖‍♀️', desc: 'Cleansing, anti-aging, hydration' },
              { name: 'Waxing & Threading', price: 'From $15', icon: '🌟', desc: 'Professional hair removal services' }
            ].map((service, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.desc}</p>
                <p className="text-2xl font-bold text-rose-600">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stylists */}
      <section id="stylists" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
            <p className="text-xl text-gray-600">Passionate professionals dedicated to your beauty</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Master Stylist', specialty: 'Color Specialist' },
              { name: 'Emily Chen', role: 'Senior Stylist', specialty: 'Cutting Expert' },
              { name: 'Maria Garcia', role: 'Makeup Artist', specialty: 'Bridal Makeup' },
              { name: 'Jessica Lee', role: 'Esthetician', specialty: 'Facial Treatments' }
            ].map((stylist, i) => (
              <div key={i} className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-rose-200 to-pink-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900">{stylist.name}</h3>
                <p className="text-rose-600 font-semibold">{stylist.role}</p>
                <p className="text-gray-600">{stylist.specialty}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-20 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Work</h2>
            <p className="text-xl text-gray-600">See the transformations we create</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-rose-200 to-pink-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-rose-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Look Your Best?</h2>
          <p className="text-xl mb-8">Book your appointment today and experience the difference</p>
          <Link 
            href="/builder/beauty-salon"
            className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition inline-block"
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
                  <MapPin className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-gray-600">123 Beauty Lane, Los Angeles, CA 90001</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600">info@glamourbeauty.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">Hours</p>
                    <p className="text-gray-600">Mon-Sat: 9AM-8PM</p>
                    <p className="text-gray-600">Sunday: 10AM-6PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Book Online</h3>
              <p className="text-gray-600 mb-6">Fill out the form and we'll confirm your appointment</p>
              <div className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border" />
                <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border" />
                <input type="tel" placeholder="Phone" className="w-full px-4 py-3 rounded-lg border" />
                <select className="w-full px-4 py-3 rounded-lg border">
                  <option>Select Service</option>
                  <option>Hair Styling & Cuts</option>
                  <option>Hair Coloring</option>
                  <option>Hair Treatments</option>
                  <option>Makeup Services</option>
                  <option>Facial Treatments</option>
                  <option>Waxing & Threading</option>
                </select>
                <Link 
                  href="/builder/beauty-salon"
                  className="w-full bg-rose-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-700 transition block text-center"
                >
                  Request Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <span className="text-xl font-bold">Glamour Beauty Salon</span>
          </div>
          <p className="text-gray-400 mb-4">Where Beauty Meets Excellence</p>
          <p className="text-gray-500 text-sm">© 2025 Glamour Beauty Salon. All rights reserved.</p>
          <div className="mt-6">
            <Link 
              href="/builder/beauty-salon"
              className="text-rose-400 hover:text-rose-300 transition"
            >
              Build Your Own Beauty Salon Website →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
