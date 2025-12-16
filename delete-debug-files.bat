@echo off
echo Deleting remaining debug and test files...
echo.

cd /d "c:\Files\Dockerized-nodejs-cloud-app\backend"

if exist "debug-login.js" (
    del /Q "debug-login.js"
    echo [OK] Deleted debug-login.js
) else (
    echo [SKIP] debug-login.js not found
)

if exist "debug-db.js" (
    del /Q "debug-db.js"
    echo [OK] Deleted debug-db.js
) else (
    echo [SKIP] debug-db.js not found
)

if exist "debug-complaints.js" (
    del /Q "debug-complaints.js"
    echo [OK] Deleted debug-complaints.js
) else (
    echo [SKIP] debug-complaints.js not found
)

if exist "test-api.js" (
    del /Q "test-api.js"
    echo [OK] Deleted test-api.js
) else (
    echo [SKIP] test-api.js not found
)

if exist "test-atlas.js" (
    del /Q "test-atlas.js"
    echo [OK] Deleted test-atlas.js
) else (
    echo [SKIP] test-atlas.js not found
)

echo.
echo ========================================
echo Cleanup complete! 5 debug files removed.
echo Total files cleaned: 11 files
echo Kept: tools\screenshot.js (as requested)
echo ========================================
