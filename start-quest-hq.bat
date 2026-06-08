@echo off
setlocal
cd /d "%~dp0"
start "Quest HQ Dev Server" /min cmd /c "npm run dev -- --port 5173"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5173/"
