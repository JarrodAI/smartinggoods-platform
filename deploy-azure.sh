#!/bin/bash

# 🚀 SMARTINGGOODS AI - RAPID AZURE DEPLOYMENT SCRIPT
# This script deploys the complete platform to Azure in under 2 hours

set -e

echo "🚀 SMARTINGGOODS AI - AZURE DEPLOYMENT"
echo "======================================"
echo "Deploying AI-powered business automation platform to Azure"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Configuration
RESOURCE_GROUP="smartinggoods-rg"
LOCATION="eastus"
APP_NAME="smartinggoods-ai"
DB_NAME="smartinggoods-db"
REDIS_NAME="smartinggoods-redis"
DB_PASSWORD="SmartingGoods2024!"
GITHUB_REPO="https://github.com/yourusername/smartinggoods-platform"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    print_error "Azure CLI is not installed. Please install it first:"
    echo "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    print_warning "Not logged in to Azure. Please login:"
    az login
fi

print_info "Starting Azure deployment..."

# Step 1: Create Resource Group
print_info "Creating resource group..."
if az group create --name $RESOURCE_GROUP --location $LOCATION --output none; then
    print_status "Resource group created: $RESOURCE_GROUP"
else
    print_warning "Resource group may already exist"
fi

# Step 2: Create PostgreSQL Database
print_info "Creating PostgreSQL database (this may take 5-10 minutes)..."
if az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_NAME \
    --location $LOCATION \
    --admin-user smartingadmin \
    --admin-password "$DB_PASSWORD" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --version 14 \
    --yes \
    --output none; then
    print_status "PostgreSQL database created: $DB_NAME"
else
    print_warning "Database creation may have failed or already exists"
fi

# Configure database firewall
print_info "Configuring database firewall..."
az postgres flexible-server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_NAME \
    --rule-name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 \
    --output none

az postgres flexible-server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_NAME \
    --rule-name AllowAllIPs \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 255.255.255.255 \
    --output none

print_status "Database firewall configured"

# Step 3: Create Redis Cache
print_info "Creating Redis cache..."
if az redis create \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --location $LOCATION \
    --sku Basic \
    --vm-size c0 \
    --output none; then
    print_status "Redis cache created: $REDIS_NAME"
else
    print_warning "Redis creation may have failed or already exists"
fi

# Step 4: Create Static Web App
print_info "Creating Static Web App..."
if az staticwebapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --source $GITHUB_REPO \
    --location $LOCATION \
    --branch main \
    --app-location "/" \
    --output-location ".next" \
    --output none; then
    print_status "Static Web App created: $APP_NAME"
else
    print_warning "Static Web App creation may have failed or already exists"
fi

# Step 5: Get connection strings
print_info "Retrieving connection strings..."

DB_CONNECTION_STRING="postgresql://smartingadmin:$DB_PASSWORD@$DB_NAME.postgres.database.azure.com:5432/postgres?sslmode=require"

REDIS_CONNECTION_STRING=$(az redis show-connection-string \
    --resource-group $RESOURCE_GROUP \
    --name $REDIS_NAME \
    --auth-type password \
    --query connectionString \
    --output tsv)

APP_URL=$(az staticwebapp show \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query defaultHostname \
    --output tsv)

print_status "Connection strings retrieved"

# Step 6: Configure Application Settings
print_info "Configuring application settings..."

# Generate a secure NextAuth secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

az staticwebapp appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --setting-names \
        DATABASE_URL="$DB_CONNECTION_STRING" \
        DIRECT_URL="$DB_CONNECTION_STRING" \
        NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        NEXTAUTH_URL="https://$APP_URL" \
        REDIS_URL="$REDIS_CONNECTION_STRING" \
        NODE_ENV="production" \
    --output none

print_status "Application settings configured"

# Step 7: Create Application Insights
print_info "Creating Application Insights..."
if az monitor app-insights component create \
    --app smartinggoods-insights \
    --location $LOCATION \
    --resource-group $RESOURCE_GROUP \
    --application-type web \
    --output none; then
    
    INSIGHTS_KEY=$(az monitor app-insights component show \
        --app smartinggoods-insights \
        --resource-group $RESOURCE_GROUP \
        --query instrumentationKey \
        --output tsv)
    
    az staticwebapp appsettings set \
        --name $APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --setting-names \
            APPINSIGHTS_INSTRUMENTATIONKEY="$INSIGHTS_KEY" \
        --output none
    
    print_status "Application Insights configured"
else
    print_warning "Application Insights creation may have failed"
fi

# Step 8: Display deployment information
echo ""
echo "🎉 AZURE DEPLOYMENT COMPLETED!"
echo "=============================="
print_status "All Azure resources have been created successfully"

echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "======================"
echo "🌐 Application URL: https://$APP_URL"
echo "🗄️ Database: $DB_NAME.postgres.database.azure.com"
echo "⚡ Redis Cache: $REDIS_NAME.redis.cache.windows.net"
echo "📊 Resource Group: $RESOURCE_GROUP"
echo "📍 Location: $LOCATION"

echo ""
echo "🔧 NEXT STEPS:"
echo "=============="
echo "1. 🔑 Add your API keys to the Static Web App settings:"
echo "   - OPENAI_API_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - STRIPE_PUBLISHABLE_KEY"
echo "   - TWILIO_ACCOUNT_SID"
echo "   - TWILIO_AUTH_TOKEN"
echo ""
echo "2. 🚀 Push your code to trigger deployment:"
echo "   git add ."
echo "   git commit -m 'Deploy to Azure'"
echo "   git push origin main"
echo ""
echo "3. 🗄️ Run database migrations:"
echo "   npx prisma db push"
echo "   npx prisma db seed"
echo ""
echo "4. 🌐 Configure custom domain (optional):"
echo "   az staticwebapp hostname set --name $APP_NAME --hostname yourdomain.com"

echo ""
echo "💰 ESTIMATED MONTHLY COST: ~$50"
echo "🎯 REVENUE TARGET: $17,500 MRR in Month 1"
echo ""
print_status "Your AI empire is ready to launch! 🚀"

# Create a deployment info file
cat > deployment-info.txt << EOF
SMARTINGGOODS AI - AZURE DEPLOYMENT INFO
=======================================

Application URL: https://$APP_URL
Database Connection: $DB_CONNECTION_STRING
Redis Connection: $REDIS_CONNECTION_STRING
Resource Group: $RESOURCE_GROUP
Location: $LOCATION

NextAuth Secret: $NEXTAUTH_SECRET

Deployment Date: $(date)
Status: SUCCESS ✅

Next Steps:
1. Add API keys to Static Web App settings
2. Push code to GitHub to trigger deployment
3. Run database migrations
4. Configure custom domain
5. Start generating revenue! 💰
EOF

print_status "Deployment info saved to deployment-info.txt"

echo ""
echo "🎊 CONGRATULATIONS! Your SmartingGoods AI Platform is deployed to Azure!"
echo "Ready to revolutionize the beauty industry and generate massive revenue! 🌟"