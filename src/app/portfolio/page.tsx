import Link from 'next/link'
import { ExternalLink, ArrowUpRight, Star, Users } from 'lucide-react'

export default function PortfolioPage() {
  const projects = [
    {
      id: 'bloomify',
      title: 'Bloomify E-commerce',
      category: 'E-commerce',
      description: 'Modern flower delivery platform with subscription services and real-time tracking.',
      image: '/portfolio/bloomify.jpg',
      url: 'https://bloomify-demo.com',
      stats: { visitors: '50K+', conversion: '12%', rating: 4.9 },
      tags: ['E-commerce', 'Subscription', 'Mobile App']
    },
    {
      id: 'techconf',
      title: 'TechConf 2024',
      category: 'Event',
      description: 'Conference website with speaker profiles, scheduling, and ticket sales integration.',
      image: '/portfolio/techconf.jpg',
      url: 'https://techconf-demo.com',
      stats: { visitors: '25K+', conversion: '8%', rating: 4.8 },
      tags: ['Event', 'Ticketing', 'Speakers']
    },
    {
      id: 'greenlife',
      title: 'GreenLife Wellness',
      category: 'Health & Wellness',
      description: 'Holistic wellness center with appointment booking and membership management.',
      image: '/portfolio/greenlife.jpg',
      url: 'https://greenlife-demo.com',
      stats: { visitors: '15K+', conversion: '15%', rating: 4.9 },
      tags: ['Wellness', 'Booking', 'Membership']
    },
    {
      id: 'high-brow-ink',
      title: 'High Brow Ink',
      category: 'Beauty & Salon',
      description: 'Premium tattoo studio with portfolio showcase and consultation booking.',
      image: '/portfolio/high-brow-ink.jpg',
      url: 'https://highbrowink-demo.com',
      stats: { visitors: '30K+', conversion: '10%', rating: 4.7 },
      tags: ['Beauty', 'Portfolio', 'Booking']
    },
    {
      id: 'fitquest',
      title: 'FitQuest Gym',
      category: 'Fitness',
      description: 'Modern fitness center with class scheduling and membership management.',
      image: '/portfolio/fitquest.jpg',
      url: 'https://fitquest-demo.com',
      stats: { visitors: '40K+', conversion: '18%', rating: 4.8 },
      tags: ['Fitness', 'Classes', 'Membership']
    },
    {
      id: 'dataviz',
      title: 'DataViz Analytics',
      category: 'Technology',
      description: 'Data analytics platform with interactive dashboards and reporting tools.',
      image: '/portfolio/dataviz.jpg',
      url: 'https://dataviz-demo.com',
      stats: { visitors: '20K+', conversion: '22%', rating: 4.9 },
      tags: ['Analytics', 'Dashboard', 'SaaS']
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Success Stories
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover how we've helped businesses across industries achieve their digital goals 
              with stunning websites and powerful marketing strategies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-8 rounded-lg"
              >
                Start Your Project
              </Link>
              <Link 
                href="/templates"
                className="border border-input hover:bg-accent font-medium py-3 px-8 rounded-lg"
              >
                Browse Templates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Projects Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-muted-foreground">Client Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <p className="text-muted-foreground">Industries Served</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Each project is crafted with attention to detail, focusing on user experience and business results.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <div key={project.id} className="group bg-card rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300">
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                          <span className="text-2xl font-bold text-primary">{project.title.charAt(0)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">{project.title}</h3>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        href={`/portfolio/${project.id}`}
                        className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                        {project.category}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{project.stats.rating}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {project.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <div className="text-sm font-bold">{project.stats.visitors}</div>
                        <div className="text-xs text-muted-foreground">Visitors</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold">{project.stats.conversion}</div>
                        <div className="text-xs text-muted-foreground">Conversion</div>
                      </div>
                      <div>
                        <div className="text-sm font-bold">{project.stats.rating}/5</div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link 
                        href={`/portfolio/${project.id}`}
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-center py-2 px-4 rounded-lg font-medium text-sm"
                      >
                        View Details
                      </Link>
                      <Link 
                        href={project.url}
                        target="_blank"
                        className="border border-input hover:bg-accent p-2 rounded-lg"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-xl text-muted-foreground">
                Real feedback from real businesses we've helped succeed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  name: 'Sarah Johnson',
                  company: 'Bloomify',
                  role: 'CEO',
                  quote: 'Smarting Goods transformed our online presence completely. Sales increased by 300% in the first quarter after launch.',
                  rating: 5
                },
                {
                  name: 'Mike Chen',
                  company: 'TechConf',
                  role: 'Event Director',
                  quote: 'The team delivered exactly what we needed - a professional, scalable platform that handled thousands of registrations flawlessly.',
                  rating: 5
                },
                {
                  name: 'Lisa Rodriguez',
                  company: 'GreenLife Wellness',
                  role: 'Founder',
                  quote: 'Not only did they build us a beautiful website, but the booking system has streamlined our entire operation.',
                  rating: 5
                },
                {
                  name: 'David Kim',
                  company: 'FitQuest Gym',
                  role: 'Owner',
                  quote: 'The results speak for themselves - 40% increase in membership sign-ups and countless compliments on our new site.',
                  rating: 5
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-card rounded-xl p-6 shadow-sm border">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Be Our Next Success Story?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let's create something amazing together. Your business deserves a website that works as hard as you do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg"
            >
              Start Your Project
            </Link>
            <Link 
              href="/templates"
              className="border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-8 rounded-lg"
            >
              Browse Templates
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}