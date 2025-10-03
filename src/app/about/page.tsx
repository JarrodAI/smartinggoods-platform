import Link from 'next/link'
import { Users, Target, Award, Zap, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              We're Building the Future of{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Digital Business
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              At Smarting Goods, we believe every business deserves a powerful online presence. 
              We're on a mission to democratize professional web design and make it accessible to everyone.
            </p>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-8 rounded-lg text-lg"
            >
              Work With Us
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2020, Smarting Goods started with a simple observation: 
                    too many amazing businesses were struggling online because professional 
                    web design was expensive, complicated, and time-consuming.
                  </p>
                  <p>
                    We set out to change that. Our team of designers, developers, and 
                    digital marketing experts came together to create a platform that 
                    makes professional websites accessible to every business owner.
                  </p>
                  <p>
                    Today, we've helped thousands of businesses across the globe establish 
                    their online presence and grow their revenue through beautiful, 
                    functional websites and powerful digital marketing tools.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-2xl shadow-inner flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto flex items-center justify-center">
                        <Zap className="w-12 h-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Innovation First</h3>
                      <p className="text-gray-600">Cutting-edge technology meets beautiful design</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do and every decision we make.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Customer First</h3>
                <p className="text-muted-foreground">
                  Every feature we build and every decision we make starts with our customers' needs.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Results Driven</h3>
                <p className="text-muted-foreground">
                  We measure our success by the growth and success of our customers' businesses.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Innovation</h3>
                <p className="text-muted-foreground">
                  We constantly push the boundaries of what's possible in web design and technology.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Excellence</h3>
                <p className="text-muted-foreground">
                  We're committed to delivering the highest quality in everything we create.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The passionate people behind Smarting Goods who make it all possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  name: 'Alex Johnson',
                  role: 'CEO & Founder',
                  bio: 'Visionary leader with 15+ years in digital marketing and web development.',
                  image: '/team/alex.jpg'
                },
                {
                  name: 'Sarah Chen',
                  role: 'Head of Design',
                  bio: 'Award-winning designer passionate about creating beautiful, functional experiences.',
                  image: '/team/sarah.jpg'
                },
                {
                  name: 'Mike Rodriguez',
                  role: 'CTO',
                  bio: 'Full-stack developer and tech innovator building scalable solutions.',
                  image: '/team/mike.jpg'
                },
                {
                  name: 'Emily Davis',
                  role: 'Marketing Director',
                  bio: 'Digital marketing expert helping businesses grow their online presence.',
                  image: '/team/emily.jpg'
                },
                {
                  name: 'David Kim',
                  role: 'Lead Developer',
                  bio: 'Senior developer specializing in modern web technologies and AI integration.',
                  image: '/team/david.jpg'
                },
                {
                  name: 'Lisa Thompson',
                  role: 'Customer Success',
                  bio: 'Dedicated to ensuring every customer achieves their business goals.',
                  image: '/team/lisa.jpg'
                }
              ].map((member, index) => (
                <div key={index} className="bg-card rounded-xl p-6 text-center shadow-sm border">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Numbers that showcase the difference we're making for businesses worldwide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
                <p className="text-lg opacity-90">Websites Created</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
                <p className="text-lg opacity-90">Countries Served</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
                <p className="text-lg opacity-90">Uptime Guarantee</p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">4.9/5</div>
                <p className="text-lg opacity-90">Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Join Thousands of Successful Businesses?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let's work together to create something amazing for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/templates"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-8 rounded-lg"
              >
                Browse Templates
              </Link>
              <Link 
                href="/contact"
                className="border border-input hover:bg-accent font-medium py-3 px-8 rounded-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}