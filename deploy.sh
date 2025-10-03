#!/bin/bash

# SmartingGoods Platform - Azure Deployment Script
# Bash deployment script for Linux/macOS

set -e

# Default values
ENVIRONMENT="production"
RESOURCE_GROUP="smartinggoods-rg"
LOCATION="East US"
SKIP_BUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -e|--environment)
      ENVIRONMENT="$2"
      shift 2
      ;;
    -g|--resource-group)
      RESOURCE_GROUP="$2"
      shift 2
      ;;
    -l|--location)
      LOCATION="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  -e, --environment     Environment (default: production)"
      echo "  -g, --resource-group  Resource group name (default: smartinggoods-rg)"
      echo "  -l, --location        Azure location (default: East US)"
      echo "  --skip-build          Skip npm build step"
      echo "  -h, --help            Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

echo "🚀 Starting SmartingGoods Platform Deployment"
echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP"

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install Azure CLI first."
    exit 1
fi
echo "✅ Azure CLI found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js found"

# Login to Azure
echo "🔐 Logging into Azure..."
az login

# Create resource group
echo "📦 Creating resource group..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Install dependencies and build
if [ "$SKIP_BUILD" = false ]; then
    echo "📦 Installing dependencies..."
    npm install

    echo "🔧 Building application..."
    npm run build
fi

# Create App Service Plan
echo "🏗️ Creating App Service Plan..."
az appservice plan create \
    --name "smartinggoods-plan" \
    --resource-group "$RESOURCE_GROUP" \
    --sku B1 \
    --is-linux

# Create Web App
echo "🌐 Creating Web App..."
WEB_APP_NAME="smartinggoods-$RANDOM"
az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "smartinggoods-plan" \
    --name "$WEB_APP_NAME" \
    --runtime "NODE:18-lts"

# Configure environment variables
echo "⚙️ Setting environment variables..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEB_APP_NAME" \
    --settings \
    NEXTAUTH_URL="https://$WEB_APP_NAME.azurewebsites.net" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    NODE_ENV="production" \
    WEBSITE_NODE_DEFAULT_VERSION="18.17.0"

# Create PostgreSQL server
echo "🗄️ Creating PostgreSQL server..."
DB_SERVER_NAME="smartinggoods-db-$RANDOM"
DB_PASSWORD="SmartingGoods$(shuf -i 100-999 -n 1)!"

az postgres server create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$DB_SERVER_NAME" \
    --location "$LOCATION" \
    --admin-user "smartingadmin" \
    --admin-password "$DB_PASSWORD" \
    --sku-name "B_Gen5_1" \
    --version "13"

# Create database
echo "📊 Creating database..."
az postgres db create \
    --resource-group "$RESOURCE_GROUP" \
    --server-name "$DB_SERVER_NAME" \
    --name "smartinggoods"

# Configure firewall rule for Azure services
az postgres server firewall-rule create \
    --resource-group "$RESOURCE_GROUP" \
    --server "$DB_SERVER_NAME" \
    --name "AllowAzureServices" \
    --start-ip-address "0.0.0.0" \
    --end-ip-address "0.0.0.0"

# Set database connection string
CONNECTION_STRING="postgresql://smartingadmin:$DB_PASSWORD@$DB_SERVER_NAME.postgres.database.azure.com:5432/smartinggoods?sslmode=require"
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEB_APP_NAME" \
    --settings DATABASE_URL="$CONNECTION_STRING"

# Create deployment package
echo "📦 Creating deployment package..."
rm -f deployment.zip

# Create a temporary directory for deployment files
TEMP_DIR="temp-deploy"
rm -rf "$TEMP_DIR"
mkdir "$TEMP_DIR"

# Copy necessary files
cp -r .next "$TEMP_DIR/"
cp -r public "$TEMP_DIR/"
cp -r prisma "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
cp package-lock.json "$TEMP_DIR/"
cp next.config.js "$TEMP_DIR/"

# Create web.config for Azure
cat > "$TEMP_DIR/web.config" << 'EOF'
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
EOF

# Create server.js for Azure
cat > "$TEMP_DIR/server.js" << 'EOF'
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
EOF

# Create zip file
cd "$TEMP_DIR"
zip -r ../deployment.zip .
cd ..
rm -rf "$TEMP_DIR"

# Deploy the zip file
echo "🚀 Deploying application..."
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEB_APP_NAME" \
    --src "deployment.zip"

# Run database migrations
echo "🗄️ Running database migrations..."
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP" \
    --name "$WEB_APP_NAME" \
    --settings PRISMA_MIGRATE="true"

# Restart the web app
echo "🔄 Restarting web app..."
az webapp restart --resource-group "$RESOURCE_GROUP" --name "$WEB_APP_NAME"

# Get the URL
APP_URL="https://$WEB_APP_NAME.azurewebsites.net"

echo "✅ Deployment completed successfully!"
echo "🌐 Your application is available at: $APP_URL"
echo "🗄️ Database server: $DB_SERVER_NAME.postgres.database.azure.com"
echo "👤 Database user: smartingadmin"
echo "🔑 Database password: $DB_PASSWORD"

# Save deployment info
cat > deployment-info.txt << EOF
SmartingGoods Platform Deployment Information
============================================
Deployment Date: $(date)
Environment: $ENVIRONMENT
Resource Group: $RESOURCE_GROUP
Web App Name: $WEB_APP_NAME
App URL: $APP_URL
Database Server: $DB_SERVER_NAME.postgres.database.azure.com
Database Name: smartinggoods
Database User: smartingadmin
Database Password: $DB_PASSWORD
Connection String: $CONNECTION_STRING
EOF

echo "📄 Deployment information saved to deployment-info.txt"
echo "🎉 SmartingGoods Platform is now live!"