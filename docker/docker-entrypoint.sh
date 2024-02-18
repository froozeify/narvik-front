#!/bin/sh
set -e

yarn install --production=false
yarn run build

exec node /app/.output/server/index.mjs
