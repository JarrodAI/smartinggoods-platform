import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartinggoods.com' },
    update: {},
    create: {
      email: 'admin@smartinggoods.com',
      name: 'Admin User',
      role: 'ADMIN',
      hashedPassword: adminPassword,
    },
  })

  console.log('✅ Admin user created:', admin.email)

  // Create sample templates
  const templates = [
    {
      id: 'nail-salon-modern',
      name: 'Modern Nail Salon',
      description: 'Clean, modern design perfect for upscale nail salons',
      category: 'nail_salon',
      previewImage: '/templates/nail-salon-modern.jpg',
      features: ['Online Booking', 'Service Gallery', 'Virtual Try-On', 'Customer Reviews'],
      price: 0,
      isActive: true,
      templateData: {
        colors: { primary: '#FF6B9D', secondary: '#4ECDC4' },
        fonts: { heading: 'Playfair Display', body: 'Inter' },
        layout: 'modern',
        sections: ['hero', 'services', 'gallery', 'booking', 'reviews', 'contact']
      }
    },
    {
      id: 'hair-salon-elegant',
      name: 'Elegant Hair Salon',
      description: 'Sophisticated design for premium hair salons',
      category: 'hair_salon',
      previewImage: '/templates/hair-salon-elegant.jpg',
      features: ['Stylist Profiles', 'Before/After Gallery', 'Online Booking', 'Product Shop'],
      price: 0,
      isActive: true,
      templateData: {
        colors: { primary: '#8B5CF6', secondary: '#F59E0B' },
        fonts: { heading: 'Cormorant Garamond', body: 'Source Sans Pro' },
        layout: 'elegant',
        sections: ['hero', 'services', 'stylists', 'gallery', 'booking', 'shop', 'contact']
      }
    },
    {
      id: 'spa-wellness',
      name: 'Wellness Spa',
      description: 'Calming, zen-inspired design for spas and wellness centers',
      category: 'spa',
      previewImage: '/templates/spa-wellness.jpg',
      features: ['Treatment Menu', 'Therapist Booking', 'Membership Plans', 'Wellness Blog'],
      price: 0,
      isActive: true,
      templateData: {
        colors: { primary: '#10B981', secondary: '#6366F1' },
        fonts: { heading: 'Lora', body: 'Open Sans' },
        layout: 'zen',
        sections: ['hero', 'treatments', 'therapists', 'membership', 'blog', 'contact']
      }
    }
  ]

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: {},
      create: template,
    })
  }

  console.log('✅ Templates created:', templates.length)

  // Create sample business profiles
  const sampleBusinesses = [
    {
      userId: admin.id,
      businessName: 'Glamour Nails Studio',
      businessType: 'nail_salon',
      description: 'Premium nail salon offering the latest in nail art and care',
      address: '123 Beauty Lane, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      website: 'https://glamournails.com',
      services: [
        {
          name: 'Classic Manicure',
          description: 'Traditional nail care with polish',
          price: 35,
          duration: 45,
          category: 'manicure'
        },
        {
          name: 'Gel Manicure',
          description: 'Long-lasting gel polish application',
          price: 55,
          duration: 60,
          category: 'manicure'
        },
        {
          name: 'Nail Art',
          description: 'Custom nail art designs',
          price: 75,
          duration: 90,
          category: 'art'
        }
      ],
      hours: {
        monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
        tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
        wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
        thursday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
        friday: { isOpen: true, openTime: '09:00', closeTime: '20:00' },
        saturday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
        sunday: { isOpen: true, openTime: '10:00', closeTime: '17:00' }
      },
      socialMedia: {
        instagram: '@glamournails',
        facebook: 'GlamourNailsStudio',
        tiktok: '@glamournails'
      }
    }
  ]

  for (const business of sampleBusinesses) {
    await prisma.businessProfile.upsert({
      where: { userId: business.userId },
      update: {},
      create: business,
    })
  }

  console.log('✅ Sample businesses created:', sampleBusinesses.length)

  // Create sample AI chat sessions
  const sampleChats = [
    {
      userId: admin.id,
      messages: [
        {
          role: 'user',
          content: 'Hi, I need help with booking an appointment',
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: 'Hello! I\'d be happy to help you book an appointment. What service are you interested in?',
          timestamp: new Date()
        }
      ]
    }
  ]

  for (const chat of sampleChats) {
    await prisma.aIChat.create({
      data: chat,
    })
  }

  console.log('✅ Sample AI chats created:', sampleChats.length)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })