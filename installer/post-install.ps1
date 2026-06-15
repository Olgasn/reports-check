# Регистрирует автозапуск сервера проверки отчётов при входе пользователя и сразу запускает его.
$ErrorActionPreference = 'SilentlyContinue'
$n = 'ReportsCheckWeb'
$dir = $PSScriptRoot
$ps1 = Join-Path $dir 'start.ps1'
$u = $env:USERNAME
$psexe = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"

# Удаляем прежнее задание (если переустановка), затем создаём заново.
Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue |
  Unregister-ScheduledTask -Confirm:$false

# Видимое окно PowerShell (без -WindowStyle Hidden) — пользователь сможет
# закрыть его, чтобы остановить сервер.
$a = New-ScheduledTaskAction -Execute $psexe `
  -Argument ("-NoProfile -ExecutionPolicy Bypass -File `"" + $ps1 + "`"") `
  -WorkingDirectory $dir
$t = New-ScheduledTaskTrigger -AtLogOn -User $u
$s = New-ScheduledTaskSettingsSet -ExecutionTimeLimit ([timespan]::Zero) `
  -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 2) -MultipleInstances IgnoreNew
$p = New-ScheduledTaskPrincipal -UserId $u -LogonType Interactive -RunLevel Limited
Register-ScheduledTask -TaskName $n -Action $a -Trigger $t -Settings $s -Principal $p -Force | Out-Null

Start-ScheduledTask -TaskName $n
