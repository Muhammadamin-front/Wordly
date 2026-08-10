#!/usr/bin/env bash
# Encrypted, off-site Postgres backup. Configure Restic via /etc/vocora/backup.env.
set -euo pipefail

readonly backup_dir="${VOCORA_BACKUP_DIR:-/var/backups/vocora}"
readonly keep_daily="${VOCORA_BACKUP_KEEP_DAILY:-14}"
readonly keep_weekly="${VOCORA_BACKUP_KEEP_WEEKLY:-8}"
readonly keep_monthly="${VOCORA_BACKUP_KEEP_MONTHLY:-12}"
readonly postgres_user="${POSTGRES_USER:-words}"
readonly postgres_db="${POSTGRES_DB:-words}"

: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY must point to off-site storage}"
: "${RESTIC_PASSWORD_FILE:?RESTIC_PASSWORD_FILE must point to a root-only file}"

umask 077
mkdir -p "$backup_dir"
backup_file="$backup_dir/postgres-$(date -u +%Y%m%dT%H%M%SZ).dump"
trap 'rm -f "$backup_file" "$backup_file.sha256"' EXIT

docker compose exec -T postgres pg_dump \
  --format=custom --no-owner --no-privileges \
  --username="$postgres_user" "$postgres_db" > "$backup_file"

test -s "$backup_file"
sha256sum "$backup_file" > "$backup_file.sha256"
restic backup --tag vocora --tag postgres "$backup_file" "$backup_file.sha256"
restic forget --tag vocora --keep-daily "$keep_daily" --keep-weekly "$keep_weekly" --keep-monthly "$keep_monthly" --prune
restic snapshots --tag vocora --latest 1
