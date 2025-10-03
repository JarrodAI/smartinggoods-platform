import Link from 'next/link'
import { Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react'

export default function BlogPage() {
  const featuredPost = {
    id: 'website-speed-optimization-2025',
    title: 'Website Speed Optimization: The Complete 2025 Guide',
    excerpt: 'Learn how to make your website load in under 1 second with these advanced optimization techniques. From AVIF images to edge computing.',
    author: 'Alex Johnson',
    date: '2025-01-15',
    readTime: '8 min read',
    category: 'Performance',
    image: '/blog/speed-optimization.jpg',
    featured: true
  }

  const blogPosts = [
    {
      id: 'small-business-seo-2025',
      title: '10 SEO Strategies That Actually Work for Small Businesses in 2025',
      excerpt: 'Discover the SEO tactics that are driving real results for small businesses this year. No fluff, just proven strategies.',
      author: 'Sarah Chen',
      date: '2025-01-12',
      readTime: '6 min read',
      category: 'SEO',
      image: '/blog/seo-strategies.jpg'
    },
    {
      id: 'nail-salon-marketing',
      title: 'How This Nail Salon Increased Bookings by 300% with Digital Marketing',
      excerpt: 'A complete case study of how we helped a local nail salon transform their business with the right digital strategy.',
      author: 'Mike Rodriguez',
      date: '2025-01-10',
      readTime: '5 min read',
      category: 'Case Study',
      image: '/blog/nail-salon-case-study.jpg'
    },
    {
      id: 'restaurant-online-ordering',
      title: 'Why Every Restaurant Needs Online Ordering (And How to Set It Up)',
      excerpt: 'The restaurant industry has changed forever. Here\'s how to adapt and thrive with online ordering systems.',
      author: 'Emily Davis',
      date: '2025-01-08',
      readTime: '7 min read',
      category: 'Restaurant',
      image: '/blog/restaurant-ordering.jpg'
    },
    {
      id: 'website-conversion-tips',
      title: '15 Website Changes That Will Double Your Conversion Rate',
      excerpt: 'Simple tweaks that make a massive difference. These conversion optimization tips are backed by real data.',
      author: 'David Kim',
      date: '2025-01-05',
      readTime: '9 min read',
      category: 'Conversion',
      image: '/blog/conversion-tips.jpg'
    },
    {
      id: 'fitness-business-online',
      title: 'Taking Your Fitness Business Online: A Complete Playbook',
      excerpt: 'From virtual classes to membership management, here\'s everything fitness businesses need to succeed online.',
      author: 'Lisa Thompson',
      date: '2025-01-03',
      readTime: '6 min read',
      category: 'Fitness',
      image: '/blog/fitness-online.jpg'
    },
    {
      id: 'ecommerce-trends-2025',
      title: 'E-commerce Trends That Will Dominate 2025',
      excerpt: 'Stay ahead of the competition with these emerging e-commerce trends and technologies.',
      author: 'Alex Johnson',
      date: '2025-01-01',
      readTime: '8 min read',
      category: 'E-commerce',
      image: '/blog/ecommerce-trends.jpg'
    }
  ]

  const categories = ['All', 'SEO', 'Performance', 'Case Study', 'Restaurant', 'Fitness', 'E-commerce', 'Conversion']

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Digital Marketing{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Expert tips, case studies, and strategies to help your business thrive online. 
              Learn from real success stories and actionable insights.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Featured Article</h2>
            </div>
            
            <div className="bg-card rounded-2xl overflow-hidden shadow-lg border">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="aspect-video lg:aspect-square bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                      <span className="text-3xl">⚡</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Speed Optimization</h3>
                  </div>
                </div>
                
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      {featuredPost.category}
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                      Featured
                    </span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    {featuredPost.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 text-lg">
                    {featuredPost.excerpt}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/blog/${featuredPost.id}`}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-6 rounded-lg w-fit"
                  >
                    Read Full Article
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 border-t border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === 'All' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-accent border'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article key={post.id} className="bg-card rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all duration-300 group">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 mx-auto shadow-md">
                        <Tag className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-gray-600">{post.category}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                        {post.category}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                      <Link href={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    
                    <Link 
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Stay Ahead of the Competition
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get the latest digital marketing insights, case studies, and strategies delivered to your inbox weekly.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-sm opacity-75 mt-4">
              No spam, unsubscribe anytime. Join 10,000+ business owners getting our insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}