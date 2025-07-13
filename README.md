# Bee Web UI

A user-friendly, personal web UI to manage your `bee.computer` todos and facts.

## Overview

This project provides a simple interface for managing the `Bee` via the web. It was created to provide a web interface, making it easier to review in bulk.

The application is built with a Node.js/Express backend that serves a vanilla HTML, CSS, and JavaScript frontend. The backend acts as a secure proxy to the Bee API, using the official `beeai` npm package to protect your `BEE_API_TOKEN`.

## Features

- **Facts Management:** View, confirm, unconfirm, edit, and delete facts with pagination and search.
- **Todos Management:** View incomplete/completed todos, mark as complete, edit, and delete with pagination and search.
- **Conversations:** View conversations in an accordion format with full markdown rendering, pagination, and search.
- **Secure API Key Handling:** Your API key is handled securely on the server-side and is never exposed to the browser.
- **Bulk Actions:** Perform actions on multiple items at once.

<!-- Add screenshots here -->

## Getting Started

1.  **Install dependencies and start the server:**

    ```bash
    npm install
    npm start
    ```
    The application will be accessible at `http://localhost:3000`.

2.  **Provide your API Token:**

    You will need an API token from `bee.computer`.

    #### How to get your API Key:
    1. Go to <a href="https://developer.bee.computer" target="_blank" rel="noopener noreferrer">developer.bee.computer</a>.
    2. Sign in with your Apple ID.
    3. Ensure the Apple ID email is the same one associated with your bee.computer account.
    4. Once signed in, your API key will be displayed on the developer portal.

    When you first run the application, it will prompt you to enter this key on the home page. The key is stored securely in a server-side session for the duration of your visit.

    For development, you can also create a `.env` file in the project root and add your key:
    ```
    BEE_API_TOKEN=your_bee_api_token_here
    ```

## Project Structure

-   `index.js`: Main Node.js Express server.
-   `public/`: Frontend static assets (HTML, CSS, JS).
-   `routes/`: Express route definitions.
-   `services/`: Backend services, including `beeService.js` for Bee API interactions.
-   `tests/`: Playwright end-to-end tests.
-   `docs/`: Project documentation (CHANGELOG, DESIGN, TASKS, test_cases, GEMINI.md).
-   `.env`: Environment variables (e.g., `BEE_API_TOKEN`).
-   `Dockerfile`: Defines the Docker image for the development container.
-   `.devcontainer/devcontainer.json`: Configures the VS Code Dev Container.

## Running Tests

This project uses Playwright for end-to-end testing. To run the tests, see the instructions in the Contributing Guide.

## Contributing

We welcome contributions! Please see the CONTRIBUTING.md file for details on how to set up the development environment and submit changes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
