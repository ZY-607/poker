@echo off
echo ========================================
echo            Poker - Git Push Script
echo ========================================
echo.
set PATH=F:\Program Files\Git\cmd;%PATH%
cd /d %~dp0
git add .
git commit -m Update
git push origin main
echo.
echo Done!
pause
