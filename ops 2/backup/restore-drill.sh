#!/usr/bin/env bash
# Restore the latest encrypted backup into an isolated disposable Docker network.
# This script never connects to or changes the production PostgreSQL container.
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "Run this restore drill with sudo so the root-only backup credentials remain protected." >&2
  exit 1
fi

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
backup_env="${VOCORA_BACKUP_ENV_FILE:-/etc/vocora/backup.env}"
operations_log="${VOCORA_OPERATIONS_LOG:-/var/log/vocora/operations.log}"
run_id="$(date -u +%Y%m%dT%H%M%SZ)"
network_name="vocora-restore-drill-${run_id}"
postgres_name="${network_name}-postgres"
redis_name="${network_name}-redis"
api_name="${network_name}-api"
restore_dir="$(mktemp -d)"
drill_user="restore_drill"
drill_db="restore_drill"
drill_password="$(openssl rand -hex 24)"
drill_email="restore-drill-${run_id}@invalid.example"
drill_password_login="$(openssl rand -hex 20)"

if [ ! -r "$backup_env" ]; then
  echo "Backup environment file is not readable: $backup_env" >&2
  exit 1
fi

set -a
. "$backup_env"
set +a

: "${RESTIC_REPOSITORY:?RESTIC_REPOSITORY must point to the off-site repository}"
: "${RESTIC_PASSWORD_FILE:?RESTIC_PASSWORD_FILE must point to the root-only Restic password file}"

mkdir -p "$(dirname "$operations_log")"
chmod 0750 "$(dirname "$operations_log")"
touch "$operations_log"
chmod 0640 "$operations_log"
exec > >(tee -a "$operations_log") 2>&1

cleanup() {
  docker rm -f "$api_name" "$redis_name" "$postgres_name" >/dev/null 2>&1 || true
  docker network rm "$network_name" >/dev/null 2>&1 || true
  rm -rf "$restore_dir"
}
trap cleanup EXIT

wait_for_postgres() {
  for _ in $(seq 1 30); do
    if docker exec "$postgres_name" pg_isready -U "$drill_user" -d "$drill_db" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  docker logs "$postgres_name" >&2 || true
  return 1
}

wait_for_api() {
  for _ in $(seq 1 30); do
    if docker exec "$api_name" python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health/detail', timeout=2).read()" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  docker logs "$api_name" >&2 || true
  return 1
}

cd "$project_dir"
api_container_id="$(docker compose ps -q api)"
if [ -z "$api_container_id" ]; then
  echo "The production API container must be running to identify the tested API image." >&2
  exit 1
fi
api_image="$(docker inspect --format '{{.Config.Image}}' "$api_container_id")"

echo "Vocora isolated restore drill started at $(date -u +%FT%TZ)"
echo "Repository: $RESTIC_REPOSITORY"
echo "API image: $api_image"

restic snapshots --tag vocora --latest 1
restic check --read-data-subset=5%
restic restore latest --tag vocora --target "$restore_dir"

dump_file="$(find "$restore_dir" -type f -name '*.dump' -print -quit)"
test -n "$dump_file"
test -f "${dump_file}.sha256"
(cd "$(dirname "$dump_file")" && sha256sum -c "$(basename "${dump_file}.sha256")")

docker network create "$network_name" >/dev/null
docker run -d --rm \
  --name "$postgres_name" \
  --network "$network_name" \
  --network-alias postgres \
  -e "POSTGRES_USER=$drill_user" \
  -e "POSTGRES_PASSWORD=$drill_password" \
  -e "POSTGRES_DB=$drill_db" \
  postgres:16-alpine >/dev/null
wait_for_postgres

cat "$dump_file" | docker exec -i "$postgres_name" pg_restore \
  --clean --if-exists --no-owner --no-privileges \
  --username="$drill_user" --dbname="$drill_db"

docker exec "$postgres_name" psql -v ON_ERROR_STOP=1 -qtAX \
  -U "$drill_user" -d "$drill_db" \
  -c "SELECT version_num FROM alembic_version LIMIT 1;"
for table_name in users words expressions subscriptions payments; do
  docker exec "$postgres_name" psql -v ON_ERROR_STOP=1 -qtAX \
    -U "$drill_user" -d "$drill_db" \
    -c "SELECT to_regclass('public.${table_name}') IS NOT NULL;" | grep -qx t
done

database_url="postgresql+asyncpg://${drill_user}:${drill_password}@postgres:5432/${drill_db}"
docker run --rm --network "$network_name" \
  -e "DATABASE_URL=$database_url" \
  "$api_image" alembic upgrade head

docker run -d --rm \
  --name "$redis_name" \
  --network "$network_name" \
  --network-alias redis \
  redis:7-alpine >/dev/null
docker run -d --rm \
  --name "$api_name" \
  --network "$network_name" \
  -e ENVIRONMENT=development \
  -e SECRET_KEY="restore-drill-${run_id}" \
  -e "DATABASE_URL=$database_url" \
  -e REDIS_URL=redis://redis:6379/0 \
  -e EMAIL_PROVIDER=console \
  -e FRONTEND_ORIGIN=http://localhost:3000 \
  -e COOKIE_SECURE=false \
  "$api_image" sh -c "uvicorn app.main:app --host 0.0.0.0 --port 8000 --no-proxy-headers" >/dev/null
wait_for_api

docker exec -i \
  -e "DRILL_EMAIL=$drill_email" \
  -e "DRILL_PASSWORD=$drill_password_login" \
  "$api_name" python - <<'PY'
import json
import os
import urllib.request


def request(path, payload, expected_status):
    body = json.dumps(payload).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/v1/auth/" + path,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        if response.status != expected_status:
            raise RuntimeError(f"{path} returned {response.status}, expected {expected_status}")
        return json.loads(response.read())


email = os.environ["DRILL_EMAIL"]
password = os.environ["DRILL_PASSWORD"]
request(
    "register",
    {"email": email, "password": password, "display_name": "Restore Drill", "ui_locale": "en"},
    201,
)
login = request("login", {"email": email, "password": password}, 200)
if not login.get("access_token"):
    raise RuntimeError("Login response did not include an access token")
PY

echo "Vocora isolated restore drill passed at $(date -u +%FT%TZ)"
echo "Restored archive: $(basename "$dump_file")"
echo "Result: passed (checksum, PostgreSQL import, migrations, health, register/login smoke test)"
