import { users } from '../../src/data/users';
import { expect, test } from '../../src/fixtures/test';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'standard user can sign in',
    { tag: '@smoke' },
    async ({ loginPage, inventoryPage, page }) => {
      await loginPage.login(users.standard.username, users.standard.password);

      await expect(page).toHaveURL(/inventory\.html/);
      await expect(inventoryPage.title).toHaveText('Products');
    },
  );

  const invalidLogins = [
    {
      scenario: 'locked out user',
      username: users.lockedOut.username,
      password: users.lockedOut.password,
      error: 'Sorry, this user has been locked out.',
    },
    {
      scenario: 'wrong password',
      username: users.standard.username,
      password: 'not-the-password',
      error: 'Username and password do not match any user in this service',
    },
    {
      scenario: 'missing username',
      username: '',
      password: users.standard.password,
      error: 'Username is required',
    },
    {
      scenario: 'missing password',
      username: users.standard.username,
      password: '',
      error: 'Password is required',
    },
  ];

  for (const { scenario, username, password, error } of invalidLogins) {
    test(`shows an error for ${scenario}`, { tag: '@regression' }, async ({ loginPage, page }) => {
      await loginPage.login(username, password);

      await expect(loginPage.errorMessage).toContainText(error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test(
    'protected pages are not reachable without a session',
    { tag: '@regression' },
    async ({ inventoryPage, loginPage }) => {
      await inventoryPage.goto();

      await expect(loginPage.errorMessage).toContainText(
        "You can only access '/inventory.html' when you are logged in.",
      );
      await expect(loginPage.loginButton).toBeVisible();
    },
  );
});

test.describe('Logout', () => {
  test.use({ authenticatedAs: users.standard.username });

  test('user can sign out', { tag: '@smoke' }, async ({ inventoryPage, loginPage, page }) => {
    await inventoryPage.goto();
    await inventoryPage.header.logout();

    await expect(loginPage.loginButton).toBeVisible();

    await test.step('session is cleared', async () => {
      await inventoryPage.goto();
      await expect(loginPage.errorMessage).toBeVisible();
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  });
});
