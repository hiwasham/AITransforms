#!/usr/bin/env bash
# Authenticated GET against Circle's internal SPA API.
set -euo pipefail
JAR="${EMPOWER_JAR:-/tmp/.empower.jar}"
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
curl -sS -b "$JAR" -c "$JAR" -A "$UA" \
  -H 'Accept: application/json, text/plain, */*' \
  -H 'Accept-Language: en-US,en;q=0.9' \
  -H 'X-Requested-With: XMLHttpRequest' \
  -H 'Sec-Fetch-Site: same-origin' -H 'Sec-Fetch-Mode: cors' -H 'Sec-Fetch-Dest: empty' \
  -H 'Referer: https://community.empowerlabs.ai/' \
  --compressed -w '\n__HTTP:%{http_code}\n' \
  "https://community.empowerlabs.ai$1"
