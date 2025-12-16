@echo off
echo Deleting 6 safe unused files...
echo.

cd /d "c:\Files\Dockerized-nodejs-cloud-app"

if exist "stub-backend.js" (
    del /Q "stub-backend.js"
    echo [OK] Deleted stub-backend.js
) else (
    echo [SKIP] stub-backend.js not found
)

if exist "console.log('body'" (
    del /Q "console.log('body'"
    echo [OK] Deleted console.log('body'
) else (
    echo [SKIP] console.log('body' not found
)

if exist "console.log('stub" (
    del /Q "console.log('stub"
    echo [OK] Deleted console.log('stub
) else (
    echo [SKIP] console.log('stub not found
)

cd backend

if exist "create-admin.js" (
    del /Q "create-admin.js"
    echo [OK] Deleted backend\create-admin.js
) else (
    echo [SKIP] backend\create-admin.js not found
)

if exist "src\setup.js" (
    del /Q "src\setup.js"
    echo [OK] Deleted backend\src\setup.js
) else (
    echo [SKIP] backend\src\setup.js not found
)

if exist "src\create-admin-docker.js" (
    del /Q "src\create-admin-docker.js"
    echo [OK] Deleted backend\src\create-admin-docker.js
) else (
    echo [SKIP] backend\src\create-admin-docker.js not found
)

echo.
echo ========================================
echo Deletion complete! 6 files removed.
echo ========================================
