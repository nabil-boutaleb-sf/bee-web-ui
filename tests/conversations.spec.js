const { test, expect } = require('@playwright/test');

test.describe('Conversation Page Accordion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/conversations.html');
    // Wait for the initial "Loading conversations..." message to disappear
    await expect(page.locator('text="Loading conversations..."')).not.toBeVisible({ timeout: 10000 });
    // Wait for at least one conversation item to be present
    await expect(page.locator('.conversation-item').first()).toBeVisible({ timeout: 10000 });
  });

  test('should expand and collapse conversation item on header click, and not collapse on panel click', async ({ page }) => {
    // Find the first conversation item that is not in "CAPTURING" state
    // This is important because "CAPTURING" items don't have the accordion behavior
    const conversationItem = page.locator('.conversation-item:not(:has-text("State: CAPTURING"))').first();
    await expect(conversationItem).toBeVisible();

    const triggerContainer = conversationItem.locator('.trigger-container');
    const accordionPanel = conversationItem.locator('.accordion-panel');

    // 1. Initial state: Panel should be collapsed (not have 'active' class on li, or panel has no maxHeight)
    // We'll check if the li parent of triggerContainer has the 'active' class
    const listItem = page.locator('.conversation-item:not(:has-text("State: CAPTURING"))').first();
    await expect(listItem).not.toHaveClass(/active/);
    await expect(accordionPanel).toHaveCSS('max-height', /0px|none/); // maxHeight is 0px or not set initially

    // 2. Click header to expand
    await triggerContainer.click();
    await expect(listItem).toHaveClass(/active/);
    // Check if maxHeight is set to something other than 0px. scrollHeight can be 0 for empty panels.
    // So, we check it's not explicitly "0px". A more robust check might be needed if scrollHeight is consistently 0 for some reason.
    await expect(accordionPanel).not.toHaveCSS('max-height', '0px');

    // Wait for network to be idle after expansion, in case of images/external resources
    await page.waitForLoadState('networkidle');

    // Wait for the accordion panel's scrollHeight to stabilize
    await page.waitForFunction(async (selector) => {
      const panel = document.querySelector(selector);
      if (!panel) return false; // Element might not be ready yet
      const initialScrollHeight = panel.scrollHeight;
      await new Promise(resolve => setTimeout(resolve, 250)); // Wait a longer period
      const currentScrollHeight = panel.scrollHeight;
      return initialScrollHeight === currentScrollHeight;
    }, '.accordion-panel', { timeout: 5000 }); // Max 5 seconds wait for stabilization

    // 3. Panel should be expanded. Get its current height.
    const panelMaxHeightExpanded = await accordionPanel.evaluate(el => getComputedStyle(el).maxHeight);
    expect(panelMaxHeightExpanded).not.toBe('0px');
    expect(panelMaxHeightExpanded).not.toBe('none');


    // 4. Click inside the panel
    await accordionPanel.click({ force: true }); // force true if panel content is minimal and hard to click directly
    // Panel should remain expanded (class and maxHeight should be the same)
    await expect(listItem).toHaveClass(/active/);
    const panelMaxHeightAfterPanelClick = await accordionPanel.evaluate(el => getComputedStyle(el).maxHeight);
    expect(panelMaxHeightAfterPanelClick).toBe(panelMaxHeightExpanded);

    // 5. Click header again to collapse
    await triggerContainer.click();
    await expect(listItem).not.toHaveClass(/active/);
    // Exact check for '0px' or 'none' might be tricky due to animations or specific CSS.
    // A common way is to check if it's "0px" or if it becomes very small.
    // For this implementation, it's set to null, which often computes to '0px' or similar.
    // Let's wait for the transition and then check.
    await page.waitForTimeout(500); // Wait for potential CSS transition
    const panelMaxHeightCollapsed = await accordionPanel.evaluate(el => getComputedStyle(el).maxHeight);
    // Depending on how null is interpreted by the browser for maxHeight with content.
    // It might be '0px' or a small value if there's padding/border, or simply not the expanded value.
    // Checking it's not the expanded height is a safe bet.
    expect(panelMaxHeightCollapsed).not.toBe(panelMaxHeightExpanded);
    // More specific: it should be '0px' or very close to it if transitions are instant or style is set to null.
    // If style.maxHeight is set to null, getComputedStyle might return '0px' or the 'none' keyword or a computed small value.
    // Let's refine this to check if it's '0px' or a very small value (e.g. less than 10px)
     const finalHeight = parseFloat(panelMaxHeightCollapsed);
     expect(finalHeight).toBeLessThan(10); // Assuming collapsed height is less than 10px

  });

  test('should not have pointer cursor or accordion behavior for "CAPTURING" state conversations', async ({ page }) => {
    // Attempt to find a "CAPTURING" state conversation. This test might be skipped if none exist.
    const capturingItem = page.locator('.conversation-item:has-text("State: CAPTURING")').first();
    const triggerContainer = capturingItem.locator('.trigger-container');

    if (await capturingItem.isVisible()) {
      // Check cursor style
      await expect(triggerContainer).toHaveCSS('cursor', 'default');

      // Check it does not have an accordion panel or icon that implies interactivity
      const accordionPanel = capturingItem.locator('.accordion-panel');
      await expect(accordionPanel).not.toBeVisible(); // Or not exist, depending on implementation
      const accordionIcon = capturingItem.locator('.accordion-icon');
      await expect(accordionIcon).not.toBeVisible(); // Or not exist

      // Try clicking and verify no change (no 'active' class)
      const listItem = capturingItem; // In this case, the item itself
      await triggerContainer.click({ force: true }); // Force click even if other checks might imply it's not interactive
      await expect(listItem).not.toHaveClass(/active/); // Should not become active
    } else {
      console.log('Skipping CAPTURING state test as no such item was found on the page.');
      // This is not a test failure, but an indication that the condition for the test wasn't met.
      // In a real CI setup, you might want to ensure your test data always includes such items
      // or use test.skip() conditionally. For now, a console log is fine.
      test.skip(true, 'No "CAPTURING" state conversation found to test.');
    }
  });
});
