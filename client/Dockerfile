ARG NODE_VERSION=22.19.0-alpine
ARG NGINX_VERSION=alpine3.22

FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install lightningcss-linux-x64-musl

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build:prod


FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose the SSR server port
EXPOSE 4000

CMD ["node", "dist/gym-tracker/server/server.mjs"]