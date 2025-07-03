# Bee Web UI - Design Document

## 1. Overview

The official `bee.computer` application has a user interface that makes it difficult to manage generated data, specifically "todos" and "facts". It is often not possible to remove or edit these items.

This project aims to build a simple, personal-use web application that acts as an alternative UI. It will directly leverage the `bee.computer` API to provide a clean and functional interface for managing this data. This document outlines the design and architecture for this proof-of-concept application.

## 2. Goals & Scope

The primary goal is to create a functional proof-of-concept that solves the immediate problem of being unable to edit/delete todos and facts.

### In-Scope (MVP)

-   **Authentication**: Securely store and use the personal `bee.computer` API token.
-   **Todos**:
    -   View a list of all current todos on a dedicated page.
    -   Mark a todo as complete.
    -   Delete a todo.
-   **Facts**:
    -   View a list of all recorded facts (both confirmed and unconfirmed) on a dedicated page.
    -   Visually distinguish between confirmed and unconfirmed facts.
    -   For unconfirmed facts, provide a "Confirm" button.
    -   For all facts, provide an "Edit" button to modify the text.
    -   For all facts, provide a "Delete" button.

### Out-of-Scope (Future Enhancements)

-   Creating new todos or facts.
-   Editing the text content of existing items.
-   Viewing daily summaries or conversations.
-   A user login system (the app is for personal use and will rely on a pre-configured API token).
-   Advanced filtering, sorting, or searching.
-   Confirmation dialogs for single deletions (to maintain a streamlined workflow).

## 3. Technical Architecture

The application will use a simple client-server architecture to ensure the API token remains secure.

### Backend

-   **Framework**: Node.js with Express.
-   **Role**:
    1.  **API Proxy**: The backend will be the only component that communicates directly with the `bee.computer` API (`https://api.bee.computer/v1/...`). This prevents the API token from being exposed to the user's browser.
    2.  **Static Server**: It will serve the frontend HTML, CSS, and JavaScript files to the browser.

### Frontend

-   **Technology**: Plain HTML, CSS, and vanilla JavaScript. A complex framework like React or Vue is unnecessary for this proof-of-concept.
-   **Role**: The frontend will provide the user interface. It will make requests to our *own* backend, which will then proxy those requests to the Bee API.

### API Endpoints (Our Application)

The Express server will expose the following endpoints for the frontend to consume:

-   `GET /`: Serves the main `index.html` landing page.
-   `GET /todos`: Serves the `todos.html` page.
-   `GET /facts`: Serves the `facts.html` page.
-   `GET /api/auth/status`: Checks if the backend is properly authenticated with the Bee API.
-   `GET /api/todos`: Fetches the list of todos from the Bee API.
-   `PUT /api/todos/:id/complete`: Marks a todo as complete. The Bee API does not delete completed todos, so they may still appear in the main list.
-   `DELETE /api/todos/:id`: Deletes a todo.
-   `GET /api/facts`: Fetches the list of facts from the Bee API.
-   `DELETE /api/facts/:id`: Deletes a fact.
    -   `PUT /api/facts/:id/confirm`: Confirms a fact.
    -   `PUT /api/facts/:id`: Updates a fact's text.

## 4. Data & Security

-   The `bee.computer` API token is the primary secret.
-   It will be stored in a `.env` file in the project root.
-   This file will be loaded by the Node.js application at startup.
-   The `.env` file will be added to `.gitignore` to prevent it from being committed to version control.

**Example `.env` file:**

```
BEE_API_TOKEN="your_bearer_token_here"
BEE_API_BASE_URL="https://api.bee.computer/v1"
```

## 5. UI/UX Concept

The user interface will be a clean, multi-page application.

-   **Home Page (`/`)**: A simple landing page that confirms the application is running and the Bee API token is configured correctly. It will provide navigation links to the "Todos" and "Facts" pages.
-   **Todos Page (`/todos`)**:
    -   Displays a list of pending and completed todos.
    -   Each todo item will have a "Complete" button and a "Delete" button.
    -   Completed todos will be visually distinguished (e.g., grayed out with a line-through).
-   **Facts Page (`/facts`)**:
    -   The Facts page will be divided into two main sections: "Confirmed Facts" and "Unconfirmed Facts".
    -   Each section will display its respective list of facts with independent pagination controls, including page numbers (e.g., "Page 1 of X").
    -   Unconfirmed facts will be visually distinguished from confirmed facts (e.g., different background color or an icon).
    -   Each fact item will have action buttons on the right edge.
    -   Unconfirmed facts will have "Confirm", "Edit", and "Delete" buttons.
    -   Confirmed facts will have "Edit" and "Delete" buttons.
    -   Full text of the fact will be displayed.
    -   Loading indicators will be displayed for each section while facts are being fetched.

### User Experience Elements

-   **Loading State**: When fetching data (e.g., loading the todo list), a clear loading indicator (e.g., "Loading...") will be displayed to inform the user.
-   **Error Handling**: If an API call fails, a simple, non-intrusive notification will appear on the screen to inform the user of the error (e.g., "Failed to delete fact.").

## 6. Proposed Project Structure

```
/bee-web-ui
├── .devcontainer/
├── bee/                  # API documentation
├── public/
│   ├── index.html        # Main landing page
│   ├── todos.html        # Page for managing todos
│   ├── facts.html        # Page for managing facts
│   ├── style.css         # Shared styles for the UI
│   └── app.js            # Frontend JavaScript logic
├── services/
│   └── beeService.js     # Module for Bee API communication
├── .env                  # For storing API token (will be gitignored)
├── .gitignore
├── DESIGN.md             # This document
├── Dockerfile
├── index.js              # Express server entry point
├── package.json
└── package-lock.json
```