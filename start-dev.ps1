# SmartingGoods Platform - Development Server
# Starts the Next.js dev server bound to 0.0.0.0 for VPN access

Write-Host "🚀 Starting SmartingGoods Platform Development Server" -ForegroundColor Green
Write-Host "📡 Binding to 0.0.0.0 for VPN/remote access" -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the development server
Write-Host "🔥 Starting Next.js development server..." -ForegroundColor Green
npm run dev

Write-Host "✅ Server should be accessible at:" -ForegroundColor Green
Write-Host "   - Local: http://localhost:3000" -ForegroundColor White
Write-Host "   - Network: http://0.0.0.0:3000" -ForegroundColor White
Write-Host "   - VPN: http://[your-ip]:3000" -ForegroundColor White