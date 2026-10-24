#!/bin/sh
set -e

# Apply Prisma schema on local container database startup
if [ -n "$DATABASE_URL" ]; then
  case "$DATABASE_URL" in
    *neon.tech*|*aws*|*azure*|*supabase*|*production*)
      echo "[TerAuth Docker] Hosted/Production database detected in DATABASE_URL. Skipping automatic schema push."
      ;;
    *)
      echo "[TerAuth Docker] Local database detected. Synchronizing Prisma database schema..."
      npx prisma db push --skip-generate || echo "[TerAuth Docker] Warning: Schema sync exited with code $?."
      ;;
  esac
fi

exec "$@"
