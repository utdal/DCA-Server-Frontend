########################################
# Stage 1 – Build the React application
########################################
FROM node:20-alpine AS builder

# Where all build commands run
WORKDIR /app

# Speed up Docker layer caching
COPY package*.json ./
RUN npm ci --silent

# Copy the rest of the source and build
COPY . .
RUN npm run build          # <-- outputs to /app/build

########################################
# Stage 2 – Serve with Nginx
########################################
FROM nginx:1.28.2-alpine

# Remove default Nginx static files and the stock conf.d/default.conf,
# which would otherwise shadow our config for requests with Host: localhost
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy React build artefacts from the previous stage
COPY --from=builder /app/build /usr/share/nginx/html

# Custom Nginx config (see below)
#COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY app-locations.conf /etc/nginx/app-locations.conf

# Expose HTTP
EXPOSE 80

# Keep Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
