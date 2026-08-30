#!/usr/bin/env bash
# Read-only backup integrity check. It never contacts or changes production Postgres.
set -euo pipefail

: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY must point to off-site storage}"
: "${RESTIC_PASSWORD_FILE:?RESTIC_PASSWORD_FILE must point to a root-only file}"

restore_dir="$(mktemp -d)"
trap 'rm -rf "$restore_dir"' EXIT

restic check --read-data-subset=5%
restic restore latest --target "$restore_dir" --tag vocora
dump_file="$(find "$restore_dir" -type f -name '*.dump' -print -quit)"
test -n "$dump_file"
pg_restore --list "$dump_file" >/dev/null
echo "Vocora backup verified: $(basename "$dump_file")"
