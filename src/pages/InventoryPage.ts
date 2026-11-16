import type { Locator } from '@playwright/test';
import type { SortOption } from '../data/products';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';

  get items() {
    return this.page.getByTestId('inventory-item');
  }

  get itemNames() {
    return this.page.getByTestId('inventory-item-name');
  }

  get itemPrices() {
    return this.page.getByTestId('inventory-item-price');
  }

  get sortDropdown() {
    return this.page.getByTestId('product-sort-container');
  }

  item(productName: string): Locator {
    return this.items.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  addToCartButton(productName: string): Locator {
    return this.item(productName).getByRole('button', { name: 'Add to cart' });
  }

  removeButton(productName: string): Locator {
    return this.item(productName).getByRole('button', { name: 'Remove' });
  }

  async addToCart(...productNames: string[]): Promise<void> {
    for (const name of productNames) {
      await this.addToCartButton(name).click();
    }
  }

  async removeFromCart(productName: string): Promise<void> {
    await this.removeButton(productName).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortDropdown.selectOption(option);
  }
}
