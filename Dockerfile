# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.11

FROM node:${NODE_VERSION}-slim as base

ENV NODE_ENV=production

WORKDIR /app

# Build
FROM base as build

COPY --link . .

COPY --link --chmod=755 docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint
ENTRYPOINT ["docker-entrypoint"]
