# Setup Auto Backup - Run as Administrator!

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "CRM AUTO BACKUP SETUP" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

# Check admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`nERROR: Administrator rights required!" -ForegroundColor Red
    Write-Host "Run PowerShell as Administrator and try again." -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`nAdmin rights confirmed" -ForegroundColor Green

# Remove old task if exists
$existingTask = Get-ScheduledTask -TaskName "CRM Auto Backup" -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "`nRemoving existing task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "CRM Auto Backup" -Confirm:$false
    Write-Host "Old task removed" -ForegroundColor Green
}

# Create new task
Write-Host "`nCreating new task..." -ForegroundColor Cyan

try {
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"d:\Projects\crm\auto-backup.ps1`""
    $trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(5) -RepetitionInterval (New-TimeSpan -Hours 1)
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
    
    Register-ScheduledTask -TaskName "CRM Auto Backup" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Auto backup CRM project every hour" | Out-Null
    
    Write-Host "Task created successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "`nERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    pause
    exit 1
}

# Verify task
$task = Get-ScheduledTask -TaskName "CRM Auto Backup"
$taskInfo = Get-ScheduledTaskInfo -TaskName "CRM Auto Backup"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`nTask Information:" -ForegroundColor White
Write-Host "  Name: CRM Auto Backup" -ForegroundColor Gray
Write-Host "  Status: $($task.State)" -ForegroundColor Gray
Write-Host "  Next run: $($taskInfo.NextRunTime)" -ForegroundColor Gray
Write-Host "  Interval: Every hour" -ForegroundColor Gray
Write-Host "  Backup folder: d:\Projects\crm-backups" -ForegroundColor Gray
Write-Host "  Max versions: 5" -ForegroundColor Gray

Write-Host "`nWhat happens next:" -ForegroundColor Cyan
Write-Host "  1. Backups will be created automatically every hour" -ForegroundColor White
Write-Host "  2. First backup in ~5 minutes" -ForegroundColor White
Write-Host "  3. Error check before each backup" -ForegroundColor White
Write-Host "  4. Keeps last 5 versions" -ForegroundColor White

Write-Host "`nTest run (optional):" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName 'CRM Auto Backup'" -ForegroundColor Yellow

Write-Host "`nView backups:" -ForegroundColor Cyan
Write-Host "  explorer d:\Projects\crm-backups" -ForegroundColor Yellow

Write-Host "`n============================================================" -ForegroundColor Cyan
pause
