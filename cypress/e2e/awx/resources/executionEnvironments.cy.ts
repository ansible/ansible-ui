// import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('Execution Environments', () => {
  //   let organization: Organization;

  before(function () {
    cy.awxLogin();
  });

  beforeEach(function () {
    //Add the following dependencies:
    //Execution Environment
    //Organization
    //Registry Credential
    //Normal user tied to the organization
    //Job template
  });

  afterEach(function () {
    //Cleanup:
    //Execution Environment
    //Organization
    //Registry Credential
    //Normal user
  });

  describe('Execution Environments: List View', () => {
    it.skip('can create a new globally available EE from the list view, assert info on details page, then navigate to EE list and delete the EE', function () {
      //Assert EE list
      //Assert certain form fields on EE create form
      //Assert info on details page after EE is created
      //Assert deletion of EE from list view
    });

    it.skip('can create a new EE associated to a particular org, assign admin access to a user in that org, and login as that user to assert access to the EE', function () {
      //This test needs the org and user, create them in the beforeEach block
      //Assert that the EE is created with the particular Org
      //Assert info on details page after EE is created
      //Assert the assignment of the normal user as an admin user of the EE
      //Logout and login as normal user, assert their access to the EE
    });

    it.skip('can create a new EE associated to a particular org, then visit the EE tab inside the org to view the EE and assert info', function () {
      //NOTE: the development for this has not been completed yet
      //This test needs the org and user, create them in the beforeEach block
      //Create the EE with the org populated in the form
      //Assert info on details page after EE is created
      //Navigate to the org, then to the EE tab of the org, and assert that the EE is visible
      //Cleanup the EE created in this test
    });

    it.skip('can edit an EE from the list view and assert edited information', function () {
      //Use the EE created in the beforeEach block
      //Assert the Edit form of the EE
      //Assert the Edited info after Save by intercepting the PATCH request
    });

    it.skip('can bulk delete multiple EEs from the list view and assert deletion', function () {
      //Use the EE created in the beforeEach block
      //Add a command at the beginning of this test to create an additional EE
      //Assert the presence of the two EEs in the list view
      //Assert the deletion of both following the DELETE request
    });
  });

  describe('Execution Environments: Details View', () => {
    it.skip('can edit an EE from the details view and assert edited information on details page', function () {
      //Use the EE created in the beforeEach block
      //Assert the Edit form of the EE
      //Assert the Edited info after Save by intercepting the PATCH request
    });

    it.skip('can create a new EE using a designated registry cred, assert that the cred is associated, and delete the EE', function () {
      //NOTE: the development for this has not been completed yet
      //This test needs the registry credential, create it in the beforeEach block
      //Assert that the EE is created with the particular credential
      //Assert info on details page after EE is created
      //Delete the EE from the details page and assert deletion
    });
  });

  describe('Execution Environments: Templates View', () => {
    it.skip('can create a new JT using the existing EE, visit the templates tab of the EE to view the JT, then delete the JT', function () {
      //Use the EE created in the beforeEach block
      //Assert that the JT has the EE associated to it after manually creating the JT
      //Assert that the JT appears on the Templates tab of the EE
      //Delete the JT and assert the deletion
    });
  });
});
