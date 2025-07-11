// @ts-check
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('/test.html');
  // Wait for the initial content to load
  await Promise.race([
    page.waitForSelector('#confirmed-facts-container p:has-text("No confirmed facts found.")', { state: 'visible' }),
    page.waitForSelector('#confirmed-facts-container ul li', { state: 'visible' }),
  ]);
  await Promise.race([
    page.waitForSelector('#unconfirmed-facts-container p:has-text("No unconfirmed facts found.")', { state: 'visible' }),
    page.waitForSelector('#unconfirmed-facts-container ul li', { state: 'visible' }),
  ]);
});

test.describe('Test Page (Independent API)', () => {
  test('should display confirmed and unconfirmed fact sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Confirmed Facts', level: 2 })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Unconfirmed Facts', level: 2 })).toBeVisible();
  });

  test('should navigate back to home page via breadcrumb', async ({ page }) => {
    await page.locator('a:has-text("Home")').click();
    await expect(page).toHaveURL(/.*\//);
    await expect(page.locator('h1')).toHaveText('Welcome to Bee Web UI');
  });
});
