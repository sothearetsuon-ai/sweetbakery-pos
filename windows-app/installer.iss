; Script generated for Inno Setup 6
; SweetBakery POS - Windows Official Setup Installer

#define MyAppName "SweetBakery POS"
#define MyAppVersion "1.5.8"
#define MyAppPublisher "SweetBakery Team"
#define MyAppURL "https://sothearetsuon-ai.github.io/sweetbakery-pos/"
#define MyAppExeName "SweetBakery-POS.exe"

[Setup]
; Basic Application Info
AppId={{5C16834A-8A4E-464A-A5E8-F0E84624792C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Destination Directories
; Defaults to LocalAppData\Programs\SweetBakery POS for non-admin, or Program Files for admin
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; Output file setup
OutputDir=..
OutputBaseFilename=SweetBakery-POS-Setup
SetupIconFile=icon.ico
Compression=lzma2/normal
SolidCompression=yes
CloseApplications=force
RestartApplications=no

; Modern Wizard Styling
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; Windows Add/Remove Programs Metadata
UninstallDisplayIcon={app}\{#MyAppExeName}
UninstallDisplayName={#MyAppName} - ប្រព័ន្ធគ្រប់គ្រងហាងនំខេកស្តង់ដារ

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
; All files from Electron packager distribution
Source: "dist\SweetBakery-POS-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\resources\app\icon.ico"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\resources\app\icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
Filename: "{app}\{#MyAppExeName}"; Flags: nowait; Check: ShouldRunSilent

[Code]
function ShouldRunSilent: Boolean;
begin
  Result := WizardSilent();
end;
