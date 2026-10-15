$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
Set-Location "$PSScriptRoot\android-app"
$gradleBat = "C:\Users\User\.gradle\wrapper\dists\gradle-9.5.0-bin\bvnork1r7n8i6kp5cnkibsc9q\gradle-9.5.0\bin\gradle.bat"
& $gradleBat assembleDebug --no-daemon
if (Test-Path "app\build\outputs\apk\debug\app-debug.apk") {
    Copy-Item "app\build\outputs\apk\debug\app-debug.apk" -Destination "$PSScriptRoot\SweetBakery-Android.apk" -Force
    Write-Host "SUCCESS: SweetBakery-Android.apk created successfully!"
} else {
    Write-Host "FAILED: app-debug.apk not found"
}
