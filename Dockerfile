# Use the official Playwright image which comes with browsers and dependencies pre-installed.
FROM mcr.microsoft.com/playwright:v1.53.2-noble

# The Playwright image comes with Node.js and npm installed.
# It also creates a non-root user 'pwuser'. We'll switch to it later.

# Set the working directory inside the container
WORKDIR /workspaces/bee-web-ui

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install application dependencies
RUN npm install && \
    npm install -g @google/gemini-cli

# Copy the rest of the application code
COPY . .

# The base image already has a 'pwuser'. We need to grant it ownership
# of the files we just copied to avoid permission issues.
# The user ID for pwuser is 1000.
RUN chown -R 1000:1000 /workspaces/bee-web-ui

# Switch to the non-root user provided by the base image
USER pwuser

# Expose the port the app runs on
EXPOSE 3000 9323

# The command to start the app (will be used by 'npm start')
CMD [ "node", "index.js" ]