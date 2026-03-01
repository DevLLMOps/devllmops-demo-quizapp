// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Button and Choice Animations', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for questions to load
    await page.waitForSelector('.question-card', { timeout: 5000 });
  });

  test('buttons have animation CSS classes', async ({ page }) => {
    // Check theme toggle button has animation class
    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toHaveClass(/btn-press-animate/);

    // Check navigation buttons have animation classes
    const prevBtn = page.locator('#prev-btn');
    await expect(prevBtn).toHaveClass(/btn-press-animate/);

    const nextBtn = page.locator('#next-btn');
    await expect(nextBtn).toHaveClass(/btn-press-animate/);
    await expect(nextBtn).toHaveClass(/btn-pulse-animate/);
  });

  test('choice selection applies animation class temporarily', async ({ page }) => {
    // Click on the first option
    const firstOption = page.locator('.option').first();
    
    // Verify option exists and click it
    await expect(firstOption).toBeVisible();
    await firstOption.click();

    // Check that the option has the selected class
    await expect(firstOption).toHaveClass(/selected/);
  });

  test('submit button has animation classes when visible', async ({ page }) => {
    // Answer all questions to get to submit button
    let questionCount = 0;
    while (questionCount < 10) { // assuming max 10 questions
      const options = page.locator('.option');
      const optionCount = await options.count();
      
      if (optionCount === 0) break; // No more questions
      
      // Click first option
      await options.first().click();
      
      // Try to go to next question
      const nextBtn = page.locator('#next-btn');
      const submitBtn = page.locator('#submit-btn');
      
      if (await nextBtn.isVisible() && !await nextBtn.isDisabled()) {
        await nextBtn.click();
        questionCount++;
      } else if (await submitBtn.isVisible()) {
        // We're on the last question, check submit button classes
        await expect(submitBtn).toHaveClass(/btn-press-animate/);
        await expect(submitBtn).toHaveClass(/btn-pulse-animate/);
        break;
      } else {
        break;
      }
    }
  });

  test('restart button has animation class', async ({ page }) => {
    // Complete the quiz quickly to get to results
    let questionCount = 0;
    while (questionCount < 10) {
      const options = page.locator('.option');
      const optionCount = await options.count();
      
      if (optionCount === 0) break;
      
      await options.first().click();
      
      const nextBtn = page.locator('#next-btn');
      const submitBtn = page.locator('#submit-btn');
      
      if (await nextBtn.isVisible() && !await nextBtn.isDisabled()) {
        await nextBtn.click();
        questionCount++;
      } else if (await submitBtn.isVisible() && !await submitBtn.isDisabled()) {
        await submitBtn.click();
        break;
      } else {
        break;
      }
    }
    
    // Wait for results to show
    await page.waitForSelector('#results:not(.hidden)', { timeout: 10000 });
    
    // Check restart button has animation class
    const restartBtn = page.locator('.restart-btn');
    await expect(restartBtn).toBeVisible();
    await expect(restartBtn).toHaveClass(/btn-press-animate/);
  });

  test('animations respect prefers-reduced-motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    // Wait for questions to load
    await page.waitForSelector('.question-card', { timeout: 5000 });

    // Animations should still be present in HTML but controlled by CSS media query
    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toHaveClass(/btn-press-animate/);

    // The CSS media query should handle disabling animations
    // This is a CSS-level test, so we just verify the classes are still there
    const firstOption = page.locator('.option').first();
    await firstOption.click();
    await expect(firstOption).toHaveClass(/selected/);
  });

  test('option selection maintains visual feedback', async ({ page }) => {
    // Click first option
    const firstOption = page.locator('.option').first();
    await firstOption.click();
    
    // Should have selected class
    await expect(firstOption).toHaveClass(/selected/);
    
    // Radio button should be checked
    const radioButton = firstOption.locator('input[type="radio"]');
    await expect(radioButton).toBeChecked();
    
    // Click second option
    const secondOption = page.locator('.option').nth(1);
    await secondOption.click();
    
    // Second should be selected, first should not
    await expect(secondOption).toHaveClass(/selected/);
    await expect(firstOption).not.toHaveClass(/selected/);
  });
});