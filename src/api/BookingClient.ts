import type { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { authTokenSchema, type Booking } from './schemas';

/**
 * Thin, typed wrapper around the Restful-Booker endpoints.
 * Methods return the raw `APIResponse` so tests can assert on status codes
 * for both happy and negative paths.
 */
export class BookingClient {
  private token?: string;

  constructor(private readonly request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  createToken(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  /** Logs in with the configured admin account and caches the token. */
  async authenticate(): Promise<string> {
    if (!this.token) {
      const response = await this.createToken(env.bookerUsername, env.bookerPassword);
      this.token = authTokenSchema.parse(await response.json()).token;
    }
    return this.token;
  }

  listBookingIds(filters: Partial<Pick<Booking, 'firstname' | 'lastname'>> = {}) {
    return this.request.get('/booking', { params: filters });
  }

  getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  createBooking(booking: Booking): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  async updateBooking(id: number, booking: Booking, { auth = true } = {}) {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: await this.authHeaders(auth),
    });
  }

  async patchBooking(id: number, changes: Partial<Booking>, { auth = true } = {}) {
    return this.request.patch(`/booking/${id}`, {
      data: changes,
      headers: await this.authHeaders(auth),
    });
  }

  async deleteBooking(id: number, { auth = true } = {}) {
    return this.request.delete(`/booking/${id}`, { headers: await this.authHeaders(auth) });
  }

  private async authHeaders(auth: boolean): Promise<Record<string, string>> {
    return auth ? { Cookie: `token=${await this.authenticate()}` } : {};
  }
}
