export const SUBSCRIPTION_PLANS = {
  starter: {
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: '$29',
    priceId: 'price_starter_monthly', // Replace with actual Stripe price ID
    features: [
      '1 Website Template',
      'Basic Customization',
      'SSL Certificate',
      'Mobile Responsive',
      'Basic SEO',
      'Email Support'
    ],
    popular: false
  },
  professional: {
    name: 'Professional',
    description: 'Best for growing businesses',
    price: '$79',
    priceId: 'price_professional_monthly', // Replace with actual Stripe price ID
    features: [
      '5 Website Templates',
      'Advanced Customization',
      'Custom Domain',
      'SSL Certificate',
      'Advanced SEO',
      'Appointment Booking',
      'Analytics Dashboard',
      'Priority Support'
    ],
    popular: true
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For established businesses with advanced needs',
    price: '$199',
    priceId: 'price_enterprise_monthly', // Replace with actual Stripe price ID
    features: [
      'Unlimited Templates',
      'Full Customization',
      'Multiple Domains',
      'SSL Certificate',
      'Advanced SEO & Analytics',
      'POS Integration',
      'Multi-location Support',
      'White-label Options',
      'Dedicated Support',
      'API Access'
    ],
    popular: false
  }
}

export const ADDON_SERVICES = {
  customDesign: {
    name: 'Custom Design Service',
    description: 'Professional custom website design',
    price: '$499',
    priceId: 'price_custom_design', // One-time payment
    type: 'one-time'
  },
  seoOptimization: {
    name: 'SEO Optimization Package',
    description: 'Complete SEO audit and optimization',
    price: '$299',
    priceId: 'price_seo_package',
    type: 'one-time'
  },
  socialMediaManagement: {
    name: 'AI Social Media Management',
    description: 'AI-powered social media content and posting',
    price: '$99',
    priceId: 'price_social_media_monthly',
    type: 'monthly'
  },
  extraDomain: {
    name: 'Additional Domain',
    description: 'Connect additional custom domain',
    price: '$19',
    priceId: 'price_extra_domain_monthly',
    type: 'monthly'
  }
}