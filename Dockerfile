# Use the official Node.js 18 Alpine image for an ultra-lightweight container
FROM node:18-alpine

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . ./

# Run the web service on container startup.
# GCP Cloud Run injects the PORT environment variable dynamically (usually 8080).
CMD [ "npm", "start" ]
