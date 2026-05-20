#!/usr/bin/env bash
# =============================================================================
# scripts/db-backup.sh — Backup de la base Supabase (pg_dump)
# =============================================================================
# Sprint 8 prep: queda listo, no se ejecuta hoy.
#
# Uso:
#   ./scripts/db-backup.sh prod         # backup de producción
#   ./scripts/db-backup.sh staging      # backup de staging
#   ./scripts/db-backup.sh local        # backup de Supabase local (dev)
#
# Requiere las siguientes vars de entorno (de SPRINT8_SECRETS.md):
#   - SUPABASE_DB_PASSWORD_<ENV>
#   - SUPABASE_PROJECT_REF_<ENV>
#
# Para `local` usa las credenciales del CLI (postgres:postgres@127.0.0.1:54322).
#
# Output:
#   backups/<env>-YYYYMMDD-HHMMSS.sql.gz
#
# Recomendación: correr antes de cada migration en prod, y como cron diario.
# =============================================================================

set -euo pipefail

ENV="${1:-}"
if [[ -z "$ENV" ]]; then
  echo "Usage: $0 <local|staging|prod>" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUPS_DIR="$REPO_ROOT/backups"
mkdir -p "$BACKUPS_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUPS_DIR/${ENV}-${STAMP}.sql.gz"

case "$ENV" in
  local)
    HOST="127.0.0.1"
    PORT="54322"
    USER="postgres"
    PASSWORD="postgres"
    DB="postgres"
    ;;
  staging|prod)
    UPPER="$(echo "$ENV" | tr '[:lower:]' '[:upper:]')"
    PROJECT_REF_VAR="SUPABASE_PROJECT_REF_${UPPER}"
    PASSWORD_VAR="SUPABASE_DB_PASSWORD_${UPPER}"
    PROJECT_REF="${!PROJECT_REF_VAR:-}"
    PASSWORD="${!PASSWORD_VAR:-}"
    if [[ -z "$PROJECT_REF" || -z "$PASSWORD" ]]; then
      echo "Faltan vars: $PROJECT_REF_VAR y/o $PASSWORD_VAR" >&2
      exit 1
    fi
    # Supabase pooler URL canónica para dumps externos.
    HOST="aws-0-us-east-1.pooler.supabase.com"
    PORT="6543"
    USER="postgres.${PROJECT_REF}"
    DB="postgres"
    ;;
  *)
    echo "ENV inválido: $ENV (esperado: local|staging|prod)" >&2
    exit 1
    ;;
esac

echo "→ Dump de $ENV → $OUT"
PGPASSWORD="$PASSWORD" pg_dump \
  --host="$HOST" --port="$PORT" --username="$USER" --dbname="$DB" \
  --no-owner --no-privileges --schema=public --schema=auth \
  | gzip > "$OUT"

SIZE="$(du -h "$OUT" | cut -f1)"
echo "✓ Backup OK: $OUT ($SIZE)"
