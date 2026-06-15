#define AppName "Проверка отчётов"
#define AppShort "ReportsCheck"
#define AppVersion "1.0.0"
#define AppPublisher "IT-GSTU"
#define AppExeName "ReportsCheck.Web.exe"
#define AppPort "5034"

[Setup]
AppId={{D7E4A821-3F9C-4B5D-8A2E-1C6F7B0D9E43}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
DefaultDirName={localappdata}\{#AppShort}
DefaultGroupName={#AppShort}
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
DisableProgramGroupPage=no
AllowNoIcons=yes
UsePreviousAppDir=yes
OutputDir=Output
OutputBaseFilename=ReportsCheck_Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
CloseApplications=no
ShowLanguageDialog=no

[Languages]
Name: "russian"; MessagesFile: "compiler:Languages\Russian.isl"

[Files]
; Приложение (self-contained). База данных не включается — она создаётся
; и мигрируется самим приложением при первом запуске.
Source: "app\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion; \
  Excludes: "reports-check.sqlite,reports-check.sqlite-shm,reports-check.sqlite-wal,reports-check.sqlite.bak*,*.pdb"

; Скрипты запуска и пост-установки.
Source: "start.ps1";        DestDir: "{app}"; Flags: ignoreversion
Source: "post-install.ps1"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
; Рабочий стол — запуск сервера (видимая консоль PowerShell + автозапуск браузера).
Name: "{autodesktop}\{#AppShort}"; \
  Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\start.ps1"""; \
  WorkingDir: "{app}"; \
  Comment: "Запустить сервер проверки отчётов (закрытие окна остановит сервер)"

; Меню Пуск — запуск сервера.
Name: "{autoprograms}\{#AppShort}\{#AppShort}"; \
  Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\start.ps1"""; \
  WorkingDir: "{app}"; \
  Comment: "Запустить сервер проверки отчётов (закрытие окна остановит сервер)"

; Меню Пуск — удаление.
Name: "{autoprograms}\{#AppShort}\Удалить {#AppShort}"; \
  Filename: "{uninstallexe}"

[INI]
; URL-ярлык «открыть в браузере» на рабочем столе.
Filename: "{autodesktop}\{#AppShort} (открыть).url"; \
  Section: "InternetShortcut"; \
  Key: "URL"; \
  String: "http://localhost:{#AppPort}"

[Run]
; post-install.ps1 регистрирует автозапуск и стартует сервер. nowait — не блокирует UI.
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; \
  Parameters: "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""{app}\post-install.ps1"""; \
  WorkingDir: "{app}"; \
  Description: "Настройка и запуск системы проверки отчётов"; \
  Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}\logs"
Type: filesandordirs; Name: "{app}\models_logs"
Type: files; Name: "{autodesktop}\{#AppShort} (открыть).url"

[Code]
const
  TaskName = 'ReportsCheckWeb';

// ── При удалении ──────────────────────────────────────────────────────────────
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  ResultCode, KeepDb: Integer;
  TmpScript, DbPath:  string;
begin
  if CurUninstallStep <> usUninstall then Exit;

  // 1. Остановка сервера.
  Exec(ExpandConstant('{sys}\taskkill.exe'),
    '/IM "{#AppExeName}" /F', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);

  Sleep(1000);

  // 2. Удаление задания планировщика автозапуска.
  TmpScript := ExpandConstant('{tmp}\unregister-task.ps1');
  SaveStringToFile(
    TmpScript,
    'Unregister-ScheduledTask -TaskName ''' + TaskName + ''' -Confirm:$false -ErrorAction SilentlyContinue',
    False);
  Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'),
    '-NoProfile -ExecutionPolicy Bypass -File "' + TmpScript + '"',
    '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
  DeleteFile(TmpScript);

  // 3. Предложение сохранить базу данных.
  DbPath := ExpandConstant('{app}') + '\reports-check.sqlite';
  if FileExists(DbPath) then
  begin
    KeepDb := MsgBox(
      'Сохранить базу данных (reports-check.sqlite) после удаления?' + #13#13 +
      'Если выбрать «Да», файл останется в папке:' + #13 +
      ExpandConstant('{app}'),
      mbConfirmation, MB_YESNO);
    if KeepDb <> IDYES then
    begin
      DeleteFile(DbPath);
      DeleteFile(DbPath + '-shm');
      DeleteFile(DbPath + '-wal');
    end;
  end;
end;
