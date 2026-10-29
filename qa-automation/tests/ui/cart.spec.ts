import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();
  await login.login('standard_user');
  await expect(page.getByTestId('title')).toHaveText('Products');
});

test('adding a backpack shows a cart badge of 1', async ({ page }) => {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
});

test('removing the backpack from the cart removes the badge', async ({ page }) => {
  await page.getByTestId('add-to-cart-sauce-labs-backpack').click();
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await page.getByTestId('shopping-cart-link').click();
  await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
  await page.getByTestId('remove-sauce-labs-backpack').click();
  await expect(page.getByTestId('inventory-item')).toHaveCount(0);
  await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);
});
