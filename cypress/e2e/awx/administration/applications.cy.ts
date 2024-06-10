import { randomString } from '../../../../framework/utils/random-string';
import { Application } from '../../../../frontend/awx/interfaces/Application';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('Applications', () => {
  let app: Application;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxApplication().then((application: Application) => {
      app = application;
    });
  });

  afterEach(() => {
    cy.deleteAwxApplication(app.id.toString(), { failOnStatusCode: false });
  });

  describe('Applications- CRUD functionality- List View', () => {
    it(`can create a single application with grant type Authorization Code and client type Confidential, then delete from the list view`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      // Create OAuth application
      cy.navigateTo('awx', 'applications');
      cy.clickButton('Create OAuth application');
      cy.verifyPageTitle('Create OAuth application');
      cy.getByDataCy('name').type(appName);
      cy.getByDataCy('description').type(appDescription);
      cy.singleSelectByDataCy('organization', (this.globalOrganization as Organization).name);
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Authorization code');
      cy.selectDropdownOptionByResourceName('client-type', 'Confidential');
      cy.getByDataCy('redirect-uris').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create OAuth application');
      cy.wait('@createApp')
        .its('response.body')
        .then((newApplication: Application) => {
          cy.getModal().within(() => {
            cy.get('header').contains('Application information');
            cy.getByDataCy('name').should('have.text', newApplication.name);
            cy.get('button[aria-label="Close"]').click();
          });
          // Assert application details
          cy.getByDataCy('name').should('have.text', appName);
          cy.getByDataCy('description').should('have.text', appDescription);
          cy.getByDataCy('organization').should(
            'have.text',
            (this.globalOrganization as Organization).name
          );
          cy.getByDataCy('authorization-grant-type').should('have.text', 'authorization-code');
          cy.getByDataCy('client-type').should('have.text', 'confidential');
          // Delete application from the list view
          cy.clickTab(/^Back to OAuth Applications$/, true);
          cy.filterTableBySingleSelect('name', appName);
          cy.clickTableRowAction('name', appName, 'delete-application', {
            inKebab: true,
            disableFilter: true,
          });
          cy.clickModalConfirmCheckbox();
          cy.clickModalButton('Delete application');
          cy.assertModalSuccess();
          cy.clickModalButton('Close');
          cy.clickButton('Clear all filters');
        });
    });

    it(`can create a single application with grant type Password and client type Confidential`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      // Create OAuth application
      cy.navigateTo('awx', 'applications');
      cy.clickButton('Create OAuth application');
      cy.verifyPageTitle('Create OAuth application');
      cy.getByDataCy('name').type(appName);
      cy.getByDataCy('description').type(appDescription);
      cy.singleSelectByDataCy('organization', (this.globalOrganization as Organization).name);
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Password');
      cy.selectDropdownOptionByResourceName('client-type', 'Confidential');
      cy.getByDataCy('redirect-uris').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create OAuth application');
      cy.wait('@createApp')
        .its('response.body')
        .then((newApplication: Application) => {
          cy.getModal().within(() => {
            cy.get('header').contains('Application information');
            cy.getByDataCy('name').should('have.text', newApplication.name);
            cy.get('button[aria-label="Close"]').click();
          });
          // Assert application details
          cy.getByDataCy('name').should('have.text', appName);
          cy.getByDataCy('description').should('have.text', appDescription);
          cy.getByDataCy('organization').should(
            'have.text',
            (this.globalOrganization as Organization).name
          );
          cy.getByDataCy('authorization-grant-type').should('have.text', 'password');
          cy.getByDataCy('client-type').should('have.text', 'confidential');
          cy.deleteAwxApplication(newApplication.id.toString(), { failOnStatusCode: false });
        });
    });

    it(`can create a single application with grant type Password and client type Public`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      // Create OAuth application
      cy.navigateTo('awx', 'applications');
      cy.clickButton('Create OAuth application');
      cy.verifyPageTitle('Create OAuth application');
      cy.getByDataCy('name').type(appName);
      cy.getByDataCy('description').type(appDescription);
      cy.singleSelectByDataCy('organization', (this.globalOrganization as Organization).name);
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Password');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.getByDataCy('redirect-uris').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create OAuth application');
      cy.wait('@createApp')
        .its('response.body')
        .then((newApplication: Application) => {
          cy.getModal().within(() => {
            cy.get('header').contains('Application information');
            cy.getByDataCy('name').should('have.text', newApplication.name);
            cy.get('button[aria-label="Close"]').click();
          });
          // Assert application details
          cy.getByDataCy('name').should('have.text', appName);
          cy.getByDataCy('description').should('have.text', appDescription);
          cy.getByDataCy('organization').should(
            'have.text',
            (this.globalOrganization as Organization).name
          );
          cy.getByDataCy('authorization-grant-type').should('have.text', 'password');
          cy.getByDataCy('client-type').should('have.text', 'public');
          cy.deleteAwxApplication(newApplication.id.toString(), { failOnStatusCode: false });
        });
    });

    it('can edit an application with grant type password from client type confidential to public from the List View', function () {
      cy.navigateTo('awx', 'applications');
      cy.verifyPageTitle('OAuth Applications');
      cy.filterTableBySingleSelect('name', app.name);
      cy.clickTableRowAction('name', app.name, 'edit-application', {
        inKebab: true,
        disableFilter: true,
      });
      cy.intercept('PATCH', `api/v2/applications/*/`).as('editApp');
      // Edit application
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.clickButton('Save application');
      cy.wait('@editApp')
        .its('response.body')
        .then((newApplication: Application) => {
          // Assert the edited details
          cy.getByDataCy('name').should('have.text', app.name);
          cy.getByDataCy('description').should('have.text', newApplication.description);
          cy.getByDataCy('organization').should('have.text', 'Default');
          cy.getByDataCy('authorization-grant-type').should('have.text', 'password');
          cy.getByDataCy('client-type').should('have.text', 'public');
        });
    });
  });

  describe('Applications- Edit and Delete- Details View ', () => {
    it(`can create a single application with grant type Authorization Code and client type Public, then delete from Details view`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      cy.navigateTo('awx', 'applications');
      // Create OAuth Application
      cy.clickButton('Create OAuth application');
      cy.verifyPageTitle('Create OAuth application');
      cy.getByDataCy('name').type(appName);
      cy.getByDataCy('description').type(appDescription);
      cy.singleSelectByDataCy('organization', (this.globalOrganization as Organization).name);
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Authorization code');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.getByDataCy('redirect-uris').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create OAuth application');
      cy.wait('@createApp')
        .its('response.body')
        .then((newApplication: Application) => {
          cy.getModal().within(() => {
            cy.get('header').contains('Application information');
            cy.getByDataCy('name').should('have.text', newApplication.name);
            cy.get('button[aria-label="Close"]').click();
          });
          // Assert application details
          cy.getByDataCy('name').should('have.text', appName);
          cy.getByDataCy('description').should('have.text', appDescription);
          cy.getByDataCy('organization').should(
            'have.text',
            (this.globalOrganization as Organization).name
          );
          cy.getByDataCy('authorization-grant-type').should('have.text', 'authorization-code');
          cy.getByDataCy('client-type').should('have.text', 'public');
          // Delete from Details View
          cy.clickButton('Delete application');
          cy.clickModalConfirmCheckbox();
          cy.intercept('DELETE', awxAPI`/applications/${newApplication.id.toString()}/`).as(
            'deletedApp'
          );
          cy.clickModalButton('Delete application');
          cy.wait('@deletedApp').then((deletedApp) => {
            expect(deletedApp?.response?.statusCode).to.eql(204);
          });
        });
    });

    it('can edit an application with grant type Password from client type Confidential to Public from the Details View', function () {
      cy.navigateTo('awx', 'applications');
      cy.filterTableBySingleSelect('name', app.name);
      // Navigate to Details View
      cy.clickTableRowLink('name', app.name, { disableFilter: true });
      cy.verifyPageTitle(app.name);
      // Assert application details
      cy.getByDataCy('name').should('have.text', app.name);
      cy.getByDataCy('description').should('have.text', app.description);
      cy.getByDataCy('organization').should('have.text', 'Default');
      cy.getByDataCy('authorization-grant-type').should('have.text', 'password');
      cy.getByDataCy('client-type').should('have.text', 'confidential');
      // Edit application
      cy.clickButton('Edit application');
      cy.intercept('PATCH', `api/v2/applications/*/`).as('editApp');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.clickButton('Save application');
      cy.wait('@editApp')
        .its('response.body.client_type')
        .then((client_type: string) => {
          // Assert edited details
          expect(client_type).to.eql('public');
          cy.getByDataCy('client-type').should('have.text', 'public');
        });
    });
  });

  describe('Applications- Tokens', () => {
    //These tests are dependent on https://issues.redhat.com/browse/AAP-22268
    //add a beforeEach hook here that has a custom command to create 2 user tokens
    it.skip('can verify token creation', function () {
      //Initially, assert that the user can create an application but doesn't have access
      //Have the user create the token and assert the creation
      //Assert that the new token gives the user access to the application
    });
    it.skip('can verify the deletion of a single token', function () {
      //Use one of the tokens created in the beforeEach hook
      //Assert the info of the token
      //Assert the token deletion
    });
    it.skip('can verify bulk deletion of tokens', function () {
      //Use the tokens created in the beforeEach hook
      //Assert the info of the tokens
      //Assert bulk deletion of the tokens
    });
  });
});
