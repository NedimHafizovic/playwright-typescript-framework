# Playwright + TypeScript Test Automation Framework

[![Playwright Tests](https://github.com/NedimHafizovic/playwright-typescript-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/NedimHafizovic/playwright-typescript-framework/actions/workflows/playwright.yml)
![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

An end-to-end test automation framework covering **UI** and **REST API** testing in a single
codebase. It is built the way I would set up automation for a real product team: readable
tests, a strict separation between test intent and page mechanics, generated test data,
contract validation and a CI pipeline that runs everything on every push.

| Layer | Application under test                                     | What is covered                                              |
| ----- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| UI    | [Sauce Demo](https://www.saucedemo.com) web store          | Login, catalogue sorting, shopping cart, checkout end to end |
| API   | [Restful-Booker](https://restful-booker.herokuapp.com) API | Auth, booking CRUD lifecycle, filtering, negative paths      |

## Highlights

- **Page Object Model with components** – pages extend a `BasePage`; shared UI such as the
  header is a reusable component, so a selector lives in exactly one place.
- **Custom fixtures** – tests receive ready-to-use page objects and API clients through
  Playwright fixtures instead of constructing them by hand.
- **Authentication without the login form** – an `authenticatedAs` option injects the session
  cookie into the browser context. Only the login tests go through the login UI, which keeps
  the rest of the suite fast and independent.
- **Self-cleaning API preconditions** – the `existingBooking` fixture creates a booking before
  a test and deletes it afterwards.
- **Contract testing** – API responses are validated at runtime against [Zod](https://zod.dev)
  schemas, and the same schemas provide the TypeScript types.
- **Generated test data** – customers and bookings come from factories built on
  [Faker](https://fakerjs.dev), with overrides for the fields a test cares about.
- **No hard-coded expectations** – sort orders and order totals (including tax) are calculated
  from a product catalogue that acts as the test oracle.
- **Data-driven tests** – invalid logins, sort options and required-field validation are
  generated from tables.
- **Cross-browser and mobile** – Chromium, Firefox, WebKit and an emulated Pixel 7.
- **CI/CD** – GitHub Actions runs lint, type-check and formatting gates, then one parallel job
  per browser/API project, and publishes HTML reports, traces and videos as artifacts.
- **Code quality** – strict TypeScript, ESLint (with `eslint-plugin-playwright`) and Prettier.

## Project structure

```
├── .github/workflows/playwright.yml   # CI pipeline
├── playwright.config.ts               # Projects, reporters, retries, tracing
├── src
│   ├── api
│   │   ├── BookingClient.ts           # Typed client for the Restful-Booker API
│   │   └── schemas.ts                 # Zod response contracts + inferred types
│   ├── config/env.ts                  # Environment configuration with defaults
│   ├── data
│   │   ├── factories.ts               # Faker-based test data builders
│   │   ├── products.ts                # Product catalogue, sorting and totals oracle
│   │   └── users.ts                   # Test accounts
│   ├── fixtures/test.ts               # Extended `test` with page objects and API fixtures
│   └── pages
│       ├── BasePage.ts
│       ├── LoginPage.ts
│       ├── InventoryPage.ts
│       ├── CartPage.ts
│       ├── CheckoutPage.ts
│       └── components/Header.ts
└── tests
    ├── api
    │   ├── auth.spec.ts
    │   └── booking.spec.ts
    └── ui
        ├── login.spec.ts
        ├── inventory.spec.ts
        ├── cart.spec.ts
        └── checkout.spec.ts
```

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/NedimHafizovic/playwright-typescript-framework.git
cd playwright-typescript-framework
npm ci
npx playwright install --with-deps
```

The suite runs against the public demo applications out of the box. To point it at another
environment, copy `.env.example` to `.env` and change the values.

## Running tests

| Command                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `npm test`                | Run everything (all browsers + API)              |
| `npm run test:ui`         | UI tests on all browsers                         |
| `npm run test:api`        | API tests only                                   |
| `npm run test:chromium`   | UI tests on Chromium only                        |
| `npm run test:smoke`      | Tests tagged `@smoke`                            |
| `npm run test:regression` | Tests tagged `@regression`                       |
| `npm run test:headed`     | Chromium with a visible browser                  |
| `npm run test:debug`      | Step through tests with the Playwright Inspector |
| `npm run ui-mode`         | Playwright UI mode (watch, time-travel)          |
| `npm run report`          | Open the last HTML report                        |

Quality gates: `npm run typecheck`, `npm run lint`, `npm run format:check`.

## What a test looks like

Tests read as a description of behaviour; the mechanics live in page objects and fixtures.

```ts
test.use({ authenticatedAs: users.standard.username });

test('customer can complete a purchase', { tag: '@smoke' }, async ({ checkoutPage, page }) => {
  const summary = orderSummary(order);

  await test.step('enter customer information', async () => {
    await checkoutPage.fillInformation(buildCustomer());
    await checkoutPage.continue();
  });

  await test.step('review order and totals', async () => {
    await expect(checkoutPage.total).toHaveText(`Total: $${summary.total}`);
  });

  await test.step('place the order', async () => {
    await checkoutPage.finish();
    await expect(checkoutPage.confirmationHeader).toHaveText('Thank you for your order!');
  });
});
```

## Reporting and debugging

- An **HTML report** is generated on every run (`npm run report`).
- On failure the framework keeps a **screenshot** and **video**; a **trace** is recorded on
  the first retry and can be opened with `npx playwright show-trace <trace.zip>`.
- In CI, reports are uploaded as artifacts for each project and JUnit XML is produced for
  integration with other tools.

## Continuous integration

The [workflow](.github/workflows/playwright.yml) runs on every push and pull request to `main`
and can be started manually:

1. **Lint & type-check** – TypeScript, ESLint and Prettier must pass before any test runs.
2. **Test matrix** – `chromium`, `firefox`, `webkit`, `mobile-chrome` and `api` run as separate
   parallel jobs, each installing only the browser it needs.
3. **Artifacts** – the HTML report is always uploaded; traces and videos are uploaded on failure.

Tests retry twice in CI to absorb the occasional hiccup of the public demo environments.

## Design decisions

- **Locators** use the application's `data-test` attributes (configured as Playwright's test id)
  and accessible roles, never CSS chains or XPath tied to layout.
- **Assertions stay in tests.** Page objects expose locators and actions; tests decide what is
  expected. Web-first assertions (`expect(locator)`) handle waiting, so there are no manual
  sleeps anywhere.
- **Tests are independent** and run fully in parallel: each one gets a fresh browser context
  and creates the data it needs.

## License

[MIT](LICENSE)
