// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test('should display successful connection status', async ({ page }) => {
    await page.goto('/');
    const statusText = page.locator('#connection-status');
    await expect(statusText).toBeVisible();
    await expect(statusText).toHaveText('Status: Connected to Bee API');
    await expect(statusText).toHaveCSS('color', 'rgb(0, 128, 0)'); // Green color
  });

  test('should navigate to Todos page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Manage Todos');
    await expect(page).toHaveURL(/.*todos/);
    await expect(page.locator('h1')).toHaveText('Todos');
  });

  test('should navigate to Facts page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Manage Facts');
    await expect(page).toHaveURL(/.*facts/);
    await expect(page.locator('h1')).toHaveText('Facts');
  });

  test('should navigate to Conversations page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Manage Conversations');
    await expect(page).toHaveURL(/.*conversations/);
    await expect(page.locator('h1')).toHaveText('Conversations');
  });

  test('should navigate to Test page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Test Page');
    await expect(page).toHaveURL(/.*test/);
    await expect(page.locator('h1')).toHaveText('Bee.computer Data Test');
  });
});
