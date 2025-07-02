# Project Tasks

This document outlines the development tasks for the Bee Web UI project.

## Phase 1: Setup & Foundation

-   [x] Initialize Git repository and connect to GitHub.
-   [x] Create `TASKS.md` to track progress.
-   [x] Move existing test functionality from `index.html` to a new `test.html` page.
-   [x] Create the new placeholder HTML files (`index.html`, `todos.html`, `facts.html`) in the `public/` directory.
-   [ ] Install the `beeai` SDK.
-   [ ] Create the basic Express server in `index.js`.
-   [ ] Create the initial `beeService.js` to use the `beeai` SDK.
-   [ ] Create the `.env` file and add the `BEE_API_TOKEN`.
-   [ ] **Research**: Review the `beemcp` server repository for UI/UX inspiration.

## Phase 2: Backend Development

-   [ ] Implement `GET /`, `GET /todos`, and `GET /facts` routes in `index.js` to serve the HTML pages.
-   [ ] Implement the `GET /api/auth/status` endpoint using the `beeai` SDK.
-   [ ] Implement the `GET /api/todos` endpoint using the `beeai` SDK.
-   [ ] Implement the `PUT /api/todos/:id/complete` endpoint using the `beeai` SDK.
-   [ ] Implement the `DELETE /api/todos/:id` endpoint using the `beeai` SDK.
-   [ ] Implement the `GET /api/facts` endpoint using the `beeai` SDK.
-   [ ] Implement the `DELETE /api/facts/:id` endpoint using the `beeai` SDK.

## Phase 3: Frontend Development

### Home Page (`index.html`)
-   [x] Add navigation links to the Todos, Facts, and Test pages.
-   [ ] Call the `/api/auth/status` endpoint and display the connection status.

### Todos Page (`todos.html` & `app.js`)
-   [ ] Fetch and display the list of todos from `/api/todos`.
-   [ ] Implement the "Complete" button functionality.
-   [ ] Implement the "Delete" button functionality.
-   [ ] Add loading and error state indicators.

### Facts Page (`facts.html` & `app.js`)
-   [ ] Fetch and display the list of facts from `/api/facts`.
-   [ ] Implement the "Delete" button functionality.
-   [ ] Add loading and error state indicators.

## Phase 4: Styling & Refinement

-   [ ] Apply consistent and clean styling to all pages using `style.css`.
-   [ ] Review and refactor the code for clarity and efficiency.
-   [ ] Final testing of all features.
