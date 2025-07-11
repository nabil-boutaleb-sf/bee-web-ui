// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/todos.html');
  // Wait for the initial content to load for both lists and their pagination
  await page.waitForSelector('#incomplete-todos-list');
  await page.waitForSelector('#completed-todos-list');
  await page.waitForSelector('#incomplete-todos-pagination');
  await page.waitForSelector('#completed-todos-pagination');

  // Helper to ensure lists are populated or show "no todos" message
  const waitForListReady = async (listId) => {
    await Promise.race([
      page.waitForSelector(`${listId} p:has-text("No .* todos found.")`),
      page.waitForSelector(`${listId} p:has-text("No .* todos match your search.")`),
      page.waitForSelector(`${listId} ul li`),
    ]);
  };

  await waitForListReady('#incomplete-todos-list');
  await waitForListReady('#completed-todos-list');
});

// Helper function to create todos via page.evaluate
async function createTodo(page, text, completed = false) {
  return await page.evaluate(async ({ text, completed }) => {
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }) // Assuming your API creates todos as incomplete by default
    });
    const todo = await response.json();
    if (completed && todo && todo.id) {
      await fetch(`/api/todos/${todo.id}/complete`, { method: 'PUT' });
      return { ...todo, completed: true };
    }
    return todo;
  }, { text, completed });
}

// Helper function to delete all todos
async function deleteAllTodos(page) {
    await page.evaluate(async () => {
        const response = await fetch('/api/todos?limit=2000'); // Fetch all todos
        const data = await response.json();
        const todoIds = data.todos.map(t => t.id);
        if (todoIds.length > 0) {
            await fetch('/api/todos/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todoIds })
            });
        }
    });
    await page.reload(); // Reload to reflect changes
     // Wait for lists to be ready after deletion and reload
    await page.waitForSelector('#incomplete-todos-list');
    await page.waitForSelector('#completed-todos-list');
    await page.waitForSelector('#incomplete-todos-pagination');
    await page.waitForSelector('#completed-todos-pagination');
     const waitForListReady = async (listId) => {
        await Promise.race([
            page.waitForSelector(`${listId} p:has-text("No .* todos found.")`),
            page.waitForSelector(`${listId} ul li`, { state: 'detached' }), // for case where all items are deleted
        ]);
    };
    await waitForListReady('#incomplete-todos-list');
    await waitForListReady('#completed-todos-list');
}


test.describe('Todos Page - Separate Pagination', () => {
  // Clean up todos before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await deleteAllTodos(page);
  });

  test('should display separate pagination controls for incomplete and completed todos', async ({ page }) => {
    await expect(page.locator('#incomplete-todos-pagination .pagination-container')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination .pagination-container')).toBeVisible();

    await expect(page.locator('#incomplete-todos-pagination button:has-text("Previous")')).toBeVisible();
    await expect(page.locator('#incomplete-todos-pagination button:has-text("Next")')).toBeVisible();
    await expect(page.locator('#incomplete-todos-pagination span[class*="page-info"], #incomplete-todos-pagination span[class*="Page"]')).toBeVisible(); // More flexible selector for page info

    await expect(page.locator('#completed-todos-pagination button:has-text("Previous")')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination button:has-text("Next")')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination span[class*="page-info"], #completed-todos-pagination span[class*="Page"]')).toBeVisible();
  });

  test('should paginate incomplete todos independently', async ({ page }) => {
    // Create 12 incomplete todos
    for (let i = 1; i <= 12; i++) {
      await createTodo(page, `Incomplete Todo ${i}`);
    }
    await page.reload(); // Reload to fetch all new todos
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(10)'); // Wait for 10th item

    const incompleteList = page.locator('#incomplete-todos-list');
    const incompleteNext = page.locator('#incomplete-todos-pagination button:has-text("Next")');
    const incompletePrev = page.locator('#incomplete-todos-pagination button:has-text("Previous")');
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span[class*="Page"]');

    await expect(incompleteList.locator('li')).toHaveCount(10);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Todo 1');
    await expect(incompletePageInfo).toHaveText('Page 1 of 2');

    await incompleteNext.click();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Incomplete Todo 11")'); // Wait for new items
    await expect(incompleteList.locator('li')).toHaveCount(2);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Todo 11');
    await expect(incompletePageInfo).toHaveText('Page 2 of 2');
    await expect(incompleteNext).toBeDisabled();

    await incompletePrev.click();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Incomplete Todo 1")'); // Wait for new items
    await expect(incompleteList.locator('li')).toHaveCount(10);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Todo 1');
    await expect(incompletePageInfo).toHaveText('Page 1 of 2');
    await expect(incompletePrev).toBeDisabled();

    // Ensure completed list is not affected
    await expect(page.locator('#completed-todos-list p:has-text("No completed todos found.")')).toBeVisible();
  });

  test('should paginate completed todos independently', async ({ page }) => {
    // Create 12 completed todos
    for (let i = 1; i <= 12; i++) {
      await createTodo(page, `Completed Todo ${i}`, true);
    }
    await page.reload();
    await page.waitForSelector('#completed-todos-list ul li:nth-child(10)');


    const completedList = page.locator('#completed-todos-list');
    const completedNext = page.locator('#completed-todos-pagination button:has-text("Next")');
    const completedPrev = page.locator('#completed-todos-pagination button:has-text("Previous")');
    const completedPageInfo = page.locator('#completed-todos-pagination span[class*="Page"]');

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

    // Ensure incomplete list is not affected
    await expect(page.locator('#incomplete-todos-list p:has-text("No incomplete todos found.")')).toBeVisible();
  });

  test('search should reset pagination for both lists and filter correctly', async ({ page }) => {
    // Create 12 incomplete and 12 completed todos
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
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span[class*="Page"]');
    const completedPageInfo = page.locator('#completed-todos-pagination span[class*="Page"]');

    // Go to page 2 for both
    await page.locator('#incomplete-todos-pagination button:has-text("Next")').click();
    await page.locator('#completed-todos-pagination button:has-text("Next")').click();
    await page.waitForSelector('#incomplete-todos-list ul li:has-text("Incomplete Search Test 11")');
    await page.waitForSelector('#completed-todos-list ul li:has-text("Completed Search Test 11")');


    await expect(incompletePageInfo).toHaveText('Page 2 of 2');
    await expect(completedPageInfo).toHaveText('Page 2 of 2');

    // Perform a search that matches one item in each list
    await searchInput.fill('Test 1'); // Should match "Incomplete Search Test 1" and "Completed Search Test 1" (and 10, 11, 12)
    await page.waitForTimeout(500); // Wait for debounce and UI update

    // Check if pagination is reset to page 1 for both
    await expect(incompletePageInfo).toHaveText('Page 1 of 1'); // Assuming search 'Test 1' yields less than 10 items
    await expect(completedPageInfo).toHaveText('Page 1 of 1');

    await expect(incompleteList.locator('li')).toHaveCount(4); // Test 1, 10, 11, 12
    await expect(incompleteList.locator('li:has-text("Incomplete Search Test 1")')).toBeVisible();
    await expect(incompleteList.locator('li:has-text("Incomplete Search Test 2")')).not.toBeVisible();


    await expect(completedList.locator('li')).toHaveCount(4);
    await expect(completedList.locator('li:has-text("Completed Search Test 1")')).toBeVisible();
    await expect(completedList.locator('li:has-text("Completed Search Test 2")')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // Pagination should remain page 1, but total pages should update
    await expect(incompletePageInfo).toHaveText('Page 1 of 2');
    await expect(completedPageInfo).toHaveText('Page 1 of 2');
    await expect(incompleteList.locator('li')).toHaveCount(10);
    await expect(completedList.locator('li')).toHaveCount(10);
  });

  test('pagination with empty or single-page lists', async ({ page }) => {
    const incompleteNext = page.locator('#incomplete-todos-pagination button:has-text("Next")');
    const incompletePrev = page.locator('#incomplete-todos-pagination button:has-text("Previous")');
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span[class*="Page"]');
    const completedNext = page.locator('#completed-todos-pagination button:has-text("Next")');
    const completedPrev = page.locator('#completed-todos-pagination button:has-text("Previous")');
    const completedPageInfo = page.locator('#completed-todos-pagination span[class*="Page"]');

    // 1. Both lists empty
    await expect(page.locator('#incomplete-todos-list p:has-text("No incomplete todos found.")')).toBeVisible();
    await expect(incompletePageInfo).toHaveText('Page 1 of 1');
    await expect(incompleteNext).toBeDisabled();
    await expect(incompletePrev).toBeDisabled();

    await expect(page.locator('#completed-todos-list p:has-text("No completed todos found.")')).toBeVisible();
    await expect(completedPageInfo).toHaveText('Page 1 of 1');
    await expect(completedNext).toBeDisabled();
    await expect(completedPrev).toBeDisabled();

    // 2. Incomplete list has 5 items (single page), completed is empty
    for (let i = 1; i <= 5; i++) {
      await createTodo(page, `Incomplete Single ${i}`);
    }
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(5)');

    await expect(page.locator('#incomplete-todos-list li')).toHaveCount(5);
    await expect(incompletePageInfo).toHaveText('Page 1 of 1');
    await expect(incompleteNext).toBeDisabled();
    await expect(incompletePrev).toBeDisabled();

    await expect(page.locator('#completed-todos-list p:has-text("No completed todos found.")')).toBeVisible();
    await expect(completedPageInfo).toHaveText('Page 1 of 1');

    // 3. Completed list has 3 items (single page), incomplete has 5
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
    // Create 12 incomplete todos
    for (let i = 1; i <= 12; i++) {
      await createTodo(page, `Incomplete Bulk ${i}`);
    }
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li:nth-child(10)');

    const incompleteList = page.locator('#incomplete-todos-list');
    const incompletePageInfo = page.locator('#incomplete-todos-pagination span[class*="Page"]');
    const selectAllIncomplete = page.locator('#select-all-incomplete-todos');
    const bulkDeleteIncomplete = page.locator('#bulk-delete-incomplete-todos');

    // Select all on page 1
    await selectAllIncomplete.check();
    incompleteList.locator('li input[type="checkbox"]').first().waitFor({ state: 'checked' }); // ensure it's checked

    // Intercept and accept the confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await bulkDeleteIncomplete.click();

    // Wait for items to be deleted and list to re-render
    await page.waitForFunction(() => !document.querySelector('#incomplete-todos-list ul li:has-text("Incomplete Bulk 1")'));

    // Should now be on page 1 of 1, with 2 items
    await expect(incompletePageInfo).toHaveText('Page 1 of 1');
    await expect(incompleteList.locator('li')).toHaveCount(2);
    await expect(incompleteList.locator('li').first()).toContainText('Incomplete Bulk 11'); // The remaining items
  });

});

// Keep existing tests, but remove .skip from the describe block
test.describe('Original Todos Page Functionality', () => {
   test.beforeEach(async ({ page }) => {
    await deleteAllTodos(page);
  });
  // ... (original tests for complete, edit, delete, filter if they are still relevant and adapted)
  // For example, the original filter tests might need adjustment if they assumed single pagination

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

    // The button to complete is now just an icon button, we need a more robust selector
    await incompleteTodo.locator('button.confirm-btn').click(); // Assuming 'confirm-btn' class

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

    await todoItem.locator('button.edit-btn').click(); // Assuming 'edit-btn' class
    const editInput = todoItem.locator('input[type="text"]');
    await expect(editInput).toBeVisible();
    await editInput.fill('Updated Todo Text');
    await todoItem.locator('button:has([class*="fa-save"])').click(); // Save button by icon

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

    page.on('dialog', dialog => dialog.accept()); // Accept confirmation
    await todoItem.locator('button.delete-btn').click(); // Assuming 'delete-btn' class

    await page.waitForFunction((text) => !document.querySelector(`#incomplete-todos-list li:has-text("${text}")`), 'Todo to Delete');
    await expect(todoItem).not.toBeVisible();
  });

});
