ARG NODE_VERSION=22.19.0-alpine
ARG NGINX_VERSION=1.27-alpine

# ---------- 1. deps: install deps (cached separately from source) ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY client/package.json client/package-lock.json ./
# required for Tailwind v4 (lightningcss) on Alpine/musl
RUN npm install lightningcss-linux-x64-musl
RUN npm ci

# ---------- 2. build: compile the Angular app ----------
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY client/ .
RUN npm run build:prod

# ---------- 3. runner: nginx serving the static "browser" output ----------
FROM nginx:${NGINX_VERSION} AS runner

COPY client/nginx.conf /etc/nginx/nginx.conf
# "browser" is the static output folder even though this project has SSR
# configured (outputMode: server in angular.json) — we only need this part.
COPY --from=build /app/dist/gym-tracker/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
