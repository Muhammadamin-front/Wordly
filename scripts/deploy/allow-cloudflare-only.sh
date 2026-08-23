#!/usr/bin/env bash
# Restricts inbound HTTP(S) on this origin to Cloudflare's published IP
# ranges only, via ufw. Run this ONLY if the diagnostic step in
# docs/deploy.md's "DDoS posture" section shows a public listener bound to
# 80/443 (a Cloudflare Tunnel setup has no such listener and doesn't need
# this at all — running it there is harmless but pointless).
#
# Safety: this script NEVER touches the SSH port or any other existing ufw
# rule — it only adds/refreshes allow rules for 80/443 from Cloudflare's
# ranges and, the first time, denies 80/443 from everywhere else. If you are
# not already SSH'd in over a port other than 80/443, or ufw is not already
# allowing your current SSH session, do not run this — you cannot lock
# yourself out of SSH via this script, but a *pre-existing* misconfiguration
# is not this script's problem to fix.
#
# Usage: sudo ./allow-cloudflare-only.sh
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run as root (sudo)." >&2
  exit 1
fi

if ! command -v ufw >/dev/null 2>&1; then
  echo "ufw not found — this script targets Ubuntu/Debian's ufw. Adapt the" >&2
  echo "same idea (allow 80/443 from Cloudflare's ranges, deny elsewhere)" >&2
  echo "to your actual firewall (iptables/nftables/cloud security group)." >&2
  exit 1
fi

echo "Fetching current Cloudflare IP ranges..."
V4=$(curl -fsS --max-time 10 https://www.cloudflare.com/ips-v4)
V6=$(curl -fsS --max-time 10 https://www.cloudflare.com/ips-v6)

if [[ -z "$V4" || -z "$V6" ]]; then
  echo "Could not fetch Cloudflare's IP list — aborting without changing anything." >&2
  exit 1
fi

echo "Allowing 80/443 from Cloudflare's ranges..."
for cidr in $V4 $V6; do
  ufw allow from "$cidr" to any port 80,443 proto tcp comment 'cloudflare'
done

echo "Denying 80/443 from everywhere else (SSH and all other rules untouched)..."
ufw deny 80/tcp
ufw deny 443/tcp

echo
echo "Done — the Cloudflare allow rules were added before the two deny"
echo "rules, so ufw (first-match-wins, evaluated top to bottom) checks them"
echo "first. Review before trusting it:"
ufw status numbered
echo
echo "If you re-run this later, or edit rules by hand, keep it that way: any"
echo "'allow from <cloudflare-cidr>' rule must stay above 'deny 80/tcp' and"
echo "'deny 443/tcp' in 'ufw status numbered', or use 'ufw insert 1 ...' to"
echo "re-place a rule that ends up after the deny rules."
