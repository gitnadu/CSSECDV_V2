#!/bin/bash

# CSSECDV_V2 Setup and Run Script
# This script installs dependencies, runs database migrations, and starts the dev server

set -e  # Exit on error

echo "================================================"
echo "CSSECDV_V2 Setup and Run Script"
echo "================================================"

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

print_success "Node.js found: $(node --version)"

# Install dependencies
print_status "Installing npm dependencies..."

npm install
npm install next react react-dom
npm install mongoose bcryptjs jsonwebtoken cookie
npm install tailwind-merge clsx tailwindcss-animate
npm install pg
npm install tailwindcss@3 postcss autoprefixer
npm install fs dotenv
npm install -D nodemon

print_success "All dependencies installed successfully!"

# Find PostgreSQL binary
PSQL_CMD=""

# Check common PostgreSQL installation locations on macOS
if command -v psql &> /dev/null; then
    PSQL_CMD="psql"
elif [ -f "/Applications/Postgres.app/Contents/Versions/latest/bin/psql" ]; then
    PSQL_CMD="/Applications/Postgres.app/Contents/Versions/latest/bin/psql"
elif [ -f "/usr/local/bin/psql" ]; then
    PSQL_CMD="/usr/local/bin/psql"
elif [ -f "/opt/homebrew/bin/psql" ]; then
    PSQL_CMD="/opt/homebrew/bin/psql"
else
    # Check /Library/PostgreSQL for any version
    PSQL_FOUND=$(find /Library/PostgreSQL/*/bin/psql 2>/dev/null | head -n 1)
    if [ -n "$PSQL_FOUND" ]; then
        PSQL_CMD="$PSQL_FOUND"
    fi
fi

if [ -z "$PSQL_CMD" ]; then
    print_error "PostgreSQL (psql) not found. Please ensure PostgreSQL is installed."
    print_status "Common installation paths checked:"
    print_status "  - /Applications/Postgres.app"
    print_status "  - /usr/local/bin"
    print_status "  - /opt/homebrew/bin"
    print_status "  - /Library/PostgreSQL"
    echo ""
    print_status "You can skip database creation by pressing Ctrl+C and running:"
    print_status "  1. Manually create the database"
    print_status "  2. Comment out the database creation section in this script"
    exit 1
fi

print_success "PostgreSQL found: $PSQL_CMD"

# Database credentials
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="postgres"
DB_PASSWORD="F0rtu1t0us_"
DB_NAME="enrollment_system"

# Create database
print_status "Creating database: $DB_NAME..."
export PGPASSWORD=$DB_PASSWORD
$PSQL_CMD -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || print_status "Database may already exist, continuing..."
unset PGPASSWORD
print_success "Database setup completed"

# Check if .env file exists
if [ ! -f .env ]; then
    print_status "Creating .env file with database credentials..."
    cat > .env << EOF
# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# JWT Configuration
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Node Environment
NODE_ENV=development
EOF
    print_success ".env file created"
else
    print_success ".env file already exists"
fi

# Run database migrations
print_status "Running database migrations..."
if [ -f "scripts/runMigrations.js" ]; then
    node scripts/runMigrations.js
    print_success "Migrations completed"
else
    print_error "runMigrations.js not found in scripts directory"
fi

# Run database scripts
print_status "Running database scripts..."
if [ -f "scripts/runScripts.js" ]; then
    node scripts/runScripts.js
    print_success "Database scripts completed"
else
    print_error "runScripts.js not found in scripts directory"
fi

echo ""
echo "================================================"
print_success "Setup completed successfully!"
echo "================================================"
echo ""
print_status "Starting development server..."
echo ""

# Start the development server
npm run dev
