@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║           德州扑克 - 一键推送脚本 v1.0                      ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  仓库: https://github.com/ZY-607/poker                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set "PATH=F:\Program Files\Git\cmd;%PATH%"

cd /d "%~dp0"

echo [1/5] 检查 Git 状态...
git status --porcelain >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Git 未安装或未找到，请检查 Git 安装路径
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('git status --porcelain') do set "HAS_CHANGES=1"

if not defined HAS_CHANGES (
    echo [提示] 没有需要提交的更改
    echo.
    goto :push_only
)

echo [2/5] 添加所有更改...
git add .
if %errorlevel% neq 0 (
    echo [错误] git add 失败
    pause
    exit /b 1
)

echo [3/5] 获取版本号...
for /f "tokens=2 delims=:, " %%v in ('findstr /r "\"version\":" package.json 2^>nul') do (
    set "VERSION=%%~v"
)
if not defined VERSION set "VERSION=unknown"

set "COMMIT_MSG=Update to v%VERSION% - %date% %time:~0,8%"
echo [4/5] 提交更改: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo [警告] 提交可能失败或没有新更改
)

:push_only
echo [5/5] 推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo [错误] 推送失败！可能原因：
    echo   1. 网络连接问题
    echo   2. GitHub 认证过期（请重新登录）
    echo   3. 远程仓库有冲突（需要先 pull）
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    推送成功！                               ║
echo ╠════════════════════════════════════════════════════════════╣
echo ║  GitHub: https://github.com/ZY-607/poker                   ║
echo ║  版本: v%VERSION%                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

if exist "C:\Windows\System32\cmd.exe" (
    echo 按任意键关闭窗口...
    pause >nul
)
