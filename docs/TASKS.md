# Project Tasks

This document outlines the development tasks for the Bee Web UI project.

## High Priority
- [ ] **Fix Skipped Tests:**
    - [ ] The test 'should filter unconfirmed facts by search term' in `tests/facts.spec.js` is currently skipped. To fix this, the test needs to create a new fact to search for, which requires implementing a `POST /api/facts` endpoint and the corresponding `createFact` service function.

## Blocked Tasks
- [ ] **Todos Page:**
    - [ ] Separate todos into three sections: "Unconfirmed", "Incomplete", and "Completed". (Blocked by Bee.computer API clarification on "suggested todos")

## Medium Priority
- [ ] **Investigate Suggested Todos API:** Test for a "suggestion" event via a WebSocket connection using the `websocket-test.js` script when a new suggestion is likely to be pushed by the server.

## Low Priority
- [ ] **General UI/UX:**
    - [ ] Add an inline creation form for new items (facts, todos).
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
    -   [x] Implement the `PUT /api/todos/:id` endpoint for editing todos.
    -   [x] Implement the `GET /api/facts` endpoint using the `beeai` SDK.
    -   [x] Implement the `DELETE /api/facts/:id` endpoint using the `beeai` SDK.
    -   [x] Implement the `PUT /api/facts/:id/confirm` endpoint using the `beeai` SDK.
    -   [x] Implement the `PUT /api/facts/:id/unconfirm` endpoint using the `beeai` SDK.
    -   [x] Implement the `PUT /api/facts/:id` endpoint for editing facts.
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
    -   **Conversations Page:**
        -   [x] Display conversation metadata (e.g., date, number of messages).
        -   [x] Allow users to view the full content of a conversation.
        -   [x] Implement a search or filter for conversations.
        -   [x] Fix cursor issue on conversation accordion items (removed `cursor: pointer` from `.conversation-item` in `public/style.css`).
        -   [x] Improve stability of Playwright test for conversation accordion expansion/collapse (`tests/conversations.spec.js`).
-   **General UI/UX:**
    -   [x] Implement a search/filter for items on all pages.
    -   [x] Implement bulk actions (e.g., delete, confirm).
-   **Code Cleanup:**
    -   [x] Remove redundant and verbose logging from `services/beeService.js`.
-   **API Investigation:**
    -   [x] Contact Bee.computer developers to clarify how to access "suggested todos".
-   **Playwright Integration:**
    -   [x] Set up Playwright for end-to-end testing.
    -   [x] Configure `playwright.config.js` to run tests against the local server.
    -   [x] Resolve environment issues preventing Playwright from running (missing browser binaries and system dependencies).
    -   [x] Migrate to an official Playwright Docker image for a pre-configured testing environment.