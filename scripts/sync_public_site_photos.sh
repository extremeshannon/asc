#!/usr/bin/env bash
# Copy ASC marketing JPEGs from platform-py (same files MalfunctionDZ /dz uses).
# Source: process_public_site_photos.py → uploads/public_site/1/*.jpg
#
# Usage (from ASC repo root):
#   bash scripts/sync_public_site_photos.sh
#   PLATFORM_PY=/path/to/platform-py bash scripts/sync_public_site_photos.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${PLATFORM_PY:-$ROOT/../platform/platform-py}/uploads/public_site/1"
DST="$ROOT/public"

mkdir -p "$DST"
FILES=(hero-main.jpg gallery-01-tandem.jpg gallery-02-landing.jpg gallery-03-solo.jpg gallery-04-climbout.jpg)
copied=0
for f in "${FILES[@]}"; do
  if [[ -f "$SRC/$f" ]]; then
    cp -p "$SRC/$f" "$DST/$f"
    echo "synced $f"
    copied=$((copied + 1))
  else
    echo "skip $f (not found under $SRC)"
  fi
done
if [[ "$copied" -eq 0 ]]; then
  echo "No files copied. Add source PNGs and run in platform-py container:"
  echo "  docker exec platform_py python scripts/process_public_site_photos.py"
  exit 0
fi
echo "Done. Restart or refresh nginx container if needed: docker compose restart"
