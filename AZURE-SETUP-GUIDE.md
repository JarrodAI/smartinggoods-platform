# Azure Setup Guide for SmartingGoods Platform

## Prerequisites Setup (Copy & Paste Commands)

### 1. Install Azure CLI (if not already installed)

**Windows (PowerShell as Administrator):**
```powershell
# Download and install Azure CLI
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi; Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'; rm .\AzureCLI.msi
```

**Alternative - Using Chocolatey:**
```powershell
choco install azure-cli
```

**Alternative - Using Winget:**
```powershell
winget install Microsoft.AzureCLI
```

### 2. Install Node.js (if not already installed)

**Windows (PowerShell as Administrator):**
```powershell
# Using Chocolatey
choco install nodejs

# OR using Winget
winget install OpenJS.NodeJS
```

### 3. Verify Installations
```powershell
# Check Azure CLI
az --version

# Check Node.js
node --version
npm --version
```

## Azure Account Setup

### 1. Login to Azure
```powershell
# Login to your Azure account
az login
```
*This will open a browser window for authentication*

### 2. List Available Subscriptions
```powershell
# See all your subscriptions
az account list --output table
```

### 3. Set Default Subscription (if you have multiple)
```powershell
# Replace YOUR_SUBSCRIPTION_ID with your actual subscription ID
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 4. Verify Current Subscription
```powershell
# Confirm which subscription is active
az account show --output table
```

## Environment Variables Setup

### Create .env.production file
Create this file in your `smartinggoods-platform` folder:

```bash
# Copy this entire block and save as .env.production

# Next.js Configuration
NEXTAUTH_URL=https://your-app-name.azurewebsites.net
NEXTAUTH_SECRET=your-nextauth-secret-here

# Database Configuration (will be set by deployment script)
DATABASE_URL=postgresql://username:password@server.postgres.database.azure.com:5432/database?sslmode=require

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key-here
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-here

# Redis Configuration (optional - can use Azure Redis)
REDIS_URL=redis://your-redis-url:6379

# Production Mode
NODE_ENV=production
```

## API Keys You Need to Obtain

### 1. OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Replace `sk-your-openai-api-key-here` in .env.production

### 2. Stripe API Keys
1. Go to: https://dashboard.stripe.com/apikeys
2. Copy "Publishable key" (starts with `pk_`)
3. Copy "Secret key" (starts with `sk_`)
4. For webhook secret:
   - Go to: https://dashboard.stripe.com/webhooks
   - Create endpoint: `https://your-app-name.azurewebsites.net/api/stripe/webhooks`
   - Copy the signing secret (starts with `whsec_`)

### 3. Gmail App Password (for email)
1. Go to: https://myaccount.google.com/security
2. Enable 2-factor authentication
3. Go to "App passwords"
4. Generate password for "Mail"
5. Use this 16-character password in SMTP_PASS

## Pre-Deployment Checklist

### 1. Navigate to Project Directory
```powershell
cd smartinggoods-platform
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Test Build Locally
```powershell
npm run build
```

### 4. Verify Environment File
```powershell
# Check if .env.production exists
Get-Content .env.production
```

## Ready to Deploy Commands

### Option 1: Quick Deploy (Default Settings)
```powershell
# Run the deployment script with defaults
.\deploy.ps1
```

### Option 2: Custom Deploy
```powershell
# Deploy with custom settings
.\deploy.ps1 -Environment "production" -ResourceGroup "my-smarting-rg" -Location "East US"
```

### Option 3: Skip Build (if already built)
```powershell
# Skip the build step
.\deploy.ps1 -SkipBuild
```

## Post-Deployment Steps

### 1. Get Your App URL
After deployment completes, check the `deployment-info.txt` file:
```powershell
Get-Content deployment-info.txt
```

### 2. Update Environment Variables
```powershell
# Replace YOUR_RESOURCE_GROUP and YOUR_WEB_APP_NAME with actual values from deployment-info.txt
az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings OPENAI_API_KEY="sk-your-actual-openai-key"

az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings STRIPE_PUBLISHABLE_KEY="pk_live_your-actual-stripe-key"

az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings STRIPE_SECRET_KEY="sk_live_your-actual-stripe-secret"

az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings STRIPE_WEBHOOK_SECRET="whsec_your-actual-webhook-secret"

az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings SMTP_USER="your-actual-email@gmail.com"

az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings SMTP_PASS="your-actual-app-password"
```

### 3. Restart App
```powershell
az webapp restart --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME"
```

## Troubleshooting Commands

### Check App Logs
```powershell
# Stream live logs
az webapp log tail --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME"

# Download log files
az webapp log download --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME"
```

### Check App Status
```powershell
az webapp show --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --query "state"
```

### Update App Settings
```powershell
# View current settings
az webapp config appsettings list --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME"
```

## Cost Optimization

### Check Current Costs
```powershell
# View cost analysis
az consumption usage list --start-date 2024-01-01 --end-date 2024-01-31
```

### Scale Down for Development
```powershell
# Scale to free tier (limited hours)
az appservice plan update --resource-group "YOUR_RESOURCE_GROUP" --name "smartinggoods-plan" --sku FREE
```

## Cleanup Commands (if needed)

### Delete Everything
```powershell
# WARNING: This deletes everything in the resource group
az group delete --name "YOUR_RESOURCE_GROUP" --yes --no-wait
```

## Quick Reference

**Your app will be available at:**
`https://smartinggoods-XXXX.azurewebsites.net`

**Database connection will be:**
`smartinggoods-db-XXXX.postgres.database.azure.com`

**Important files created:**
- `deployment-info.txt` - Contains all your deployment details
- `deployment.zip` - Your app package (can be deleted after deployment)

## Support

If you encounter issues:
1. Check `deployment-info.txt` for your specific details
2. Use the troubleshooting commands above
3. Check Azure portal: https://portal.azure.com
4. View app logs for specific errors

**Ready to deploy? Run:**
```powershell
.\deploy.ps1
```