#!/bin/bash

echo "🌊 MultiFlow Deployment Script"
echo "=============================="
echo ""

echo "📋 Step 1: Check current git status"
git status
echo ""

echo "📋 Step 2: Check remote configuration"
git remote -v
echo ""

echo "📋 Step 3: Ready to push to GitHub"
echo "Repository: https://github.com/arunprabusiva/multiflow-cli"
echo ""
echo "⚠️  Make sure you:"
echo "   1. Created the repository on GitHub (arunprabusiva/multiflow-cli)"
echo "   2. Are logged into the correct GitHub account"
echo ""

read -p "Ready to push? (y/n): " confirm
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
    echo ""
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo "🔗 Repository: https://github.com/arunprabusiva/multiflow-cli"
        echo ""
        echo "📦 Next step: Publish to npm"
        read -p "Publish to npm now? (y/n): " npm_confirm
        if [[ $npm_confirm == [yY] || $npm_confirm == [yY][eE][sS] ]]; then
            echo ""
            echo "📦 Publishing to npm..."
            npm publish
            
            if [ $? -eq 0 ]; then
                echo ""
                echo "🎉 SUCCESS! MultiFlow is now live!"
                echo "📦 npm: https://www.npmjs.com/package/multiflow-cli"
                echo "🐙 GitHub: https://github.com/arunprabusiva/multiflow-cli"
                echo ""
                echo "🚀 Ready to share with the world!"
            else
                echo "❌ npm publish failed. Check your npm login."
            fi
        fi
    else
        echo "❌ Git push failed. Check your GitHub authentication."
    fi
else
    echo "⏸️  Deployment cancelled."
fi

echo ""