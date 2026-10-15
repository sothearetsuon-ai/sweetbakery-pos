@echo off
chcp 65001 >nul
title កម្មវិធីដំឡើង SweetBakery POS (Windows Installer)
echo ============================================================
echo      ដំឡើង SweetBakery POS ទៅកាន់ Windows ជាអចិន្ត្រៃយ៍
echo ============================================================
echo.

set "SOURCE_DIR=%~dp0"
if not exist "%SOURCE_DIR%SweetBakery-POS.exe" (
    if exist "%SOURCE_DIR%windows-app\dist\SweetBakery-POS-win32-x64\SweetBakery-POS.exe" (
        set "SOURCE_DIR=%SOURCE_DIR%windows-app\dist\SweetBakery-POS-win32-x64\"
    )
)

if not exist "%SOURCE_DIR%SweetBakery-POS.exe" (
    echo [កំហុស] រកមិនឃើញឯកសារ SweetBakery-POS.exe ទេ។
    echo សូមពិនិត្យមើលថាអ្នកបាន Extract (ពន្លា) ZIP រួចរាល់ហើយឬនៅ។
    echo.
    pause
    exit /b 1
)

set "DEST_DIR=%LocalAppData%\Programs\SweetBakery-POS"

echo [*] កំពុងត្រួតពិនិត្យ និងរៀបចំទីតាំងដំឡើង...
if not exist "%DEST_DIR%" (
    mkdir "%DEST_DIR%"
)

echo [*] កំពុងចម្លង (Copy) ឯកសារកម្មវិធីទាំងអស់ទៅកាន់ទីតាំងអចិន្ត្រៃយ៍:
echo     %DEST_DIR%
echo.

xcopy "%SOURCE_DIR%*" "%DEST_DIR%\" /E /I /Y /Q >nul

echo [*] កំពុងបង្កើតរូបតំណាង (Desktop Shortcut) និងក្នុង Start Menu...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; ^
   $DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop); ^
   $TargetExe = Join-Path -Path '%DEST_DIR%' -ChildPath 'SweetBakery-POS.exe'; ^
   $IconPath = Join-Path -Path '%DEST_DIR%' -ChildPath 'resources\app\icon.ico'; ^
   if (-not (Test-Path $IconPath)) { $IconPath = $TargetExe }; ^
   $Shortcut = $WshShell.CreateShortcut(\"$DesktopPath\SweetBakery POS.lnk\"); ^
   $Shortcut.TargetPath = $TargetExe; ^
   $Shortcut.WorkingDirectory = '%DEST_DIR%'; ^
   $Shortcut.IconLocation = \"$IconPath, 0\"; ^
   $Shortcut.Description = 'SweetBakery POS - ប្រព័ន្ធគ្រប់គ្រងហាងនំខេកស្តង់ដារ'; ^
   $Shortcut.Save(); ^
   $ProgramsPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs); ^
   $StartShortcut = $WshShell.CreateShortcut(\"$ProgramsPath\SweetBakery POS.lnk\"); ^
   $StartShortcut.TargetPath = $TargetExe; ^
   $StartShortcut.WorkingDirectory = '%DEST_DIR%'; ^
   $StartShortcut.IconLocation = \"$IconPath, 0\"; ^
   $StartShortcut.Description = 'SweetBakery POS - ប្រព័ន្ធគ្រប់គ្រងហាងនំខេកស្តង់ដារ'; ^
   $StartShortcut.Save(); ^
   Add-Type -AssemblyName System.Windows.Forms; ^
   [System.Windows.Forms.MessageBox]::Show('ការដំឡើង SweetBakery POS បានជោគជ័យ ១០០%!' + [Environment]::NewLine + [Environment]::NewLine + 'កម្មវិធីត្រូវបានរក្សាទុកជាអចិន្ត្រៃយ៍ក្នុងកុំព្យូទ័ររបស់អ្នក មិនបាត់ទៀតទេពេលបិទបើកម៉ាស៊ីនឡើងវិញ!', 'SweetBakery POS Installer', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)"

echo.
echo ============================================================
echo   [ជោគជ័យ] បានដំឡើងរួចរាល់ជាស្ថាពរ!
echo   - ទីតាំងដំឡើង: %DEST_DIR%
echo   - បានបង្កើត Shortcut នៅលើ Desktop និង Start Menu រួចរាល់
echo   - ពេលបិទបើកកុំព្យូទ័រឡើងវិញ កម្មវិធីនឹងមិនបាត់ឡើយ!
echo ============================================================
echo.
pause
