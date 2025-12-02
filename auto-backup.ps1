# Автоматический бэкап проекта CRM с ротацией версий
# Запускается каждый час, создает до 5 версий

$projectPath = "d:\Projects\crm"
$backupRoot = "d:\Projects\crm-backups"
$maxBackups = 5

# Создаем папку для бэкапов если её нет
if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
    Write-Host "Создана папка для бэкапов: $backupRoot" -ForegroundColor Green
}

# Проверяем наличие ошибок в проекте (lint)
Write-Host "`n[1/4] Проверка проекта на ошибки..." -ForegroundColor Cyan
Set-Location $projectPath

# Запускаем lint проверку
$lintResult = npm run lint 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Обнаружены ошибки линтера. Бэкап отменен." -ForegroundColor Red
    Write-Host $lintResult -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Проект без ошибок" -ForegroundColor Green

# Создаем имя папки с временной меткой
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupName = "crm-backup-$timestamp"
$backupPath = Join-Path $backupRoot $backupName

Write-Host "`n[2/4] Создание бэкапа: $backupName" -ForegroundColor Cyan

# Копируем проект (исключаем node_modules, .git, dist)
$excludeDirs = @('node_modules', '.git', 'dist', 'build', '.vscode')
robocopy $projectPath $backupPath /E /XD $excludeDirs /NFL /NDL /NJH /NJS | Out-Null

if (Test-Path $backupPath) {
    Write-Host "✅ Бэкап создан: $backupPath" -ForegroundColor Green
} else {
    Write-Host "❌ Ошибка создания бэкапа" -ForegroundColor Red
    exit 1
}

# Создаем Git коммит
Write-Host "`n[3/4] Создание Git коммита..." -ForegroundColor Cyan
Set-Location $projectPath

$commitMessage = "Auto-backup: $timestamp"
git add -A
$gitStatus = git status --porcelain

if ($gitStatus) {
    git commit -m $commitMessage
    Write-Host "✅ Git коммит создан: $commitMessage" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Нет изменений для коммита" -ForegroundColor Yellow
}

# Ротация старых бэкапов (оставляем только последние 5)
Write-Host "`n[4/4] Ротация бэкапов (макс. $maxBackups)..." -ForegroundColor Cyan

$backups = Get-ChildItem -Path $backupRoot -Directory | 
    Where-Object { $_.Name -match "^crm-backup-" } | 
    Sort-Object CreationTime -Descending

$backupsCount = $backups.Count
Write-Host "Найдено бэкапов: $backupsCount" -ForegroundColor White

if ($backupsCount -gt $maxBackups) {
    $toDelete = $backups | Select-Object -Skip $maxBackups
    foreach ($backup in $toDelete) {
        Remove-Item -Path $backup.FullName -Recurse -Force
        Write-Host "🗑️  Удален старый бэкап: $($backup.Name)" -ForegroundColor Gray
    }
    Write-Host "✅ Оставлено последних $maxBackups бэкапов" -ForegroundColor Green
} else {
    Write-Host "✅ Всего бэкапов: $backupsCount (в пределах лимита)" -ForegroundColor Green
}

# Итоговая информация
Write-Host "`n" + "="*60 -ForegroundColor Cyan
Write-Host "📦 БЭКАП ЗАВЕРШЕН УСПЕШНО" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Cyan
Write-Host "Время: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host "Папка бэкапа: $backupPath" -ForegroundColor White
Write-Host "Активных бэкапов: $([Math]::Min($backupsCount, $maxBackups))" -ForegroundColor White
Write-Host "="*60 -ForegroundColor Cyan
