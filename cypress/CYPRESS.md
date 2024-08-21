# Cypress Testing

Cypress is being used for both end-to-end tests and component tests.

SEE: [README](../README.md) for instructions on setting up and running tests.

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
   - Ideally, tests should not rely on a previously created resource, and whenever possible, the test should create the resources it needs.
     - Create the resources in the test itself or in a `before` block, and clean them up in an `after` block.
   - If certain resources were created during deployment, those should not be deleted as part of the test runs.
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
   - Avoid using `cy.wait` as much as possible, especially with hardcoded wait values. Prefer to use `cy.get` with assertions.

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

4. **Resource Creation**:

   - Avoid creating resources in `beforeEach` or `before` blocks that are not used later in the `it` test block. For cases where the resource is not used during an `it` block, it is preferable to create a new `describe` block.

   **NOT TO DO Example**:

   ```javascript
   describe('Test Click Resource', () => {
     let resourceA;

     beforeEach(() => {
       cy.createResourceA().then((r) => {
         resourceA = r;
       });
     });

     it('click on the resource A button', () => {
       // Click on the Resource A button
       cy.getByDataCy('resource-a').should('contain', resourceA).click();
     });

     it('click on the resource B button', () => {
       // Click on the Resource B button
       cy.getByDataCy('resource-b').click();
     });
   });
   ```

   **TO DO Example**:

   ```javascript
   describe('Test Click Resource A', () => {
     let resourceA;

     beforeEach(() => {
       cy.createResourceA().then((r) => {
         resourceA = r;
       });
     });

     it('click on the resource A button', () => {
       // Click on the Resource A button
       cy.getByDataCy('resource-a').should('contain', resourceA).click();
     });
   });

   describe('Test Click Resource B', () => {
     it('click on the resource B button', () => {
       // Click on the Resource B button
       cy.getByDataCy('resource-b').click();
     });
   });
   ```

5. **Emulating User Interaction in Cypress Tests - no hardcoding URLs**
   Best Practices:
   Navigate Through UI Interactions: Whenever possible, simulate user interactions to navigate through the application rather than relying on cy.visit(). This approach allows you to maintain the application state and avoid unnecessary page reloads.

Use cy.visit() Sparingly: Reserve the use of cy.visit() for scenarios where reloading the page is necessary, such as testing initial page loads or navigating to a specific URL that cannot be reached through UI interactions.

Example:
Suppose you have a scenario where a user needs to navigate to the Team Access tab in Instance Groups. Instead of directly visiting the URL for Team Access, you can simulate the user journey by searching for the Instance Group, filtering the results, and then clicking on the Team Access tab.

```javascript
// Avoid using hardcoded URLs
cy.visit('/infrastructure/instance-groups/1974/team-access');

// use navigateTo command
cy.navigateTo('awx', 'instance-groups');

// Instead, simulate and navigate user interactions through UI interactions
// Simulate user searching for Instance Group
// if you are using a custom command to create a new instance group,
// grab the instance group object to access the instance group name

cy.filterTableBySingleSelect('name', instanceGroup.name);

// Simulate user clicking on the filtered Instance Group
cy.clickTableRowLink('name', instanceGroup.name, { disableFilter: true });

// Simulate user clicking on the Team Access tab
cy.clickTab('Team Access', true);
```

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

## AWX Cleanup during Tests

Many AWX resources have an organization, and if the organization is deleted, the resource gets deleted. By creating an organization at the start of the tests and using it with resources, then deleting the organization, most resources clean up.

There are a few cases where resources do not get cleaned up, such as when a project is syncing. Deleting the organization leaves the project around without an associated organization.

To handle this, the tests delete E2E organizations older than 2 hours. Then the other tests delete resources that do not have an organization. This makes the system eventually clean up the E2E resources.
