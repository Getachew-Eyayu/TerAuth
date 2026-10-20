#!/usr/bin/env bash
# ==============================================================================
# TerAuth Production PostgreSQL Restore Script
# Usage: ./scripts/restore-db.sh <backup_file.dump.gz>
# ==============================================================================
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path_to_backup_file.dump.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[ERROR] Backup file does not exist: ${BACKUP_FILE}"
  exit 1
fi

# Checksum verification if file exists
if [ -f "${BACKUP_FILE}.sha256" ]; then
  echo "[INFO] Verifying backup checksum..."
  sha256sum -c "${BACKUP_FILE}.sha256"
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-terauth}"
DB_USER="${DB_USER:-postgres}"

echo "[WARNING] This will overwrite existing data in database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}."
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
  echo "[INFO] Restore cancelled."
  exit 0
fi

echo "[INFO] Restoring database from ${BACKUP_FILE}..."

PGPASSWORD="${POSTGRES_PASSWORD:-postgres}" gunzip -c "${BACKUP_FILE}" | pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists

echo "[SUCCESS] TerAuth database restored successfully."
