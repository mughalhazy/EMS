#!/usr/bin/env bash
# =============================================================
# EMS Development Seed Script
# =============================================================
# Usage:
#   bash infra/scripts/seed/seed.sh
#
# Env overrides (defaults match docker-compose.yml):
#   PGHOST     localhost
#   PGPORT     5432
#   PGUSER     ems
#   PGDATABASE ems
#   PGPASSWORD ems
# =============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEED_SQL="${SCRIPT_DIR}/seed.sql"

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-ems}"
PGDATABASE="${PGDATABASE:-ems}"
PGPASSWORD="${PGPASSWORD:-ems}"

echo ""
echo "Connecting to PostgreSQL..."
echo "  Host:     ${PGHOST}:${PGPORT}"
echo "  Database: ${PGDATABASE}"
echo "  User:     ${PGUSER}"
echo ""

# Wait for postgres to be ready (up to 30s)
RETRIES=30
until PGPASSWORD="${PGPASSWORD}" psql \
  -h "${PGHOST}" -p "${PGPORT}" \
  -U "${PGUSER}" -d "${PGDATABASE}" \
  -c "SELECT 1" > /dev/null 2>&1; do
  RETRIES=$((RETRIES - 1))
  if [ "$RETRIES" -le 0 ]; then
    echo "ERROR: PostgreSQL not reachable after 30 attempts. Is docker-compose up?" >&2
    exit 1
  fi
  echo "  Waiting for PostgreSQL... (${RETRIES} retries left)"
  sleep 1
done

echo "Running seed..."
echo ""

PGPASSWORD="${PGPASSWORD}" psql \
  -h "${PGHOST}" -p "${PGPORT}" \
  -U "${PGUSER}" -d "${PGDATABASE}" \
  -f "${SEED_SQL}"
