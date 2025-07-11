# Bee Web UI

A personal web UI to interact with the [bee.computer](https://bee.computer) API.

## Project Overview

This project provides a user-friendly interface for managing "todos" and "facts" from the `bee.computer` API, addressing the difficulty of editing and deleting these items in the official UI.

## Architecture

The application is built with a Node.js/Express backend that serves a vanilla HTML, CSS, and JavaScript frontend. The backend acts as a proxy to the Bee API, using the official `beeai` npm package to protect the `BEE_API_TOKEN`.

## Getting Started

### Prerequisites

-   Node.js (LTS version recommended)
-   npm (comes with Node.js)
-   A `BEE_API_TOKEN` from [bee.computer](https://bee.computer).

### Development Container Setup (Recommended)

This project is configured for development in a Dev Container (e.g., with VS Code Dev Containers extension). This provides a consistent and pre-configured environment with all necessary tools and dependencies.

1.  **Install Docker:** Ensure Docker Desktop (or Docker Engine) is installed and running on your system.
2.  **Install VS Code:** If you don't have it, download [Visual Studio Code](https://code.visualstudio.com/).
3.  **Install Dev Containers Extension:** In VS Code, install the "Dev Containers" extension.
4.  **Open Project in Container:**
    *   Clone this repository.
    *   Open the cloned folder in VS Code.
    *   VS Code should prompt you to "Reopen in Container" or "Open in Dev Container". Accept this prompt.
    *   If not prompted, open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and select "Dev Containers: Rebuild and Reopen in Container".

    The container will build (this may take a few minutes on the first run) and your project will open inside it, with all dependencies and tools ready.

### Manual Setup (Alternative)

If you prefer not to use Dev Containers:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/nabil-boutaleb-sf/bee-web-ui.git
    cd bee-web-ui
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure API Token:**

    Create a `.env` file in the project root and add your Bee API token:

    ```
    BEE_API_TOKEN=your_bee_api_token_here
    ```

### Running the Application

To start the Node.js server:

```bash
npm start
```

The application will be accessible at `http://localhost:3000`.

## Running Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

### Running Playwright Tests

To run the Playwright tests, ensure your development container is built (or you have manually installed Playwright browsers and dependencies if not using a dev container).

```bash
npx playwright test
```

This command will:

1.  Automatically start the application server (as configured in `playwright.config.js`).
2.  Launch a browser (Chromium by default).
3.  Run the tests located in the `tests/` directory.
4.  Generate an HTML test report (accessible by running `npx playwright show-report` after the tests complete).

### Troubleshooting Playwright Tests

If you encounter issues running Playwright tests (e.g., browser not launching, tests getting stuck):

*   **Ensure Dev Container is Rebuilt:** After any changes to `Dockerfile` or `.devcontainer/devcontainer.json`, you *must* rebuild the dev container.
*   **Missing Browser Dependencies:** If you see errors about missing browser executables or system dependencies, ensure you are using the recommended Playwright Dev Container image. If not, you might need to manually install them (e.g., `npx playwright install` for browsers, and `sudo apt-get install ...` for system dependencies if `npx playwright install-deps` fails).
*   **Lingering Processes:** Sometimes, previous test runs can leave orphaned browser processes. While Playwright tries to clean up, if issues persist, you might need to manually terminate them (e.g., `pkill -f "(chrome|firefox|webkit|playwright)"`).

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

## Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests.