#!/usr/bin/env sh
set -eu

compose_file="docker/compose.phase1.yml"
project_name="aitransforms_phase1"
service_name="phase1-test"
container_name="${project_name}-${service_name}-1"

docker compose -f "$compose_file" -p "$project_name" up -d
trap 'docker compose -f "$compose_file" -p "$project_name" down >/dev/null 2>&1 || true' EXIT INT TERM

./tests/phase1_isolation.sh "$container_name"
