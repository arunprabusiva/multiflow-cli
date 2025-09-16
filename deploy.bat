@echo off
echo 🌊 MultiFlow Deployment Script
echo ==============================
echo.

echo 📋 Step 1: Check current git status
git status
echo.

echo 📋 Step 2: Check remote configuration
git remote -v
echo.

echo 📋 Step 3: Ready to push to GitHub
echo Repository: https://github.com/arunprabusiva/multiflow-cli
echo.
echo ⚠️  Make sure you:
echo    1. Created the repository on GitHub (arunprabusiva/multiflow-cli)
echo    2. Are logged into the correct GitHub account
echo    3. Have your GitHub token ready for authentication
echo.

set /p confirm="Ready to push? (y/n): "
if /i "%confirm%"=="y" (
    echo.
    echo 🚀 Pushing to GitHub...
    git push -u origin main
    
    if %errorlevel%==0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo 🔗 Repository: https://github.com/arunprabusiva/multiflow-cli
        echo.
        echo 📦 Next step: Publish to npm
        set /p npm_confirm="Publish to npm now? (y/n): "
        if /i "!npm_confirm!"=="y" (
            echo.
            echo 📦 Publishing to npm...
            npm publish
            
            if %errorlevel%==0 (
                echo.
                echo 🎉 SUCCESS! MultiFlow is now live!
                echo 📦 npm: https://www.npmjs.com/package/multiflow-cli
                echo 🐙 GitHub: https://github.com/arunprabusiva/multiflow-cli
                echo.
                echo 🚀 Ready to share with the world!
            ) else (
                echo ❌ npm publish failed. Check your npm login.
            )
        )
    ) else (
        echo ❌ Git push failed. Check your GitHub authentication.
    )
) else (
    echo ⏸️  Deployment cancelled.
)

echo.
pause