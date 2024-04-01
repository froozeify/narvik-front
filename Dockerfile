# syntax = docker/dockerfile:1

ARG NODE_VERSION=20.12

FROM node:${NODE_VERSION}-slim as base

ARG PORT=3000
ENV NODE_ENV=production

WORKDIR /app

# Build
FROM base as build

COPY --link package.json yarn.lock .
RUN yarn install --production=false

COPY --link . .

RUN yarn run build

# Run
FROM base as run

ENV PORT=$PORT

COPY --from=build /app/.output /app/.output
COPY --link --chmod=755 docker/docker-entrypoint.sh /usr/local/bin/docker-entrypoint

ENTRYPOINT ["docker-entrypoint"]
