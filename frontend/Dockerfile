# --- Stage 1: Build ---
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies with legacy peer deps
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Set build argument for backend API URL and write it to env
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build project
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine

# Copy built static files to nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
