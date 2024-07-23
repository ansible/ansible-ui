import { randomString } from '../../../../../framework/utils/random-string';
import { Application } from '../../../../../frontend/awx/interfaces/Application';
import { Token } from '../../../../../frontend/awx/interfaces/Token';
import { gatewayV1API } from '../../../../../platform/api/gateway-api-utils';
import { PlatformOrganization } from '../../../../../platform/interfaces/PlatformOrganization';
import { PlatformUser } from '../../../../../platform/interfaces/PlatformUser';

describe('AAP OAuth Applications CRUD actions List page', () => {
  let platformOrganization: PlatformOrganization;
  beforeEach(() => {
    cy.createPlatformOrganization().then((organization) => {
      platformOrganization = organization;
    });
    cy.navigateTo('platform', 'applications-page');
  });

  afterEach(() => {
    cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
  });

  const authorizationGrantTypes = ['Authorization code', 'Password'];
  const clientTypes = ['Confidential', 'Public'];
  authorizationGrantTypes.forEach((grantType) => {
    clientTypes.forEach((clientType) => {
      it(`create an new OAuth application with grant type ${grantType} and client type ${clientType} and deletes from the details page`, () => {
        const oauthApplicationName = `AAP OAuth Application ${randomString(2)}`;
        const authGrantType = grantType.replace(/ /g, '-').toLowerCase();
        const appClientType = clientType.toLowerCase();
        cy.getByDataCy('create-application').click();
        cy.getByDataCy('name').type(oauthApplicationName);
        cy.getByDataCy('description').type(`${authGrantType} with ${appClientType} description`);
        cy.singleSelectByDataCy('organization', `${platformOrganization.name}`);
        cy.selectDropdownOptionByResourceName('authorization-grant-type', grantType);
        cy.selectDropdownOptionByResourceName('client-type', clientType);
        cy.getByDataCy('redirect-uris').type('https://redhat.com');
        cy.getByDataCy('Submit').click();
        cy.getModal().within(() => {
          cy.contains('h1', 'Application information');
          if (
            (grantType === 'Authorization code' || grantType === 'Password') &&
            clientType === 'Confidential'
          ) {
            cy.contains('dt', 'Client ID');
            cy.contains('dt', 'Client Secret');
          } else if (
            (grantType === 'Authorization code' || grantType === 'Password') &&
            clientType === 'Public'
          ) {
            cy.contains('dt', 'Client ID');
          }
          cy.contains('h1', 'Application information');
          cy.contains('dd', oauthApplicationName);
          cy.get('button[aria-label="Close"]').click();
        });
        cy.verifyPageTitle(oauthApplicationName);
        cy.contains('h1', oauthApplicationName);
        cy.contains('dd', oauthApplicationName);
        cy.contains('dd', authGrantType);
        cy.contains('dd', appClientType);
        //edit from list row and delete from details page
        cy.navigateTo('platform', 'applications-page');
        cy.clickTableRowPinnedAction(oauthApplicationName, 'edit-application', false);
        cy.verifyPageTitle(`Edit ${oauthApplicationName}`);
        cy.getByDataCy('description').clear().type(`${authGrantType} with ${appClientType} edited`);
        cy.getByDataCy('Submit').click();
        cy.verifyPageTitle(oauthApplicationName);
        cy.clickButton(/^Delete application/);
        cy.intercept('DELETE', gatewayV1API`/applications/*/`).as('deleteApplication');
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.clickButton(/^Delete application/);
          cy.wait('@deleteApplication')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
        });
      });
    });
  });
});

describe('AAP OAuth Applications CRUD actions Details page', () => {
  let platformOrganization: PlatformOrganization;
  beforeEach(() => {
    cy.createPlatformOrganization().then((organization) => {
      platformOrganization = organization;
    });
    cy.navigateTo('platform', 'applications-page');
  });

  afterEach(() => {
    cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
  });

  const authorizationGrantTypes = ['Authorization code', 'Password'];
  const clientTypes = ['Confidential', 'Public'];
  authorizationGrantTypes.forEach((grantType) => {
    clientTypes.forEach((clientType) => {
      it(`create an new OAuth application with grant type ${grantType} and client type ${clientType} and deletes from list page`, () => {
        const oauthApplicationName = `AAP OAuth Application ${randomString(2)}`;
        const authGrantType = grantType.replace(/ /g, '-').toLowerCase();
        const appClientType = clientType.toLowerCase();
        cy.getByDataCy('create-application').click();
        cy.getByDataCy('name').type(oauthApplicationName);
        cy.getByDataCy('description').type(`${authGrantType} with ${appClientType} description`);
        cy.singleSelectByDataCy('organization', `${platformOrganization.name}`);
        cy.selectDropdownOptionByResourceName('authorization-grant-type', grantType);
        cy.selectDropdownOptionByResourceName('client-type', clientType);
        cy.getByDataCy('redirect-uris').type('https://redhat.com');
        cy.getByDataCy('Submit').click();
        cy.getModal().within(() => {
          cy.contains('h1', 'Application information');
          if (
            (grantType === 'Authorization code' || grantType === 'Password') &&
            clientType === 'Confidential'
          ) {
            cy.contains('dt', 'Client ID');
            cy.contains('dt', 'Client Secret');
          } else if (
            (grantType === 'Authorization code' || grantType === 'Password') &&
            clientType === 'Public'
          ) {
            cy.contains('dt', 'Client ID');
          }
          cy.contains('h1', 'Application information');
          cy.contains('dd', oauthApplicationName);
          cy.get('button[aria-label="Close"]').click();
        });
        cy.verifyPageTitle(oauthApplicationName);
        cy.contains('h1', oauthApplicationName);
        cy.contains('dd', oauthApplicationName);
        cy.contains('dd', authGrantType);
        cy.contains('dd', appClientType);
        //delete from list page
        cy.navigateTo('platform', 'applications-page');
        cy.verifyPageTitle('Applications');
        cy.clickTableRowKebabAction(oauthApplicationName, 'delete-application');
        cy.clickModalConfirmCheckbox();
        cy.intercept('DELETE', gatewayV1API`/applications/*/`).as('deleteApplication');
        cy.getModal().within(() => {
          cy.clickButton(/^Delete application/);
          cy.wait('@deleteApplication')
            .its('response')
            .then((response) => {
              expect(response?.statusCode).to.eql(204);
            });
          cy.clickButton(/^Close/);
        });
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});

describe('AAP OAuth Applications CRUD actions and Bulk Deletion', () => {
  let platformApplication1: Application;
  let platformApplication2: Application;
  beforeEach(() => {
    cy.createPlatformOAuthApplication('authorization-code', 'public').then((aapApplication) => {
      platformApplication1 = aapApplication;
    });
    cy.createPlatformOAuthApplication('authorization-code', 'confidential').then(
      (aapApplication) => {
        platformApplication2 = aapApplication;
      }
    );
    cy.navigateTo('platform', 'applications-page');
  });

  it('create an auth code applications (confidential & public clients) and performs bulk delete from the list toolbar', () => {
    cy.verifyPageTitle('Applications');
    cy.selectTableRow(platformApplication1.name);
    cy.selectTableRow(platformApplication2.name);
    cy.clickToolbarKebabAction('delete-selected-applications');
    cy.clickModalConfirmCheckbox();
    cy.intercept('DELETE', gatewayV1API`/applications/*/`).as('deleteOAuthApp1');
    cy.intercept('DELETE', gatewayV1API`/applications/*`).as('deleteOAuthApp2');
    cy.getModal().within(() => {
      cy.clickButton(/^Delete application/);
      cy.wait(['@deleteOAuthApp1', '@deleteOAuthApp2']).then((deleteTeamArr) => {
        expect(deleteTeamArr[0]?.response?.statusCode).to.eql(204);
        expect(deleteTeamArr[1]?.response?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
      });
    });
    cy.clickButton(/^Clear all filters$/);
  });
});

describe('AAP OAuth Application Creation and AAP token association with it', () => {
  let platformApplication: Application;
  let platformOrganization: PlatformOrganization;
  beforeEach(() => {
    cy.createPlatformOrganization().then((organization) => {
      platformOrganization = organization;
      cy.createPlatformOAuthApplication('authorization-code', 'public', platformOrganization).then(
        (aapApplication) => {
          platformApplication = aapApplication;
        }
      );
    });
    cy.navigateTo('platform', 'applications-page');
  });

  it("admin user creates an an AAP Oauth application and associates an AAP token with it, verifies the association in application's token tab", () => {
    cy.verifyPageTitle('Applications');
    cy.clickTableRowLink('name', platformApplication.name, { disableFilter: true });
    cy.verifyPageTitle(platformApplication.name);
    cy.clickTab('Tokens', true);
    cy.contains('h4', 'There are currently no tokens associated with this application');
    cy.contains('.pf-v5-c-empty-state__body', 'You can create a token from your user page.');
    cy.getCurrentPlatformUser().then((currentPlatformUser: PlatformUser) => {
      cy.createPlatformToken({ application: platformApplication.id, scope: 'write' }).then(
        (createdPlatformToken: Token) => {
          cy.wrap(createdPlatformToken)
            .its('summary_fields.user.username')
            .then((userAssociatedWithOAuthApp: string) => {
              expect(userAssociatedWithOAuthApp).to.eql(currentPlatformUser.username);
            });
        }
      );
      cy.contains('h4', 'There are currently no tokens associated with this application').should(
        'not.exist'
      );
      cy.contains(
        '.pf-v5-c-empty-state__body',
        'You can create a token from your user page.'
      ).should('not.exist');
      cy.selectTableRow(currentPlatformUser.username);
    });
    cy.clickToolbarKebabAction('delete-selected-tokens');
    cy.clickModalConfirmCheckbox();
    cy.intercept('DELETE', gatewayV1API`/tokens/*/`).as('deleteAAPToken');
    cy.getModal().within(() => {
      cy.clickButton(/^Delete token/);
      cy.wait('@deleteAAPToken').then((deleteAAPToken) => {
        expect(deleteAAPToken?.response?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
      });
    });
    cy.clickButton(/^Clear all filters$/);
    cy.clickTab('Back to Applications', true);
    cy.verifyPageTitle('Applications');
    cy.contains('h4', 'These OAuth Applications apply to resources at platform level.');
    cy.selectTableRow(platformApplication.name);
    cy.clickToolbarKebabAction('delete-selected-applications');
    cy.clickModalConfirmCheckbox();
    cy.intercept('DELETE', gatewayV1API`/applications/*/`).as('deleteOAuthApp');
    cy.getModal().within(() => {
      cy.clickButton(/^Delete application/);
      cy.wait('@deleteOAuthApp').then((deleteOAuthApp) => {
        expect(deleteOAuthApp?.response?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
      });
    });
    cy.clickButton(/^Clear all filters$/);
  });
});
