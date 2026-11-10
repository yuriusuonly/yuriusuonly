# Syntax: docker/dockerfile:1

# --- Build: install deps and export the static web app ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run expo:build

# --- Runtime image, shared by the two `docker-compose.yml` services ---
FROM node:22-alpine

# Build args from .env (via docker-compose `build.args`); consumed at runtime by
# the Caddyfile's `{$PORT}`/`{$HTTPS_PORT}` placeholders.
ARG PORT
ARG HTTPS_PORT
ENV PORT=${PORT} HTTPS_PORT=${HTTPS_PORT}

# Caddy binary from the official image
COPY --from=caddy:2-alpine /usr/bin/caddy /usr/local/bin/caddy

WORKDIR /app

# Production deps (expo serve needs expo CLI; all deps are runtime deps)
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY Caddyfile ./

# No CMD: both service commands are plain argv arrays in `docker-compose.yml` —
# the image is only the built artifact ("build once, define commands at the
# compose level"). `expo serve` needs `--port`, whose value compose interpolates
# from .env (it ignores the `PORT` env var), which is why the commands must live
# at the compose level rather than in this file.
