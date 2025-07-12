// @ts-check
const { test, expect } = require('@playwright/test');

// Helper to wait for the list to be ready (either items or "no items" message)
async function waitForListContent(page, listId) {
  await page.waitForSelector(`${listId} >> css=ul li >> nth=0, ${listId} >> css=p:textmatches(/No .* todos found.*|No .* todos match your search.*)/`, { timeout: 10000 });
}

test.beforeEach(async ({ page }) => {
  await page.goto('/todos.html');
  // Wait for initial structure
  await page.waitForSelector('#incomplete-todos-list', { timeout: 10000 });
  await page.waitForSelector('#completed-todos-list', { timeout: 10000 });
  await page.waitForSelector('#incomplete-todos-pagination', { timeout: 10000 });
  await page.waitForSelector('#completed-todos-pagination', { timeout: 10000 });

  // Wait for initial data load (both lists will attempt to fetch)
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false') && resp.status() === 200),
    page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true') && resp.status() === 200),
  ]);
  await waitForListContent(page, '#incomplete-todos-list');
  await waitForListContent(page, '#completed-todos-list');
});

async function createTodoViaAPI(page, text, completed = false) {
  const todo = await page.evaluate(async ({ text }) => {
    const response = await fetch('/api/todos', { // This is the old create endpoint, assuming it still works for creation
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return response.json();
  }, { text });

  if (completed && todo && todo.id) {
    await page.evaluate(async ({ todoId }) => {
      await fetch(`/api/todos/${todoId}/complete`, { method: 'PUT' });
    }, { todoId: todo.id });
    return { ...todo, completed: true };
  }
  return todo;
}

async function deleteAllTodosViaAPI(page) {
  await page.evaluate(async () => {
    const response = await fetch('/api/todos?completed=false&limit=1000'); // Get all incomplete
    const dataIncomplete = await response.json();
    const todoIdsIncomplete = dataIncomplete.todos.map(t => t.id);

    const responseCompleted = await fetch('/api/todos?completed=true&limit=1000'); // Get all completed
    const dataCompleted = await responseCompleted.json();
    const todoIdsCompleted = dataCompleted.todos.map(t => t.id);

    const todoIds = [...todoIdsIncomplete, ...todoIdsCompleted];

    if (todoIds.length > 0) {
      await fetch('/api/todos/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todoIds })
      });
    }
  });
  // After deleting, reload and wait for lists to settle (fetch initial empty pages)
  await page.reload();
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false') && resp.status() === 200),
    page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true') && resp.status() === 200),
  ]);
  await waitForListContent(page, '#incomplete-todos-list');
  await waitForListContent(page, '#completed-todos-list');
}

test.describe('Todos Page - Server-Side Separate Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await deleteAllTodosViaAPI(page);
  });

  test('should display separate pagination controls', async ({ page }) => {
    await expect(page.locator('#incomplete-todos-pagination .pagination-container')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination .pagination-container')).toBeVisible();
    await expect(page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toBeVisible();
    await expect(page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toBeVisible();
  });

  test('should paginate incomplete todos independently', async ({ page }) => {
    for (let i = 1; i <= 12; i++) {
      await createTodoViaAPI(page, `Incomplete Todo ${i}`);
    }
    await page.reload(); // Reload to trigger initial fetch for both lists
    await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false') && resp.status() === 200),
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true') && resp.status() === 200),
    ]);
    await waitForListContent(page, '#incomplete-todos-list');


    const list = page.locator('#incomplete-todos-list');
    const nextBtn = page.locator('#incomplete-todos-pagination button:has-text("Next")');
    const prevBtn = page.locator('#incomplete-todos-pagination button:has-text("Previous")');
    const pageInfo = page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');

    await expect(list.locator('li')).toHaveCount(10);
    await expect(list.locator('li').first()).toContainText('Incomplete Todo 1');
    await expect(pageInfo).toHaveText('Page 1 of 2');

    // Navigate to next page
    const incompleteNextResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false&page=2'));
    await nextBtn.click();
    await incompleteNextResponse;
    await waitForListContent(page, '#incomplete-todos-list');

    await expect(list.locator('li')).toHaveCount(2);
    await expect(list.locator('li').first()).toContainText('Incomplete Todo 11');
    await expect(pageInfo).toHaveText('Page 2 of 2');
    await expect(nextBtn).toBeDisabled();

    // Navigate to previous page
    const incompletePrevResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false&page=1'));
    await prevBtn.click();
    await incompletePrevResponse;
    await waitForListContent(page, '#incomplete-todos-list');

    await expect(list.locator('li')).toHaveCount(10);
    await expect(list.locator('li').first()).toContainText('Incomplete Todo 1');
    await expect(pageInfo).toHaveText('Page 1 of 2');
    await expect(prevBtn).toBeDisabled();

    // Check completed list is still empty
    await expect(page.locator('#completed-todos-list p:textmatches(/No completed todos found.*)/')).toBeVisible();
  });

  test('should paginate completed todos independently', async ({ page }) => {
    for (let i = 1; i <= 12; i++) {
      await createTodoViaAPI(page, `Completed Todo ${i}`, true);
    }
     await page.reload();
     await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false') && resp.status() === 200),
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true') && resp.status() === 200),
    ]);
    await waitForListContent(page, '#completed-todos-list');

    const list = page.locator('#completed-todos-list');
    const nextBtn = page.locator('#completed-todos-pagination button:has-text("Next")');
    const prevBtn = page.locator('#completed-todos-pagination button:has-text("Previous")');
    const pageInfo = page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)');

    await expect(list.locator('li')).toHaveCount(10);
    await expect(list.locator('li').first()).toContainText('Completed Todo 1');
    await expect(pageInfo).toHaveText('Page 1 of 2');

    const completedNextResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true&page=2'));
    await nextBtn.click();
    await completedNextResponse;
    await waitForListContent(page, '#completed-todos-list');

    await expect(list.locator('li')).toHaveCount(2);
    await expect(list.locator('li').first()).toContainText('Completed Todo 11');
    await expect(pageInfo).toHaveText('Page 2 of 2');

    const completedPrevResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true&page=1'));
    await prevBtn.click();
    await completedPrevResponse;
    await waitForListContent(page, '#completed-todos-list');

    await expect(list.locator('li')).toHaveCount(10);
    await expect(list.locator('li').first()).toContainText('Completed Todo 1');
    await expect(pageInfo).toHaveText('Page 1 of 2');
  });

  test('search should reset pagination and filter server-side', async ({ page }) => {
    for (let i = 1; i <= 12; i++) {
      await createTodoViaAPI(page, `Incomplete Search Test ${i}`);
      await createTodoViaAPI(page, `Completed Search Test ${i}`, true);
    }
    await page.reload();
    await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false') && resp.status() === 200),
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true') && resp.status() === 200),
    ]);
    await waitForListContent(page, '#incomplete-todos-list');
    await waitForListContent(page, '#completed-todos-list');

    // Go to page 2 for both lists first
    const incompleteNextResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false&page=2'));
    await page.locator('#incomplete-todos-pagination button:has-text("Next")').click();
    await incompleteNextResponse;
    const completedNextResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true&page=2'));
    await page.locator('#completed-todos-pagination button:has-text("Next")').click();
    await completedNextResponse;
    await waitForListContent(page, '#incomplete-todos-list');
    await waitForListContent(page, '#completed-todos-list');

    await expect(page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toHaveText('Page 2 of 2');
    await expect(page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toHaveText('Page 2 of 2');

    const searchInput = page.locator('#todo-search');
    const searchString = 'Test 1'; // Should match "Test 1", "Test 10", "Test 11", "Test 12"

    const searchIncompleteResponse = page.waitForResponse(resp => resp.url().includes(`/api/todos?completed=false&page=1&limit=10&search=${encodeURIComponent(searchString)}`));
    const searchCompletedResponse = page.waitForResponse(resp => resp.url().includes(`/api/todos?completed=true&page=1&limit=10&search=${encodeURIComponent(searchString)}`));
    await searchInput.fill(searchString);
    await searchInput.press('Enter'); // Or wait for debounce if that's still the trigger
    await Promise.all([searchIncompleteResponse, searchCompletedResponse]);
    await waitForListContent(page, '#incomplete-todos-list');
    await waitForListContent(page, '#completed-todos-list');

    await expect(page.locator('#incomplete-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toHaveText('Page 1 of 1');
    await expect(page.locator('#incomplete-todos-list li')).toHaveCount(4);
    await expect(page.locator('#incomplete-todos-list li:has-text("Incomplete Search Test 1")')).toBeVisible();

    await expect(page.locator('#completed-todos-pagination span:textmatches(/Page \\d+ of \\d+/)')).toHaveText('Page 1 of 1');
    await expect(page.locator('#completed-todos-list li')).toHaveCount(4);
    await expect(page.locator('#completed-todos-list li:has-text("Completed Search Test 1")')).toBeVisible();
  });
});

test.describe('Original Todos Page Functionality (Adapted for Server Pagination)', () => {
   test.beforeEach(async ({ page }) => {
    await deleteAllTodosViaAPI(page);
  });

  test('should display incomplete and completed todo sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Incomplete Todos', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Completed Todos', level: 2 })).toBeVisible();
  });

  test('should complete a todo and it moves lists', async ({ page }) => {
    await createTodoViaAPI(page, 'Test Todo to Complete');
    await page.reload(); // Reload to fetch initial state
    await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false')),
        page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true')),
    ]);
    await waitForListContent(page, '#incomplete-todos-list');


    const incompleteTodo = page.locator('#incomplete-todos-list li', { hasText: 'Test Todo to Complete' });
    await expect(incompleteTodo).toBeVisible();

    // Wait for responses after action
    const completeActionResponse = page.waitForResponse(resp => resp.url().includes('/complete') && resp.status() === 204);
    // After completion, refreshTodoLists will call both APIs
    const refreshIncompleteResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false'));
    const refreshCompletedResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true'));

    await incompleteTodo.locator('button.confirm-btn').click();
    await Promise.all([completeActionResponse, refreshIncompleteResponse, refreshCompletedResponse]);
    await waitForListContent(page, '#completed-todos-list');
    await waitForListContent(page, '#incomplete-todos-list');


    await expect(page.locator('#incomplete-todos-list li', { hasText: 'Test Todo to Complete' })).not.toBeVisible();
    const completedTodo = page.locator('#completed-todos-list li', { hasText: 'Test Todo to Complete' });
    await expect(completedTodo).toBeVisible();
  });

  test('should edit a todo', async ({ page }) => {
    await createTodoViaAPI(page, 'Original Todo Text');
    await page.reload();
    await page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false'));
    await waitForListContent(page, '#incomplete-todos-list');

    const todoItem = page.locator('#incomplete-todos-list li', { hasText: 'Original Todo Text' });
    await expect(todoItem).toBeVisible();

    await todoItem.locator('button.edit-btn').click();
    const editInput = todoItem.locator('input[type="text"]');
    await expect(editInput).toBeVisible();
    await editInput.fill('Updated Todo Text');

    const updateActionResponse = page.waitForResponse(resp => resp.url().includes('/api/todos/') && resp.method() === 'PUT');
    const refreshIncompleteResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false'));
    // completed list won't change, but refreshTodoLists calls it
    const refreshCompletedResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true'));

    await todoItem.locator('button:has([class*="fa-save"])').click();
    await Promise.all([updateActionResponse, refreshIncompleteResponse, refreshCompletedResponse]);
    await waitForListContent(page, '#incomplete-todos-list');


    await expect(page.locator('#incomplete-todos-list li', { hasText: 'Updated Todo Text' })).toBeVisible();
    await expect(page.locator('#incomplete-todos-list li', { hasText: 'Original Todo Text' })).not.toBeVisible();
  });

  test('should delete a todo', async ({ page }) => {
    await createTodoViaAPI(page, 'Todo to Delete');
    await page.reload();
    await page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false'));
    await waitForListContent(page, '#incomplete-todos-list');


    const todoItem = page.locator('#incomplete-todos-list li', { hasText: 'Todo to Delete' });
    await expect(todoItem).toBeVisible();

    page.on('dialog', dialog => dialog.accept());

    const deleteActionResponse = page.waitForResponse(resp => resp.url().includes('/api/todos/') && resp.method() === 'DELETE');
    const refreshIncompleteResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=false'));
    const refreshCompletedResponse = page.waitForResponse(resp => resp.url().includes('/api/todos?completed=true'));

    await todoItem.locator('button.delete-btn').click();
    await Promise.all([deleteActionResponse, refreshIncompleteResponse, refreshCompletedResponse]);
    await waitForListContent(page, '#incomplete-todos-list');

    await expect(page.locator('#incomplete-todos-list li', { hasText: 'Todo to Delete' })).not.toBeVisible();
  });
});
