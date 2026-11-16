import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { createdBookingSchema, type CreatedBooking } from '../api/schemas';
import { buildBooking } from '../data/factories';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';

export interface TestOptions {
  /**
   * Username to start the test already signed in as. The session cookie is
   * injected straight into the browser context, so only the login tests pay
   * the cost of going through the login form.
   */
  authenticatedAs: string | null;
}

interface Fixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  bookingApi: BookingClient;
  /** A booking created before the test and deleted after it. */
  existingBooking: CreatedBooking;
}

export const test = base.extend<TestOptions & Fixtures>({
  authenticatedAs: [null, { option: true }],

  context: async ({ context, authenticatedAs, baseURL }, use) => {
    if (authenticatedAs) {
      await context.addCookies([
        { name: 'session-username', value: authenticatedAs, url: baseURL },
      ]);
    }
    await use(context);
  },

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),

  bookingApi: async ({ request }, use) => use(new BookingClient(request)),

  existingBooking: async ({ bookingApi }, use) => {
    const response = await bookingApi.createBooking(buildBooking());
    expect(response.status(), 'booking precondition should be created').toBe(200);
    const created = createdBookingSchema.parse(await response.json());

    await use(created);

    // Best-effort cleanup: the booking may already have been deleted by the test.
    await bookingApi.deleteBooking(created.bookingid);
  },
});

export { expect };
