import { randomString } from '../../../../framework/utils/random-string';
import { Application } from '../../../../frontend/awx/interfaces/Application';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe.skip('Applications', () => {
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
      cy.navigateTo('awx', 'applications');
      cy.clickButton('Create application');
      cy.verifyPageTitle('Create Application');
      cy.get('[data-cy="name"]').type(appName);
      cy.get('[data-cy="description"]').type(appDescription);
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Authorization code');
      cy.selectDropdownOptionByResourceName('client-type', 'Confidential');
      cy.get('[data-cy="redirect-uris"]').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create application');
      cy.wait('@createApp')
        .its('response.body')
        .then((response: Application) => {
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.get('header').contains('Application information');
          });
          cy.get('button[aria-label="Close"]').click();
          cy.getByDataCy('name').should('contain', appName);
          cy.getByDataCy('description').should('contain', appDescription);
          cy.getByDataCy('authorization-grant-type').should('contain', 'authorization-code');
          cy.getByDataCy('client-type').should('contain', 'confidential');
          cy.getByDataCy('OAuth Applications').eq(1).click();
          //Delete from the list view
          cy.filterTableByMultiSelect('name', [response.name]);
          cy.clickTableRowAction('name', response.name, 'delete-application', {
            inKebab: true,
            disableFilter: true,
          });
          cy.get('[data-ouia-component-id="confirm"]').click();
          cy.get('[data-ouia-component-id="submit"]').click();
          cy.clickButton('Close');
          cy.clickButton('Clear all filters');
        });
    });

    it(`can create a single application with grant type Password and client type Confidential`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      cy.navigateTo('awx', 'applications');
      cy.clickButton('Create application');
      cy.verifyPageTitle('Create Application');
      cy.get('[data-cy="name"]').type(appName);
      cy.get('[data-cy="description"]').type(appDescription);
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Password');
      cy.selectDropdownOptionByResourceName('client-type', 'Confidential');
      cy.get('[data-cy="redirect-uris"]').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create application');
      cy.wait('@createApp')
        .its('response.body')
        .then((response: Application) => {
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.get('header').contains('Application information');
          });
          cy.get('button[aria-label="Close"]').click();
          cy.getByDataCy('name').should('contain', appName);
          cy.getByDataCy('description').should('contain', appDescription);
          cy.getByDataCy('authorization-grant-type').should('contain', 'password');
          cy.getByDataCy('client-type').should('contain', 'confidential');
          cy.deleteAwxApplication(response.id.toString(), { failOnStatusCode: false });
        });
    });

    it(`can create a single application with grant type Password and client type Public`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      cy.navigateTo('awx', 'applications');
      cy.clickButton('Create application');
      cy.verifyPageTitle('Create Application');
      cy.get('[data-cy="name"]').type(appName);
      cy.get('[data-cy="description"]').type(appDescription);
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Password');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.get('[data-cy="redirect-uris"]').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create application');
      cy.wait('@createApp')
        .its('response.body')
        .then((response: Application) => {
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.get('header').contains('Application information');
          });
          cy.get('button[aria-label="Close"]').click();
          cy.getByDataCy('name').should('contain', appName);
          cy.getByDataCy('description').should('contain', appDescription);
          cy.getByDataCy('authorization-grant-type').should('contain', 'password');
          cy.getByDataCy('client-type').should('contain', 'public');
          cy.deleteAwxApplication(response.id.toString(), { failOnStatusCode: false });
        });
    });

    it('can edit an application with grant type password from client type confidential to public from the List View', function () {
      cy.navigateTo('awx', 'applications');
      cy.verifyPageTitle('OAuth Applications');
      cy.filterTableByMultiSelect('name', [app.name]);
      cy.getTableRow('name', app.name, { disableFilter: true });
      cy.getByDataCy('name-column-cell').should('contain', app.name);
      //Edit the Application from the List View
      cy.get(`[data-cy="edit-application"]`).click();
      cy.intercept('PATCH', `api/v2/applications/*/`).as('editApp');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.clickButton('Save application');
      cy.wait('@editApp')
        .its('response.body.client_type')
        .then((client_type: string) => {
          expect(client_type).to.eql('public');
        });
      //Assert the edited information
      cy.get('[data-cy="name"]').should('contain', app.name);
      cy.get('[data-cy="organization"]').should('contain', 'Default');
      cy.get('[data-cy="authorization-grant-type"]').should('contain', 'password');
      cy.get('[data-cy="client-type"]').should('contain', 'public');
    });
  });

  describe('Applications- Edit and Delete- Details View ', () => {
    it(`can create a single application with grant type Authorization Code and client type Public, then delete from Details view`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      cy.navigateTo('awx', 'applications');
      cy.clickButton('Create application');
      //Create Application
      cy.verifyPageTitle('Create Application');
      cy.get('[data-cy="name"]').type(appName);
      cy.get('[data-cy="description"]').type(appDescription);
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Authorization code');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.get('[data-cy="redirect-uris"]').type('https://create_from_api.com');
      cy.intercept('POST', `api/v2/applications/`).as('createApp');
      cy.clickButton('Create application');
      cy.wait('@createApp')
        .its('response.body')
        .then((response: Application) => {
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.get('header').contains('Application information');
          });
          cy.get('button[aria-label="Close"]').click();
          //Details View
          cy.getByDataCy('name').should('contain', appName);
          cy.getByDataCy('description').should('contain', appDescription);
          cy.getByDataCy('authorization-grant-type').should('contain', 'authorization-code');
          cy.getByDataCy('client-type').should('contain', 'public');
          //Delete from Details View
          cy.getByDataCy('delete-application')
            .click()
            .then(() => {
              cy.get('[data-ouia-component-id="confirm"]').click();
              cy.intercept('DELETE', awxAPI`/applications/${response.id.toString()}/`).as(
                'deletedApp'
              );
              cy.get('[data-ouia-component-id="submit"]').click();
              cy.wait('@deletedApp').then((deletedApp) => {
                expect(deletedApp?.response?.statusCode).to.eql(204);
              });
            });
        });
    });

    it('can edit an application with grant type Password from client type Confidential to Public from the Details View', function () {
      cy.navigateTo('awx', 'applications');
      cy.filterTableByMultiSelect('name', [app.name]);
      cy.getTableRow('name', app.name, { disableFilter: true });
      //Navigate to Details View
      cy.getByDataCy('name-column-cell').contains(app.name).click();
      cy.verifyPageTitle(app.name);
      //Assert info on Details View
      cy.get('[data-cy="name"]').should('contain', app.name);
      cy.get('[data-cy="organization"]').should('contain', 'Default');
      cy.get('[data-cy="authorization-grant-type"]').should('contain', 'password');
      cy.get('[data-cy="client-type"]').should('contain', 'confidential');
      //Edit the Application
      cy.clickButton('Edit application');
      cy.intercept('PATCH', `api/v2/applications/*/`).as('editApp');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.clickButton('Save application');
      cy.wait('@editApp')
        .its('response.body.client_type')
        .then((client_type: string) => {
          //Assert the edited information
          expect(client_type).to.eql('public');
          cy.get('[data-cy="client-type"]').should('contain', 'public');
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
