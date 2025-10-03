import Link from 'next/link'
import { Check, Star, Zap, Crown, Rocket } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 29,
      description: 'Perfect for small businesses getting started online',
      icon: <Star className="w-6 h-6" />,
      color: 'blue',
      popular: false,
      features: [
        'Professional website template',
        'Mobile responsive design',
        'Basic SEO optimization',
        'Contact forms',
        'Social media integration',
        'SSL certificate included',
        'Basic analytics',
        '24/7 support'
      ],
      limitations: [
        'Up to 5 pages',
        '1 GB storage',
        'Basic customization'
      ]
    },
    {
      name: 'Professional',
      price: 79,
      description: 'Most popular for growing businesses',
      icon: <Zap className="w-6 h-6" />,
      color: 'purple',
      popular: true,
      features: [
        'Everything in Starter',
        'Advanced template customization',
        'Appointment booking system',
        'Online payment processing',
        'Advanced SEO tools',
        'Google Analytics integration',
        'Email marketing tools',
        'Priority support',
        'Custom domain included',
        'Advanced forms & workflows'
      ],
      limitations: [
        'Up to 15 pages',
        '10 GB storage',
        'Advanced customization'
      ]
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'Advanced features for established businesses',
      icon: <Crown className="w-6 h-6" />,
      color: 'gold',
      popular: false,
      features: [
        'Everything in Professional',
        'Multi-location management',
        'Advanced e-commerce features',
        'Custom integrations',
        'White-label options',
        'Advanced analytics & reporting',
        'API access',
        'Dedicated account manager',
        'Custom development hours',
        'Advanced security features'
      ],
      limitations: [
        'Unlimited pages',
        '100 GB storage',
        'Full customization'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent{' '}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your business. All plans include hosting, security, 
              and our award-winning support. No hidden fees, no surprises.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className="text-sm font-medium">Monthly</span>
              <div className="relative">
                <input type="checkbox" id="billing-toggle" className="sr-only" />
                <label htmlFor="billing-toggle" className="flex items-center cursor-pointer">
                  <div className="w-12 h-6 bg-gray-300 rounded-full p-1 transition-colors duration-300">
                    <div className="w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300"></div>
                  </div>
                </label>
              </div>
              <span className="text-sm font-medium">
                Yearly 
                <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={plan.name}
                className={`relative rounded-2xl border-2 p-8 ${
                  plan.popular 
                    ? 'border-primary bg-primary/5 scale-105 shadow-xl' 
                    : 'border-border bg-card hover:border-primary/50'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                      <Rocket className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    plan.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {plan.icon}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <Link 
                    href={`/signup/flow?plan=${plan.name.toLowerCase()}`}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors inline-flex items-center justify-center ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                    What's Included
                  </h4>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="pt-4 border-t">
                    <h5 className="font-medium text-sm mb-2">Plan Limits</h5>
                    <ul className="space-y-1">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="text-sm text-muted-foreground">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about our pricing and plans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  question: 'Can I change plans anytime?',
                  answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately and we\'ll prorate any billing differences.'
                },
                {
                  question: 'Is there a setup fee?',
                  answer: 'No setup fees, ever. The price you see is the price you pay. We believe in transparent, honest pricing.'
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards, PayPal, and bank transfers. All payments are processed securely through Stripe.'
                },
                {
                  question: 'Do you offer refunds?',
                  answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment, no questions asked.'
                },
                {
                  question: 'Is my website data backed up?',
                  answer: 'Absolutely! We perform daily automated backups and store them securely. Your data is safe and can be restored anytime.'
                },
                {
                  question: 'Can I use my own domain?',
                  answer: 'Yes! Professional and Enterprise plans include a free custom domain. Starter plans can connect existing domains for a small fee.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-card rounded-lg p-6 border">
                  <h3 className="font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Need Something Custom?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Large business or unique requirements? Let's build something amazing together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg"
                >
                  Contact Sales
                </Link>
                <Link 
                  href="/templates"
                  className="border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-8 rounded-lg"
                >
                  View Templates
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-primary mb-2">99.9%</div>
                <p className="text-muted-foreground">Uptime Guarantee</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Expert Support</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary mb-2">30-Day</div>
                <p className="text-muted-foreground">Money Back Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}