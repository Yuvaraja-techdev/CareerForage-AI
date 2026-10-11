@echo off
title CareerForge AI - Stopping Services
echo ===================================================
echo           Stopping CareerForge AI Services
echo ===================================================
echo.

set "ROOT_DIR=%~dp0"

echo Stopping Docker Compose containers...
cd /d "%ROOT_DIR%backend"
docker compose down

echo.
echo ===================================================
echo Docker containers stopped.
echo To close any open Node service windows, press Ctrl+C in their respective windows or close them.
echo ===================================================
pause
