# Bee Web UI

A simple web UI to interact with the [bee.computer](https://bee.computer/) API. This application provides a user-friendly interface for managing your personal "todos" and "facts".

## Features

-   **View and Manage Facts:** See your confirmed and unconfirmed facts, with options to confirm, unconfirm, edit, and delete them.
-   **View and Manage Todos:** See your incomplete and completed todos, with options to complete, edit, and delete them.
-   **View Conversations:** See a list of your conversations.
-   **Secure API Interaction:** The application uses a Node.js backend to securely handle API requests, so your `BEE_API_TOKEN` is never exposed to the browser.
-   **Isolated Test Page:** A dedicated test page allows for direct interaction with the Bee API for testing and debugging purposes.

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   An API token from [bee.computer](https://bee.computer/)

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nabil-boutaleb-sf/bee-web-ui.git
    cd bee-web-ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    Create a file named `.env` in the root of the project and add your Bee API token:
    ```
    BEE_API_TOKEN="your-api-token-here"
    ```

### Running the Application

To start the application, run the following command:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).
