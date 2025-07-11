// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/todos.html');
  // Wait for the initial content to load
  await Promise.race([
    page.waitForSelector('#incomplete-todos-list p:has-text("No incomplete todos found.")'),
    page.waitForSelector('#incomplete-todos-list ul li'),
  ]);
  await Promise.race([
    page.waitForSelector('#completed-todos-list p:has-text("No completed todos found.")'),
    page.waitForSelector('#completed-todos-list ul li'),
  ]);
});

test.describe.skip('Todos Page', () => {
  test('should display incomplete and completed todo sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Incomplete Todos', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Completed Todos', level: 2 })).toBeVisible();
  });

  test('should complete a todo', async ({ page }) => {
    // Create a new todo for this test to ensure it's deterministic
    // In a real scenario, you might use an API call here to seed data
    await page.evaluate(async () => {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Test Todo to Complete' })
        });
        const data = await response.json();
        // console.log('Create Todo Response:', data);
      } catch (error) {
        console.error('Error in page.evaluate (create todo):', error);
      }
    });
    await page.reload(); // Reload to fetch the newly added todo
    await page.waitForSelector('#incomplete-todos-list ul li');

    const incompleteTodo = page.locator('#incomplete-todos-list li', { hasText: 'Test Todo to Complete' });
    await expect(incompleteTodo).toBeVisible();

    await incompleteTodo.locator('button:has-text("Complete")').click();

    await expect(incompleteTodo).not.toBeVisible(); // Should disappear from incomplete
    const completedTodo = page.locator('#completed-todos-list li', { hasText: 'Test Todo to Complete' });
    await expect(completedTodo).toBeVisible(); // Should appear in completed
  });

  test('should edit a todo', async ({ page }) => {
    // Create a new todo for this test
    await page.evaluate(() => {
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Original Todo Text' })
      });
    });
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li');

    const todoItem = page.locator('#incomplete-todos-list li', { hasText: 'Original Todo Text' });
    await expect(todoItem).toBeVisible();

    await todoItem.locator('button:has-text("Edit")').click();
    const editInput = todoItem.locator('input[type="text"]');
    await expect(editInput).toBeVisible();
    await editInput.fill('Updated Todo Text');
    await todoItem.locator('button:has-text("Save")').click();

    await expect(todoItem).not.toHaveText(/Original Todo Text/);
    await expect(todoItem).toHaveText(/Updated Todo Text/);
  });

  test.skip('should delete a todo', async ({ page }) => {
    // Create a new todo for this test
    await page.evaluate(() => {
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Todo to Delete' })
      });
    });
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li');

    const todoItem = page.locator('#incomplete-todos-list li', { hasText: 'Todo to Delete' });
    await expect(todoItem).toBeVisible();

    await todoItem.locator('button:has-text("Delete")').click();

    await expect(todoItem).not.toBeVisible();
  });

  test('should paginate incomplete todos', async ({ page }) => {
    // This test assumes there are enough todos to trigger pagination.
    // If not, you'd need to seed many todos via API calls.
    // For now, we'll check if pagination controls exist and are clickable.
    const incompletePaginationNext = page.locator('#incomplete-todos-pagination button:has-text("Next")');
    const incompletePaginationPrev = page.locator('#incomplete-todos-pagination button:has-text("Previous")');

    if (await incompletePaginationNext.isVisible()) {
      const initialContent = await page.locator('#incomplete-todos-list').textContent();
      await incompletePaginationNext.click();
      await page.waitForTimeout(500); // Wait for content to load
      const newContent = await page.locator('#incomplete-todos-list').textContent();
      expect(newContent).not.toEqual(initialContent);

      await incompletePaginationPrev.click();
      await page.waitForTimeout(500); // Wait for content to load
      const originalContent = await page.locator('#incomplete-todos-list').textContent();
      expect(originalContent).toEqual(initialContent);
    } else {
      test.info().annotations.push({ type: 'skipped', description: 'Not enough incomplete todos for pagination test.' });
    }
  });

  test('should paginate completed todos', async ({ page }) => {
    const completedPaginationNext = page.locator('#completed-todos-pagination button:has-text("Next")');
    const completedPaginationPrev = page.locator('#completed-todos-pagination button:has-text("Previous")');

    if (await completedPaginationNext.isVisible()) {
      const initialContent = await page.locator('#completed-todos-list').textContent();
      await completedPaginationNext.click();
      await page.waitForTimeout(500); // Wait for content to load
      const newContent = await page.locator('#completed-todos-list').textContent();
      expect(newContent).not.toEqual(initialContent);

      await completedPaginationPrev.click();
      await page.waitForTimeout(500); // Wait for content to load
      const originalContent = await page.locator('#completed-todos-list').textContent();
      expect(originalContent).toEqual(initialContent);
    } else {
      test.info().annotations.push({ type: 'skipped', description: 'Not enough completed todos for pagination test.' });
    }
  });

  test('should filter incomplete todos by search term', async ({ page }) => {
    const searchInput = page.locator('#todo-search');
    const incompleteTodosList = page.locator('#incomplete-todos-list');

    // Create a new todo for this test
    await page.evaluate(() => {
      fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Searchable Incomplete Todo' })
      });
    });
    await page.reload();
    await page.waitForSelector('#incomplete-todos-list ul li');

    // Search for a term expected to have results
    await searchInput.fill('Searchable Incomplete');
    await page.waitForTimeout(500); // Wait for debounce and UI update

    const incompleteItems = incompleteTodosList.locator('ul li');
    await expect(incompleteItems.first()).toContainText(/Searchable Incomplete Todo/i);
    await expect(incompleteItems).toHaveCount(1);

    // Search for a term expected to have NO results
    const uniqueSearchTerm = 'NoMatchTodoXYZ';
    await searchInput.fill(uniqueSearchTerm);
    await page.waitForTimeout(500);

    await expect(incompleteTodosList.locator('p')).toHaveText('No incomplete todos match your search.');
    await expect(incompleteTodosList.locator('ul li')).toHaveCount(0);

    // Clear search, should show all/initial todos
    await searchInput.fill('');
    // Wait for the "no match" message to disappear, or for initial content to reappear
    await Promise.race([
      incompleteTodosList.locator('p:has-text("No incomplete todos match your search.")').isHidden(),
      incompleteTodosList.locator('p:has-text("No incomplete todos found.")').waitFor({ state: 'visible' }),
      incompleteTodosList.locator('ul li').first().waitFor({ state: 'visible' }),
    ]);
    // Ensure the "no match" message is indeed gone
    await expect(incompleteTodosList.locator('p:has-text("No incomplete todos match your search.")')).not.toBeVisible();
    // Ensure either the "No incomplete todos found." message or actual list items are present
    await expect(incompleteTodosList.locator('p:has-text("No incomplete todos found.")').or(incompleteTodosList.locator('ul li').first())).toBeVisible();
  });

  test('should filter completed todos by search term', async ({ page }) => {
    const searchInput = page.locator('#todo-search');
    const completedTodosList = page.locator('#completed-todos-list');

    // Create and complete a new todo for this test
    await page.evaluate(async () => {
      try {
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Searchable Completed Todo' })
        });
        // console.log('Create Searchable Completed Todo Response:', todo);

        const completeResponse = await fetch(`/api/todos/${todo.id}/complete`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        // console.log('Complete Searchable Completed Todo Response Status:', completeResponse.status);
      } catch (error) {
        console.error('Error in page.evaluate (create and complete todo):', error);
      }
    });
    await page.reload();
    await page.waitForSelector('#completed-todos-list ul li');

    // Search for a term expected to have results
    await searchInput.fill('Searchable Completed');
    await page.waitForTimeout(500);

    const completedItems = completedTodosList.locator('ul li');
    await expect(completedItems.first()).toContainText(/Searchable Completed Todo/i);
    await expect(completedItems).toHaveCount(1);

    // Search for a term expected to have NO results
    const uniqueSearchTerm = 'NoMatchCompletedTodoXYZ';
    await searchInput.fill(uniqueSearchTerm);
    await page.waitForTimeout(500);

    await expect(completedTodosList.locator('p')).toHaveText('No completed todos match your search.');
    await expect(completedTodosList.locator('ul li')).toHaveCount(0);

    // Clear search, should show all/initial todos
    await searchInput.fill('');
    // Wait for the "no match" message to disappear, or for initial content to reappear
    await Promise.race([
      completedTodosList.locator('p:has-text("No completed todos match your search.")').isHidden(),
      completedTodosList.locator('p:has-text("No completed todos found.")').waitFor({ state: 'visible' }),
      completedTodosList.locator('ul li').first().waitFor({ state: 'visible' }),
    ]);
    // Ensure the "no match" message is indeed gone
    await expect(completedTodosList.locator('p:has-text("No completed todos match your search.")')).not.toBeVisible();
    // Ensure either the "No completed todos found." message or actual list items are present
    await expect(completedTodosList.locator('p:has-text("No completed todos found.")').or(completedTodosList.locator('ul li').first())).toBeVisible();
  });
});
