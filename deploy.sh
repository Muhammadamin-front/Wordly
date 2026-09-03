#!/bin/bash
set -e
set -o pipefail

script_dir="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$script_dir"
expected_sha="${1:-}"

# Where the last two successfully deployed commits are recorded. Rolling back
# is checking out a known-good commit and rebuilding it — not a mystery state.
readonly deployed_file=".deployed-sha"
readonly previous_file=".previous-deployed-sha"


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

if [ "$expected_sha" = "--rollback" ]; then
  previous="$(cat "$previous_file" 2>/dev/null || true)"
  if [ -z "$previous" ]; then
    echo "No previous deploy recorded in $previous_file — nothing to roll back to."
    exit 1
  fi
  echo "=== Rolling back to $previous ==="
  # Migrations are additive by policy, so the older code runs against the
  # newer schema. A migration that drops or renames something breaks that
  # promise and has to be reversed by hand — deliberately, not by this script.
  git checkout --quiet --detach "$previous"
  git status --porcelain | grep -q . && { echo "Working tree dirty"; exit 1; }
  retry 3 docker compose --profile production build
  docker compose --profile production up -d --remove-orphans --wait --wait-timeout 180
  curl -fsS http://127.0.0.1:8000/health/detail >/dev/null
  echo "$previous" > "$deployed_file"
  echo "✅ Rolled back to $previous"
  exit 0
fi

echo "=== Check working tree ==="
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit/stash local changes before deploying."
  git status --short
  exit 1
fi

echo "=== Fetch code ==="
git fetch origin main
# A rollback leaves the checkout detached; come back to the branch before
# fast-forwarding, so the next deploy moves main rather than a loose HEAD.
git checkout --quiet main
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

echo "=== Apply migrations and content import ==="
# Ahead of the swap, once, instead of on every container start: a second
# replica would otherwise race the same alembic upgrade.
retry 2 docker compose --profile production run --rm api alembic upgrade head
retry 2 docker compose --profile production run --rm api python -m scripts.import_expressions

echo "=== Apply containers ==="
# --wait holds until every service with a healthcheck reports healthy, so a
# container that starts and immediately dies fails the deploy here rather
# than being discovered by a learner.
docker compose --profile production up -d --remove-orphans --wait --wait-timeout 180

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

# Only now, with the public smoke passed, is this commit worth rolling back
# to. Recorded after the fact so the previous entry is always a version that
# actually served traffic.
if [ -f "$deployed_file" ]; then
  cp "$deployed_file" "$previous_file"
fi
git rev-parse HEAD > "$deployed_file"

echo
echo "✅ Deploy complete ($(git rev-parse --short HEAD))"
echo "   Roll back with: ./deploy.sh --rollback"
