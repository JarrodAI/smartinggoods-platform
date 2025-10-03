'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

interface Review {
  id: string
  name: string
  business: string
  businessType: string
  rating: number
  review: string
  platform: 'google' | 'trustpilot'
  date: string
  avatar: string
  verified: boolean
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    business: 'Bliss Nail Studio',
    businessType: 'Nail Salon',
    rating: 5,
    review: 'SmartingGoods transformed my nail salon completely! Online bookings increased 400% and my customers love the new website. The SMS reminders have eliminated no-shows entirely.',
    platform: 'google',
    date: '2025-01-20',
    avatar: '👩🏽‍💼',
    verified: true
  },
  {
    id: '2',
    name: 'Michael Chen',
    business: 'Dragon Fitness Center',
    businessType: 'Fitness',
    rating: 5,
    review: 'Best investment I ever made for my gym. The membership management system and class booking features are incredible. Revenue up 250% in just 3 months!',
    platform: 'trustpilot',
    date: '2025-01-18',
    avatar: '👨🏻‍💪',
    verified: true
  },
  {
    id: '3',
    name: 'Jessica Thompson',
    business: 'Bella Vista Restaurant',
    businessType: 'Restaurant',
    rating: 5,
    review: 'The online ordering system paid for itself in the first week. Customer reviews are pouring in and our Google ranking shot up to #1 in our area. Amazing service!',
    platform: 'google',
    date: '2025-01-15',
    avatar: '👩🏼‍🍳',
    verified: true
  },
  {
    id: '4',
    name: 'David Rodriguez',
    business: 'Elite Barber Shop',
    businessType: 'Beauty Salon',
    rating: 5,
    review: 'My barber shop went from old school to cutting edge overnight. The appointment system and customer management tools are game changers. Highly recommend!',
    platform: 'trustpilot',
    date: '2025-01-12',
    avatar: '👨🏽‍💼',
    verified: true
  },
  {
    id: '5',
    name: 'Amanda Foster',
    business: 'Zen Yoga Studio',
    businessType: 'Fitness',
    rating: 5,
    review: 'The class scheduling and membership features are perfect for my yoga studio. Students can book classes easily and I can focus on teaching instead of admin work.',
    platform: 'google',
    date: '2025-01-10',
    avatar: '👩🏻‍🧘',
    verified: true
  },
  {
    id: '6',
    name: 'Robert Kim',
    business: 'Seoul Kitchen',
    businessType: 'Restaurant',
    rating: 5,
    review: 'SmartingGoods helped us survive the pandemic with their online ordering system. Now we are busier than ever with both dine-in and delivery orders!',
    platform: 'trustpilot',
    date: '2025-01-08',
    avatar: '👨🏻‍🍳',
    verified: true
  },
  {
    id: '7',
    name: 'Lisa Williams',
    business: 'Glamour Beauty Spa',
    businessType: 'Beauty Salon',
    rating: 5,
    review: 'The website is absolutely gorgeous and the booking system works flawlessly. My clients love being able to book treatments online 24/7. Revenue increased 180%!',
    platform: 'google',
    date: '2025-01-05',
    avatar: '👩🏾‍💄',
    verified: true
  },
  {
    id: '8',
    name: 'Carlos Mendoza',
    business: 'Iron Paradise Gym',
    businessType: 'Fitness',
    rating: 5,
    review: 'The membership management and payment processing features are incredible. No more chasing down payments - everything is automated and professional.',
    platform: 'trustpilot',
    date: '2025-01-03',
    avatar: '👨🏽‍💪',
    verified: true
  },
  {
    id: '9',
    name: 'Emily Davis',
    business: 'Chic Boutique',
    businessType: 'Retail',
    rating: 5,
    review: 'My online store looks amazing and the inventory management system keeps everything organized. Sales have tripled since launching with SmartingGoods!',
    platform: 'google',
    date: '2025-01-01',
    avatar: '👩🏼‍💼',
    verified: true
  },
  {
    id: '10',
    name: 'James Wilson',
    business: 'Wilson Law Firm',
    businessType: 'Professional Services',
    rating: 5,
    review: 'The client portal and appointment scheduling features have streamlined our entire practice. Clients love the professional look and easy communication.',
    platform: 'trustpilot',
    date: '2024-12-28',
    avatar: '👨🏻‍💼',
    verified: true
  },
  {
    id: '11',
    name: 'Maria Gonzalez',
    business: 'Sunshine Daycare',
    businessType: 'Professional Services',
    rating: 5,
    review: 'Parents love being able to see updates and photos of their children throughout the day. The communication features have made our daycare stand out from competitors.',
    platform: 'google',
    date: '2024-12-25',
    avatar: '👩🏽‍🏫',
    verified: true
  },
  {
    id: '12',
    name: 'Kevin Park',
    business: 'Park Dental Care',
    businessType: 'Professional Services',
    rating: 5,
    review: 'The appointment reminders have reduced no-shows by 90%. The professional website has attracted so many new patients. Best business decision I have made!',
    platform: 'trustpilot',
    date: '2024-12-22',
    avatar: '👨🏻‍⚕️',
    verified: true
  },
  {
    id: '13',
    name: 'Rachel Green',
    business: 'Green Thumb Landscaping',
    businessType: 'Professional Services',
    rating: 5,
    review: 'The before/after photo galleries showcase our work perfectly. Lead generation has increased 300% and we are booked solid for months ahead!',
    platform: 'google',
    date: '2024-12-20',
    avatar: '👩🏻‍🌾',
    verified: true
  },
  {
    id: '14',
    name: 'Tony Ricci',
    business: 'Ricci\'s Pizza Palace',
    businessType: 'Restaurant',
    rating: 5,
    review: 'The online ordering system is fantastic! Orders come in automatically and the kitchen display makes everything so efficient. Sales up 220% since launch!',
    platform: 'trustpilot',
    date: '2024-12-18',
    avatar: '👨🏻‍🍕',
    verified: true
  },
  {
    id: '15',
    name: 'Priya Patel',
    business: 'Lotus Wellness Center',
    businessType: 'Beauty Salon',
    rating: 5,
    review: 'The holistic approach to wellness is perfectly captured in our new website. Clients can book massages, yoga classes, and consultations all in one place.',
    platform: 'google',
    date: '2024-12-15',
    avatar: '👩🏽‍⚕️',
    verified: true
  }
]

export default function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const reviewsPerPage = 3
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex + reviewsPerPage >= reviews.length ? 0 : prevIndex + reviewsPerPage
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextReviews = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex + reviewsPerPage >= reviews.length ? 0 : prevIndex + reviewsPerPage
    )
  }

  const prevReviews = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? Math.max(0, reviews.length - reviewsPerPage) : prevIndex - reviewsPerPage
    )
  }

  const currentReviews = reviews.slice(currentIndex, currentIndex + reviewsPerPage)

  const getPlatformIcon = (platform: 'google' | 'trustpilot') => {
    if (platform === 'google') {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">G</span>
          </div>
          <span>Google</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-600">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span>Trustpilot</span>
        </div>
      )
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by 10,000+ Business Owners
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what real business owners are saying about how SmartingGoods transformed their success.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">G</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium">4.9/5 (2,847 reviews)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium">4.8/5 (1,923 reviews)</span>
              </div>
            </div>
          </div>

          {/* Reviews Carousel */}
          <div className="relative">
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              {currentReviews.map((review) => (
                <div key={review.id} className="bg-card rounded-xl p-6 shadow-sm border hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                        {review.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{review.name}</h4>
                          {review.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.business}</p>
                        <p className="text-xs text-muted-foreground">{review.businessType}</p>
                      </div>
                    </div>
                    {getPlatformIcon(review.platform)}
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-muted-foreground text-sm leading-relaxed mb-4">
                    "{review.review}"
                  </blockquote>
                  
                  <div className="text-xs text-muted-foreground">
                    {new Date(review.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevReviews}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg border flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={nextReviews}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg border flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * reviewsPerPage)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(currentIndex / reviewsPerPage) === index 
                    ? 'bg-primary' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}