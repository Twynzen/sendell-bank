import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('bank-login')).toBeVisible();
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    const submitButton = page.locator('lb-button:has-text("Iniciar sesión")');
    await submitButton.click();

    // Should show validation errors
    await expect(page.locator('text=documento es requerido')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to OTP step after valid credentials', async ({ page }) => {
    // Fill in credentials
    await page.fill('lb-input[label*="Documento"] input', '12345678A');
    await page.fill('lb-input[type="password"] input', 'password123');

    // Submit
    await page.click('lb-button:has-text("Iniciar sesión")');

    // Should show OTP input
    await expect(page.locator('otp-input')).toBeVisible({ timeout: 10000 });
  });

  test('should login successfully with valid OTP', async ({ page }) => {
    // Fill credentials
    await page.fill('lb-input[label*="Documento"] input', '12345678A');
    await page.fill('lb-input[type="password"] input', 'password123');
    await page.click('lb-button:has-text("Iniciar sesión")');

    // Wait for OTP step
    await expect(page.locator('otp-input')).toBeVisible({ timeout: 10000 });

    // Fill OTP (123456)
    const otpInputs = page.locator('otp-input input');
    const digits = ['1', '2', '3', '4', '5', '6'];
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(digits[i]);
    }

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('should show error for invalid OTP', async ({ page }) => {
    // Fill credentials
    await page.fill('lb-input[label*="Documento"] input', '12345678A');
    await page.fill('lb-input[type="password"] input', 'password123');
    await page.click('lb-button:has-text("Iniciar sesión")');

    // Wait for OTP step
    await expect(page.locator('otp-input')).toBeVisible({ timeout: 10000 });

    // Fill wrong OTP
    const otpInputs = page.locator('otp-input input');
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill('0');
    }

    // Should show error
    await expect(page.locator('text=incorrecto')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login|\/$/);
  });

  test('should access dashboard when authenticated', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.fill('lb-input[label*="Documento"] input', '12345678A');
    await page.fill('lb-input[type="password"] input', 'password123');
    await page.click('lb-button:has-text("Iniciar sesión")');

    await expect(page.locator('otp-input')).toBeVisible({ timeout: 10000 });

    const otpInputs = page.locator('otp-input input');
    const digits = ['1', '2', '3', '4', '5', '6'];
    for (let i = 0; i < 6; i++) {
      await otpInputs.nth(i).fill(digits[i]);
    }

    // Should be on dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
    await expect(page.locator('app-shell')).toBeVisible();
  });
});
