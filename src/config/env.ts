import 'dotenv/config';

/**
 * Single source of truth for environment-specific settings.
 * Every value has a default pointing at the public demo applications,
 * so the suite runs out of the box; override through `.env` or CI variables.
 */
export const env = {
  baseUrl: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com',
  saucePassword: process.env.SAUCE_PASSWORD ?? 'secret_sauce',
  bookerUsername: process.env.BOOKER_USERNAME ?? 'admin',
  bookerPassword: process.env.BOOKER_PASSWORD ?? 'password123',
  isCI: Boolean(process.env.CI),
} as const;
