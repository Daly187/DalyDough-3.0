#!/bin/bash

# Navigate to your project directory
cd /path/to/your/project

# Show git status
git status

# Stage all changes
git add .

# Ask for a commit message
read -p "Enter your commit message: " msg

# Commit changes
git commit -m "$msg"

# Pull latest changes (to avoid conflicts)
git pull origin main

# Push to GitHub
git push origin main

echo "✅ Github updated with your latest changes!"
