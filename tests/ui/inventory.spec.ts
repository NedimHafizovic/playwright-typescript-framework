import { catalogue, products, sortedCatalogue, type SortOption } from '../../src/data/products';
import { users } from '../../src/data/users';
import { expect, test } from '../../src/fixtures/test';

test.use({ authenticatedAs: users.standard.username });

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists the full product catalogue', { tag: '@smoke' }, async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(catalogue.length);
    await expect(inventoryPage.itemNames).toHaveText(sortedCatalogue('az').map((p) => p.name));
  });

  const nameSorts: { option: SortOption; label: string }[] = [
    { option: 'az', label: 'name ascending' },
    { option: 'za', label: 'name descending' },
  ];

  for (const { option, label } of nameSorts) {
    test(`sorts products by ${label}`, { tag: '@regression' }, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);

      await expect(inventoryPage.itemNames).toHaveText(sortedCatalogue(option).map((p) => p.name));
    });
  }

  const priceSorts: { option: SortOption; label: string }[] = [
    { option: 'lohi', label: 'price low to high' },
    { option: 'hilo', label: 'price high to low' },
  ];

  for (const { option, label } of priceSorts) {
    test(`sorts products by ${label}`, { tag: '@regression' }, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(option);

      await expect(inventoryPage.itemPrices).toHaveText(
        sortedCatalogue(option).map((p) => `$${p.price.toFixed(2)}`),
      );
    });
  }

  test(
    'cart badge tracks added and removed products',
    { tag: '@regression' },
    async ({ inventoryPage }) => {
      const { header } = inventoryPage;
      await expect(header.cartBadge).toBeHidden();

      await inventoryPage.addToCart(products.backpack.name, products.onesie.name);
      await expect(header.cartBadge).toHaveText('2');
      await expect(inventoryPage.removeButton(products.backpack.name)).toBeVisible();

      await inventoryPage.removeFromCart(products.backpack.name);
      await expect(header.cartBadge).toHaveText('1');
      await expect(inventoryPage.addToCartButton(products.backpack.name)).toBeVisible();
    },
  );
});
