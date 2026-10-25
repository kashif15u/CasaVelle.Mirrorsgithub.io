@echo off
chcp 65001 >nul
cd /d "%~dp0"
title CASAVELLE - Start Website
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing. Run 01_FIRST_TIME_SETUP.bat first.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Dependencies not installed yet. Run 01_FIRST_TIME_SETUP.bat first.
  pause
  exit /b 1
)
if not exist .env (
  echo .env settings file missing. Run 01_FIRST_TIME_SETUP.bat first.
  pause
  exit /b 1
)
start "" "http://localhost:3000"
npm start
pause
