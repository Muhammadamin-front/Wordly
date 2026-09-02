#!/usr/bin/env bash
# Host-side health probe. Runs on the production box every few minutes and
# alerts on Telegram when something the public probe cannot see goes wrong:
# a container that exited, a database or Redis dependency the API reports as
# degraded, or a disk about to fill.
#
# Configure via /etc/vocora/monitoring.env:
#   VOCORA_ALERT_BOT_TOKEN=...   (a Telegram bot token)
#   VOCORA_ALERT_CHAT_ID=...     (the chat that receives alerts)
#   VOCORA_DISK_PERCENT_MAX=85   (optional, default 85)
set -uo pipefail

readonly compose_dir="${VOCORA_COMPOSE_DIR:-/home/kitsune/Wordly}"
readonly health_url="${VOCORA_HEALTH_URL:-http://127.0.0.1:8000/health/detail}"
readonly web_url="${VOCORA_WEB_URL:-http://127.0.0.1:3006/uz}"
readonly disk_max="${VOCORA_DISK_PERCENT_MAX:-85}"
# One line per alert already sent, so a sustained outage pages once rather
# than every run; cleared as soon as the check passes again.
readonly state_file="${VOCORA_ALERT_STATE:-/var/lib/vocora/alert-state}"

problems=()

check_api() {
  local body
  body="$(curl -fsS --max-time 10 "$health_url" 2>/dev/null)" || {
    problems+=("API health endpoint unreachable ($health_url)")
    return
  }
  case "$body" in
    *'"database":"ok"'*) ;;
    *) problems+=("API reports a degraded database: $body") ;;
  esac
}

check_web() {
  curl -fsS -o /dev/null --max-time 15 "$web_url" \
    || problems+=("Web app not serving ($web_url)")
}

check_containers() {
  local not_running
  not_running="$(cd "$compose_dir" && docker compose --profile production ps \
    --format '{{.Service}} {{.State}}' 2>/dev/null | awk '$2 != "running" {print $1"("$2")"}')"
  [ -n "$not_running" ] && problems+=("Containers not running: ${not_running//$'\n'/, }")
}

check_disk() {
  local used
  used="$(df --output=pcent "$compose_dir" 2>/dev/null | tail -1 | tr -dc '0-9')"
  [ -n "$used" ] && [ "$used" -ge "$disk_max" ] && problems+=("Disk ${used}% full (limit ${disk_max}%)")
}

notify() {
  local text="$1"
  [ -n "${VOCORA_ALERT_BOT_TOKEN:-}" ] && [ -n "${VOCORA_ALERT_CHAT_ID:-}" ] || {
    echo "$text" >&2
    return
  }
  curl -fsS --max-time 15 -o /dev/null \
    "https://api.telegram.org/bot${VOCORA_ALERT_BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${VOCORA_ALERT_CHAT_ID}" \
    --data-urlencode "text=${text}" || echo "Alert delivery failed: $text" >&2
}

check_api
check_web
check_containers
check_disk

mkdir -p "$(dirname "$state_file")"

if [ ${#problems[@]} -eq 0 ]; then
  if [ -s "$state_file" ]; then
    notify "✅ Vocora recovered on $(hostname): all checks passing again."
    : > "$state_file"
  fi
  echo "ok"
  exit 0
fi

summary="$(printf '%s\n' "${problems[@]}")"
if [ "$summary" != "$(cat "$state_file" 2>/dev/null)" ]; then
  notify "🚨 Vocora alert on $(hostname):
$summary"
  printf '%s\n' "$summary" > "$state_file"
fi

printf '%s\n' "$summary" >&2
exit 1
