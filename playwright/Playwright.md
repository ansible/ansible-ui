# Playwright

[Playwright](https://playwright.dev/) is a powerful end-to-end testing framework designed to automate web browsers for testing web applications across various platforms and devices. It allows you to write reliable and scalable tests that mimic real user interactions, ensuring your application's UI behaves as expected. With Playwright, you can test modern web apps with ease by leveraging features like auto-waiting, browser isolation, and cross-browser support, making it an ideal tool for delivering high-quality, bug-free user experiences.

## Ansible Testing

Goals

- End-to-end tests that can validate the platform for all supported configurations.
- Pull request testing to validate the code changes do not break the platform.

Solution

- End-to-end tests that are run nightly against all supported configurations.
- Pull requests run the same tests against a mock API implementation.

## Getting Started

1. **Install Playwright & Browsers**

   Playwright is installed as part of `npm ci` at the root of the repo.

   Playwright browsers are not installed as part of that, so the following needs to be run:

   ```bash
   npx playwright install
   ```

   Fedora users may also need to run this command:

   ```bash
   npm init playwright@latest
   ```

2. **Add the VSCode plugin for Playwright**

   [Link to Plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

3. **Setup environment variable by creating a `.env` file in the `/playwright` directory**

   Playwright will pickup environment variable from your enviroment,
   but if you woulld like to override them you can create a `.env`
   file in the playwright directory.

   ```bash
   PLATFORM_UI=https://localhost:4100
   PLATFORM_USERNAME=username
   PLATFORM_PASSWORD=password
   ```

   > Why PLATFORM_UI vs PLATFORM_SERVER?
   >
   > Playwright runs against a UI that might not be the same as the API server. Having a new variable PLATFORM_UI keeps existing developers from running into issues with PLATFORM_SERVER which is pointed at the server API.
   >
   > For nightly runs PLATFORM_UI will be pointed at a PLATFORM_SERVER to run tests.
   
   Additionally, for Ansible Lightspeed UI testing, the environment variable "LIGHTSPEED_SERVER" is required,
   In case the environment LIGHTSPEED_SERVER is not supplied the related tests are skipped. 

   ```bash
   LIGHTSPEED_SERVER=https://localhost:8447
   ```
 
4. **Run the Platform UI**

   When running against a local UI, you need to have the local UI running.
   Playwright will run much better against a production build.
   While `npm start` will work, `npm serve` will use a production build.

   ```bash
   cd platform
   npm run serve
   ```

5. **Run Playwright tests.**

   Either

   - Run the tests from the VSCode test explorer
   - or run from the CLI
     ```
     cd playwright
     npm run mock
     ```

### NPM scripts

|   Script | Description                       |
| -------: | --------------------------------- |
|     mock | Run tests against a mock API.     |
|     live | Run tests against a live server.  |
| coverage | Open the coverage report.         |
|    clean | Cleanup all tha old test results. |

### Tags

Tests should be tagged based on their capabilities. Tags are built into playwright and different playwright projects (i.e. "mock chromium") will default to the right flags.

|       Tag | Description                                                          |
| --------: | -------------------------------------------------------------------- |
| @not_mock | This test should not run when testing against the mock API           |
|  @upgrade | This test should only run against a server that is setup for upgrade |
|    @tier1 | This test runs in the Tier 1 Jenkins nightly pipeline (green-path customer scenarios) |
|   @visual | Visual regression test (excluded from Jenkins runs via `NOT_TAGS`)   |

### Tier 1 Tagging Convention

The `@tier1` tag follows an **opt-in model**: only tests tagged with `@tier1` run in the Tier 1 Jenkins pipeline. Tests without this tag still run in pre-merge (ephemeral) workflows, which execute the full suite.

**When to use `@tier1`:** Tag tests that validate green-path customer scenarios -- core workflows that every AAP customer would perform (create/edit/delete resources, RBAC assignments, auth setup, license checks).

**When NOT to use `@tier1`:** Do not tag form validation, cancel buttons, redundant CRUD paths (same operation from different UI entry points), bulk operations, or static content checks. These are valuable but belong in pre-merge testing only.

**How to tag:**

```typescript
// Add @tier1 alongside any existing tags
test('should create an organization', { tag: ['@not_mock', '@tier1'] }, async ({ page }) => {
  // ...
});

// @tier1 alone (for tests that also run against mock)
test('should toggle a feature flag', { tag: ['@tier1'] }, async ({ page }) => {
  // ...
});
```

**Environment variable filtering:** The `TAGS` and `NOT_TAGS` environment variables control which tags are included or excluded. In `playwright.config.ts`, `TAGS` maps to the `grep` option and `NOT_TAGS` maps to `grepInvert`. When `TAGS` is empty or unset, all tests run (no filtering).

```bash
# Run only @tier1 tests (used in Jenkins Tier 1 pipeline)
TAGS=@tier1 npm run live

# Exclude visual tests (used in all Jenkins runs)
NOT_TAGS=@visual npm run live

# Both can be combined
TAGS=@tier1 NOT_TAGS=@visual npm run live
```

### Developer Experience

VSCode has a test explorer built in. Any testing frameworks that implement support for the test explorer can integrate right with VSCode. This allows running and working with tests right from VSCode. Playwright has a [VSCode plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) developers should install.

In the VSCode test explorer, developers can select "projects" to run the tests. There are several browsers available. More importantly, we have extended the projects to support use a mock API implementation. Developers need to get both the live API and the mock API working for their tests. This will involve running against a live server and enhancing the mock to support their tests. Only mock will be used for testing pull requests. Nightly runs will run the tests against live servers.

Playwright also has support for generating tests by interacting with the UI while playwright records the test commands. Developers should explore this functionality.

## Best Practices

Playwright tests should closely mimic how users interact with your UI. This ensures that the tests are intuitive and robust, focusing on UI behavior rather than underlying implementation details.

Follow the best practices suggested [here](https://docs.cypress.io/guides/references/best-practices).

1. **Helper functions should always include a relevant assertion**

2. **All helper functions should include JS docs**

   Docs should include:

   - short description of what the function does
   - example of how to use the function
   - parameter descriptions

3. **Helper functions that create a child resource should include the creation of the parent resource as well**

4. **Assertions**

   - Avoid assertion redundancy
   - Make sure relevant assertions are utilized strategically

5. **Filter a list in the UI and assert text showing**

   Example of best implementation:

   ```js
   await expect(page.locator('tr', { hasText: resourceName })).toBeVisible();
   ```

6. **Test the UI Like a User**

   Ensure that tests simulate user interactions rather than internal mechanics like API calls or database operations.

7. **Use Labels for Interactions**

   Users interact with the UI via labels, buttons, and visual elements—so should your tests.

   Best Practice: Every input element must have an associated label, and tests should use labels to find and interact with inputs.

   ```js
   await page.getByLabel('Username').fill('user1');
   await page.getByLabel('Password').fill('secret');
   await page.getByRole('button', { name: 'Login' }).click();
   ```

8. **Ignore API Requests and Responses**

   Users are unaware of backend operations like API requests; they focus solely on what they see.

   Best Practice: Do not test for API calls or responses in UI tests. Focus instead on verifying the visible changes in the UI.

   ```js
   // Don't do this:
   expect(apiCall).toHaveBeenMade();

   // Do this instead:
   await expect(page).toHaveText('Welcome, user1!');
   ```

9. **Check UI State After Actions**

   Users validate actions by checking the changes in the UI, such as new content, messages, or redirects.

   Best Practice: Always validate that the UI reflects the desired result of the user action.

   ```js
   // After a form submission, check the UI state, not API responses
   await expect(page.getByText('Submission successful')).toBeVisible();
   ```

10. **Be User-Centric**

Avoid relying on technical aspects such as element IDs or class names for interactions.
Prioritize tests that reflect the user's journey and behavior.

11. **Skipping Tests Correctly**

`test.skip()` must be called in the correct context to work properly. Calling it inside `test.beforeEach()` does **NOT** work as expected.

**❌ Wrong - Skip in beforeEach (doesn't work):**

```js
test.beforeEach(async ({ page }) => {
  if (getTopologyType() === TOPOLOGY_SAAS) {
    test.skip(true, 'Not available on SaaS'); // This won't skip the test!
    return;
  }
});
```

**✅ Correct - Skip in beforeAll (skips all tests in describe block):**

```js
test.beforeAll(() => {
  if (isTopology(TOPOLOGY_SAAS, TOPOLOGY_AZURE)) {
    test.skip(true, 'Not available on SaaS/Azure deployments');
  }
});
```

**✅ Correct - Skip at the start of individual tests:**

```js
test('my test', async ({ page }) => {
  if (isSaaS()) {
    test.skip();
    return;
  }
  // ... test code
});
```

Use `beforeAll` when you want to skip all tests in a describe block based on a condition. Use the per-test approach when only specific tests need to be skipped.

## Topology Detection

AAP Playwright tests support different deployment topologies (SaaS, Azure, OCP-A, etc.). Use the `AAP_TOPOLOGY_TYPE` environment variable to specify the deployment type.

### Environment Variable

Set `AAP_TOPOLOGY_TYPE` in `/playwright/.env`:

```bash
# Valid values: 'saas', 'azure', 'ocp-a'
# This is set by the CI/CD pipeline
AAP_TOPOLOGY_TYPE=saas
```

### Usage in Tests

```typescript
import { TOPOLOGY_SAAS, TOPOLOGY_AZURE } from '@ansible/playwright/commands/constants';
import { getTopologyType, isTopology, isSaaS, isAzure, isOcpA } from '@ansible/playwright/commands/getTopologyType';

// Skip for specific topology
test.beforeAll(() => {
  if (getTopologyType() === TOPOLOGY_SAAS) {
    test.skip(true, 'Not available on SaaS');
  }
});

// Skip for multiple topologies (using helper)
test.beforeAll(() => {
  if (isTopology(TOPOLOGY_SAAS, TOPOLOGY_AZURE)) {
    test.skip(true, 'Not available on SaaS or Azure');
  }
});

// Individual helper functions
if (isSaaS()) { /* Skip on SaaS */ }
if (isAzure()) { /* Skip on Azure */ }
if (isOcpA()) { /* Skip on OCP-A */ }
```

**Available constants:**
- `TOPOLOGY_SAAS` - AWS SaaS deployment (`'saas'`)
- `TOPOLOGY_AZURE` - Azure cloud deployment (`'azure'`)
- `TOPOLOGY_OCP_A` - OpenShift deployment (`'ocp-a'`)
- `TOPOLOGY_UNKNOWN` - Unknown or local/RPM deployment (`''`)

**Helper functions:**
- `getTopologyType()` - Returns the current topology type string
- `isSaaS()` - Returns true if topology is SaaS
- `isAzure()` - Returns true if topology is Azure
- `isOcpA()` - Returns true if topology is OCP-A
- `isTopology(...types)` - Returns true if topology matches any of the provided types

## Feature Flags

The behavior of certain UI elements depends on whether a feature flag is enabled on the server.
Take care that Playwright tests don't rely on an environment that has a feature flag with a specific value.
Take the following steps when testing feature-flag-dependent UI:

- When possible, test feature flag behavior in lower level tests (unit tests or component tests) that use a mocked API.
- In playwright, it may make sense to isolate feature-flag specific assertions in their own tests.
  Check the server response to see if the feature flag is set, and skip/pass the test if it is off.
- Don't mock feature flag API responses when a test is being run against a live server.

Tests should be stable when run against a mock server, a live server with the flag enabled, and a live server with the flag disabled.

## Troubleshooting

1. **Check Playwright version**

   ```bash
   npx playwright --version
   ```
