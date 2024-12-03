# Use a Node.js base image
FROM node:16-bullseye

# Debugging: Check if Dockerfile is being executed
RUN echo "Starting Dockerfile execution"

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Check if the build was successful
RUN echo "Build completed"

# List the contents of the dist directory for debugging
RUN ls -la dist || echo "dist directory not found"

# Expose the port the app runs on
EXPOSE 3000

# Start the application with seeding
CMD ["sh", "-c", "npm run seed && node dist/src/main.js"]
