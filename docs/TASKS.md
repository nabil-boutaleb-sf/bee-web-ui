# Project Tasks

This document outlines the development tasks for the Bee Web UI project.

## High Priority
- [ ] **Todos Page:**
    - [ ] Separate todos into three sections: "Unconfirmed", "Incomplete", and "Completed".

## Medium Priority
- [ ] **Conversations Page:**
    - [ ] Display conversation metadata (e.g., date, number of messages).
    - [ ] Allow users to view the full content of a conversation.
    - [ ] Implement a search or filter for conversations.

## Low Priority
- [ ] **General UI/UX:**
    - [ ] Add an inline creation form for new items (facts, todos).
    - [ ] Implement a search/filter for items on all pages.
    - [ ] Implement bulk actions (e.g., delete, confirm).
    - [ ] Display date/source information for items (if available from the API).
    - [ ] Improve the visual design and branding.

## Completed Tasks

-   **Setup & Foundation:**
    -   [x] Initialize Git repository and connect to GitHub.
    -   [x] Create `TASKS.md` to track progress.
    -   [x] Move existing test functionality from `index.html` to a new `test.html` page.
    -   [x] Create the new placeholder HTML files (`index.html`, `todos.html`, `facts.html`) in the `public/` directory.
    -   [x] Install the `beeai` SDK.
    -   [x] Create the basic Express server in `index.js`.
    -   [x] Create the initial `beeService.js` to use the `beeai` SDK.
    -   [x] Create the `.env` file and add the `BEE_API_TOKEN`.
    -   [x] Restore and verify the functionality of the Test page (public/test.html and public/test.js).
-   **Backend Development:**
    -   [x] Implement `GET /`, `GET /todos`, and `GET /facts` routes in `index.js` to serve the HTML pages.
    -   [x] Implement the `GET /api/auth/status` endpoint using the `beeai` SDK.
    -   [x] Implement `GET /api/todos` and `GET /api/facts` endpoints in `index.js`.
    -   [x] Implement the `PUT /api/todos/:id/complete` endpoint using the `beeai` SDK.
    -   [x] Implement the `DELETE /api/todos/:id` endpoint using the `beeai` SDK.
    -   [x] Implement the `GET /api/facts` endpoint using the `beeai` SDK.
    -   [x] Implement the `DELETE /api/facts/:id` endpoint using the `beeai` SDK.
    -   [x] Implement the `PUT /api/facts/:id/confirm` endpoint using the `beeai` SDK.
    -   [x] Implement the `PUT /api/facts/:id/unconfirm` endpoint using the `beeai` SDK.
    -   [x] Implement the `PUT /api/facts/:id` endpoint for editing facts.
    -   [x] Implement the `PUT /api/todos/:id` endpoint for editing todos.
-   **Frontend Development:**
    -   **Home Page (`index.html`):**
        -   [x] Add navigation links to the Todos, Facts, and Test pages.
        -   [x] Call the `/api/auth/status` endpoint and display the connection status.
        -   [x] Validate that the "status: connected to bee api" message is not a false positive.
    -   **Todos Page (`todos.html` & `app.js`):**
        -   [x] Fetch and display the list of todos from `/api/todos`.
        -   [x] Implement the "Complete" button functionality.
        -   [x] Implement the "Delete" button functionality.
        -   [x] Add loading and error state indicators.
        -   [x] Fix duplicate pagination issue.
        -   [x] Fix incomplete loading of todos.
        -   [x] Implement "edit todo" functionality.
    -   **Facts Page (`facts.html` & `app.js`):**
        -   [x] Fetch and display the list of facts from `/api/facts`.
        -   [x] Visually distinguish between confirmed and unconfirmed facts.
        -   [x] Implement the "Confirm" button functionality for unconfirmed facts.
        -   [x] Implement the "Delete" button functionality for all facts.
        -   [x] Implement the "Edit" button functionality for all facts.
        -   [x] Add unconfirm button.
        -   [x] Add breadcrumbs on pages so I can navigate back.
        -   [x] Add loading and error state indicators.
        -   [x] Separate confirmed and unconfirmed facts into distinct sections on the page.
        -   [x] Add pagination numbers (e.g., "Page 1 of X") to the facts lists.
    -   **Test Page (`test.html` & `test.js`):**
        -   [x] Restore the Test page (`public/test.html` and `public/test.js`), preserving the original `test.js` as `public/test.original.js` for reference.
        -   [x] Create an isolated test API that calls the Bee API directly, bypassing the SDK.
        -   [x] Update the test page to use the isolated test API.
        -   [x] Add "Confirmed" and "Unconfirmed" sections to the test page.
        -   [x] Add breadcrumbs to the test page.
-   **Code Cleanup:**
    -   [x] Remove redundant and verbose logging from `services/beeService.js`.