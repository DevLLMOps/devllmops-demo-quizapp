// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Dark/Light mode toggle', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggle button is visible', async ({ page }) => {
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toBeVisible();
  });

  test('clicking toggle adds dark class to html', async ({ page }) => {
    const html = page.locator('html');

    // Clear any saved preference so we start from a known state
    await page.evaluate(() => localStorage.removeItem('theme'));
    await page.reload();

    // Get initial state
    const hadDark = await html.evaluate(el => el.classList.contains('dark'));

    // Click toggle
    await page.locator('#theme-toggle').click();

    // Class should have flipped
    if (hadDark) {
      await expect(html).not.toHaveClass(/dark/);
    } else {
      await expect(html).toHaveClass(/dark/);
    }
  });

  test('background color changes when toggling theme', async ({ page }) => {
    // Get initial background color
    const initialBg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );

    // Toggle theme
    await page.locator('#theme-toggle').click();

    // Background color must be different
    const newBg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    expect(newBg).not.toBe(initialBg);
  });

  test('theme persists after reload', async ({ page }) => {
    // Toggle to ensure a known state is saved
    await page.locator('#theme-toggle').click();

    const themeAfterToggle = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    // Reload the page
    await page.reload();

    const themeAfterReload = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );

    expect(themeAfterReload).toBe(themeAfterToggle);
  });

  test('toggle icon changes between moon and sun', async ({ page }) => {
    const icon = page.locator('.theme-toggle-icon');
    const initialIcon = await icon.textContent();

    await page.locator('#theme-toggle').click();

    const newIcon = await icon.textContent();
    expect(newIcon).not.toBe(initialIcon);

    // Icons should be one of ☽ (moon) or ☀ (sun)
    expect(['\u263D', '\u2600']).toContain(newIcon?.trim());
  });
});
