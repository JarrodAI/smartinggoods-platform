# SmartingGoods Platform - Local Development Setup Script
# PowerShell script for setting up local development environment

Write-Host "🚀 Setting up SmartingGoods Platform for Local Development" -ForegroundColor Green

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚙️ Creating .env.local file..." -ForegroundColor Cyan
    
    # Generate random secrets
    $nextAuthSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)
    $jwtSecret = [System.Web.Security.Membership]::GeneratePassword(32, 0)
    
    @"
# SmartingGoods Platform - Local Environment Variables
# Generated on $(Get-Date)

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$nextAuthSecret
JWT_SECRET=$jwtSecret

# Database Configuration (SQLite for local development)
DATABASE_URL="file:./dev.db"

# OpenAI Configuration (Add your API key)
OPENAI_API_KEY=your_openai_api_key_here

# Stripe Configuration (Add your test keys)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here

# Email Configuration (Optional for local development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Redis Configuration (Optional for local development)
REDIS_URL=redis://localhost:6379

# Development Mode
NODE_ENV=development
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

    Write-Host "✅ .env.local created. Please update with your API keys." -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local already exists" -ForegroundColor Green
}

# Setup database
Write-Host "🗄️ Setting up database..." -ForegroundColor Cyan

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Run database migrations
Write-Host "📊 Running database migrations..." -ForegroundColor Cyan
npx prisma db push

# Seed database with sample data
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Cyan
npx prisma db seed

# Build the application
Write-Host "🔧 Building application..." -ForegroundColor Cyan
npm run build

# Create startup script
Write-Host "📝 Creating startup scripts..." -ForegroundColor Cyan

# Create start-dev.ps1
@"
# Start SmartingGoods Platform in Development Mode
Write-Host "🚀 Starting SmartingGoods Platform in Development Mode" -ForegroundColor Green
npm run dev
"@ | Out-File -FilePath "start-dev.ps1" -Encoding UTF8

# Create start-prod.ps1
@"
# Start SmartingGoods Platform in Production Mode
Write-Host "🚀 Starting SmartingGoods Platform in Production Mode" -ForegroundColor Green
npm run start
"@ | Out-File -FilePath "start-prod.ps1" -Encoding UTF8

Write-Host "✅ Local development setup completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update .env.local with your API keys (OpenAI, Stripe, etc.)" -ForegroundColor White
Write-Host "2. Run 'npm run dev' or './start-dev.ps1' to start development server" -ForegroundColor White
Write-Host "3. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📚 Available Commands:" -ForegroundColor Yellow
Write-Host "• npm run dev          - Start development server" -ForegroundColor White
Write-Host "• npm run build        - Build for production" -ForegroundColor White
Write-Host "• npm run start        - Start production server" -ForegroundColor White
Write-Host "• npx prisma studio    - Open database browser" -ForegroundColor White
Write-Host "• ./start-dev.ps1      - Start development mode" -ForegroundColor White
Write-Host "• ./start-prod.ps1     - Start production mode" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🎉 SmartingGoods Platform is ready for development!" -ForegroundColor Green