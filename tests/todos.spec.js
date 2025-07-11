// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/todos.html');
  // Wait for the initial content to load for both lists and their pagination
  await page.waitForSelector('#incomplete-todos-list', { timeout: 10000 });
  await page.waitForSelector('#completed-todos-list', { timeout: 10000 });
  await page.waitForSelector('#incomplete-todos-pagination', { timeout: 10000 });
  await page.waitForSelector('#completed-todos-pagination', { timeout: 10000 });

  // Helper to ensure lists are populated or show "no todos" message
  const waitForListReady = async (listId) => {
    // Wait for either a paragraph with "No todos" message OR a list item to be present
    await page.waitForSelector(`${listId} p:textmatches(/No (incomplete|completed) todos found.*|No (incomplete|completed) todos match your search.*)/, ${listId} ul li`, { timeout: 7000 });
  };

  // It's better to wait for lists to be ready AFTER potential deleteAllTodos in test.beforeEach of a suite
  // So, this top-level beforeEach will just navigate.
  // await waitForListReady('#incomplete-todos-list');
  // await waitForListReady('#completed-todos-list');
});

// Helper function to create todos via page.evaluate
async function createTodo(page, text, completed = false) {
  const result = await page.evaluate(async ({ text, completed }) => {
    try {
      const createResponse = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!createResponse.ok) {
        // console.error('Failed to create todo:', createResponse.status, await createResponse.text());
        return null;
      }
      const todo = await createResponse.json();
      if (!todo || !todo.id) {
        // console.error('Create todo did not return a valid todo object with id.');
        return null;
      }

      if (completed) {
        const completeResponse = await fetch(`/api/todos/${todo.id}/complete`, { method: 'PUT' });
        if (!completeResponse.ok) {
            // console.error('Failed to complete todo:', completeResponse.status, await completeResponse.text());
            return { ...todo, completed: false };
        }
        return { ...todo, completed: true };
      }
      return todo;
    } catch (e) {
      // console.error('Error in createTodo page.evaluate:', e.message, e.stack);
      return null;
    }
  }, { text, completed });

  // Instead of fixed timeout, wait for the app to process the change.
  // This might involve waiting for a specific element to appear or a network idle state.
  // For simplicity here, a small wait, but in complex apps, more robust waits are needed.
  await page.waitForLoadState('networkidle', {timeout: 5000}); // Wait for network to be idle
  // await page.waitForTimeout(100); // Keep a very small safety net if networkidle isn't enough
  return result;
}

// Helper function to delete all todos
async function deleteAllTodos(page) {
    await page.evaluate(async () => {
        try {
            const response = await fetch('/api/todos?limit=2000');
            if (!response.ok) {
                //  console.error('Failed to fetch todos for deletion:', response.status, await response.text());
                 return;
            }
            const data = await response.json();
            if (data.todos && data.todos.length > 0) {
                const todoIds = data.todos.map(t => t.id);
                if (todoIds.length > 0) {
                    const deleteResponse = await fetch('/api/todos/bulk-delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ todoIds })
                    });
                     if (!deleteResponse.ok) {
                        // console.error('Failed to bulk delete todos:', deleteResponse.status, await deleteResponse.text());
                    }
                }
            }
        } catch (e) {
            // console.error('Error in deleteAllTodos page.evaluate:', e.message, e.stack);
        }
    });
    await page.reload();
    await page.waitForLoadState('domcontentloaded', {timeout: 10000}); // Wait for page to reload

    // Wait for lists to be ready after deletion and reload
    const waitForListOrMessage = async (listId) => {
         await page.waitForSelector(`${listId} p:textmatches(/No (incomplete|completed) todos found.*)/, ${listId} ul`, { timeout: 7000 });
    };

    try {
        await waitForListOrMessage('#incomplete-todos-list');
        await waitForListOrMessage('#completed-todos-list');
        await page.waitForSelector('#incomplete-todos-pagination', { timeout: 7000 });
        await page.waitForSelector('#completed-todos-pagination', { timeout: 7000 });
    } catch (e) {
        // console.warn("Timeout waiting for elements after deleteAllTodos:", e.message);
        // This can happen if the page is truly empty and app.js has timing issues on empty load.
    }
}


test.describe('Todos Page - Separate Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTodos(page);
  });

  test('should display separate pagination controls for incomplete and completed todos', async ({ page }) => {
    await expect(page.locator('#incomplete-todos-pagination .pagination-container')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination .pagination-container')).toBeVisible();

    await expect(page.locator('#incomplete-todos-pagination button:has-text("Previous")')).toBeVisible();
    await expect(page.locator('#incomplete-todos-pagination button:has-text("Next")')).toBeVisible();
    await expect(page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toBeVisible();

    await expect(page.locator('#completed-todos-pagination button:has-text("Previous")')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination button:has-text("Next")')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toBeVisible();
  });

  test('should paginate incomplete todos independently', async ({ page }) => {
    for (let i = 1; i <= 12; i++) {
      await createTodo(page, `Incomplete Todo ${i}`);
    }
    await page.reload(); // reload to ensure all todos are fetched and rendered by app.js
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(10)');

    const incompleteList = page.locator('#incomplete-todos-list');
    const incompleteNext = page.locator('#incomplete-todos-pagination button:has-text("Next")');
    const incompletePrev = page.locator('#incomplete-todos-pagination button:has-text("Previous")');
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');

    await expect(incompleteList.locator('li')).toHaveCount(10);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Todo 1');
    await expect(incompletePageInfo).toHaveText('Page 1 of 2');

    await incompleteNext.click();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Incomplete Todo 11")');
    await expect(incompleteList.locator('li')).toHaveCount(2);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Todo 11');
    await expect(incompletePageInfo).toHaveText('Page 2 of 2');
    await expect(incompleteNext).toBeDisabled();

    await incompletePrev.click();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Incomplete Todo 1")');
    await expect(incompleteList.locator('li')).toHaveCount(10);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Todo 1');
    await expect(incompletePageInfo).toHaveText('Page 1 of 2');
    await expect(incompletePrev).toBeDisabled();

    await expect(page.locator('#completed-todos-list p:textmatches(/No completed todos found.*)/')).toBeVisible();
  });

  test('should paginate completed todos independently', async ({ page }) => {
    for (let i = 1; i <= 12; i++) {
      await createTodo(page, `Completed Todo ${i}`, true);
    }
    await page.reload();
    await page.waitForSelector('#completed-todos-list ul li:nth-child(10)');

    const completedList = page.locator('#completed-todos-list');
    const completedNext = page.locator('#completed-todos-pagination button:has-text("Next")');
    const completedPrev = page.locator('#completed-todos-pagination button:has-text("Previous")');
    const completedPageInfo = page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');

    await expect(completedList.locator('li')).toHaveCount(10);
    await expect(completedList.locator('li').first()).toContainText('Completed Todo 1');
    await expect(completedPageInfo).toHaveText('Page 1 of 2');

    await completedNext.click();
    await page.waitForSelector('#completed-todos-list ul li:has-text("Completed Todo 11")');
    await expect(completedList.locator('li')).toHaveCount(2);
    await expect(completedList.locator('li').first()).toContainText('Completed Todo 11');
    await expect(completedPageInfo).toHaveText('Page 2 of 2');
    await expect(completedNext).toBeDisabled();

    await completedPrev.click();
    await page.waitForSelector('#completed-todos-list ul li:has-text("Completed Todo 1")');
    await expect(completedList.locator('li')).toHaveCount(10);
    await expect(completedList.locator('li').first()).toContainText('Completed Todo 1');
    await expect(completedPageInfo).toHaveText('Page 1 of 2');
    await expect(completedPrev).toBeDisabled();

    await expect(page.locator('#incomplete-todos-list p:textmatches(/No incomplete todos found.*)/')).toBeVisible();
  });

  test('search should reset pagination for both lists and filter correctly', async ({ page }) => {
    for (let i = 1; i <= 12; i++) {
      await createTodo(page, `Incomplete Search Test ${i}`);
      await createTodo(page, `Completed Search Test ${i}`, true);
    }
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(10)');
    await page.waitForSelector('#completed-todos-list ul li:nth-child(10)');

    const searchInput = page.locator('#todo-search');
    const incompleteList = page.locator('#incomplete-todos-list');
    const completedList = page.locator('#completed-todos-list');
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');
    const completedPageInfo = page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');

    await page.locator('#incomplete-todos-pagination button:has-text("Next")').click();
    await page.locator('#completed-todos-pagination button:has-text("Next")').click();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Incomplete Search Test 11")');
    await page.waitForSelector('#completed-todos-list ul li:has-text("Completed Search Test 11")');

    await expect(incompletePageInfo).toHaveText('Page 2 of 2');
    await expect(completedPageInfo).toHaveText('Page 2 of 2');

    await searchInput.fill('Test 1'); // This will match items containing "Test 1", "Test 10", "Test 11", "Test 12"
    await page.waitForTimeout(500); // Wait for debounce

    await expect(incompletePageInfo).toHaveText('Page 1 of 1'); // 4 items fit on one page
    await expect(completedPageInfo).toHaveText('Page 1 of 1'); // 4 items fit on one page

    await expect(incompleteList.locator('li')).toHaveCount(4);
    await expect(incompleteList.locator('li:has-text("Incomplete Search Test 1")')).toBeVisible();
    await expect(incompleteList.locator('li:has-text("Incomplete Search Test 2")')).not.toBeVisible();

    await expect(completedList.locator('li')).toHaveCount(4);
    await expect(completedList.locator('li:has-text("Completed Search Test 1")')).toBeVisible();
    await expect(completedList.locator('li:has-text("Completed Search Test 2")')).not.toBeVisible();

    await searchInput.fill('');
    await page.waitForTimeout(500);

    await expect(incompletePageInfo).toHaveText('Page 1 of 2');
    await expect(completedPageInfo).toHaveText('Page 1 of 2');
    await expect(incompleteList.locator('li')).toHaveCount(10);
    await expect(completedList.locator('li')).toHaveCount(10);
  });

  test('pagination with empty or single-page lists', async ({ page }) => {
    const incompleteNext = page.locator('#incomplete-todos-pagination button:has-text("Next")');
    const incompletePrev = page.locator('#incomplete-todos-pagination button:has-text("Previous")');
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');
    const completedNext = page.locator('#completed-todos-pagination button:has-text("Next")');
    const completedPrev = page.locator('#completed-todos-pagination button:has-text("Previous")');
    const completedPageInfo = page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');

    // Wait for initial load to ensure "No todos" messages are potentially visible
    await page.waitForTimeout(500);


    await expect(page.locator('#incomplete-todos-list p:textmatches(/No incomplete todos found.*)/')).toBeVisible();
    await expect(incompletePageInfo).toHaveText('Page 1 of 1');
    await expect(incompleteNext).toBeDisabled();
    await expect(incompletePrev).toBeDisabled();

    await expect(page.locator('#completed-todos-list p:textmatches(/No completed todos found.*)/')).toBeVisible();
    await expect(completedPageInfo).toHaveText('Page 1 of 1');
    await expect(completedNext).toBeDisabled();
    await expect(completedPrev).toBeDisabled();

    for (let i = 1; i <= 5; i++) {
      await createTodo(page, `Incomplete Single ${i}`);
    }
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(5)');

    await expect(page.locator('#incomplete-todos-list li')).toHaveCount(5);
    await expect(incompletePageInfo).toHaveText('Page 1 of 1');
    await expect(incompleteNext).toBeDisabled();
    await expect(incompletePrev).toBeDisabled();

    await expect(page.locator('#completed-todos-list p:textmatches(/No completed todos found.*)/')).toBeVisible();
    await expect(completedPageInfo).toHaveText('Page 1 of 1');

    for (let i = 1; i <= 3; i++) {
      await createTodo(page, `Completed Single ${i}`, true);
    }
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(5)');
    await page.waitForSelector('#completed-todos-list ul li:nth-child(3)');

    await expect(page.locator('#incomplete-todos-list li')).toHaveCount(5);
    await expect(incompletePageInfo).toHaveText('Page 1 of 1');

    await expect(page.locator('#completed-todos-list li')).toHaveCount(3);
    await expect(completedPageInfo).toHaveText('Page 1 of 1');
    await expect(completedNext).toBeDisabled();
    await expect(completedPrev).toBeDisabled();
  });

  test('bulk actions (e.g., delete) work correctly with paginated lists', async ({ page }) => {
    for (let i = 1; i <= 12; i++) {
      await createTodo(page, `Incomplete Bulk ${i}`);
    }
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(10)');

    const incompleteList = page.locator('#incomplete-todos-list');
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');
    const selectAllIncomplete = page.locator('#select-all-incomplete-todos');
    const bulkDeleteIncomplete = page.locator('#bulk-delete-incomplete-todos');

    await selectAllIncomplete.check();
    await expect(incompleteList.locator('li input[type="checkbox"]').first()).toBeChecked();

    page.on('dialog', dialog => dialog.accept());
    await bulkDeleteIncomplete.click();

    // Wait for the list to update, specifically for the first item of page 1 to be gone
    await page.waitForFunction(() =>
        !document.querySelector('#incomplete-todos-list ul li:has-text("Incomplete Bulk 1")') &&
        document.querySelector('#incomplete-todos-list ul li') // and some items are still present or the "no items" message
    );

    await expect(incompletePageInfo).toHaveText('Page 1 of 1'); // 12 - 10 = 2 items left
    await expect(incompleteList.locator('li')).toHaveCount(2);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Bulk 11');
  });
});


test.describe('Original Todos Page Functionality (Adapted)', () => {
   test.beforeEach(async ({ page }) => {
    await deleteAllTodos(page);
  });

  test('should display incomplete and completed todo sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Incomplete Todos', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Completed Todos', level: 2 })).toBeVisible();
  });

  test('should complete a todo', async ({ page }) => {
    await createTodo(page, 'Test Todo to Complete');
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Test Todo to Complete")');

    const incompleteTodo = page.locator('#incomplete-todos-list li', { hasText: 'Test Todo to Complete' });
    await expect(incompleteTodo).toBeVisible();

    await incompleteTodo.locator('button.confirm-btn').click();

    await page.waitForSelector('#completed-todos-list li:has-text("Test Todo to Complete")');
    await expect(incompleteTodo).not.toBeVisible();
    const completedTodo = page.locator('#completed-todos-list li', { hasText: 'Test Todo to Complete' });
    await expect(completedTodo).toBeVisible();
  });

  test('should edit a todo', async ({ page }) => {
    await createTodo(page, 'Original Todo Text');
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Original Todo Text")');

    const todoItem = page.locator('#incomplete-todos-list li', { hasText: 'Original Todo Text' });
    await expect(todoItem).toBeVisible();

    await todoItem.locator('button.edit-btn').click();
    const editInput = todoItem.locator('input[type="text"]');
    await expect(editInput).toBeVisible();
    await editInput.fill('Updated Todo Text');
    await todoItem.locator('button:has([class*="fa-save"])').click();

    await page.waitForSelector('#incomplete-todos-list li:has-text("Updated Todo Text")');
    const updatedTodoItem = page.locator('#incomplete-todos-list li', { hasText: 'Updated Todo Text' });
    await expect(updatedTodoItem).toBeVisible();
    const oldTodoItem = page.locator('#incomplete-todos-list li', { hasText: 'Original Todo Text' });
    await expect(oldTodoItem).not.toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    await createTodo(page, 'Todo to Delete');
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Todo to Delete")');

    const todoItem = page.locator('#incomplete-todos-list li', { hasText: 'Todo to Delete' });
    await expect(todoItem).toBeVisible();

    page.on('dialog', dialog => dialog.accept());
    await todoItem.locator('button.delete-btn').click();

    await page.waitForFunction((text) => !document.querySelector(`#incomplete-todos-list li:has-text("${text}")`), 'Todo to Delete');
    await expect(todoItem).not.toBeVisible();
  });
});
