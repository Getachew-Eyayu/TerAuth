#!/usr/bin/env bash
# ==============================================================================
# TerAuth Production PostgreSQL Automated Backup Script
# Usage: ./scripts/backup-db.sh [/path/to/backups]
# ==============================================================================
set -euo pipefail

BACKUP_DIR="${1:-${BACKUP_DIR:-./backups}}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/terauth_backup_${TIMESTAMP}.dump.gz"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting TerAuth PostgreSQL backup at $(date)..."

# Ensure environment variables are present or load from .env
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-terauth}"
DB_USER="${DB_USER:-postgres}"

# Execute compressed pg_dump
PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -Fc \
  | gzip > "${BACKUP_FILE}"

# Generate SHA-256 Checksum for verification
sha256sum "${BACKUP_FILE}" > "${BACKUP_FILE}.sha256"

echo "[SUCCESS] Backup completed successfully: ${BACKUP_FILE}"
echo "[INFO] Checksum: $(cat "${BACKUP_FILE}.sha256")"

# Purge backups older than retention policy
echo "[INFO] Cleaning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "terauth_backup_*.dump.gz*" -mtime "+${RETENTION_DAYS}" -delete
echo "[SUCCESS] Retention cleanup complete."
