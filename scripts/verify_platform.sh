#!/usr/bin/env bash
# Run from anywhere; requires container platform_py (platform-py docker compose).
set -euo pipefail
docker exec platform_py python -c \
  "import asc_public_site; print('asc_public_site OK — slug:', asc_public_site.PUBLIC_SITE_SLUG)" \
  || {
    echo "Failed. From platform/platform-py run: docker compose up -d --force-recreate api" >&2
    exit 1
  }
echo "Public site (after: docker compose up -d in ASC/): http://localhost:8006/"
