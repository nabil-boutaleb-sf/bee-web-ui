# Project Tasks

This document outlines the development tasks for the Bee Web UI project.

## Phase 1: Setup & Foundation

-   [x] Initialize Git repository and connect to GitHub.
-   [x] Create `TASKS.md` to track progress.
-   [x] Move existing test functionality from `index.html` to a new `test.html` page.
-   [x] Create the new placeholder HTML files (`index.html`, `todos.html`, `facts.html`) in the `public/` directory.
-   [x] Install the `beeai` SDK.
-   [x] Reinforce the container - do we need to link gh directly on container load? (Answer - no need)
-   [x] Make sure pgrep is set up, set Gemini CLI to ensure I have checkpoints where there's enough tokens to document in detail what's been happening
-   [x] Create the basic Express server in `index.js`.
-   [x] Create the initial `beeService.js` to use the `beeai` SDK.
-   [x] Create the `.env` file and add the `BEE_API_TOKEN`.
-   [x] Restore and verify the functionality of the Test page (public/test.html and public/test.js).

## Phase 2: Backend Development

-   [x] Implement `GET /`, `GET /todos`, and `GET /facts` routes in `index.js` to serve the HTML pages.
-   [x] Implement the `GET /api/auth/status` endpoint using the `beeai` SDK.
-   [ ] Implement `GET /api/todos` and `GET /api/facts` endpoints in `index.js`.
-   [ ] Implement the `PUT /api/todos/:id/complete` endpoint using the `beeai` SDK.
-   [ ] Implement the `DELETE /api/todos/:id` endpoint using the `beeai` SDK.
-   [ ] Implement the `GET /api/facts` endpoint using the `beeai` SDK.
-   [ ] Implement the `DELETE /api/facts/:id` endpoint using the `beeai` SDK.
-   [ ] Implement the `PUT /api/facts/:id/confirm` endpoint using the `beeai` SDK.

## Phase 3: Frontend Development

### Home Page (`index.html`)
-   [x] Add navigation links to the Todos, Facts, and Test pages.
-   [x] Call the `/api/auth/status` endpoint and display the connection status.
-   [ ] Validate that the "status: connected to bee api" message is not a false positive.

### Todos Page (`todos.html` & `app.js`)
-   [ ] Fetch and display the list of todos from `/api/todos`.
-   [ ] Implement the "Complete" button functionality.
-   [ ] Implement the "Delete" button functionality.
-   [ ] Add loading and error state indicators.
-   [ ] Investigate and fix "loading" state for Todos and Facts pages.

### Facts Page (`facts.html` & `app.js`)
-   [x] Fetch and display the list of facts from `/api/facts`.
-   [x] Visually distinguish between confirmed and unconfirmed facts.
-   [x] Implement the "Confirm" button functionality for unconfirmed facts.
-   [x] Implement the "Delete" button functionality for all facts.
-   [ ] Implement the "Edit" button functionality for all facts.
-   [ ] Add unconfirm button.
-   [ ] Add breadcrumbs on pagesso i can navigate back.
-   [x] Add loading and error state indicators.
-   [x] Separate confirmed and unconfirmed facts into distinct sections on the page.
-   [x] Add pagination numbers (e.g., "Page 1 of X") to the facts lists.

### Test Page (`test.html` & `test.js`)
-   [ ] Restore the Test page (`public/test.html` and `public/test.js`), preserving the original `test.js` as `public/test.original.js` for reference.

## Phase 4: Styling & Refinement

-   [ ] Apply consistent and clean styling to all pages using `style.css`.
-   [ ] Review and refactor the code for clarity and efficiency.
-   [ ] Final testing of all features.

## Phase 5: Future improvements
-   [ ] **Research**: Review the `beemcp` server repository for UI/UX inspiration.
-   [ ] **Research**: Investigate the use of `Gemini.md`.