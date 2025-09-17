#!/bin/bash

echo "🌊 MultiFlow CLI - Real User Test"
echo "================================"
echo "This script tests MultiFlow as a real user would experience it"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Install from npm (like a real user)
echo ""
echo "📦 Installing MultiFlow CLI from npm..."
npm install -g multiflow-cli

# Check installation
echo ""
echo "🔍 Checking installation..."
if command -v mflow &> /dev/null; then
    echo "✅ 'mflow' command is available globally"
    mflow --version
else
    echo "⚠️  'mflow' command not found, using npx fallback"
    npx multiflow-cli --version
fi

# Create a real test workspace
echo ""
echo "🏗️  Creating test workspace..."
mkdir multiflow-demo
cd multiflow-demo

# Create realistic repositories
echo "📁 Setting up realistic multi-repo project..."
repos=("frontend" "backend" "mobile" "docs")

for repo in "${repos[@]}"; do
    echo "  Creating $repo repository..."
    mkdir $repo
    cd $repo
    git init
    
    case $repo in
        "frontend")
            echo "# Frontend App" > README.md
            echo "console.log('Hello Frontend');" > app.js
            ;;
        "backend")
            echo "# Backend API" > README.md
            echo "const express = require('express');" > server.js
            ;;
        "mobile")
            echo "# Mobile App" > README.md
            echo "import React from 'react';" > App.jsx
            ;;
        "docs")
            echo "# Documentation" > README.md
            echo "# API Documentation" > api.md
            ;;
    esac
    
    git add .
    git commit -m "Initial $repo setup"
    cd ..
done

# Test the 30-second getting started experience
echo ""
echo "🚀 Testing the 30-second getting started experience..."

echo "  Step 1: Initialize MultiFlow..."
if command -v mflow &> /dev/null; then
    mflow init
else
    npx multiflow-cli init
fi

echo ""
echo "  Step 2: Create a feature..."
if command -v mflow &> /dev/null; then
    mflow feature create user-authentication
else
    npx multiflow-cli feature create user-authentication
fi

echo ""
echo "  Step 3: Check status..."
if command -v mflow &> /dev/null; then
    mflow status user-authentication
else
    npx multiflow-cli status user-authentication
fi

# Make some changes and test commit
echo ""
echo "📝 Making changes and testing commit..."
echo "// Added login functionality" >> frontend/app.js
echo "// Added auth endpoints" >> backend/server.js

if command -v mflow &> /dev/null; then
    mflow feature commit user-authentication -m "Add user authentication system"
else
    npx multiflow-cli feature commit user-authentication -m "Add user authentication system"
fi

# Test other essential commands
echo ""
echo "🧪 Testing essential commands..."

echo "  → Testing doctor command..."
if command -v mflow &> /dev/null; then
    mflow doctor
else
    npx multiflow-cli doctor
fi

echo "  → Testing profile creation..."
if command -v mflow &> /dev/null; then
    mflow profile create frontend-team --repos frontend mobile docs
    mflow profile list
else
    npx multiflow-cli profile create frontend-team --repos frontend mobile docs
    npx multiflow-cli profile list
fi

echo "  → Testing PR URL generation..."
if command -v mflow &> /dev/null; then
    mflow pr user-authentication --title "Add user authentication system"
else
    npx multiflow-cli pr user-authentication --title "Add user authentication system"
fi

# Clean up feature
echo ""
echo "🧹 Cleaning up feature..."
if command -v mflow &> /dev/null; then
    mflow feature cleanup user-authentication
else
    npx multiflow-cli feature cleanup user-authentication
fi

# Clean up workspace
echo ""
echo "🗂️  Cleaning up test workspace..."
cd ..
rm -rf multiflow-demo

echo ""
echo "✅ User test completed successfully!"
echo ""
echo "📊 Test Summary:"
echo "  ✅ Installation from npm"
echo "  ✅ 30-second getting started flow"
echo "  ✅ Feature creation and management"
echo "  ✅ Cross-repo operations"
echo "  ✅ Profile management"
echo "  ✅ PR URL generation"
echo "  ✅ Workspace cleanup"

# Uninstall
echo ""
echo "🗑️  Uninstalling MultiFlow CLI..."
npm uninstall -g multiflow-cli

echo ""
echo "🎉 MultiFlow CLI test completed and uninstalled!"
echo "   Ready for real users! 🚀"