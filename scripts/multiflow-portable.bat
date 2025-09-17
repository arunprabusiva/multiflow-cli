@echo off
REM Multimflow Portable - Windows Corporate Version
REM Usage: multiflow-portable.bat --help
REM No installation required - just download and run

setlocal

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is required but not found
    echo    Please install Node.js 16+ from: https://nodejs.org/
    pause
    exit /b 1
)

REM Get the directory where this batch file is located
set SCRIPT_DIR=%~dp0

REM Try different methods to run MultiFlow
if exist "%SCRIPT_DIR%multiflow-standalone.js" (
    node "%SCRIPT_DIR%multiflow-standalone.js" %*
) else if exist "%SCRIPT_DIR%node_modules\multiflow-cli" (
    node "%SCRIPT_DIR%node_modules\multiflow-cli\src\cli.js" %*
) else (
    echo 🔄 First time setup - downloading MultiFlow...
    npx multiflow-cli@latest %*
)
