#!/usr/bin/env bash
set -euo pipefail
curl -sf "http://127.0.0.1:8006/" | grep -q "ALASKA" || {
  echo "Expected Alaska Skydive Center home on http://127.0.0.1:8006/" >&2
  exit 1
}
echo "OK — http://localhost:8006/"
