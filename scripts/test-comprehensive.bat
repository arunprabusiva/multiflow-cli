@echo off
echo 🧪 Multimflow Comprehensive Local Test
echo =====================================

REM Create test workspace
echo.
echo 📁 Setting up test workspace...
mkdir test-workspace 2>nul
cd test-workspace

REM Create 4 test repositories
echo.
echo 🏗️ Creating test repositories...

mkdir frontend
cd frontend
git init
echo # Frontend React App > README.md
echo const App = () => ^<div^>Frontend^</div^>; > src.js
git add .
git commit -m "Initial frontend setup"
cd ..

mkdir backend
cd backend  
git init
echo # Backend API > README.md
echo const express = require('express'); > server.js
git add .
git commit -m "Initial backend setup"
cd ..

mkdir mobile
cd mobile
git init
echo # Mobile App > README.md
echo import React from 'react'; > App.tsx
git add .
git commit -m "Initial mobile setup"
cd ..

mkdir database
cd database
git init
echo # Database Migrations > README.md
echo CREATE TABLE users(); > schema.sql
git add .
git commit -m "Initial database setup"
cd ..

echo.
echo ✅ Created 4 test repositories

REM Test Multimflow commands
echo.
echo 🌊 Testing Multimflow Commands...
echo.

echo 1. Initialize workspace
node ..\src\cli.js init

echo.
echo 2. Show initial config
node ..\src\cli.js config show

echo.
echo 3. Create profiles
node ..\src\cli.js profile create frontend-only --repos frontend
node ..\src\cli.js profile create backend-only --repos backend database
node ..\src\cli.js profile create fullstack --repos frontend backend mobile

echo.
echo 4. List profiles
node ..\src\cli.js profile list

echo.
echo 5. Show profile details
node ..\src\cli.js profile show frontend-only

echo.
echo 6. Switch to frontend profile
node ..\src\cli.js profile switch frontend-only

echo.
echo 7. Create feature (should only affect frontend)
node ..\src\cli.js feature create user-authentication

echo.
echo 8. Check status
node ..\src\cli.js status user-authentication

echo.
echo 9. Make changes and commit
cd frontend
echo const Login = () => ^<div^>Login^</div^>; > Login.js
git add .
cd ..
node ..\src\cli.js feature commit user-authentication -m "Add login component"

echo.
echo 10. Switch to fullstack profile
node ..\src\cli.js profile switch fullstack

echo.
echo 11. Create another feature (should affect all repos)
node ..\src\cli.js feature create payment-system

echo.
echo 12. Show workspace health
node ..\src\cli.js doctor

echo.
echo 13. Show diff
node ..\src\cli.js diff user-authentication --summary

echo.
echo 14. Test checkout
node ..\src\cli.js checkout main

echo.
echo 15. Cleanup features
node ..\src\cli.js feature cleanup user-authentication
node ..\src\cli.js feature cleanup payment-system

echo.
echo 16. Delete profile
node ..\src\cli.js profile delete backend-only

echo.
echo 17. Final config
node ..\src\cli.js config show

echo.
echo 🎉 Comprehensive test completed!
echo Check the output above for any errors.

cd ..
pause
