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
-   **As a user, I want to view my conversations in an expandable accordion format, with full content displayed upon expansion.**
-   **As a user, I want to search and filter my conversations to find specific discussions.**
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
*   **Test Case 2.6: Search Todos**
    *   **Action:** Enter a search term into the search bar on the Todos page.
    *   **Expected Result:** The displayed todos are filtered to only show those matching the search term.
*   **Test Case 2.7: Bulk Delete Incomplete Todos**
    *   **Action:** Select multiple incomplete todos using checkboxes and click the "Bulk Delete" button.
    *   **Expected Result:** The selected incomplete todos are removed from the list.
*   **Test Case 2.8: Bulk Complete Incomplete Todos**
    *   **Action:** Select multiple incomplete todos using checkboxes and click the "Bulk Complete" button.
    *   **Expected Result:** The selected incomplete todos are moved to the "Completed Todos" list.
*   **Test Case 2.9: Bulk Delete Completed Todos**
    *   **Action:** Select multiple completed todos using checkboxes and click the "Bulk Delete" button.
    *   **Expected Result:** The selected completed todos are removed from the list.

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
*   **Test Case 3.7: Search Facts**
    *   **Action:** Enter a search term into the search bar on the Facts page.
    *   **Expected Result:** The displayed facts are filtered to only show those matching the search term.
*   **Test Case 3.8: Bulk Delete Confirmed Facts**
    *   **Action:** Select multiple confirmed facts using checkboxes and click the "Bulk Delete" button.
    *   **Expected Result:** The selected confirmed facts are removed from the list.
*   **Test Case 3.9: Bulk Unconfirm Confirmed Facts**
    *   **Action:** Select multiple confirmed facts using checkboxes and click the "Bulk Unconfirm" button.
    *   **Expected Result:** The selected confirmed facts are moved to the "Unconfirmed Facts" list.
*   **Test Case 3.10: Bulk Delete Unconfirmed Facts**
    *   **Action:** Select multiple unconfirmed facts using checkboxes and click the "Bulk Delete" button.
    *   **Expected Result:** The selected unconfirmed facts are removed from the list.
*   **Test Case 3.11: Bulk Confirm Unconfirmed Facts**
    *   **Action:** Select multiple unconfirmed facts using checkboxes and click the "Bulk Confirm" button.
    *   **Expected Result:** The selected unconfirmed facts are moved to the "Confirmed Facts" list.

### Conversations Page

*   **Test Case 4.1: View Conversations**
    *   **Action:** Navigate to the Conversations page.
    *   **Expected Result:** The page displays a list of conversation items, each showing a short summary, state, and time information.
*   **Test Case 4.2: Expand and Collapse Conversation**
    *   **Action:** Click on a conversation item's header.
    *   **Expected Result:** The accordion panel expands to reveal the full conversation content, rendered with markdown. Clicking the header again collapses the panel.
*   **Test Case 4.3: Pagination**
    *   **Action:** Click the "Next" and "Previous" buttons below the conversation list.
    *   **Expected Result:** The list of conversations updates to show the next or previous page of results.
*   **Test Case 4.4: Search Conversations**
    *   **Action:** Enter a search term into the search bar on the Conversations page.
    *   **Expected Result:** The displayed conversations are filtered to only show those matching the search term.
*   **Test Case 4.5: No Pointer Cursor on Panel Content**
    *   **Action:** Hover over the expanded content within a conversation accordion panel.
    *   **Expected Result:** The cursor remains the default pointer (not a clicker/hand pointer).

### Suggested Todos Page

*   **Test Case 5.1: View Suggested Todos**
    *   **Precondition:** The application is connected to the Bee API and there are suggested todos available.
    *   **Action:** Navigate to a new "Suggestions" page or a "Suggestions" section on the Todos page.
    *   **Expected Result:** The page displays a list of suggested todos, each with a description and an "Add" button. A loading message appears first.
*   **Test Case 5.2: Add a Suggested Todo**
    *   **Action:** Click the "Add" button on a suggested todo.
    *   **Expected Result:** The suggested todo is removed from the suggestions list and appears in the "Incomplete Todos" list on the Todos page.
*   **Test Case 5.3: No Suggested Todos**
    *   **Precondition:** The application is connected to the Bee API but there are no suggested todos available.
    *   **Action:** Navigate to the "Suggestions" page or section.
    *   **Expected Result:** A message like "No new suggestions at the moment." is displayed.

### Test Page (Independent API)

*   **Test Case 6.1: View Facts**
    *   **Action:** Navigate to the Test page (`/test.html`).
    *   **Expected Result:** The page makes a direct call to the Bee API (via the `/test-api` proxy) and displays "Confirmed Facts" and "Unconfirmed Facts" in their respective sections.
*   **Test Case 6.2: Breadcrumb Navigation**
    *   **Action:** Click the "Home" link in the breadcrumb navigation.
    *   **Expected Result:** The user is navigated back to the home page.
