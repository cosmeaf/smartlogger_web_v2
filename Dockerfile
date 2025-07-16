# Dockerfile
FROM node:18 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the Vite app for production
RUN npm run build

# Serve the build with a simple HTTP server
FROM node:18 AS serve

# Install a simple HTTP server to serve static files
RUN npm install -g serve

# Copy the build files from the previous stage
COPY --from=build /app/dist /app/dist

# Set the working directory
WORKDIR /app/dist

# Expose the desired port
EXPOSE 4000

# Command to serve the static files
CMD ["serve", "-s", ".", "-l", "4000"]
