const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
  test('should show the API key form if not authenticated', async ({ page }) => {
    await page.route('/api/auth/status', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ isAuthenticated: false }),
      });
    });

    await page.goto('/');
    await expect(page.locator('#auth-status')).toHaveText('Status: Not connected to Bee API. Please provide a key.');
    await expect(page.locator('#api-key-form-container')).toBeVisible();
  });

  test('should show success and hide form on valid key submission', async ({ page }) => {
    let callCount = 0;
    await page.route('/api/auth/status', route => {
      callCount++;
      if (callCount === 1) {
        return route.fulfill({
          status: 200,
          body: JSON.stringify({ isAuthenticated: false }),
        });
      }
      return route.fulfill({
        status: 200,
        body: JSON.stringify({ isAuthenticated: true }),
      });
    });

    await page.route('/api/auth/set-token', route => {
      route.fulfill({ status: 200 });
    });

    await page.goto('/');

    await page.waitForSelector('#api-key-form-container', { state: 'visible' });

    await page.locator('#api-key-input').fill('valid-key');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#auth-status')).toHaveText('Status: Connected to Bee API');
    await expect(page.locator('#api-key-form-container')).toBeHidden();
  });

  test('should show an error message on invalid key submission', async ({ page }) => {
    // Mock all status checks to return unauthenticated
    await page.route('/api/auth/status', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ isAuthenticated: false }),
      });
    });

    // Mock the set-token endpoint
    await page.route('/api/auth/set-token', route => {
      route.fulfill({ status: 200 });
    });

    await page.goto('/');

    // Wait for the form to be visible
    await page.waitForSelector('#api-key-form-container', { state: 'visible' });

    await page.locator('#api-key-input').fill('invalid-key');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('#auth-status')).toHaveText('Status: Not connected to Bee API. Invalid key.');
    await expect(page.locator('#api-key-form-container')).toBeVisible();
  });
});
