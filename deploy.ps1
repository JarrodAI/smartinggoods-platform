# SmartingGoods Platform - Azure Deployment Script
# PowerShell deployment script for Windows

param(
    [string]$Environment = "production",
    [string]$ResourceGroup = "smartinggoods-rg",
    [string]$Location = "East US",
    [switch]$SkipBuild = $false
)

Write-Host "🚀 Starting SmartingGoods Platform Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Yellow

# Check prerequisites
Write-Host "📋 Checking prerequisites..." -ForegroundColor Cyan

# Check if Azure CLI is installed
try {
    az --version | Out-Null
    Write-Host "✅ Azure CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Azure CLI not found. Please install Azure CLI first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    node --version | Out-Null
    Write-Host "✅ Node.js found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Login to Azure
Write-Host "🔐 Logging into Azure..." -ForegroundColor Cyan
az login

# Set subscription (optional - will use default)
# az account set --subscription "your-subscription-id"

# Create resource group
Write-Host "📦 Creating resource group..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location

# Install dependencies and build
if (-not $SkipBuild) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install

    Write-Host "🔧 Building application..." -ForegroundColor Cyan
    npm run build
}

# Create App Service Plan
Write-Host "🏗️ Creating App Service Plan..." -ForegroundColor Cyan
az appservice plan create `
    --name "smartinggoods-plan" `
    --resource-group $ResourceGroup `
    --sku B1 `
    --is-linux

# Create Web App
Write-Host "🌐 Creating Web App..." -ForegroundColor Cyan
$webAppName = "smartinggoods-$(Get-Random -Minimum 1000 -Maximum 9999)"
az webapp create `
    --resource-group $ResourceGroup `
    --plan "smartinggoods-plan" `
    --name $webAppName `
    --runtime "NODE:18-lts"

# Configure environment variables
Write-Host "⚙️ Setting environment variables..." -ForegroundColor Cyan
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $webAppName `
    --settings `
    NEXTAUTH_URL="https://$webAppName.azurewebsites.net" `
    NEXTAUTH_SECRET="$(New-Guid)" `
    NODE_ENV="production" `
    WEBSITE_NODE_DEFAULT_VERSION="18.17.0"

# Create PostgreSQL server
Write-Host "🗄️ Creating PostgreSQL server..." -ForegroundColor Cyan
$dbServerName = "smartinggoods-db-$(Get-Random -Minimum 1000 -Maximum 9999)"
$dbPassword = "SmartingGoods$(Get-Random -Minimum 100 -Maximum 999)!"

az postgres server create `
    --resource-group $ResourceGroup `
    --name $dbServerName `
    --location $Location `
    --admin-user "smartingadmin" `
    --admin-password $dbPassword `
    --sku-name "B_Gen5_1" `
    --version "13"

# Create database
Write-Host "📊 Creating database..." -ForegroundColor Cyan
az postgres db create `
    --resource-group $ResourceGroup `
    --server-name $dbServerName `
    --name "smartinggoods"

# Configure firewall rule for Azure services
az postgres server firewall-rule create `
    --resource-group $ResourceGroup `
    --server $dbServerName `
    --name "AllowAzureServices" `
    --start-ip-address "0.0.0.0" `
    --end-ip-address "0.0.0.0"

# Set database connection string
$connectionString = "postgresql://smartingadmin:$dbPassword@$dbServerName.postgres.database.azure.com:5432/smartinggoods?sslmode=require"
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $webAppName `
    --settings DATABASE_URL="$connectionString"

# Deploy application
Write-Host "🚀 Deploying application..." -ForegroundColor Cyan
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $webAppName `
    --src "deployment.zip"

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan
if (Test-Path "deployment.zip") {
    Remove-Item "deployment.zip"
}

# Create a temporary directory for deployment files
$tempDir = "temp-deploy"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir

# Copy necessary files
Copy-Item -Recurse ".next" "$tempDir/.next"
Copy-Item -Recurse "public" "$tempDir/public"
Copy-Item -Recurse "prisma" "$tempDir/prisma"
Copy-Item "package.json" "$tempDir/"
Copy-Item "package-lock.json" "$tempDir/"
Copy-Item "next.config.js" "$tempDir/"

# Create web.config for Azure
@"
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
"@ | Out-File -FilePath "$tempDir/web.config" -Encoding UTF8

# Create server.js for Azure
@"
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
"@ | Out-File -FilePath "$tempDir/server.js" -Encoding UTF8

# Create zip file
Compress-Archive -Path "$tempDir/*" -DestinationPath "deployment.zip"
Remove-Item -Recurse -Force $tempDir

# Deploy the zip file
az webapp deployment source config-zip `
    --resource-group $ResourceGroup `
    --name $webAppName `
    --src "deployment.zip"

# Run database migrations
Write-Host "🗄️ Running database migrations..." -ForegroundColor Cyan
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $webAppName `
    --settings PRISMA_MIGRATE="true"

# Restart the web app
Write-Host "🔄 Restarting web app..." -ForegroundColor Cyan
az webapp restart --resource-group $ResourceGroup --name $webAppName

# Get the URL
$appUrl = "https://$webAppName.azurewebsites.net"

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your application is available at: $appUrl" -ForegroundColor Yellow
Write-Host "🗄️ Database server: $dbServerName.postgres.database.azure.com" -ForegroundColor Yellow
Write-Host "👤 Database user: smartingadmin" -ForegroundColor Yellow
Write-Host "🔑 Database password: $dbPassword" -ForegroundColor Yellow

# Save deployment info
@"
SmartingGoods Platform Deployment Information
============================================
Deployment Date: $(Get-Date)
Environment: $Environment
Resource Group: $ResourceGroup
Web App Name: $webAppName
App URL: $appUrl
Database Server: $dbServerName.postgres.database.azure.com
Database Name: smartinggoods
Database User: smartingadmin
Database Password: $dbPassword
Connection String: $connectionString
"@ | Out-File -FilePath "deployment-info.txt" -Encoding UTF8

Write-Host "📄 Deployment information saved to deployment-info.txt" -ForegroundColor Cyan
Write-Host "🎉 SmartingGoods Platform is now live!" -ForegroundColor Green