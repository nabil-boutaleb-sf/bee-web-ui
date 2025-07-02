# Test Cases, User Cases, and User Stories for Bee Web UI

## User Stories

*   **As a user, I want to see the connection status to the Bee API on the home page so I know if the application is functional.**
    *   **Acceptance Criteria:**
        *   When I load the home page, I see "status: connected to bee api" if the connection is successful.
        *   When I load the home page, I see an error message if the connection fails.
*   **As a user, I want to view my list of todos so I can keep track of my tasks.**
    *   **Acceptance Criteria:**
        *   When I navigate to the Todos page, I see a list of my todos.
        *   While the todos are loading, I see a "loading" indicator.
        *   If there's an error fetching todos, I see an error message.
*   **As a user, I want to mark a todo as complete so I can track my progress.**
    *   **Acceptance Criteria:**
        *   On the Todos page, each todo has a "Complete" button.
        *   When I click "Complete" on a todo, it is marked as complete (e.g., visually struck through or moved to a "completed" section).
        *   The change is persisted.
*   **As a user, I want to delete a todo so I can remove irrelevant tasks.**
    *   **Acceptance Criteria:**
        *   On the Todos page, each todo has a "Delete" button.
        *   When I click "Delete" on a todo, it is removed from the list.
        *   The change is persisted.
*   **As a user, I want to view my list of facts so I can access important information.**
    *   **Acceptance Criteria:**
        *   When I navigate to the Facts page, I see a list of my facts.
        *   While the facts are loading, I see a "loading" indicator.
        *   If there's an error fetching facts, I see an error message.
*   **As a user, I want to delete a fact so I can remove outdated information.**
    *   **Acceptance Criteria:**
        *   On the Facts page, each fact has a "Delete" button.
        *   When I click "Delete" on a fact, it is removed from the list.
        *   The change is persisted.
*   **As a developer, I want a working test page so I can verify core functionalities independently.**
    *   **Acceptance Criteria:**
        *   When I navigate to the Test page, I see the expected test interface.
        *   The tests can be run and provide clear results.

## Test Cases

### Connection Status Validation

*   **Test Case 1.1: Successful Connection Display**
    *   **Precondition:** Bee API is accessible and returns a successful status.
    *   **Action:** Load `index.html`.
    *   **Expected Result:** The text "status: connected to bee api" is visible on the page.
*   **Test Case 1.2: Failed Connection Display**
    *   **Precondition:** Bee API is inaccessible or returns an error status.
    *   **Action:** Load `index.html`.
    *   **Expected Result:** An appropriate error message (e.g., "status: connection failed") is displayed instead of the success message.

### Todos Page Functionality

*   **Test Case 2.1: Todos Loading State**
    *   **Precondition:** Todos API endpoint is slow to respond.
    *   **Action:** Navigate to `todos.html`.
    *   **Expected Result:** A "loading" indicator is displayed before the todos list appears.
*   **Test Case 2.2: Todos Display**
    *   **Precondition:** Todos API endpoint returns a list of todos.
    *   **Action:** Navigate to `todos.html`.
    *   **Expected Result:** All todos returned by the API are displayed correctly on the page.
*   **Test Case 2.3: Mark Todo as Complete**
    *   **Precondition:** A todo exists on the Todos page.
    *   **Action:** Click the "Complete" button for a specific todo.
    *   **Expected Result:** The todo's visual state changes (e.g., strikethrough), and a successful API call to mark as complete is made.
*   **Test Case 2.4: Delete Todo**
    *   **Precondition:** A todo exists on the Todos page.
    *   **Action:** Click the "Delete" button for a specific todo.
    *   **Expected Result:** The todo is removed from the displayed list, and a successful API call to delete the todo is made.

### Facts Page Functionality

*   **Test Case 3.1: Facts Loading State**
    *   **Precondition:** Facts API endpoint is slow to respond.
    *   **Action:** Navigate to `facts.html`.
    *   **Expected Result:** A "loading" indicator is displayed before the facts list appears.
*   **Test Case 3.2: Facts Display**
    *   **Precondition:** Facts API endpoint returns a list of facts.
    *   **Action:** Navigate to `facts.html`.
    *   **Expected Result:** All facts returned by the API are displayed correctly on the page.
*   **Test Case 3.3: Delete Fact**
    *   **Precondition:** A fact exists on the Facts page.
    *   **Action:** Click the "Delete" button for a specific fact.
    *   **Expected Result:** The fact is removed from the displayed list, and a successful API call to delete the fact is made.

### Test Page Restoration

*   **Test Case 4.1: Test Page Accessibility**
    *   **Precondition:** `test.html` and `test.js` are restored.
    *   **Action:** Navigate to `test.html`.
    *   **Expected Result:** The test page loads without errors and its UI elements are functional.
*   **Test Case 4.2: Original Test.js Preservation**
    *   **Precondition:** `test.js` is modified for the new setup.
    *   **Action:** Verify the existence of `public/test.original.js`.
    *   **Expected Result:** `public/test.original.js` exists and contains the original content of `test.js` before modifications related to the SDK integration.

## User Cases

### User Case 1: Checking API Connection

1.  User opens the application in their web browser.
2.  The `index.html` page loads.
3.  The application makes a request to `/api/auth/status`.
4.  If the API returns a success, "status: connected to bee api" is displayed.
5.  If the API returns an error, an error message is displayed.

### User Case 2: Managing Todos

1.  User navigates to the Todos page (`todos.html`).
2.  The application fetches todos from `/api/todos`.
3.  While fetching, a loading indicator is shown.
4.  Upon successful retrieval, the todos are displayed.
5.  User clicks "Complete" on a todo.
6.  The application sends a `PUT` request to `/api/todos/:id/complete`.
7.  The todo's status is updated visually.
8.  User clicks "Delete" on a todo.
9.  The application sends a `DELETE` request to `/api/todos/:id`.
10. The todo is removed from the display.

### User Case 3: Managing Facts

1.  User navigates to the Facts page (`facts.html`).
2.  The application fetches facts from `/api/facts`.
3.  While fetching, a loading indicator is shown.
4.  Upon successful retrieval, the facts are displayed.
5.  User clicks "Delete" on a fact.
6.  The application sends a `DELETE` request to `/api/facts/:id`.
7.  The fact is removed from the display.

### User Case 4: Using the Test Page

1.  Developer navigates to the Test page (`test.html`).
2.  The page loads, displaying test controls and results area.
3.  Developer initiates tests.
4.  Test results are displayed on the page.
5.  The original `test.js` functionality is available for reference in `public/test.original.js`.