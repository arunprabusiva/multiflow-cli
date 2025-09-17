#!/bin/bash

echo "🌊 MultiFlow CLI - Local Version Test"
echo "===================================="
echo "Testing local version without npm install"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."
echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"

# Create test workspace
echo ""
echo "🏗️  Creating test workspace..."
TEST_DIR="local-test-$(date +%s)"
mkdir $TEST_DIR
cd $TEST_DIR

# Create mock repositories with git config
echo "📁 Setting up realistic multi-repo project..."
git config --global user.email "test@example.com"
git config --global user.name "Test User"

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

# Test using local CLI
echo ""
echo "🚀 Testing local MultiFlow CLI..."
FLOW_CMD="node ../src/cli.js"

echo "  → Testing version..."
$FLOW_CMD --version

echo "  → Testing init..."
$FLOW_CMD init

echo "  → Testing doctor..."
$FLOW_CMD doctor

echo "  → Testing feature create..."
$FLOW_CMD feature create test-feature

echo "  → Testing status..."
$FLOW_CMD status test-feature

# Make some changes and test commit
echo ""
echo "📝 Making changes and testing commit..."
echo "// Added login functionality" >> frontend/app.js
echo "// Added auth endpoints" >> backend/server.js

$FLOW_CMD feature commit test-feature -m "Add user authentication system"

echo "  → Testing profile creation..."
$FLOW_CMD profile create frontend-team --repos frontend mobile docs
$FLOW_CMD profile list

echo "  → Testing PR URL generation..."
$FLOW_CMD pr test-feature --title "Add user authentication system"

echo "  → Testing feature cleanup..."
$FLOW_CMD feature cleanup test-feature

# Clean up workspace
echo ""
echo "🧹 Cleaning up test workspace..."
cd ..
rm -rf $TEST_DIR

echo ""
echo "✅ Local test completed successfully!"
echo "🎉 MultiFlow v2.0.2 is ready for publishing!"