import type { Page } from '@playwright/test';

/** Header shared by every authenticated page: burger menu and shopping cart. */
export class Header {
  constructor(private readonly page: Page) {}

  get cartLink() {
    return this.page.getByTestId('shopping-cart-link');
  }

  get cartBadge() {
    return this.page.getByTestId('shopping-cart-badge');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Open Menu' }).click();
    await this.page.getByTestId('logout-sidebar-link').click();
  }
}
