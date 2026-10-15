@echo off
chcp 65001 >nul
title ដំឡើង Shortcut SweetBakery POS លើ Desktop
echo ============================================================
echo   កំពុងបង្កើតរូបតំណាង (Desktop Shortcut) SweetBakery POS...
echo ============================================================

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; ^
   $DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop); ^
   $TargetExe = Join-Path -Path '%~dp0' -ChildPath 'SweetBakery-POS.exe'; ^
   if (-not (Test-Path $TargetExe)) { $TargetExe = Join-Path -Path '%~dp0' -ChildPath 'windows-app\dist\SweetBakery-POS-win32-x64\SweetBakery-POS.exe' }; ^
   $IconPath = Join-Path -Path '%~dp0' -ChildPath 'windows-app\icon.ico'; ^
   if (-not (Test-Path $IconPath)) { $IconPath = Join-Path -Path '%~dp0' -ChildPath 'resources\app\icon.ico' }; ^
   if (-not (Test-Path $IconPath)) { $IconPath = $TargetExe }; ^
   $Shortcut = $WshShell.CreateShortcut(\"$DesktopPath\SweetBakery POS.lnk\"); ^
   $Shortcut.TargetPath = $TargetExe; ^
   $Shortcut.WorkingDirectory = '%~dp0'; ^
   $Shortcut.IconLocation = \"$IconPath, 0\"; ^
   $Shortcut.Description = 'SweetBakery POS - ប្រព័ន្ធគ្រប់គ្រងហាងនំខេកស្តង់ដារ'; ^
   $Shortcut.Save(); ^
   $ProgramsPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs); ^
   $StartShortcut = $WshShell.CreateShortcut(\"$ProgramsPath\SweetBakery POS.lnk\"); ^
   $StartShortcut.TargetPath = $TargetExe; ^
   $StartShortcut.WorkingDirectory = '%~dp0'; ^
   $StartShortcut.IconLocation = \"$IconPath, 0\"; ^
   $StartShortcut.Description = 'SweetBakery POS - ប្រព័ន្ធគ្រប់គ្រងហាងនំខេកស្តង់ដារ'; ^
   $StartShortcut.Save(); ^
   [System.Windows.Forms.MessageBox]::Show('ការបង្កើត Shortcut លើ Desktop និង Start Menu បានជោគជ័យ!', 'SweetBakery POS', [System.Windows.Forms.MessageBoxButtons]::OK, [System.Windows.Forms.MessageBoxIcon]::Information)"

echo.
echo [ជោគជ័យ] បានបង្កើត Shortcut លើ Desktop រួចរាល់ហើយ!
echo.
pause
