#!/bin/bash
set -e
set -o pipefail

cd /home/kitsune/Wordly

echo "=== Check working tree ==="
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit/stash local changes before deploying."
  git status --short
  exit 1
fi

echo "=== Pull latest code ==="
git fetch origin main
git pull --ff-only origin main

echo "=== Build images ==="
docker compose build

echo "=== Apply containers ==="
docker compose up -d --remove-orphans

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

echo "=== Status ==="
docker compose ps

echo "=== Health check ==="
curl -f http://127.0.0.1:8000/health/detail

echo
echo "✅ Deploy complete"
