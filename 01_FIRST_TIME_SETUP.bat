@echo off
chcp 65001 >nul
cd /d "%~dp0"
title CASAVELLE - First Time Setup
echo ================================================
echo       CASAVELLE WEBSITE - FIRST TIME SETUP
echo ================================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or Windows cannot find it.
  echo This is why your terminal says 'npm is not recognized'.
  echo.
  echo Step 1: A browser will open the official Node.js website.
  echo Step 2: Download the LTS version and install it.
  echo Step 3: During installation, keep the default options enabled.
  echo Step 4: IMPORTANT: Close VS Code completely and open it again.
  echo Step 5: Double-click this file again.
  echo.
  start "" "https://nodejs.org/en/download"
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was found, but npm is not available in PATH.
  echo Restart Windows after installing Node.js, then try again.
  pause
  exit /b 1
)
echo Node.js version:
node --version
echo npm version:
npm --version
echo.
if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env from .env.example.
  echo A settings file will open. Set ADMIN_EMAIL, ADMIN_PASSWORD and JWT_SECRET.
  notepad .env
  echo After saving the file, return to this window.
  pause
)
echo.
echo Installing website dependencies. Please wait...
npm install
if errorlevel 1 (
  echo.
  echo INSTALL FAILED. Check internet connection and read the error above.
  pause
  exit /b 1
)
echo.
echo Setup complete. Starting CASAVELLE website...
echo Keep this window open while using the website.
start "" "http://localhost:3000"
npm start
pause
