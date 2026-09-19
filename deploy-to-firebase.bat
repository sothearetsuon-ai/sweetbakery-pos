@echo off
chcp 65001 >nul
title Deploy Friends Bakery POS to Cloud Firebase
cls
echo ========================================================
echo   🧁 Friends Bakery POS - Deploy ឡើងលើ Cloud Firebase
echo ========================================================
echo.
echo [1/3] កំពុងរៀបចំ Build កូដវេបសាយ (Building production assets)...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ បរាជ័យក្នុងការ Build!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] កំពុងពិនិត្យការ Login ចូល Firebase...
call npx --yes firebase-tools login

echo.
echo [3/3] កំពុងបង្ហោះឡើងលើ Firebase Hosting (Deploying to Cloud)...
call npx --yes firebase-tools deploy --only hosting

echo.
echo ========================================================
echo   ✅ រួចរាល់ ១០០%! វេបសាយដំណើរការលើ Cloud ហើយ:
echo   👉 https://sweetbakery-8040d.web.app
echo   (លោកអ្នកអាចបិទកុំព្យូទ័របាន ហើយនៅតែបើកលើទូរស័ព្ទបាន ២៤ម៉ោង)
echo ========================================================
pause
