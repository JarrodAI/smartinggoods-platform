# 🚀 QUICK DEPLOY - SmartingGoods Platform

## 30-Second Setup

### 1. Get Your API Keys (Copy these URLs)

**OpenAI API Key:**
```
https://platform.openai.com/api-keys
```
Click "Create new secret key" → Copy the key (starts with `sk-`)

**Stripe Keys:**
```
https://dashboard.stripe.com/apikeys
```
Copy both "Publishable key" (pk_) and "Secret key" (sk_)

### 2. Create .env.production File

Copy this ENTIRE block and save as `.env.production` in your smartinggoods-platform folder:

```bash
# SmartingGoods Platform - Production Environment
NEXTAUTH_URL=https://your-app-will-be-set-automatically.azurewebsites.net
NEXTAUTH_SECRET=auto-generated-by-deployment-script
DATABASE_URL=auto-generated-by-deployment-script
NODE_ENV=production

# REPLACE THESE WITH YOUR ACTUAL KEYS:
OPENAI_API_KEY=sk-your-openai-key-here
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key-here
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here

# EMAIL (Optional - use your Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# REDIS (Optional)
REDIS_URL=redis://localhost:6379
```

### 3. Install Azure CLI (if needed)

**Windows PowerShell (as Administrator):**
```powershell
winget install Microsoft.AzureCLI
```

### 4. Login to Azure
```powershell
az login
```

### 5. Deploy!
```powershell
cd smartinggoods-platform
.\deploy.ps1
```

## That's It! 

The script will:
- ✅ Create all Azure resources
- ✅ Set up PostgreSQL database
- ✅ Deploy your app
- ✅ Configure everything automatically
- ✅ Give you the live URL

**Your app will be live at:** `https://smartinggoods-XXXX.azurewebsites.net`

## After Deployment

### Update Your API Keys
Replace the values in the commands below with your actual keys from step 1:

```powershell
# Get your app details from deployment-info.txt
Get-Content deployment-info.txt

# Update with your real API keys (replace the values)
az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings OPENAI_API_KEY="sk-your-real-openai-key"

az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings STRIPE_PUBLISHABLE_KEY="pk_live_your-real-stripe-key"

az webapp config appsettings set --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME" --settings STRIPE_SECRET_KEY="sk_live_your-real-stripe-secret"

# Restart app
az webapp restart --resource-group "YOUR_RESOURCE_GROUP" --name "YOUR_WEB_APP_NAME"
```

## Troubleshooting

**If deployment fails:**
```powershell
# Check what went wrong
az webapp log tail --resource-group "smartinggoods-rg" --name "YOUR_WEB_APP_NAME"
```

**If you need to redeploy:**
```powershell
.\deploy.ps1 -SkipBuild
```

**Total time:** ~10-15 minutes for full deployment!

🎉 **Your SmartingGoods Platform will be LIVE!**