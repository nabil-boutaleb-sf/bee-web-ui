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
    await page.waitForTimeout(500); // Wait for debounce

    // Check that the "no match" message is gone
    // And either the "No confirmed facts found." or the list is present.
    const hasNoMatchMessage = await confirmedFactsList.locator('p:has-text("No confirmed facts match your search.")').isVisible();
    expect(hasNoMatchMessage).toBe(false);

    const hasInitialNoFactsMessage = await confirmedFactsList.locator('p:has-text("No confirmed facts found.")').isVisible();
    const hasListItems = (await confirmedFactsList.locator('ul li').count()) > 0;
    expect(hasInitialNoFactsMessage || hasListItems).toBe(true);
  });

  test('should filter unconfirmed facts by search term', async ({ page }) => {
    const searchInput = page.locator('#fact-search');
    const unconfirmedFactsList = page.locator('#unconfirmed-facts-list');

    // --- Test Case 1: Search for a term expected to have results ---
    // Let's assume a fact containing "TestUnconf" exists or might exist.
    await searchInput.fill('TestUnconf');
    await page.waitForTimeout(500);

    const unconfirmedItems = unconfirmedFactsList.locator('ul li');
    const count = await unconfirmedItems.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        await expect(unconfirmedItems.nth(i)).toContainText(/TestUnconf/i);
      }
    } else {
      await expect(unconfirmedFactsList.locator('p')).toHaveText('No unconfirmed facts match your search.');
    }

    // --- Test Case 2: Search for a term expected to have NO results ---
    const uniqueSearchTerm = 'XZYXZYXZYThisShouldNotExistXZYXZYXZY';
    await searchInput.fill(uniqueSearchTerm);
    await page.waitForTimeout(500);

    await expect(unconfirmedFactsList.locator('p')).toHaveText('No unconfirmed facts match your search.');
    await expect(unconfirmedFactsList.locator('ul li')).toHaveCount(0);

    // --- Test Case 3: Clear search, should show all/initial facts ---
    await searchInput.fill('');
    await page.waitForTimeout(500);

    const hasNoMatchMessage = await unconfirmedFactsList.locator('p:has-text("No unconfirmed facts match your search.")').isVisible();
    expect(hasNoMatchMessage).toBe(false);

    const hasInitialNoFactsMessage = await unconfirmedFactsList.locator('p:has-text("No unconfirmed facts found.")').isVisible();
    const hasListItems = (await unconfirmedFactsList.locator('ul li').count()) > 0;
    expect(hasInitialNoFactsMessage || hasListItems).toBe(true);
  });
});
