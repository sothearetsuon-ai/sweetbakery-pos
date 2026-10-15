@echo off
chcp 65001 > nul
echo ========================================================
echo       កំពុងបង្កើតកម្មវិធី SweetBakery Android App (.apk)...
echo ========================================================
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0android-app"
call "C:\Users\User\.gradle\wrapper\dists\gradle-9.5.0-bin\bvnork1r7n8i6kp5cnkibsc9q\gradle-9.5.0\bin\gradle.bat" assembleDebug --no-daemon
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy /y "app\build\outputs\apk\debug\app-debug.apk" "..\SweetBakery-Android.apk" > nul
    echo.
    echo ========================================================
    echo   ✅ ការបង្កើតបានជោគជ័យ ១០០%!
    echo   👉 File APK ស្ថិតនៅ: SweetBakery-Android.apk
    echo ========================================================
) else (
    echo.
    echo ❌ [កំហុស] ការបង្កើតមិនជោគជ័យ សូមពិនិត្យមើលសារខាងលើ។
)
