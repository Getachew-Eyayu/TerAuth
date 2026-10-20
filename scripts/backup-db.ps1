# ==============================================================================
# TerAuth Windows PowerShell PostgreSQL Backup Script
# Usage: .\scripts\backup-db.ps1 -BackupDir "./backups"
# ==============================================================================
param (
    [string]$BackupDir = "./backups",
    [string]$DbHost = "localhost",
    [string]$DbPort = "5432",
    [string]$DbName = "terauth",
    [string]$DbUser = "postgres",
    [int]$RetentionDays = 30
)

$ErrorActionPreference = "Stop"

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = Join-Path $BackupDir "terauth_backup_$Timestamp.dump"

Write-Host "[INFO] Starting TerAuth PostgreSQL backup to $BackupFile..." -ForegroundColor Cyan

# Check if pg_dump is available
if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
    & pg_dump -h $DbHost -p $DbPort -U $DbUser -d $DbName -Fc -f $BackupFile
    Write-Host "[SUCCESS] Backup written to $BackupFile" -ForegroundColor Green
    
    # Calculate SHA256 Checksum
    $hash = Get-FileHash -Path $BackupFile -Algorithm SHA256
    $hash.Hash | Out-File "$BackupFile.sha256"
    Write-Host "[INFO] Checksum: $($hash.Hash)" -ForegroundColor Gray
} else {
    Write-Warning "[WARN] 'pg_dump' executable not found in PATH. Install PostgreSQL client tools to use this script."
}

# Cleanup older backups
$Cutoff = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "terauth_backup_*.dump*" | Where-Object { $_.LastWriteTime -lt $Cutoff } | Remove-Item -Force
Write-Host "[SUCCESS] Retention cleanup finished." -ForegroundColor Green
