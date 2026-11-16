import {
  bookingIdListSchema,
  bookingSchema,
  createdBookingSchema,
  type Booking,
} from '../../src/api/schemas';
import { buildBooking } from '../../src/data/factories';
import { expect, test } from '../../src/fixtures/test';

test.describe('Booking API', () => {
  test(
    'booking lifecycle: create, read, update, delete',
    { tag: '@smoke' },
    async ({ bookingApi }) => {
      const booking = buildBooking();
      let bookingId = 0;

      await test.step('create', async () => {
        const response = await bookingApi.createBooking(booking);
        expect(response.status()).toBe(200);

        const created = createdBookingSchema.parse(await response.json());
        expect(created.booking).toEqual(booking);
        bookingId = created.bookingid;
      });

      await test.step('read', async () => {
        const response = await bookingApi.getBooking(bookingId);
        expect(response.status()).toBe(200);
        expect(bookingSchema.parse(await response.json())).toEqual(booking);
      });

      await test.step('update', async () => {
        const replacement = buildBooking({ additionalneeds: 'Dinner' });
        const response = await bookingApi.updateBooking(bookingId, replacement);
        expect(response.status()).toBe(200);
        expect(bookingSchema.parse(await response.json())).toEqual(replacement);
      });

      await test.step('delete', async () => {
        const response = await bookingApi.deleteBooking(bookingId);
        expect(response.status()).toBe(201);
        expect((await bookingApi.getBooking(bookingId)).status()).toBe(404);
      });
    },
  );

  test(
    'partial update changes only the given fields',
    { tag: '@regression' },
    async ({ bookingApi, existingBooking }) => {
      const changes = { firstname: 'Updated', totalprice: 999 };

      const response = await bookingApi.patchBooking(existingBooking.bookingid, changes);

      expect(response.status()).toBe(200);
      expect(bookingSchema.parse(await response.json())).toEqual({
        ...existingBooking.booking,
        ...changes,
      });
    },
  );

  test(
    'bookings can be filtered by guest name',
    { tag: '@regression' },
    async ({ bookingApi, existingBooking }) => {
      const { firstname, lastname } = existingBooking.booking;

      const response = await bookingApi.listBookingIds({ firstname, lastname });

      expect(response.status()).toBe(200);
      const ids = bookingIdListSchema.parse(await response.json());
      expect(ids).toContainEqual({ bookingid: existingBooking.bookingid });
    },
  );

  test(
    'listing returns booking ids matching the contract',
    { tag: '@regression' },
    async ({ bookingApi }) => {
      const response = await bookingApi.listBookingIds();

      expect(response.status()).toBe(200);
      expect(bookingIdListSchema.safeParse(await response.json()).success).toBe(true);
    },
  );

  test.describe('negative paths', { tag: '@regression' }, () => {
    test('unknown booking returns 404', async ({ bookingApi }) => {
      const response = await bookingApi.getBooking(999_999_999);

      expect(response.status()).toBe(404);
    });

    test('update without a token is forbidden', async ({ bookingApi, existingBooking }) => {
      const response = await bookingApi.updateBooking(existingBooking.bookingid, buildBooking(), {
        auth: false,
      });

      expect(response.status()).toBe(403);

      const unchanged = await bookingApi.getBooking(existingBooking.bookingid);
      expect(await unchanged.json()).toEqual(existingBooking.booking);
    });

    test('delete without a token is forbidden', async ({ bookingApi, existingBooking }) => {
      const response = await bookingApi.deleteBooking(existingBooking.bookingid, { auth: false });

      expect(response.status()).toBe(403);
      expect((await bookingApi.getBooking(existingBooking.bookingid)).status()).toBe(200);
    });

    test('booking with a missing required field is rejected', async ({ request }) => {
      const incomplete: Partial<Booking> = buildBooking();
      delete incomplete.firstname;

      const response = await request.post('/booking', { data: incomplete });

      expect(response.ok()).toBe(false);
    });
  });
});
