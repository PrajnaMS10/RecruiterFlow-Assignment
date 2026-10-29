# QA Automation

A Playwright Test project that automates UI workflows on [SauceDemo](https://www.saucedemo.com) and API requests to [ReqRes](https://reqres.in) using TypeScript.

## Features

- Automated UI tests for login, locked-out users, and shopping cart functionality.
- API tests for retrieving, creating, and checking users.
- Reusable Login Page Object.
- Strict TypeScript configuration.
- HTML test reports, screenshots, and traces for debugging.
- Environment-based API key configuration.
- Independent UI and API test execution.

## Tech Stack

- Playwright Test
- TypeScript
- Node.js and npm
- SauceDemo
- ReqRes
- dotenv

## Prerequisites

- Node.js 18 or newer, preferably a supported LTS release.
- npm
- Git
- Internet access to reach SauceDemo and ReqRes.
- A ReqRes account and API key for API tests.

## Getting Started

### Installation

Clone the repository and navigate to the project directory:

```powershell
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git recruiterflow-qa
cd recruiterflow-qa
npm ci
npx playwright install chromium
```

Replace the repository URL with your GitHub repository URL.

### Configure the API Key

Sign in to [ReqRes](https://app.reqres.in) and obtain an API key with access to the required user endpoints.

Create a local environment file:

```powershell
Copy-Item .env.example .env
```

Open `.env` and add your API key:

```dotenv
REQRES_API_KEY=your_reqres_api_key
```

The API tests send the key using the `x-api-key` header. Keep `.env` private and never commit it to Git.

UI tests do not require an API key and can be run independently.

## Running Tests

Run all tests:

```powershell
npm test
```

Run only UI tests:

```powershell
npm run test:ui
```

Run only API tests:

```powershell
npm run test:api
```

Run UI tests in a visible browser:

```powershell
npm run test:headed
```

List tests without executing them:

```powershell
npm run test:list
```

Check TypeScript types:

```powershell
npm run typecheck
```

Generate and open the HTML report:

```powershell
npm run report
```

The combined suite contains eight tests across three files: five UI tests and three API tests.

## Test Scenarios

| Type | Scenario | Test File |
|---|---|---|
| UI | Log in as `standard_user` and verify the Products page | `tests/ui/login.spec.ts` |
| UI | Verify the locked-out user error | `tests/ui/login.spec.ts` |
| UI | Add a backpack and verify the cart badge | `tests/ui/cart.spec.ts` |
| API | GET `/api/users/2` and verify status and email | `tests/api/users.spec.ts` |
| API | POST `/api/users` and verify the created response | `tests/api/users.spec.ts` |
| UI | Remove the backpack and verify the cart badge disappears | `tests/ui/cart.spec.ts` |
| UI | Log out and verify the login page is displayed | `tests/ui/login.spec.ts` |
| API | GET `/api/users/23` and verify the 404 response | `tests/api/users.spec.ts` |

The login Page Object is implemented in `pages/LoginPage.ts` to reuse login actions and locators.

## Project Structure

```text
.
├── pages/
│   └── LoginPage.ts
├── tests/
│   ├── ui/
│   │   ├── login.spec.ts
│   │   └── cart.spec.ts
│   └── api/
│       └── users.spec.ts
├── playwright.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

## Design Decisions

- **Page Object Model:** Reusable login actions and locators are separated from test cases.
- **Independent tests:** Each UI test establishes its own login or cart state instead of relying on another test.
- **Reliable assertions:** Playwright's automatic waiting and retrying assertions are used instead of arbitrary delays.
- **API testing:** Playwright's request fixture sends real HTTP requests without mocking the target endpoints.
- **Environment configuration:** The ReqRes API key is loaded from `.env` and is not hardcoded in test files.
- **Failure debugging:** Screenshots and traces help investigate UI failures. API tracing is disabled to avoid capturing sensitive request headers.

## Troubleshooting

| Problem | Solution |
|---|---|
| Node.js or npm not recognized | Install Node.js and reopen the terminal. |
| PowerShell blocks npm commands | Use `npm.cmd` and `npx.cmd`. |
| Browser executable missing | Run `npx playwright install chromium`. |
| Missing API key | Create `.env` from `.env.example` and configure `REQRES_API_KEY`. |
| API returns 401 or 403 | Check the API key, account permissions, and current ReqRes documentation. |
| API rate limit exceeded | Wait before retrying. |
| UI test fails | Inspect the HTML report, screenshot, or trace. |

## Limitations

Tests depend on live third-party services and may be affected by service outages, rate limits, account restrictions, or changes to the target websites and APIs.

The project focuses on Chromium and the implemented test scenarios. It does not include checkout testing, cross-browser coverage, or CI/CD configuration.

