#!/usr/bin/env sh
set -eu

ENV_FILE="${ENV_FILE:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "missing env file: $ENV_FILE" >&2
  exit 1
fi

TOKEN="$(awk -F= '$1 == "TELEGRAM_BOT_TOKEN" { print substr($0, index($0, "=") + 1); exit }' "$ENV_FILE")"

if [ -z "${TOKEN:-}" ]; then
  echo "TELEGRAM_BOT_TOKEN is empty or missing in $ENV_FILE" >&2
  exit 1
fi

openclaw channels add --channel telegram --token "$TOKEN"
