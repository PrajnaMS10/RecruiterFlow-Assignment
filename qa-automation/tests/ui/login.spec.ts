import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test('standard user logs in and sees the Products title', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('standard_user');
  await expect(page.getByTestId('title')).toHaveText('Products');
});

test('locked out user sees a locked out error', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('locked_out_user');
  await expect(login.error).toBeVisible();
  await expect(login.error).toContainText('locked out');
});

test('standard user logs out through the side menu and sees the login page', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('standard_user');
  await expect(page.getByTestId('title')).toHaveText('Products');
  await page.getByRole('button', { name: 'Open Menu' }).click();
  await page.getByTestId('logout-sidebar-link').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/');
  await login.expectVisible();
});
