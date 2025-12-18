import { test, expect } from '@playwright/test';

// Helper to login before tests
async function login(page: any) {
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

  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display welcome message with user name', async ({ page }) => {
    await expect(page.locator('text=Bienvenido')).toBeVisible();
    await expect(page.locator('text=Carlos')).toBeVisible();
  });

  test('should display account summary', async ({ page }) => {
    await expect(page.locator('account-summary')).toBeVisible();
  });

  test('should display recent transactions', async ({ page }) => {
    await expect(page.locator('text=Últimos Movimientos')).toBeVisible();
  });

  test('should navigate to accounts page', async ({ page }) => {
    await page.click('a[href="/accounts"]');
    await expect(page).toHaveURL(/accounts/);
  });

  test('should navigate to transfers page', async ({ page }) => {
    await page.click('a[href="/transfers"]');
    await expect(page).toHaveURL(/transfers/);
  });

  test('should navigate to cards page', async ({ page }) => {
    await page.click('a[href="/cards"]');
    await expect(page).toHaveURL(/cards/);
  });
});

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should toggle sidebar collapse', async ({ page }) => {
    const sidebar = page.locator('app-sidebar');
    await expect(sidebar).toBeVisible();

    // Click collapse button
    const collapseBtn = page.locator('app-sidebar .collapse-btn');
    await collapseBtn.click();

    // Sidebar should be collapsed
    await expect(sidebar).toHaveClass(/collapsed/);
  });

  test('should highlight active nav item', async ({ page }) => {
    const dashboardNav = page.locator('app-sidebar a[href="/dashboard"]');
    await expect(dashboardNav).toHaveClass(/active/);

    // Navigate to accounts
    await page.click('app-sidebar a[href="/accounts"]');
    const accountsNav = page.locator('app-sidebar a[href="/accounts"]');
    await expect(accountsNav).toHaveClass(/active/);
  });
});

test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display user avatar', async ({ page }) => {
    await expect(page.locator('app-header lb-avatar')).toBeVisible();
  });

  test('should display notifications bell', async ({ page }) => {
    await expect(page.locator('app-header .notification-btn')).toBeVisible();
  });

  test('should open user menu on avatar click', async ({ page }) => {
    await page.click('app-header .user-menu-trigger');
    await expect(page.locator('app-header lb-dropdown')).toBeVisible();
  });

  test('should logout when clicking logout option', async ({ page }) => {
    await page.click('app-header .user-menu-trigger');
    await page.click('text=Cerrar Sesión');

    // Should redirect to login
    await expect(page).toHaveURL(/login|\/$/);
  });
});
