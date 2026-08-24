#!/bin/bash
set -e
set -o pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$script_dir"
expected_sha="${1:-}"

retry() {
  local max_attempts="$1"
  shift
  local attempt=1

  until "$@"; do
    if [ "$attempt" -ge "$max_attempts" ]; then
      echo "Command failed after ${max_attempts} attempts: $*"
      return 1
    fi

    echo "Attempt ${attempt}/${max_attempts} failed; retrying in 5 seconds..."
    attempt=$((attempt + 1))
    sleep 5
  done
}

echo "=== Check working tree ==="
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit/stash local changes before deploying."
  git status --short
  exit 1
fi

echo "=== Fetch code ==="
git fetch origin main
if [ -n "$expected_sha" ]; then
  git cat-file -e "${expected_sha}^{commit}"
  git merge-base --is-ancestor "$expected_sha" origin/main
  echo "=== Deploy verified commit $expected_sha ==="
  git merge --ff-only "$expected_sha"
else
  echo "=== Deploy latest main (manual run) ==="
  git pull --ff-only origin main
fi

echo "=== Production preflight ==="
node scripts/release-preflight.mjs --server-only

echo "=== Build images ==="
retry 3 docker compose --profile production build

echo "=== Validate migration graph inside release image ==="
heads_count="$(docker compose --profile production run --rm --no-deps api alembic heads | grep -c '(head)')"
test "$heads_count" -eq 1

echo "=== Apply containers ==="
docker compose --profile production up -d --remove-orphans

echo "=== Waiting for API ==="
for attempt in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8000/health/detail >/dev/null; then
    break
  fi
  if [ "$attempt" -eq 30 ]; then
    echo "API did not become healthy in time"
    docker compose ps
    docker compose logs --tail=120 api
    exit 1
  fi
  sleep 2
done

echo "=== Seed idempotent production corpus ==="
docker compose exec -T api python -m scripts.seed

echo "=== Status ==="
docker compose ps

echo "=== Health check ==="
curl -f http://127.0.0.1:8000/health/detail

echo "=== Public tunnel smoke ==="
node scripts/production-smoke.mjs

echo
echo "✅ Deploy complete"
