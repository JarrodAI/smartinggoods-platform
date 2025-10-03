import Link from 'next/link'
import { Calendar, Phone, Mail, MapPin, Star, Clock, Dumbbell } from 'lucide-react'

export default function GymPreview() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">PowerFit Gym</h1>
                <p className="text-sm text-blue-100">Transform Your Body, Transform Your Life</p>
              </div>
            </div>
            <nav className="hidden md:flex gap-6">
              <a href="#classes" className="hover:text-blue-200 transition">Classes</a>
              <a href="#trainers" className="hover:text-blue-200 transition">Trainers</a>
              <a href="#membership" className="hover:text-blue-200 transition">Membership</a>
              <a href="#contact" className="hover:text-blue-200 transition">Contact</a>
            </nav>
            <Link 
              href="/builder/gym"
              className="bg-white text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-3xl px-4">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Unleash Your<br />Inner Strength
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              State-of-the-art equipment, expert trainers, and a community that motivates
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/builder/gym"
                className="bg-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-600 transition"
              >
                Start Free Trial
              </Link>
              <Link 
                href="#classes"
                className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition"
              >
                View Classes
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Modern Equipment</h3>
              <p className="text-gray-600">Latest cardio and strength training machines</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Expert Trainers</h3>
              <p className="text-gray-600">Certified professionals to guide your journey</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">24/7 Access</h3>
              <p className="text-gray-600">Work out on your schedule, anytime</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Group Classes</h3>
              <p className="text-gray-600">50+ classes per week included</p>
            </div>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section id="classes" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Classes</h2>
            <p className="text-xl text-gray-600">Find the perfect workout for your goals</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'HIIT Training', icon: '🔥', desc: 'High-intensity interval training', time: '45 min' },
              { name: 'Yoga & Pilates', icon: '🧘', desc: 'Flexibility and mindfulness', time: '60 min' },
              { name: 'Spin Class', icon: '🚴', desc: 'Indoor cycling workouts', time: '45 min' },
              { name: 'Boxing', icon: '🥊', desc: 'Cardio boxing and technique', time: '50 min' },
              { name: 'Strength Training', icon: '💪', desc: 'Build muscle and power', time: '60 min' },
              { name: 'Zumba', icon: '💃', desc: 'Dance fitness party', time: '45 min' }
            ].map((cls, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
                <div className="text-5xl mb-4">{cls.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{cls.name}</h3>
                <p className="text-gray-600 mb-4">{cls.desc}</p>
                <p className="text-blue-600 font-bold">{cls.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trainers */}
      <section id="trainers" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Trainers</h2>
            <p className="text-xl text-gray-600">Certified experts dedicated to your success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { name: 'Alex Rodriguez', role: 'Head Trainer', cert: 'NASM Certified' },
              { name: 'Sarah Kim', role: 'Yoga Instructor', cert: 'RYT-500' },
              { name: 'Marcus Johnson', role: 'Strength Coach', cert: 'CSCS' },
              { name: 'Emma Davis', role: 'Spin Instructor', cert: 'Certified Cycling' }
            ].map((trainer, i) => (
              <div key={i} className="text-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900">{trainer.name}</h3>
                <p className="text-blue-600 font-bold">{trainer.role}</p>
                <p className="text-gray-600">{trainer.cert}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership */}
      <section id="membership" className="py-20 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Membership Plans</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your lifestyle</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Basic', price: '$29', features: ['Gym access', 'Locker room', 'Free WiFi'] },
              { name: 'Premium', price: '$59', features: ['All Basic features', 'Group classes', 'Guest passes'], popular: true },
              { name: 'Elite', price: '$99', features: ['All Premium features', 'Personal training', '24/7 access', 'Nutrition plan'] }
            ].map((plan, i) => (
              <div key={i} className={`bg-white rounded-2xl p-8 shadow-lg ${plan.popular ? 'ring-4 ring-blue-500 scale-105' : ''}`}>
                {plan.popular && <div className="bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">MOST POPULAR</div>}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold text-blue-600 mb-6">{plan.price}<span className="text-lg text-gray-600">/mo</span></p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/builder/gym"
                  className={`w-full px-6 py-3 rounded-lg font-bold transition block text-center ${
                    plan.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Life?</h2>
          <p className="text-xl mb-8">Start your fitness journey today with a 7-day free trial</p>
          <Link 
            href="/builder/gym"
            className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition inline-block"
          >
            Start Your Free Trial
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
                  <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Address</p>
                    <p className="text-gray-600">789 Fitness Ave, Miami, FL 33101</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Phone</p>
                    <p className="text-gray-600">(555) 456-7890</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Email</p>
                    <p className="text-gray-600">info@powerfitgym.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-bold">Hours</p>
                    <p className="text-gray-600">24/7 Access for Members</p>
                    <p className="text-gray-600">Staff: Mon-Fri 6AM-10PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Free Trial</h3>
              <p className="text-gray-600 mb-6">Fill out the form and we'll get you started</p>
              <div className="space-y-4">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg border" />
                <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-lg border" />
                <input type="tel" placeholder="Phone" className="w-full px-4 py-3 rounded-lg border" />
                <select className="w-full px-4 py-3 rounded-lg border">
                  <option>Select Membership</option>
                  <option>Basic - $29/mo</option>
                  <option>Premium - $59/mo</option>
                  <option>Elite - $99/mo</option>
                </select>
                <Link 
                  href="/builder/gym"
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition block text-center"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">PowerFit Gym</span>
          </div>
          <p className="text-gray-400 mb-4">Transform Your Body, Transform Your Life</p>
          <p className="text-gray-500 text-sm">© 2025 PowerFit Gym. All rights reserved.</p>
          <div className="mt-6">
            <Link 
              href="/builder/gym"
              className="text-blue-400 hover:text-blue-300 transition"
            >
              Build Your Own Gym Website →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
