@echo off
REM Double-click to launch the Launch Kit editor (Windows).
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js is required. Install from https://nodejs.org ^(LTS^), then run again. & pause & exit /b 1)
start "" http://127.0.0.1:4317/
node kit-server.mjs
pause
