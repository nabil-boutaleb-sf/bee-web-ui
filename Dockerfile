# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install system dependencies and application dependencies
RUN apt-get update && apt-get install -y git procps && \
    npm install && \
    npm install -g @google/gemini-cli

# Copy the rest of the application's source code from your machine to the container
COPY . .

# Expose the port the app runs on
EXPOSE 3000
