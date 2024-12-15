# Use a Node.js base image
FROM node:16-bullseye

# Set the working directory
WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the application code
COPY . .

# Create directory for certificates
RUN mkdir -p src/certs

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Add healthcheck using service name
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f ${BACKEND_URL:-http://backend:3000}/health || exit 1

# Start the application
CMD ["sh", "-c", "npm run seed && node dist/src/main.js"]
