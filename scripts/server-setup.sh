#!/bin/bash
# ============================================================
# ONE-TIME SERVER SETUP — run this once via SSH on Hostinger
# ssh your-user@your-host -p your-port
# bash server-setup.sh
# ============================================================
set -e

REPO_URL="https://github.com/OSAMA-ALI-SOFTWARE-ENGINEER/evoorion-real-state.git"
REPO_DIR="$HOME/evoorion"
BASE="$HOME/domains/osama-ali.com/public_html"

API_DIR="$BASE/evoorion-api.osama-ali.com"
WEB_DIR="$BASE/evoorion"
ADMIN_DIR="$BASE/evoorion-admin"

# ── 1. Clone the repo ──────────────────────────────────────
echo "→ Cloning repository..."
git clone "$REPO_URL" "$REPO_DIR"

# ── 2. Deploy Laravel API ──────────────────────────────────
echo "→ Setting up API..."
rsync -a --exclude='.env' "$REPO_DIR/backend/" "$API_DIR/"
cd "$API_DIR"
composer install --optimize-autoloader --no-interaction

echo ""
echo "ACTION REQUIRED — create $API_DIR/.env"
echo "Copy from backend/.env.production.example and fill in:"
echo "  APP_KEY, DB_DATABASE, DB_USERNAME, DB_PASSWORD, Cloudinary keys"
echo ""
read -p "Press ENTER once .env is created to continue..."

php artisan key:generate
php artisan migrate --force
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=CurrencySeeder
php artisan db:seed --class=PageContentSeeder
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✓ API ready"

# ── 3. Deploy Next.js Website ──────────────────────────────
echo "→ Setting up website..."
rsync -a --exclude='.env.production' \
  --exclude='node_modules' --exclude='.next' \
  "$REPO_DIR/apps/website/" "$WEB_DIR/"
cd "$WEB_DIR"

echo "NEXT_PUBLIC_API_URL=https://evoorion-api.osama-ali.com/api/v1" > .env.production

npm ci
npm run build
mkdir -p tmp
echo "✓ Website built"

# ── 4. Deploy Next.js Admin ────────────────────────────────
echo "→ Setting up admin..."
rsync -a --exclude='.env.production' \
  --exclude='node_modules' --exclude='.next' \
  "$REPO_DIR/apps/admin/" "$ADMIN_DIR/"
cd "$ADMIN_DIR"

echo "NEXT_PUBLIC_API_URL=https://evoorion-api.osama-ali.com/api/v1" > .env.production

npm ci
npm run build
mkdir -p tmp
echo "✓ Admin built"

# ── 5. Done ────────────────────────────────────────────────
echo ""
echo "============================================"
echo "Initial setup complete."
echo "Next steps in hPanel:"
echo "  1. Node.js manager → create app for evoorion/"
echo "     Startup file: node_modules/.bin/next"
echo "     Args: start"
echo "  2. Node.js manager → create app for evoorion-admin/"
echo "     Same startup settings"
echo "  3. SSL → Let's Encrypt on all 3 subdomains"
echo "============================================"
