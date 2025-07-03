# Bee Web UI

A simple web UI to interact with the [bee.computer](https://bee.computer/) API.

## Development Environment

It is highly recommended to use [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) for development. This will ensure a consistent and pre-configured environment.

When you open this project in VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) installed, it will automatically:

*   Build the Docker container defined in the `Dockerfile`.
*   Install necessary system-level dependencies (like the GitHub CLI).
*   Install the following recommended VS Code extensions inside the container:
    *   [Gemini Code Assist](https://marketplace.visualstudio.com/items?itemName=google.geminicodeassist)
    *   [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree)
    *   [PDF Viewer](https://marketplace.visualstudio.com/items?itemName=brave.vscode-pdf)

## Setup

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Create a `.env` file:**
    Create a file named `.env` in the root of the project and add your Bee API token:
    ```
    BEE_API_TOKEN="your_bee_api_token_here"
    ```

3.  **Start the server:**
    ```bash
    npm start
    ```

The server will be running at `http://localhost:3000`.