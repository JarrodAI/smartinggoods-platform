# SmartingGoods Platform 🚀

A comprehensive template-based website service platform that enables businesses to quickly create professional websites using industry-specific templates. Built with Next.js, TypeScript, and modern web technologies.

## 🌟 Features

### Core Platform
- **Template Gallery** - Industry-specific website templates
- **Visual Builder** - Drag-and-drop website customization
- **Instant Deployment** - One-click website deployment
- **Custom Domains** - Connect your own domain
- **SSL Certificates** - Automatic HTTPS for all sites
- **Mobile Responsive** - All templates are mobile-optimized

### Business Features
- **Appointment Booking** - Integrated booking system
- **Service Management** - Manage services and pricing
- **Contact Forms** - Lead capture and management
- **Business Hours** - Display operating hours
- **Location Integration** - Google Maps integration
- **Social Media** - Social media links and integration

### Advanced Features
- **Stripe Integration** - Subscription billing and payments
- **User Dashboard** - Comprehensive management interface
- **Analytics** - Website performance tracking
- **SEO Optimization** - Built-in SEO features
- **Review System** - Customer testimonials and ratings
- **Multi-location** - Support for multiple business locations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)
- **File Storage**: AWS S3 (configurable)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Stripe account
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/smartinggoods-platform.git
cd smartinggoods-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/smartinggoods"
NEXTAUTH_SECRET="your-nextauth-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the platform.

## 📁 Project Structure

```
smartinggoods-platform/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── builder/           # Website builder
│   │   ├── dashboard/         # User dashboard
│   │   ├── templates/         # Template gallery
│   │   └── preview/           # Website preview
│   ├── components/            # React components
│   └── lib/                   # Utility libraries
├── prisma/                    # Database schema
├── public/                    # Static assets
└── generated-sites/           # Generated websites
```

## 🔧 Configuration

### Required Services

1. **Database Setup**
   - Create a PostgreSQL database
   - Update `DATABASE_URL` in `.env.local`

2. **Stripe Setup**
   - Create a Stripe account
   - Get API keys from Stripe Dashboard
   - Set up webhook endpoints

3. **Authentication Setup**
   - Generate NextAuth secret: `openssl rand -base64 32`
   - Configure OAuth providers (optional)

### Optional Services

- **Email Service**: SendGrid or Resend for notifications
- **File Storage**: AWS S3 for website assets
- **Analytics**: Google Analytics integration
- **Domain Management**: Domain registrar API

## 🎨 Available Templates

### Business Types
- **Nail Salon & Spa** - Beauty and wellness businesses
- **Restaurant** - Food service establishments  
- **Fitness Center** - Gyms and fitness studios
- **Retail Store** - E-commerce and retail
- **Professional Services** - Consultants and agencies
- **Beauty Salon** - Hair and beauty services

### Template Features
- Responsive design
- SEO optimization
- Contact forms
- Service listings
- Gallery integration
- Appointment booking
- Social media integration

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration

### Stripe Integration
- `POST /api/stripe/create-checkout` - Create payment session
- `POST /api/stripe/create-customer` - Create Stripe customer
- `POST /api/stripe/webhooks` - Handle Stripe webhooks

### Website Management
- `POST /api/templates/customize` - Customize template
- `POST /api/websites/generate` - Generate website
- `POST /api/templates/deploy` - Deploy website
- `GET /api/websites/preview/[id]` - Preview website

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
```bash
npm i -g vercel
vercel
```

2. **Set environment variables in Vercel dashboard**

3. **Deploy**
```bash
vercel --prod
```

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Start production server**
```bash
npm start
```

## 📊 Business Model

### Revenue Streams
- **Monthly Subscriptions** - $29-$199/month per website
- **Custom Development** - $499-$2999 per project
- **Digital Marketing Services** - $99-$499/month
- **Domain Registration** - $15-$50/year markup
- **Premium Add-ons** - $19-$99/month

### Target Market
- Small businesses (1-50 employees)
- Service-based businesses
- Local businesses
- Entrepreneurs and startups
- Franchises and multi-location businesses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.smartinggoods.com](https://docs.smartinggoods.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/smartinggoods-platform/issues)
- **Email**: support@smartinggoods.com
- **Discord**: [Join our community](https://discord.gg/smartinggoods)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Template system
- ✅ Website builder
- ✅ Stripe integration
- ✅ User dashboard

### Phase 2 (Next)
- [ ] Advanced customization
- [ ] E-commerce integration
- [ ] Mobile app
- [ ] White-label solution

### Phase 3 (Future)
- [ ] AI-powered design
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Enterprise features

---

Built with ❤️ by the SmartingGoods team
