# Cypress Testing

Cypress is being used for both end-to-end tests and component tests.

SEE: [README](../README.md) for instructions on setting up and running tests

## Coverage

To get total coverage, run both e2e and component tests.

```bash
npm run cypress:run
```

Open the coverage report

```bash
npm run coverage
```

## End-to-End Tests Guidelines

End-to-End tests for our project are located in the `cypress/e2e` directory. The following guidelines are designed to ensure that our E2E tests are robust, maintainable, and effective.

### General Principles

1. **Test Isolation and Independence**:

   - Each test should be independent and capable of running on its own without relying on the state created by previous tests.
   - If during deployment certain resources were created, those should not be deleted as part of the test runs.
   - Avoid tests that require execution in a specific order.

2. **Environment**:

   - Tests should be executable in any environment without depending on the specific state of that environment.
   - Design tests to be environment-agnostic, ensuring they can run in development and production environments.

3. **Resource Management**:
   - Each test should create all necessary resources for its execution and clean them up after completion.
   - This includes data creation, user logins, and any other setup or teardown tasks.
   - Leveraging the `before` and `after` hooks in Cypress can help manage resource creation and cleanup.

### Test Implementation

1. **Element Selection**:

   - Prefer using data attributes (like `data-cy`) for selecting elements.
   - Avoid using CSS classes or IDs for element selection, as they can change frequently and are not unique.

2. **Asynchronous Operations**:

   - Properly handle the asynchronous nature of web applications, using Cypress's automatic waiting features or custom waits when necessary.
   - Avoid to use `cy.wait` as much as possible - mainly with hardcoded wait values, prefer to use `cy.get` with assertions.

   **Example**:

   ```javascript
   describe('User Profile Test', () => {
     it('loads user profiles asynchronously', () => {
       // Visit the user profile page
       cy.visit('/profiles');

       // Interact with an element that triggers an asynchronous operation
       cy.get('button.load-profiles').click();

       // Cypress automatically waits for the element to appear in the DOM
       cy.get('.profile-list').should('be.visible');

       // Assert on the elements loaded as a result of the asynchronous operation
       cy.get('.profile-list .profile-item').should('have.length', 5);

       // You can also wait for specific text to appear
       cy.contains('.profile-list', 'John Doe');

       // Asserting on elements that are expected to update
       cy.get('.profile-status').should('contain', 'Profiles Loaded');
     });
   });
   ```

3. **Test Data**:
   - Utilize dynamic data creation methods to avoid conflicts with existing data.

### Best Practices

1. **Descriptive Test Names and Comments**:

   - Write clear, descriptive names for test cases and suites.
   - Add comments to explain complex logic or important test steps.

2. **Security and Sensitive Data Handling**:

   - Be cautious with sensitive data in tests, using mock or anonymized data where possible.

3. **Performance Considerations**:
   - Keep tests efficient to minimize impact on the development and deployment process.

### Documentation and Collaboration

1. **Documentation of Custom Commands and Utilities**:

   - Document any Cypress [custom commands](./support/core-commands.ts) or utilities developed for the project.
   - Include usage examples and explanations of the purpose of each command.

2. **Team Collaboration**:
   - Keep the team informed about testing strategies and updates.
   - Encourage team members to contribute to the testing process and documentation.

By following these guidelines, our E2E tests will be more robust, reliable, and aligned with the best practices in automated testing.

## AWX Cleanup during tests

Many AWX resources have an organization and if the organization is deleted the resource gets deleted. By creating an organization at the start of the tests and using it with resources and then deleting the organization, most resources clean up.

There are a few cases where resources do not get cleaned up, such as when a project is syncing, deleting the organization leaves the project around without an associated organization.

To handle this, the tests delete E2E organizations older than 2 hours old. Then the other tests delete resources that do not have an organization. This makes the system eventually cleanup the E2E resources.
