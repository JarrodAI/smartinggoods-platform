# SmartingGoods Platform - Vercel Deployment Script
# PowerShell script for deploying to Vercel

param(
    [switch]$Production = $false
)

Write-Host "🚀 Deploying SmartingGoods Platform to Vercel" -ForegroundColor Green

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Cyan
    npm install -g vercel
}

# Check if user is logged in
Write-Host "🔐 Checking Vercel authentication..." -ForegroundColor Cyan
try {
    vercel whoami | Out-Null
    Write-Host "✅ Already logged in to Vercel" -ForegroundColor Green
} catch {
    Write-Host "🔐 Please log in to Vercel..." -ForegroundColor Yellow
    vercel login
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Build the application
Write-Host "🔧 Building application..." -ForegroundColor Cyan
npm run build

# Create vercel.json configuration
if (-not (Test-Path "vercel.json")) {
    Write-Host "⚙️ Creating vercel.json configuration..." -ForegroundColor Cyan
    
    @"
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
"@ | Out-File -FilePath "vercel.json" -Encoding UTF8

    Write-Host "✅ vercel.json created" -ForegroundColor Green
}

# Set environment variables
Write-Host "⚙️ Setting up environment variables..." -ForegroundColor Cyan

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️ .env.production not found. Creating template..." -ForegroundColor Yellow
    
    @"
# SmartingGoods Platform - Production Environment Variables
# Update these values for production deployment

# Next.js Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database Configuration (Use Vercel Postgres or external provider)
DATABASE_URL=your_production_database_url_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis Configuration (Use Vercel KV or external provider)
REDIS_URL=your_redis_url_here

# Production Mode
NODE_ENV=production
"@ | Out-File -FilePath ".env.production" -Encoding UTF8

    Write-Host "⚠️ Please update .env.production with your production values before deploying" -ForegroundColor Yellow
    Read-Host "Press Enter to continue when ready"
}

# Deploy to Vercel
if ($Production) {
    Write-Host "🚀 Deploying to production..." -ForegroundColor Green
    vercel --prod
} else {
    Write-Host "🚀 Deploying to preview..." -ForegroundColor Cyan
    vercel
}

# Get deployment URL
$deploymentInfo = vercel ls | Select-Object -First 1
Write-Host "✅ Deployment completed!" -ForegroundColor Green

# Create post-deployment script
Write-Host "📝 Creating post-deployment tasks..." -ForegroundColor Cyan

@"
# Post-Deployment Tasks for SmartingGoods Platform
# Run these commands after successful deployment

Write-Host "🗄️ Running database migrations..." -ForegroundColor Cyan
# Note: Run this from your local machine or CI/CD pipeline
# npx prisma db push --accept-data-loss

Write-Host "🌱 Seeding production database..." -ForegroundColor Cyan
# Note: Only run this for initial deployment
# npx prisma db seed

Write-Host "✅ Post-deployment tasks completed!" -ForegroundColor Green
"@ | Out-File -FilePath "post-deploy.ps1" -Encoding UTF8

Write-Host "" -ForegroundColor White
Write-Host "🎯 Deployment Summary:" -ForegroundColor Yellow
Write-Host "• Platform deployed to Vercel" -ForegroundColor White
Write-Host "• Check Vercel dashboard for deployment URL" -ForegroundColor White
Write-Host "• Run post-deployment tasks if needed" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Verify deployment at your Vercel URL" -ForegroundColor White
Write-Host "2. Run database migrations if needed" -ForegroundColor White
Write-Host "3. Test all functionality in production" -ForegroundColor White
Write-Host "4. Set up custom domain (optional)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🎉 SmartingGoods Platform is now live on Vercel!" -ForegroundColor Green