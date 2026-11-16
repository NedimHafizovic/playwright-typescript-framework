import { authTokenSchema } from '../../src/api/schemas';
import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures/test';

test.describe('Auth API', () => {
  test('health check responds', { tag: '@smoke' }, async ({ bookingApi }) => {
    const response = await bookingApi.ping();

    expect(response.status()).toBe(201);
  });

  test('issues a token for valid credentials', { tag: '@smoke' }, async ({ bookingApi }) => {
    const response = await bookingApi.createToken(env.bookerUsername, env.bookerPassword);

    expect(response.status()).toBe(200);
    expect(authTokenSchema.safeParse(await response.json()).success).toBe(true);
  });

  test('rejects invalid credentials', { tag: '@regression' }, async ({ bookingApi }) => {
    const response = await bookingApi.createToken(env.bookerUsername, 'wrong-password');

    expect(await response.json()).toEqual({ reason: 'Bad credentials' });
  });
});
