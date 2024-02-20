#!/bin/sh
set -e

yarn install --production=false

echo "Removing old app build output"
rm -rf /app/.output

echo "Building app"
yarn run build

echo "App build and ready"
exec node /app/.output/server/index.mjs
