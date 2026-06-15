#Requires -Version 5.1
<#
.SYNOPSIS
    Собирает Inno Setup .exe-установщик для системы проверки отчётов.
.DESCRIPTION
    1. Публикует ReportsCheck.Web как self-contained win-x64 (.NET-рантайм встроен).
    2. Компилирует ReportsCheck.iss через ISCC.exe (Inno Setup 6).
    3. Возвращает путь к готовому installer\Output\ReportsCheck_Setup.exe.

    База данных (reports-check.sqlite) создаётся и мигрируется самим приложением
    при первом запуске, поэтому заранее подготавливать БД не нужно.
.PARAMETER OutputDir
    Папка для размещения готового .exe. По умолчанию: installer\Output
.EXAMPLE
    .\installer\build-installer.ps1
    .\installer\build-installer.ps1 -OutputDir "C:\Releases"
#>
param(
    [string]$OutputDir = "$PSScriptRoot\Output"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ScriptDir  = $PSScriptRoot
$ProjectDir = Split-Path -Parent $ScriptDir
$WebProj    = Join-Path $ProjectDir 'src\ReportsCheck.Web\ReportsCheck.Web.csproj'
$PublishDir = Join-Path $ScriptDir 'app'
$IssFile    = Join-Path $ScriptDir 'ReportsCheck.iss'

function Write-Step([string]$m) { Write-Host "`n>>> $m" -ForegroundColor Cyan }
function Write-OK([string]$m)   { Write-Host "    [OK]  $m" -ForegroundColor Green }
function Write-Warn([string]$m) { Write-Host "    [!]   $m" -ForegroundColor Yellow }
function Fail([string]$m)       { Write-Host "    [ERR] $m" -ForegroundColor Red; exit 1 }

# ─────────────────────────────────────────────────────────────────────────────
# 1. Проверка .NET SDK
# ─────────────────────────────────────────────────────────────────────────────
Write-Step '.NET SDK'
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Fail '.NET SDK не найден. Загрузите с https://dotnet.microsoft.com/download'
}
$sdkVer = (& dotnet --version 2>&1).ToString().Trim()
if ($sdkVer -notmatch '^10\.') { Write-Warn "Версия .NET SDK: $sdkVer (ожидается 10.x)" }
else { Write-OK ".NET SDK $sdkVer" }

# ─────────────────────────────────────────────────────────────────────────────
# 2. Очистка предыдущих артефактов
# ─────────────────────────────────────────────────────────────────────────────
Write-Step 'Очистка предыдущих артефактов'
if (Test-Path $PublishDir) {
    Remove-Item $PublishDir -Recurse -Force
    Write-OK "Удалено: $PublishDir"
}
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# ─────────────────────────────────────────────────────────────────────────────
# 3. dotnet publish (self-contained, win-x64)
# ─────────────────────────────────────────────────────────────────────────────
Write-Step 'dotnet publish (Release, win-x64, self-contained)'

& dotnet publish $WebProj `
    --configuration Release `
    --runtime win-x64 `
    --self-contained `
    --output $PublishDir `
    /p:DebugType=None `
    /p:DebugSymbols=false `
    /p:PublishReadyToRun=true

if ($LASTEXITCODE -ne 0) { Fail "dotnet publish завершился с кодом $LASTEXITCODE" }

$exePath = Join-Path $PublishDir 'ReportsCheck.Web.exe'
if (-not (Test-Path $exePath)) { Fail "Основной файл не найден: $exePath" }

# Не тащим в установщик БД и резервные копии, если publish их подхватил.
Get-ChildItem $PublishDir -Filter 'reports-check.sqlite*' -ErrorAction SilentlyContinue | Remove-Item -Force
Write-OK "Артефакты собраны: $PublishDir"

# ─────────────────────────────────────────────────────────────────────────────
# 4. Поиск ISCC.exe (компилятор Inno Setup 6)
# ─────────────────────────────────────────────────────────────────────────────
Write-Step 'Поиск ISCC.exe (Inno Setup 6)'

$isccCandidates = @(
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe",
    "$env:ProgramFiles\Inno Setup 6\ISCC.exe",
    "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe"
)
if (-not ($isccCandidates | Where-Object { Test-Path $_ })) {
    $fromCmd = Get-Command ISCC.exe -ErrorAction SilentlyContinue
    if ($fromCmd) { $isccCandidates += $fromCmd.Source }
}
$iscc = $isccCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $iscc) {
    Write-Warn 'ISCC.exe не найден в стандартных путях.'
    Write-Warn 'Установите Inno Setup 6 одним из способов:'
    Write-Warn '  winget install JRSoftware.InnoSetup'
    Write-Warn '  choco install innosetup'
    Write-Warn '  https://jrsoftware.org/isdl.php'
    Fail 'Inno Setup не установлен'
}
Write-OK "Найден: $iscc"

# ─────────────────────────────────────────────────────────────────────────────
# 5. Компиляция установщика
# ─────────────────────────────────────────────────────────────────────────────
Write-Step 'Компиляция Inno Setup скрипта'

& $iscc $IssFile "/O$OutputDir"
if ($LASTEXITCODE -ne 0) { Fail "Inno Setup завершился с кодом $LASTEXITCODE" }

# ─────────────────────────────────────────────────────────────────────────────
# 6. Итог
# ─────────────────────────────────────────────────────────────────────────────
$result = Get-Item (Join-Path $OutputDir 'ReportsCheck_Setup.exe') -ErrorAction SilentlyContinue
if (-not $result) { Fail 'Файл установщика не найден после компиляции' }

$sizeMB = [math]::Round($result.Length / 1MB, 1)

Write-Host ''
Write-Host '┌──────────────────────────────────────────────────────────────────┐' -ForegroundColor Green
Write-Host '│  Сборка установщика завершена успешно!                            │' -ForegroundColor Green
Write-Host '└──────────────────────────────────────────────────────────────────┘' -ForegroundColor Green
Write-Host ''
Write-Host "  Файл установщика : $($result.FullName)"
Write-Host "  Размер           : $sizeMB МБ"
Write-Host ''
Write-Host 'Распространяйте файл ReportsCheck_Setup.exe.'
Write-Host 'Для установки не требуются права администратора.'
