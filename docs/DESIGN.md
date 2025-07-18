# Bee Web UI - Design Document

This document outlines the design and architecture of the Bee Web UI application.

## 1. Project Goal

The primary goal of this project is to create a simple, personal-use web application to manage "todos" and "facts" from the `bee.computer` API. The official UI makes it difficult to edit or delete these items, and this project aims to solve that problem.

## 2. Architecture

The application follows a client-server architecture:

-   **Backend:** A Node.js server using the Express framework. Its primary responsibilities are:
    -   Serving the static frontend assets (HTML, CSS, JavaScript).
    -   Acting as a secure proxy for the Bee API. It uses the `beeai` npm package to handle all API interactions, keeping the `BEE_API_TOKEN` secure on the server.
    -   Providing a separate, isolated API endpoint for the test page that makes direct calls to the Bee API.
-   **Frontend:** A multi-page application built with vanilla HTML, CSS, and JavaScript. The frontend makes API calls to the backend, which then communicates with the Bee API.

## 3. UI Structure

The application is divided into the following pages:

-   **/ (Home):** A welcome page that displays the connection status to the Bee API.
-   **/todos:** Displays the user's todos, separated into "Incomplete" and "Completed" lists. Users can complete, edit, and delete todos.
-   **/facts:** Displays the user's facts, separated into "Confirmed" and "Unconfirmed" lists. Users can confirm, unconfirm, edit, and delete facts.
-   **/conversations:** Displays a list of the user's conversations in an accordion format. Each item shows key metadata (summary, state, time) and expands to reveal the full, markdown-rendered conversation content.
-   **/test.html:** A dedicated test page for direct interaction with the Bee API.

## 4. Key Features

-   **Facts Management:**
    -   View confirmed and unconfirmed facts in separate, paginated lists.
    -   Confirm, unconfirm, edit, and delete facts.
-   **Todos Management:**
    -   View incomplete and completed todos in separate, paginated lists.
    -   Complete, edit, and delete todos.
-   **Conversations:**
    -   View a list of conversations in an accordion format, with full markdown rendering (including lists and tables) for detailed content.
    -   Pagination for conversations.
    -   Search/filter for conversations.
-   **Authentication:**
    -   The application supports two methods for API authentication:
        1.  A `BEE_API_TOKEN` can be stored in a `.env` file on the server for persistent configuration.
        2.  If the token is not provided in the `.env` file, the user is prompted to enter it in the UI. The token is then stored securely in a server-side session for the duration of the visit.
    -   The UI displays the connection status to the Bee API.
-   **Testing:**
    -   An isolated test page allows for direct API calls to the Bee API, bypassing the SDK for testing and debugging.
-   **General UI/UX:**
    -   Bulk actions (e.g., delete, confirm).
    -   Search/filter for items on all pages.

## 5. Future Enhancements

-   **General UI/UX:**
    -   Add an inline creation form for new items (facts, todos).
    -   Display date/source information for items (if available from the API).
    -   Improve the visual design and branding.
