#!/bin/bash
set -e

cd /home/kitsune/Wordly

echo "=== Pull latest code ==="
git pull --ff-only

echo "=== Build images ==="
docker compose build

echo "=== Restart services ==="
docker compose up -d --force-recreate

echo "=== Waiting for API ==="
sleep 5

echo "=== Status ==="
docker compose ps

echo "=== Health check ==="
curl -f http://127.0.0.1:8000/health/detail

echo
echo "✅ Deploy complete"
