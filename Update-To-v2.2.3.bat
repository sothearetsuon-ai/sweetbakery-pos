@echo off
chcp 65001 >nul
title អាប់ដេត SweetBakery POS ទៅកាន់ v2.2.3

echo ============================================================
echo   កំពុងរៀបចំអាប់ដេត SweetBakery POS ទៅកាន់ជំនាន់ v2.2.3
echo ============================================================
echo.
echo [*] កំពុងបិទកម្មវិធី SweetBakery POS ដែលកំពុងបើកដំណើរការ...
taskkill /F /IM SweetBakery-POS.exe >nul 2>&1
timeout /t 2 >nul

echo [*] កំពុងចាប់ផ្តើមកម្មវិធីដំឡើង SweetBakery POS v2.2.3...
start "" "%~dp0SweetBakery-POS-Setup.exe"

echo.
echo [ជោគជ័យ] សូមចុច Next -> Install នៅលើផ្ទាំងដំឡើងដែលទើបតែលោតចេញមក!
echo ============================================================
