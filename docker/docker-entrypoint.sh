#!/bin/sh
set -e

echo "Starting the app"
exec node /app/.output/server/index.mjs
