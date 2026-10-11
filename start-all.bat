@echo off
title CareerForge AI - Launching Services
echo ===================================================
echo           Starting CareerForge AI Services
echo ===================================================
echo.

set "ROOT_DIR=%~dp0"

echo [1/8] Starting Docker Compose (Redis)...
start "CareerForge - Docker (Redis)" cmd /k "cd /d ""%ROOT_DIR%backend"" && docker compose up"

:: Optional small delay to let docker start
timeout /t 3 /nobreak >nul

echo [2/8] Starting API Gateway...
start "CareerForge - API Gateway" cmd /k "cd /d ""%ROOT_DIR%backend\gateway"" && npm run dev"

echo [3/8] Starting Auth Service...
start "CareerForge - Auth Service" cmd /k "cd /d ""%ROOT_DIR%backend\services\auth"" && npm run dev"

echo [4/8] Starting Billing Service...
start "CareerForge - Billing Service" cmd /k "cd /d ""%ROOT_DIR%backend\services\billing"" && npm run dev"

echo [5/8] Starting Interview Service...
start "CareerForge - Interview Service" cmd /k "cd /d ""%ROOT_DIR%backend\services\interview"" && npm run dev"

echo [6/8] Starting Resume Service...
start "CareerForge - Resume Service" cmd /k "cd /d ""%ROOT_DIR%backend\services\resume"" && npm run dev"

echo [7/8] Starting Roadmap Service...
start "CareerForge - Roadmap Service" cmd /k "cd /d ""%ROOT_DIR%backend\services\roadmap"" && npm run dev"

echo [8/8] Starting Frontend (Vite)...
start "CareerForge - Frontend" cmd /k "cd /d ""%ROOT_DIR%frontend"" && npm run dev"

echo.
echo ===================================================
echo     All CareerForge AI services have been started!
echo ===================================================
pause
