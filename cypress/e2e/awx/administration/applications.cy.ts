import { randomString } from '../../../../framework/utils/random-string';
import { data } from './../../../fixtures/application_test_cases.json';
import { Application } from '../../../../frontend/awx/interfaces/Application';

describe('Applications', () => {
  let app: Application;

  beforeEach(() => {
    cy.awxLogin();
    cy.createAwxApplication().then((application: Application) => {
      app = application;
    });
    cy.navigateTo('awx', 'applications');
  });

  afterEach(() => {
    cy.deleteAwxApplication(app.id.toString(), { failOnStatusCode: false });
  });

  it('render the Applications page', () => {
    cy.verifyPageTitle('OAuth Applications');
  });

  data.create_cases.forEach((item) => {
    it(`can create a single application with grant type ${item.auth_grant_type} based and client type ${item.client_type}`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);

      cy.createCustomAWXApplicationFromUI(
        appName,
        appDescription,
        item.auth_grant_type,
        item.client_type,
        item.redirect_uris
      );

      cy.url().then((currentUrl) => {
        cy.deleteAwxApplication(currentUrl.split('/')[5], { failOnStatusCode: false });
      });
    });
  });

  data.edit_cases.forEach((item) => {
    it(`can edit an application with grant type ${item.auth_grant_type} based from client type ${item.client_type} to ${item.new_client_type}`, function () {
      const appName = 'E2E Application name ' + randomString(4);
      const appDescription = 'E2E Application description ' + randomString(4);
      const grantType = item.auth_grant_type;
      const clientType = item.client_type;
      const newClientType = item.new_client_type;
      const redirectUris = 'https://edit.com';

      cy.createCustomAWXApplicationFromUI(
        appName,
        appDescription,
        grantType,
        clientType,
        redirectUris
      );
      cy.editCustomAWXApplicationFromDetailsView(appName, grantType, clientType, newClientType);
      cy.url().then((currentUrl) => {
        cy.deleteAwxApplication(currentUrl.split('/')[5], { failOnStatusCode: false });
      });
    });
  });

  it('can edit an application from the List View', function () {
    const appName = 'E2E Application edit ' + randomString(4);
    const appDescription = 'E2E Application description ' + randomString(4);
    const grantType = 'Password';
    const clientType = 'Public';
    const redirectUris = 'https://edit.com';

    cy.createCustomAWXApplicationFromUI(
      appName,
      appDescription,
      grantType,
      clientType,
      redirectUris
    );

    cy.editCustomAWXApplicationFromListView(appName, grantType, clientType);
    cy.url().then((currentUrl) => {
      cy.deleteAwxApplication(currentUrl.split('/')[5], { failOnStatusCode: false });
    });
  });

  it('can delete an application from the List View', function () {
    const appName = 'E2E Application name ' + randomString(4);
    const appDescription = 'E2E Application description ' + randomString(4);
    const grantType = 'Password';
    const clientType = 'Public';
    const redirectUris = 'https://edit.com';

    cy.createCustomAWXApplicationFromUI(
      appName,
      appDescription,
      grantType,
      clientType,
      redirectUris
    );

    cy.url().then((currentUrl) => {
      cy.deleteAwxApplication(currentUrl.split('/')[5], { failOnStatusCode: false });
    });
  });

  it('can delete an application from Details view', function () {
    const appName = 'E2E Application name ' + randomString(4);
    const appDescription = 'E2E Application description ' + randomString(4);
    const grantType = 'Password';
    const clientType = 'Public';
    const redirectUris = 'https://delete.com';

    cy.createCustomAWXApplicationFromUI(
      appName,
      appDescription,
      grantType,
      clientType,
      redirectUris
    );
    cy.deleteCustomAWXApplicationFromDetailsView(appName, grantType, clientType);
  });

  it('can create a single application and navigate to the details page', function () {
    cy.searchAndDisplayResource(app.name);
    cy.clickTableRow(app.name);
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      cy.verifyPageTitle(app.name).should('be.visible');
      cy.get('[data-cy="name"]').should('contain', app.name);
      cy.get('[data-cy="organization"]').should('contain', 'Default');
      cy.get('[data-cy="authorization-grant-type"]').should(
        'contain',
        app.authorization_grant_type
      );
      cy.get('[data-cy="client-type"]').should('contain', app.client_type);
      cy.get('[data-cy="redirect-uris"]').should('contain', app.redirect_uris);
    });
  });

  it('can edit an application and navigate to details page', function () {
    const editedName = app.name + 'edited';
    cy.searchAndDisplayResource(app.name);
    cy.clickTableRow(app.name);
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      cy.verifyPageTitle(app.name).should('be.visible');
      cy.get('[data-cy="name"]').should('contain', app.name);
      cy.get('[data-cy="organization"]').should('contain', 'Default');
      cy.get('[data-cy="authorization-grant-type"]').should(
        'contain',
        app.authorization_grant_type
      );
      cy.get('[data-cy="client-type"]').should('contain', app.client_type);
      cy.get('[data-cy="redirect-uris"]').should('contain', app.redirect_uris);
    });

    cy.editAwxApplication(app, editedName);
    cy.clickTab(/^Back to Applications$/, true);

    cy.searchAndDisplayResource(editedName);
    cy.clickTableRow(editedName);

    cy.verifyPageTitle(editedName).should('be.visible');
    cy.get('[data-cy="name"]').should('contain', editedName);
  });

  it.skip('verify token creation from application page', function () {});
  it.skip('verify token deletion from application page', function () {});
  it.skip('verify token bulk deletion from application page', function () {});
  it.skip('can disable an application and verify that all tokens have been removed from that applicatione', function () {});
});
