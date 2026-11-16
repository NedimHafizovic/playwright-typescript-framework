import type { CustomerInfo } from '../data/factories';
import { BasePage } from './BasePage';

/** Covers the three checkout steps: customer information, overview and confirmation. */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';

  get errorMessage() {
    return this.page.getByTestId('error');
  }

  get itemNames() {
    return this.page.getByTestId('inventory-item-name');
  }

  get subtotal() {
    return this.page.getByTestId('subtotal-label');
  }

  get tax() {
    return this.page.getByTestId('tax-label');
  }

  get total() {
    return this.page.getByTestId('total-label');
  }

  get confirmationHeader() {
    return this.page.getByTestId('complete-header');
  }

  async fillInformation(customer: Partial<CustomerInfo>): Promise<void> {
    await this.page.getByTestId('firstName').fill(customer.firstName ?? '');
    await this.page.getByTestId('lastName').fill(customer.lastName ?? '');
    await this.page.getByTestId('postalCode').fill(customer.postalCode ?? '');
  }

  async continue(): Promise<void> {
    await this.page.getByTestId('continue').click();
  }

  async cancel(): Promise<void> {
    await this.page.getByTestId('cancel').click();
  }

  async finish(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }

  async backToProducts(): Promise<void> {
    await this.page.getByTestId('back-to-products').click();
  }
}
