@echo off
echo ===========================================
echo  CivicSphere - Applying Code Fixes
echo ===========================================
echo.
echo 1. Copying patched files to container...
docker cp backend/src/app.js complaint-backend:/app/src/app.js
docker cp backend/src/public/dashboard.html complaint-backend:/app/src/public/dashboard.html
docker cp backend/src/public/js/dashboard.js complaint-backend:/app/src/public/js/dashboard.js

echo.
echo 2. Restarting backend service...
docker restart complaint-backend

echo.
echo ===========================================
echo  SUCCESS!
echo  Please wait 10-15 seconds for the database to reconnect.
echo  Then Refresh your dashboard (Ctrl + F5).
echo ===========================================
pause
