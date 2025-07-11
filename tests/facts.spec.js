// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  // Navigate to the facts page before each test
  await page.goto('/facts.html');
  // Wait for the initial content to load, specifically for the lists to be populated
  // We'll wait for the "No confirmed facts found." or an actual list item to appear.
  await Promise.race([
    page.waitForSelector('#confirmed-facts-list p:has-text("No confirmed facts found.")'),
    page.waitForSelector('#confirmed-facts-list ul li'),
  ]);
  await Promise.race([
    page.waitForSelector('#unconfirmed-facts-list p:has-text("No unconfirmed facts found.")'),
    page.waitForSelector('#unconfirmed-facts-list ul li'),
  ]);
});

test.describe('Facts Page Search Functionality', () => {
  test('should filter confirmed facts by search term', async ({ page }) => {
    // Assuming there are some initial facts. If not, this test needs adjustment
    // or the backend needs to be seeded with test data.

    // Add a known fact to make the test deterministic if the API allows,
    // or ensure your test environment has predictable data.
    // For now, we'll rely on the existing data and make the test flexible.

    const searchInput = page.locator('#fact-search');
    const confirmedFactsList = page.locator('#confirmed-facts-list');

    // --- Test Case 1: Search for a term expected to have results ---
    // Let's assume a fact containing "TestConf" exists or might exist.
    // Type a search term
    await searchInput.fill('TestConf');
    await page.waitForTimeout(500); // Wait for debounce and UI update

    // Get all list items within the confirmed facts list
    const confirmedItems = confirmedFactsList.locator('ul li');
    const count = await confirmedItems.count();

    if (count > 0) {
      // If items are found, check if they all contain the search term
      for (let i = 0; i < count; i++) {
        await expect(confirmedItems.nth(i)).toContainText(/TestConf/i);
      }
    } else {
      // If no items are found, check for the "no match" message
      await expect(confirmedFactsList.locator('p')).toHaveText('No confirmed facts match your search.');
    }

    // --- Test Case 2: Search for a term expected to have NO results ---
    const uniqueSearchTerm = 'XZYXZYXZYThisShouldNotExistXZYXZYXZY';
    await searchInput.fill(uniqueSearchTerm);
    await page.waitForTimeout(500); // Wait for debounce

    // Check that "No confirmed facts match your search." message is shown
    await expect(confirmedFactsList.locator('p')).toHaveText('No confirmed facts match your search.');
    await expect(confirmedFactsList.locator('ul li')).toHaveCount(0); // Ensure no list items

    // --- Test Case 3: Clear search, should show all/initial facts ---
    await searchInput.fill('');
    // Wait for the "no match" message to disappear, or for initial content to reappear
    await Promise.race([
      confirmedFactsList.locator('p:has-text("No confirmed facts match your search.")').isHidden(),
      confirmedFactsList.locator('p:has-text("No confirmed facts found.")').waitFor({ state: 'visible' }),
      confirmedFactsList.locator('ul li').first().waitFor({ state: 'visible' }),
    ]);
    // Ensure the "no match" message is indeed gone
    await expect(confirmedFactsList.locator('p:has-text("No confirmed facts match your search.")')).not.toBeVisible();
    // Ensure either the "No confirmed facts found." message or actual list items are present
    await expect(confirmedFactsList.locator('p:has-text("No confirmed facts found.")').or(confirmedFactsList.locator('ul li').first())).toBeVisible();
  });

  test('should filter unconfirmed facts by search term', async ({ page }) => {
    const searchInput = page.locator('#fact-search');
    const unconfirmedFactsList = page.locator('#unconfirmed-facts-list');

    // --- Test Case 1: Create a specific fact for this test ---
    const uniqueText = `TestUnconf-${Date.now()}`;
    await page.evaluate(async (text) => {
      await fetch('/api/facts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, confirmed: false })
      });
    }, uniqueText);
    await page.reload(); // Reload to see the new fact

    // --- Test Case 2: Search for the new fact ---
    await searchInput.fill(uniqueText);
    await page.waitForTimeout(500); // Wait for debounce

    const unconfirmedItems = unconfirmedFactsList.locator('ul li');
    await expect(unconfirmedItems.first()).toContainText(uniqueText);
    await expect(unconfirmedItems).toHaveCount(1);

    // --- Test Case 3: Search for a term that should have NO results ---
    const noMatchTerm = 'NoMatchFactXYZ';
    await searchInput.fill(noMatchTerm);
    await page.waitForTimeout(500);

    await expect(unconfirmedFactsList.locator('p')).toHaveText('No unconfirmed facts match your search.');
    await expect(unconfirmedFactsList.locator('ul li')).toHaveCount(0);

    // --- Test Case 4: Clear search, should show all/initial facts ---
    await searchInput.fill('');
    // Wait for the "no match" message to disappear, or for initial content to reappear
    await Promise.race([
      unconfirmedFactsList.locator('p:has-text("No unconfirmed facts match your search.")').isHidden(),
      unconfirmedFactsList.locator('p:has-text("No unconfirmed facts found.")').waitFor({ state: 'visible' }),
      unconfirmedFactsList.locator('ul li').first().waitFor({ state: 'visible' }),
    ]);
    // Ensure the "no match" message is indeed gone
    await expect(unconfirmedFactsList.locator('p:has-text("No unconfirmed facts match your search.")')).not.toBeVisible();
    // Ensure either the "No unconfirmed facts found." message or actual list items are present
    await expect(unconfirmedFactsList.locator('p:has-text("No unconfirmed facts found.")').or(unconfirmedFactsList.locator('ul li').first())).toBeVisible();
  });
});

test.describe.skip('Facts Page Actions', () => {
  test('should display confirmed and unconfirmed fact sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Confirmed Facts', level: 2, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Unconfirmed Facts', level: 2, exact: true })).toBeVisible();
  });

  test('should confirm an unconfirmed fact', async ({ page }) => {
    // Create a new unconfirmed fact for this test
    await page.evaluate(async () => {
      try {
        const response = await fetch('/api/facts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Fact to Confirm', confirmed: false })
        });
        const data = await response.json();
        // console.log('Create Fact to Confirm Response:', data);
      } catch (error) {
        console.error('Error in page.evaluate (create fact to confirm):', error);
      }
    });
    await page.reload();
    await page.waitForSelector('#unconfirmed-facts-list ul li');

    const unconfirmedFact = page.locator('#unconfirmed-facts-list li', { hasText: 'Fact to Confirm' });
    await expect(unconfirmedFact).toBeVisible();

    await unconfirmedFact.locator('button:has-text("Confirm")').click();
    await page.waitForTimeout(500); // Wait for UI update

    await expect(unconfirmedFact).not.toBeVisible(); // Should disappear from unconfirmed
    const confirmedFact = page.locator('#confirmed-facts-list li', { hasText: 'Fact to Confirm' });
    await expect(confirmedFact).toBeVisible(); // Should appear in confirmed
  });

  test('should unconfirm a confirmed fact', async ({ page }) => {
    // Create a new confirmed fact for this test
    await page.evaluate(async () => {
      try {
        const response = await fetch('/api/facts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Fact to Unconfirm', confirmed: true })
        });
        const data = await response.json();
        // console.log('Create Fact to Unconfirm Response:', data);
      } catch (error) {
        console.error('Error in page.evaluate (create fact to unconfirm):', error);
      }
    });
    await page.reload();
    await page.waitForSelector('#confirmed-facts-list ul li');

    const confirmedFact = page.locator('#confirmed-facts-list li', { hasText: 'Fact to Unconfirm' });
    await expect(confirmedFact).toBeVisible();

    await confirmedFact.locator('button:has-text("Unconfirm")').click();
    await page.waitForTimeout(500); // Wait for UI update

    await expect(confirmedFact).not.toBeVisible(); // Should disappear from confirmed
    const unconfirmedFact = page.locator('#unconfirmed-facts-list li', { hasText: 'Fact to Unconfirm' });
    await expect(unconfirmedFact).toBeVisible(); // Should appear in unconfirmed
  });

  test('should edit a fact', async ({ page }) => {
    // Create a new fact for this test
    await page.evaluate(async () => {
      try {
        const response = await fetch('/api/facts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Original Fact Text', confirmed: false })
        });
        const data = await response.json();
        // console.log('Create Original Fact Text Response:', data);
      } catch (error) {
        console.error('Error in page.evaluate (create original fact):', error);
      }
    });
    await page.reload();
    await page.waitForSelector('#unconfirmed-facts-list ul li');

    const factItem = page.locator('#unconfirmed-facts-list li', { hasText: 'Original Fact Text' });
    await expect(factItem).toBeVisible();

    await factItem.locator('button:has-text("Edit")').click();
    const editInput = factItem.locator('input[type="text"]');
    await expect(editInput).toBeVisible();
    await editInput.fill('Updated Fact Text');
    await factItem.locator('button:has-text("Save")').click();
    await page.waitForTimeout(500); // Wait for UI update

    await expect(factItem).not.toHaveText(/Original Fact Text/);
    await expect(factItem).toHaveText(/Updated Fact Text/);
  });

  test.skip('should delete a fact', async ({ page }) => {
    // Create a new fact for this test
    await page.evaluate(async () => {
      try {
        const response = await fetch('/api/facts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Fact to Delete', confirmed: false })
        });
        const data = await response.json();
        // console.log('Create Fact to Delete Response:', data);
      } catch (error) {
        console.error('Error in page.evaluate (create fact to delete):', error);
      }
    });
    await page.reload();
    await page.waitForSelector('#unconfirmed-facts-list ul li');

    const factItem = page.locator('#unconfirmed-facts-list li', { hasText: 'Fact to Delete' });
    await expect(factItem).toBeVisible();

    await factItem.locator('button:has-text("Delete")').click();
    await page.waitForTimeout(500); // Wait for UI update

    await expect(factItem).not.toBeVisible();
  });

  test('should paginate confirmed facts', async ({ page }) => {
    const confirmedPaginationNext = page.locator('#confirmed-facts-pagination button:has-text("Next")');
    const confirmedPaginationPrev = page.locator('#confirmed-facts-pagination button:has-text("Previous")');

    if (await confirmedPaginationNext.isVisible()) {
      const initialContent = await page.locator('#confirmed-facts-list').textContent();
      await confirmedPaginationNext.click();
      await page.waitForTimeout(500); // Wait for content to load
      const newContent = await page.locator('#confirmed-facts-list').textContent();
      expect(newContent).not.toEqual(initialContent);

      await confirmedPaginationPrev.click();
      await page.waitForTimeout(500); // Wait for content to load
      const originalContent = await page.locator('#confirmed-facts-list').textContent();
      expect(originalContent).toEqual(initialContent);
    } else {
      test.info().annotations.push({ type: 'skipped', description: 'Not enough confirmed facts for pagination test.' });
    }
  });

  test('should paginate unconfirmed facts', async ({ page }) => {
    const unconfirmedPaginationNext = page.locator('#unconfirmed-facts-pagination button:has-text("Next")');
    const unconfirmedPaginationPrev = page.locator('#unconfirmed-facts-pagination button:has-text("Previous")');

    if (await unconfirmedPaginationNext.isVisible()) {
      const initialContent = await page.locator('#unconfirmed-facts-list').textContent();
      await unconfirmedPaginationNext.click();
      await page.waitForTimeout(500); // Wait for content to load
      const newContent = await page.locator('#unconfirmed-facts-list').textContent();
      expect(newContent).not.toEqual(initialContent);

      await unconfirmedPaginationPrev.click();
      await page.waitForTimeout(500); // Wait for content to load
      const originalContent = await page.locator('#unconfirmed-facts-list').textContent();
      expect(originalContent).toEqual(initialContent);
    } else {
      test.info().annotations.push({ type: 'skipped', description: 'Not enough unconfirmed facts for pagination test.' });
    }
  });
});