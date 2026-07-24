ARG NODE_VERSION=22-alpine

# ---------- 1. deps: install ALL deps (needed to compile TS) ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 2. build: compile TypeScript -> build/ ----------
FROM node:${NODE_VERSION} AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- 3. prod-deps: install ONLY production deps ----------
FROM node:${NODE_VERSION} AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- 4. runner: minimal final image ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY package.json ./

# node:alpine images ship a non-root "node" user
USER node

EXPOSE 3000
CMD ["node", "build/index.js"]
