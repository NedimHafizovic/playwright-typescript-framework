import { buildCustomer } from '../../src/data/factories';
import { orderSummary, products } from '../../src/data/products';
import { users } from '../../src/data/users';
import { expect, test } from '../../src/fixtures/test';

test.use({ authenticatedAs: users.standard.username });

test.describe('Checkout', () => {
  const order = [products.backpack, products.bikeLight];

  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(...order.map((p) => p.name));
    await inventoryPage.header.openCart();
    await cartPage.checkout();
  });

  test('customer can complete a purchase', { tag: '@smoke' }, async ({ checkoutPage, page }) => {
    const summary = orderSummary(order);

    await test.step('enter customer information', async () => {
      await checkoutPage.fillInformation(buildCustomer());
      await checkoutPage.continue();
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('review order and totals', async () => {
      await expect(checkoutPage.itemNames).toHaveText(order.map((p) => p.name));
      await expect(checkoutPage.subtotal).toHaveText(`Item total: $${summary.subtotal}`);
      await expect(checkoutPage.tax).toHaveText(`Tax: $${summary.tax}`);
      await expect(checkoutPage.total).toHaveText(`Total: $${summary.total}`);
    });

    await test.step('place the order', async () => {
      await checkoutPage.finish();
      await expect(checkoutPage.confirmationHeader).toHaveText('Thank you for your order!');
      await expect(checkoutPage.header.cartBadge).toBeHidden();
    });

    await test.step('return to the catalogue', async () => {
      await checkoutPage.backToProducts();
      await expect(page).toHaveURL(/inventory\.html/);
    });
  });

  const requiredFields = [
    { field: 'firstName', error: 'First Name is required' },
    { field: 'lastName', error: 'Last Name is required' },
    { field: 'postalCode', error: 'Postal Code is required' },
  ] as const;

  for (const { field, error } of requiredFields) {
    test(`${field} is required`, { tag: '@regression' }, async ({ checkoutPage, page }) => {
      await checkoutPage.fillInformation(buildCustomer({ [field]: '' }));
      await checkoutPage.continue();

      await expect(checkoutPage.errorMessage).toHaveText(`Error: ${error}`);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }

  test(
    'cancelling at the overview keeps the cart',
    { tag: '@regression' },
    async ({ checkoutPage, page }) => {
      await checkoutPage.fillInformation(buildCustomer());
      await checkoutPage.continue();
      await checkoutPage.cancel();

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(checkoutPage.header.cartBadge).toHaveText(String(order.length));
    },
  );
});
