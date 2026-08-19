@echo off
echo [GhostHire] Killing any existing backend on port 5000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /F /PID %%a 2>nul
timeout /t 1 >nul
echo [GhostHire] Starting backend silently via PM2...
pm2 delete all 2>nul
pm2 start E:\AI_assistant\backend\ecosystem.config.cjs
echo [GhostHire] Backend is now running invisibly!
echo You can close VS Code and all terminals now.
echo Open your exam platform safely.
pause
