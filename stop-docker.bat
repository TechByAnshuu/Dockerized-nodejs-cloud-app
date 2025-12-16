@echo off
echo ========================================
echo  STOPPING ALL DOCKER CONTAINERS
echo ========================================
echo.
echo This will stop any running Docker containers
echo that might be serving old cached files.
echo.
docker-compose down
echo.
echo ========================================
echo Docker containers stopped!
echo.
echo Now you can run the updated server with:
echo   start-server.bat
echo.
echo Or manually:
echo   cd backend
echo   node src/server.js
echo ========================================
pause
