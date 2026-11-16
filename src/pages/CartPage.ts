import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';

  get items() {
    return this.page.getByTestId('inventory-item');
  }

  get itemNames() {
    return this.page.getByTestId('inventory-item-name');
  }

  async removeItem(productName: string): Promise<void> {
    await this.items
      .filter({ has: this.page.getByText(productName, { exact: true }) })
      .getByRole('button', { name: 'Remove' })
      .click();
  }

  async continueShopping(): Promise<void> {
    await this.page.getByTestId('continue-shopping').click();
  }

  async checkout(): Promise<void> {
    await this.page.getByTestId('checkout').click();
  }
}
