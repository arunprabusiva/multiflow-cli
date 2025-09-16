@echo off
echo 🔐 Setting up GitHub Authentication
echo ==================================
echo.

echo ⚠️  IMPORTANT: This token should be kept private!
echo.

echo 📋 Setting up git credentials...
git config --global user.name "Arunprabu Sivapprakasam"

set /p email="Enter your GitHub email: "
git config --global user.email "%email%"

echo.
echo 🔑 For HTTPS authentication, you can:
echo 1. Use GitHub CLI: gh auth login
echo 2. Use the token when prompted for password
echo 3. Store credentials: git config --global credential.helper store
echo.

echo ✅ Git configuration updated!
echo.
echo 🚀 Now you can run: deploy.bat
pause