/// <reference types="cypress" />

import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../../frontend/awx/interfaces/User';

describe('User Tokens Actions', () => {
  let organization: Organization;
  let user: AwxUser;

  beforeEach(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxUser({ organization: organization.id }).then((testUser) => {
        user = testUser;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxUser(user, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it.skip('can create a read-only token, copy token to clipboard, and assert details page info', () => {
    //Assert being on the create token form
    //After creation, assert info on details page, including read-only
  });

  it.skip('can create a write-only token, copy token to clipboard, and assert details page info', () => {
    //Assert being on the create token form
    //After creation, assert info on details page, including write-only
  });

  it.skip('can create an oAuth application and use it to create a new user token, then view that token on the tokens tab of the oAuth application', () => {
    // User should create an Application that is set to Password type
    // Assert the Application details page info
    // Navigate to the Create token form, assert the page
    // User should then create a personal access token using that application, assert PAT details page info
    // Navigate to the oAuth tokens tab, assert the PAT showing there
  });

  it.skip('can delete a token and assert deletion', () => {
    //Use a token created in beforeEach hook
    //Assert the presence of the token
    //Assert being on the list view
    //After deletion, assert the deletion by intercepting the API response
  });

  it.skip('can delete a token from the details page and assert deletion', () => {
    //Use a token created in beforeEach hook
    //Assert the presence of the token
    //Assert being on the details page
    //After deletion, assert the deletion by intercepting the API response
  });

  it.skip('can bulk delete multiple tokens and assert deletion', () => {
    //Use a token created in beforeEach hook
    //Create one additional token within this test
    //Assert the presence of both tokens
    //After deletion, assert the deletion by intercepting the API response
  });

  it.skip('can verify that a user is only able to view tokens tab on their own user details page', () => {
    //Use a token created in beforeEach hook
    //Use the user created in the beforeEach hook
    //Assert the navigation to the user's details tab
    //Assert the navigation to the tokens tab of the logged in user
    //Navigate to the details page for the other user from the beforeEach hook
    //Assert that the tokens tab for that user is not visible
  });
});
