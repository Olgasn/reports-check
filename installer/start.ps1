$Host.UI.RawUI.WindowTitle = 'Проверка отчётов'
Set-Location $PSScriptRoot
$env:ASPNETCORE_ENVIRONMENT = 'Production'
$env:ASPNETCORE_URLS = 'http://localhost:5034'

$AppUrl = 'http://localhost:5034'

Write-Host '==============================================================' -ForegroundColor Cyan
Write-Host '  Проверка отчётов — сервер запускается...' -ForegroundColor Cyan
Write-Host '  Браузер откроется автоматически через несколько секунд.' -ForegroundColor Cyan
Write-Host '  Закройте это окно, чтобы остановить сервер.' -ForegroundColor Cyan
Write-Host '==============================================================' -ForegroundColor Cyan
Write-Host ''

# Открытие браузера отдельным скрытым процессом, чтобы не блокировать сервер.
Start-Process -FilePath 'powershell.exe' -WindowStyle Hidden -ArgumentList '-NoProfile','-Command',"Start-Sleep -Seconds 6; Start-Process '$AppUrl'" | Out-Null

# Запуск сервера в текущей консоли: exe становится дочерним для powershell.exe,
# закрытие окна останавливает Kestrel.
& (Join-Path $PSScriptRoot 'ReportsCheck.Web.exe')
