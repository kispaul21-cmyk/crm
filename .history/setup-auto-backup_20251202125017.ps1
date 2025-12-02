# Скрипт автоматической установки задачи бэкапа
# ЗАПУСКАТЬ ОТ ИМЕНИ АДМИНИСТРАТОРА!

Write-Host "="*60 -ForegroundColor Cyan
Write-Host "🔧 УСТАНОВКА АВТОМАТИЧЕСКОГО БЭКАПА CRM" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Cyan

# Проверка прав администратора
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n❌ ОШИБКА: Требуются права администратора!" -ForegroundColor Red
    Write-Host "Запустите PowerShell от имени администратора и повторите." -ForegroundColor Yellow
    Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "`n✅ Права администратора подтверждены" -ForegroundColor Green

# Удаляем старую задачу если существует
$existingTask = Get-ScheduledTask -TaskName "CRM Auto Backup" -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "`n⚠️  Найдена существующая задача. Удаляю..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "CRM Auto Backup" -Confirm:$false
    Write-Host "✅ Старая задача удалена" -ForegroundColor Green
}

# Создаем новую задачу
Write-Host "`n📝 Создание новой задачи..." -ForegroundColor Cyan

try {
    # Действие: запуск PowerShell скрипта
    $action = New-ScheduledTaskAction `
        -Execute "powershell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"d:\Projects\crm\auto-backup.ps1`""
    
    # Триггер: каждый час, начиная через 5 минут
    $trigger = New-ScheduledTaskTrigger `
        -Once `
        -At (Get-Date).AddMinutes(5) `
        -RepetitionInterval (New-TimeSpan -Hours 1)
    
    # Настройки безопасности
    $principal = New-ScheduledTaskPrincipal `
        -UserId $env:USERNAME `
        -LogonType Interactive `
        -RunLevel Highest
    
    # Дополнительные настройки
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 30)
    
    # Регистрация задачи
    Register-ScheduledTask `
        -TaskName "CRM Auto Backup" `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings `
        -Description "Автоматический бэкап CRM проекта каждый час с проверкой на ошибки и ротацией версий" `
    | Out-Null
    
    Write-Host "✅ Задача успешно создана!" -ForegroundColor Green
    
}
catch {
    Write-Host "`n❌ ОШИБКА при создании задачи:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Проверка созданной задачи
Write-Host "`n🔍 Проверка задачи..." -ForegroundColor Cyan
$task = Get-ScheduledTask -TaskName "CRM Auto Backup"
$taskInfo = Get-ScheduledTaskInfo -TaskName "CRM Auto Backup"

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "✅ УСТАНОВКА ЗАВЕРШЕНА УСПЕШНО!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Cyan

Write-Host "`nИнформация о задаче:" -ForegroundColor White
Write-Host "  Название: CRM Auto Backup" -ForegroundColor Gray
Write-Host "  Статус: $($task.State)" -ForegroundColor Gray
Write-Host "  Следующий запуск: $($taskInfo.NextRunTime)" -ForegroundColor Gray
Write-Host "  Интервал: Каждый час" -ForegroundColor Gray
Write-Host "  Папка бэкапов: d:\Projects\crm-backups" -ForegroundColor Gray
Write-Host "  Макс. версий: 5" -ForegroundColor Gray

Write-Host "`n📌 Что дальше:" -ForegroundColor Cyan
Write-Host "  1. Бэкапы будут создаваться автоматически каждый час" -ForegroundColor White
Write-Host "  2. Первый бэкап через ~5 минут" -ForegroundColor White
Write-Host "  3. Проверка на ошибки перед каждым бэкапом" -ForegroundColor White
Write-Host "  4. Хранятся последние 5 версий" -ForegroundColor White

Write-Host "`n🧪 Тестовый запуск (необязательно):" -ForegroundColor Cyan
Write-Host "  Start-ScheduledTask -TaskName 'CRM Auto Backup'" -ForegroundColor Yellow

Write-Host "`n📂 Просмотр бэкапов:" -ForegroundColor Cyan
Write-Host "  explorer d:\Projects\crm-backups" -ForegroundColor Yellow

Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "`nНажмите любую клавишу для выхода..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
