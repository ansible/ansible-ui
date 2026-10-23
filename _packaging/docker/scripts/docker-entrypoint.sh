#!/bin/sh
set -e

if [ -d /etc/nginx/templates ]; then
  for template in /etc/nginx/templates/*.template; do
    [ -e "$template" ] || continue
    output="/etc/nginx/conf.d/$(basename "$template" .template)"
    if grep -q 'PLATFORM_SERVER' "$template"; then
      envsubst '${PLATFORM_SERVER}' < "$template" > "$output"
    else
      cp "$template" "$output"
    fi
  done
fi

exec "$@"
