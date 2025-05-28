#!/bin/bash

# deploy.sh - DigitalOcean Deployment Script for Prometheus Exercise Library
# Run this on your DigitalOcean droplet

set -e  # Exit on any error

echo "🚀 Starting Prometheus Exercise Library Deployment..."

# Configuration
PROJECT_DIR="/var/www/prometheus-exercise-library"
REPO_URL="https://github.com/YOUR_USERNAME/prometheus-exercise-library.git"  # Replace with your repo
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install Node.js (using NodeSource repository)
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js version: $node_version"
print_status "NPM version: $npm_version"

# Install PM2 globally
print_status "Installing PM2..."
npm install -g pm2

# Install NGINX
print_status "Installing NGINX..."
apt install -y nginx

# Install MongoDB (if not using external service)
print_status "Installing MongoDB..."
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org
systemctl enable mongod
systemctl start mongod

# Create project directory
print_status "Creating project directory..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating existing repository..."
    git fetch origin
    git reset --hard origin/$BRANCH
else
    print_status "Cloning repository..."
    git clone $REPO_URL .
fi

# Install server dependencies
print_status "Installing server dependencies..."
cd $PROJECT_DIR/server
npm ci --production

# Install client dependencies and build
print_status "Installing client dependencies and building..."
cd $PROJECT_DIR/client
npm ci
npm run build

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p $PROJECT_DIR/server/logs
mkdir -p $PROJECT_DIR/server/uploads
chown -R www-data:www-data $PROJECT_DIR/server/uploads
chmod 755 $PROJECT_DIR/server/uploads

# Set up environment variables
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
    print_warning "Creating .env file template..."
    cat > $PROJECT_DIR/server/.env << EOL
# MongoDB
MONGODB_URI=mongodb://localhost:27017/prometheus-exercise-library

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Admin Passwords
ADMIN_PASSWORD1=Kraft
ADMIN_PASSWORD2=Vision

# API Keys (Optional)
OPENAI_API_KEY=your-openai-api-key
YOUTUBE_API_KEY=your-youtube-api-key
READY_PLAYER_ME_API_KEY=your-ready-player-me-api-key

# Environment
NODE_ENV=production
PORT=5000
EOL
    print_warning "Please edit $PROJECT_DIR/server/.env with your actual values!"
fi

# Copy PM2 ecosystem file
print_status "Setting up PM2 configuration..."
cp $PROJECT_DIR/ecosystem.config.js $PROJECT_DIR/server/

# Start application with PM2
print_status "Starting application with PM2..."
cd $PROJECT_DIR/server
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Set up NGINX
print_status "Configuring NGINX..."
cp $PROJECT_DIR/nginx.conf /etc/nginx/sites-available/prometheus-exercise-library
ln -sf /etc/nginx/sites-available/prometheus-exercise-library /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test NGINX configuration
nginx -t
if [ $? -eq 0 ]; then
    print_status "NGINX configuration is valid"
    systemctl reload nginx
    systemctl enable nginx
else
    print_error "NGINX configuration has errors!"
    exit 1
fi

# Set up UFW firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Install SSL certificate (Let's Encrypt)
print_status "Installing SSL certificate..."
apt install -y certbot python3-certbot-nginx

print_warning "To complete SSL setup, run:"
print_warning "certbot --nginx -d your-domain.com -d www.your-domain.com"

# Final status check
print_status "Checking service status..."
echo "MongoDB: $(systemctl is-active mongod)"
echo "NGINX: $(systemctl is-active nginx)"
echo "PM2 processes:"
pm2 status

print_status "🎉 Deployment completed!"
print_warning "Next steps:"
print_warning "1. Edit $PROJECT_DIR/server/.env with your actual values"
print_warning "2. Update domain in NGINX config: $PROJECT_DIR/nginx.conf"
print_warning "3. Run SSL certificate setup: sudo certbot --nginx -d your-domain.com"
print_warning "4. Restart services: sudo systemctl reload nginx && pm2 restart all"

echo ""
print_status "Your Prometheus Exercise Library should be accessible at:"
print_status "http://YOUR_DROPLET_IP (temporary)"
print_status "https://your-domain.com (after DNS + SSL setup)"