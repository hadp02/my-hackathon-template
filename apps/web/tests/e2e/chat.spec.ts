import { test, expect } from '@playwright/test';

test.describe('App E2E', () => {
  test('should load the app and redirect to login when unauthenticated', async ({ page }) => {
    // 1. Navigate to root page
    await page.goto('/');
    
    // 2. Wait for redirect to /login
    await page.waitForURL('**/login');
    
    // 3. Verify login form or text exists
    const signInText = page.locator('text="Sign In"').first();
    await expect(signInText).toBeVisible();
  });
});

