# Test Cases and User Stories

This document outlines the user stories and test cases for the Bee Web UI application.

## User Stories

-   **As a user, I want to see the connection status to the Bee API on the home page so I know if the application is functional.**
-   **As a user, I want to view my todos, separated by their status (incomplete, complete), so I can easily track my tasks.**
-   **As a user, I want to mark a todo as complete so I can track my progress.**
-   **As a user, I want to edit the text of a todo to correct mistakes or update details.**
-   **As a user, I want to delete a todo to remove irrelevant tasks.**
-   **As a user, I want to view my facts, separated by their status (unconfirmed, confirmed), so I can manage my information.**
-   **As a user, I want to confirm an unconfirmed fact to validate its accuracy.**
-   **As a user, I want to unconfirm a confirmed fact if it's no longer valid.**
-   **As a user, I want to edit the text of a fact to correct or update it.**
-   **As a user, I want to delete a fact to remove outdated information.**
-   **As a user, I want to navigate through long lists of todos and facts using pagination.**
-   **As a user, I want to see a list of suggested todos, separate from my main todo list, so I can discover new tasks.**
-   **As a user, I want to be able to add a suggested todo to my main todo list, so I can act on it.**
-   **As a developer, I want an independent test page to verify direct Bee API calls without using the app's main SDK service.**

## Test Cases

### Home Page

*   **Test Case 1.1: Successful Connection**
    *   **Precondition:** The backend server is running and can connect to the Bee API.
    *   **Action:** Load the home page (`/`).
    *   **Expected Result:** The text "Status: Connected to Bee API" is visible in green.
*   **Test Case 1.2: Failed Connection**
    *   **Precondition:** The backend server is running but cannot connect to the Bee API (e.g., invalid token).
    *   **Action:** Load the home page (`/`).
    *   **Expected Result:** The text "Status: Not connected to Bee API. Check your token." is visible in red.

### Todos Page

*   **Test Case 2.1: View Todos**
    *   **Action:** Navigate to the Todos page.
    *   **Expected Result:** The page displays two sections: "Incomplete Todos" and "Completed Todos", each with a list of the corresponding todos. A loading message appears first.
*   **Test Case 2.2: Complete a Todo**
    *   **Action:** Click the "Complete" button on an incomplete todo.
    *   **Expected Result:** The todo disappears from the "Incomplete" list and reappears in the "Completed" list.
*   **Test Case 2.3: Edit a Todo**
    *   **Action:** Click the "Edit" button on an incomplete todo, change the text in the input field, and click "Save".
    *   **Expected Result:** The todo's text is updated in the "Incomplete" list.
*   **Test Case 2.4: Delete a Todo**
    *   **Action:** Click the "Delete" button on any todo.
    *   **Expected Result:** The todo is permanently removed from the list.
*   **Test Case 2.5: Pagination**
    *   **Action:** Click the "Next" and "Previous" buttons below the todo lists.
    *   **Expected Result:** The list of todos updates to show the next or previous page of results.

### Facts Page

*   **Test Case 3.1: View Facts**
    *   **Action:** Navigate to the Facts page.
    *   **Expected Result:** The page displays two sections: "Confirmed Facts" and "Unconfirmed Facts", each with a list of the corresponding facts.
*   **Test Case 3.2: Confirm a Fact**
    *   **Action:** Click the "Confirm" button on an unconfirmed fact.
    *   **Expected Result:** The fact moves from the "Unconfirmed" list to the "Confirmed" list.
*   **Test Case 3.3: Unconfirm a Fact**
    *   **Action:** Click the "Unconfirm" button on a confirmed fact.
    *   **Expected Result:** The fact moves from the "Confirmed" list to the "Unconfirmed" list.
*   **Test Case 3.4: Edit a Fact**
    *   **Action:** Click the "Edit" button on any fact, change the text, and click "Save".
    *   **Expected Result:** The fact's text is updated in its list.
*   **Test Case 3.5: Delete a Fact**
    *   **Action:** Click the "Delete" button on any fact.
    *   **Expected Result:** The fact is permanently removed from the list.
*   **Test Case 3.6: Pagination**
    *   **Action:** Click the "Next" and "Previous" buttons below the fact lists.
    *   **Expected Result:** The list of facts updates to show the next or previous page of results.

### Suggested Todos Page

*   **Test Case 4.1: View Suggested Todos**
    *   **Precondition:** The application is connected to the Bee API and there are suggested todos available.
    *   **Action:** Navigate to a new "Suggestions" page or a "Suggestions" section on the Todos page.
    *   **Expected Result:** The page displays a list of suggested todos, each with a description and an "Add" button. A loading message appears first.
*   **Test Case 4.2: Add a Suggested Todo**
    *   **Action:** Click the "Add" button on a suggested todo.
    *   **Expected Result:** The suggested todo is removed from the suggestions list and appears in the "Incomplete Todos" list on the Todos page.
*   **Test Case 4.3: No Suggested Todos**
    *   **Precondition:** The application is connected to the Bee API but there are no suggested todos available.
    *   **Action:** Navigate to the "Suggestions" page or section.
    *   **Expected Result:** A message like "No new suggestions at the moment." is displayed.

### Test Page (Independent API)

*   **Test Case 5.1: View Facts**
    *   **Action:** Navigate to the Test page (`/test.html`).
    *   **Expected Result:** The page makes a direct call to the Bee API (via the `/test-api` proxy) and displays "Confirmed Facts" and "Unconfirmed Facts" in their respective sections.
*   **Test Case 5.2: Breadcrumb Navigation**
    *   **Action:** Click the "Home" link in the breadcrumb navigation.
    *   **Expected Result:** The user is navigated back to the home page.