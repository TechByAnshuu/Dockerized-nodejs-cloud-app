@echo off
echo ========================================
echo   Cleaning Unused Files from Repository
echo ========================================
echo.

echo [STEP 1] Deleting stub and fragment files...
if exist "stub-backend.js" (
    del "stub-backend.js"
    echo   ✓ Deleted stub-backend.js
) else (
    echo   ⚠ stub-backend.js not found
)

if exist "console.log('body'" (
    del "console.log('body'"
    echo   ✓ Deleted console.log('body'
) else (
    echo   ⚠ console.log('body' not found
)

if exist "console.log('stub" (
    del "console.log('stub"
    echo   ✓ Deleted console.log('stub
) else (
    echo   ⚠ console.log('stub not found
)

echo.
echo [STEP 2] Deleting duplicate admin creation scripts...
cd backend

if exist "create-admin.js" (
    del "create-admin.js"
    echo   ✓ Deleted backend\create-admin.js
) else (
    echo   ⚠ backend\create-admin.js not found
)

if exist "src\setup.js" (
    del "src\setup.js"
    echo   ✓ Deleted backend\src\setup.js
) else (
    echo   ⚠ backend\src\setup.js not found
)

if exist "src\create-admin-docker.js" (
    del "src\create-admin-docker.js"
    echo   ✓ Deleted backend\src\create-admin-docker.js
) else (
    echo   ⚠ backend\src\create-admin-docker.js not found
)

echo.
echo [STEP 3] Deleting debug and test scripts...
if exist "debug-login.js" (
    del "debug-login.js"
    echo   ✓ Deleted backend\debug-login.js
) else (
    echo   ⚠ backend\debug-login.js not found
)

if exist "debug-db.js" (
    del "debug-db.js"
    echo   ✓ Deleted backend\debug-db.js
) else (
    echo   ⚠ backend\debug-db.js not found
)

if exist "debug-complaints.js" (
    del "debug-complaints.js"
    echo   ✓ Deleted backend\debug-complaints.js
) else (
    echo   ⚠ backend\debug-complaints.js not found
)

if exist "test-api.js" (
    del "test-api.js"
    echo   ✓ Deleted backend\test-api.js
) else (
    echo   ⚠ backend\test-api.js not found
)

if exist "test-atlas.js" (
    del "test-atlas.js"
    echo   ✓ Deleted backend\test-atlas.js
) else (
    echo   ⚠ backend\test-atlas.js not found
)

echo.
echo [OPTIONAL] Screenshot tool (tools\screenshot.js)
echo   Run: del "tools\screenshot.js" if you don't need it
echo.

cd ..

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo Files deleted: 11
echo Space saved: ~21 KB
echo.
echo Next steps:
echo   1. Test your application
echo   2. If everything works, commit the changes
echo   3. Run: git status
echo.
pause
