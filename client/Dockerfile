# ---------------------------
# Stage 1: Build Angular App
# ---------------------------
FROM node:22.17.1 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Build Angular app
RUN npm run build --prod

# ---------------------------
# Stage 2: Serve the App
# ---------------------------
FROM nginx:alpine

# Copy built files from previous stage
COPY --from=build /dist/gym-tracker /usr/share/nginx/html

# Copy custom nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]