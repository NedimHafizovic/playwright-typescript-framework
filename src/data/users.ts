import { env } from '../config/env';

export interface User {
  username: string;
  password: string;
}

const user = (username: string): User => ({ username, password: env.saucePassword });

/** Accounts provided by the Sauce Demo application. */
export const users = {
  standard: user('standard_user'),
  lockedOut: user('locked_out_user'),
  problem: user('problem_user'),
  performanceGlitch: user('performance_glitch_user'),
} as const;
