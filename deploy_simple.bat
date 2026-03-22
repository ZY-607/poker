@echo off
echo ========================================================
echo            Poker - Git Push Script v1.3
echo ========================================================
echo.

set "PATH=F:\Program Files\Git\cmd;%PATH%"
cd /d "%~dp0"

echo Step 1: git add .
git add .
echo.

echo Step 2: git commit
git commit -m "Update"
echo.

echo Step 3: git push
git push origin main
echo.

echo ========================================================
echo                    Done!
echo ========================================================
echo.
echo Press any key to close...
pause >nul
