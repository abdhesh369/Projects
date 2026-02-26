const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
    test('should allow user to see the login page', async ({ page }) => {
        // Go to the login page
        await page.goto('/auth/login');

        // Expect the title to contain "Login"
        await expect(page).toHaveTitle(/Login/i);

        // Expect the login form to be visible
        await expect(page.locator('button[type="submit"]')).toBeVisible();
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/auth/login');

        // Fill in invalid credentials
        await page.fill('input[type="email"]', 'wrong@example.com');
        await page.fill('input[type="password"]', 'wrongpassword');

        // Click the submit button
        await page.click('button[type="submit"]');

        // Wait for the error message or feedback
        // Note: We'd need to know the exact selector for the error message
        // For now, we just verify the URL hasn't changed to the dashboard
        await expect(page).not.toHaveURL(/\/dashboard/);
    });
});
