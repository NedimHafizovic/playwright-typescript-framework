import { products } from '../../src/data/products';
import { users } from '../../src/data/users';
import { expect, test } from '../../src/fixtures/test';

test.use({ authenticatedAs: users.standard.username });

test.describe('Shopping cart', () => {
  const selected = [products.bikeLight, products.fleeceJacket];

  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(...selected.map((p) => p.name));
    await inventoryPage.header.openCart();
  });

  test('shows the products that were added', { tag: '@smoke' }, async ({ cartPage, page }) => {
    await expect(page).toHaveURL(/cart\.html/);
    await expect(cartPage.itemNames).toHaveText(selected.map((p) => p.name));
  });

  test('a product can be removed from the cart', { tag: '@regression' }, async ({ cartPage }) => {
    await cartPage.removeItem(products.bikeLight.name);

    await expect(cartPage.itemNames).toHaveText([products.fleeceJacket.name]);
    await expect(cartPage.header.cartBadge).toHaveText('1');
  });

  test(
    'cart contents survive a page reload',
    { tag: '@regression' },
    async ({ cartPage, page }) => {
      await page.reload();

      await expect(cartPage.itemNames).toHaveText(selected.map((p) => p.name));
    },
  );

  test(
    'continue shopping returns to the catalogue with the cart intact',
    { tag: '@regression' },
    async ({ cartPage, inventoryPage, page }) => {
      await cartPage.continueShopping();

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.header.cartBadge).toHaveText(String(selected.length));
    },
  );
});
