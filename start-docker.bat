@echo off
echo ========================================
echo  CivicSphere - Starting Docker Environment
echo ========================================
echo.
echo Stopping any existing containers...
docker-compose down
echo.
echo Building and starting containers...
echo This might take a few minutes...
echo.
docker-compose up -d
echo.
echo Containers started in background to avoid Network/DNS issues.
echo Check dashboard at http://localhost:3001
echo.
pause
