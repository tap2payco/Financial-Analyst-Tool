import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow a user to register', async ({ page }) => {
        // Generate a random email to avoid duplication
        const email = `testuser${Date.now()}@gmail.com`;
        const password = 'TestPassword123!';

        await page.goto('/register');

        // Fill in the registration form
        await page.getByLabel('Full Name').fill('Test User');
        await page.getByLabel('Email Address').fill(email);
        await page.getByLabel('Password').fill(password);
        await page.getByLabel('Phone Number').fill('1234567890');
        await page.getByLabel('Company Name').fill('Test Corp');
        await page.getByLabel('Location/Address').fill('Test Location');
        
        // Submit the form
        await page.getByRole('button', { name: 'Create Account' }).click();

        // Expect to be redirected to the dashboard (or login page then dashboard)
        // Adjust expectation based on actual flow. Assuming redirect to developer portal (based on Register.tsx code)
        await expect(page).toHaveURL(/\/developer/);
        // await expect(page.getByText('Welcome, Test User')).toBeVisible(); // This might vary based on dashboard content
    });

    test('should allow a user to login', async ({ page }) => {
        // You might need a pre-existing user or register one first.
        const email = `loginuser${Date.now()}@example.com`;
        const password = 'TestPassword123!';

        // 1. Register
        await page.goto('/register');
        await page.getByLabel('Full Name').fill('Login User');
        await page.getByLabel('Email Address').fill(email);
        await page.getByLabel('Password').fill(password);
        await page.getByLabel('Phone Number').fill('1234567890');
        await page.getByLabel('Company Name').fill('Login Corp');
        await page.getByLabel('Location/Address').fill('Login Location');
        await page.getByRole('button', { name: 'Create Account' }).click();
        
        // Wait for redirect to developer dashboard
        await expect(page).toHaveURL(/\/developer/);

        // 2. Logout
        // Assuming there is a logout button in the dashboard or sidebar
        // Note: The structure of layout/sidebar is needed to know exactly where the logout button is. 
        // Failing that, we can try to navigate to login manually or find a logout like button.
        // For now, let's assuming a "Sign Out" or "Logout" button exists.
        // If dependent on specific navigation, we might need to click a user menu first.
        // Let's try to navigate to /login and verify session is gone or just test login page directly after manually clearing cookies?
        // Better: Find the logout element. 
        
        // Workaround if logout button is hard to find: clear cookies/storage
        await page.evaluate(() => localStorage.removeItem('finance_guru_session'));
        await page.goto('/login');

        // 3. Login
        await page.getByLabel('Email').fill(email); 
        await page.getByLabel('Password').fill(password);
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page).toHaveURL(/\/developer/);
    });
});
