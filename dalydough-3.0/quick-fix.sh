#!/bin/bash
echo "🔧 Quick Fix for DalyDough Development Setup"

# Clean up
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Create environment files
echo "FMP_API_KEY=RUTyEslPzCs5tHMBZUUxCr2no36EV45Q" > .env.local
mkdir -p supabase
echo "FMP_API_KEY=RUTyEslPzCs5tHMBZUUxCr2no36EV45Q" > supabase/.env.local

echo "✅ Setup complete!"
