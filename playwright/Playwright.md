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

|   Script | Description                                 |
| -------: | ------------------------------------------- |
|     mock | Run tests against a mock API.               |
|     live | Run tests against a live server.            |
|   allure | Generate a local allure report and open it. |
| coverage | Open the coverage report.                   |
|    clean | Cleanup all tha old test results.           |

### Tags

Tests should be tagged based on their capabilities. Tags are built into playwright and different playwright projects (i.e. "mock chromium") will default to the right flags.

|       Tag | Description                                                          |
| --------: | -------------------------------------------------------------------- |
| @not_mock | This test should not run when testing against the mock API           |
| @not_live | This test should not run when testing against a live API             |
|  @upgrade | This test should only run against a server that is setup for upgrade |

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
Prioritize tests that reflect the user’s journey and behavior.

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
