import { randomString } from '../../../../framework/utils/random-string';
import { Application } from '../../../../frontend/awx/interfaces/Application';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { AwxToken } from '../../../../frontend/awx/interfaces/AwxToken';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';

describe('AAP Automation Execution OAuth Applications CRUD actions List page', () => {
  let awxOrganization: Organization;
  beforeEach(() => {
    cy.createAwxOrganization().then((organization) => {
      awxOrganization = organization;
    });
    cy.navigateTo('awx', 'applications');
  });

  const authorizationGrantTypes = ['Authorization code', 'Password'];
  const clientTypes = ['Confidential', 'Public'];
  authorizationGrantTypes.forEach((grantType) => {
    clientTypes.forEach((clientType) => {
      it(`creates a new AAP AE OAuth application with grant type ${grantType} and client type ${clientType} and deletes from the details page`, () => {
        const oauthApplicationName = `AE OAuth Application ${randomString(2)}`;
        const authGrantType = grantType.replace(/ /g, '-').toLowerCase();
        const appClientType = clientType.toLowerCase();
        cy.getByDataCy('create-application').click();
        cy.getByDataCy('name').type(oauthApplicationName);
        cy.getByDataCy('description').type(`${authGrantType} with ${appClientType} description`);
        cy.singleSelectByDataCy('organization', `${awxOrganization.name}`);
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
        cy.hasDetail('Name', oauthApplicationName);
        cy.hasDetail('Description', `${authGrantType} with ${appClientType} description`);
        //edit from list row and delete from details page
        cy.navigateTo('awx', 'applications');
        cy.verifyPageTitle('Applications');
        cy.clickTableRowPinnedAction(oauthApplicationName, 'edit-application', false);
        cy.verifyPageTitle('Edit Application');
        cy.getByDataCy('description').clear().type(`${authGrantType} with ${appClientType} edited`);
        cy.getByDataCy('Submit').click();
        cy.verifyPageTitle(oauthApplicationName);
        cy.clickButton(/^Delete application/);
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.clickButton(/^Delete application/);
        });
      });
    });
  });
});

describe('AAP OAuth Applications CRUD actions Details page', () => {
  let awxOrganization: Organization;
  beforeEach(() => {
    cy.createAwxOrganization().then((organization) => {
      awxOrganization = organization;
    });
    cy.navigateTo('awx', 'applications');
  });

  const authorizationGrantTypes = ['Authorization code', 'Password'];
  const clientTypes = ['Confidential', 'Public'];
  authorizationGrantTypes.forEach((grantType) => {
    clientTypes.forEach((clientType) => {
      it(`creates a new AAP AE OAuth application with grant type ${grantType} and client type ${clientType} and deletes from the list page`, () => {
        const oauthApplicationName = `AE OAuth Application ${randomString(2)}`;
        const authGrantType = grantType.replace(/ /g, '-').toLowerCase();
        const appClientType = clientType.toLowerCase();
        cy.getByDataCy('create-application').click();
        cy.getByDataCy('name').type(oauthApplicationName);
        cy.getByDataCy('description').type(`${authGrantType} with ${appClientType} description`);
        cy.singleSelectByDataCy('organization', `${awxOrganization.name}`);
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
        cy.hasDetail('Name', oauthApplicationName);
        cy.hasDetail('Description', `${authGrantType} with ${appClientType} description`);
        // cy.hasDetail('Authorization Grant Type', grantType);
        // cy.hasDetail('Client Type', clientType);
        //delete from list page
        cy.navigateTo('awx', 'applications');
        cy.verifyPageTitle('Applications');
        cy.filterTableBySingleSelect('name', oauthApplicationName);
        cy.clickTableRowAction('name', oauthApplicationName, 'delete-application', {
          inKebab: true,
          disableFilter: true,
        });
        cy.clickModalConfirmCheckbox();
        cy.getModal().within(() => {
          cy.clickButton(/^Delete application/);
          cy.clickButton(/^Close/);
        });
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});

describe('AAP AE OAuth Applications CRUD actions and Bulk Deletion', () => {
  let awxAEApplication1: Application;
  let awxAEApplication2: Application;
  beforeEach(() => {
    cy.createAwxApplication('authorization-code', 'public').then((OAuthApplication1) => {
      awxAEApplication1 = OAuthApplication1;
    });
    cy.createAwxApplication('authorization-code', 'confidential').then((OAuthApplication2) => {
      awxAEApplication2 = OAuthApplication2;
    });
    cy.navigateTo('awx', 'applications');
  });

  it('creates auth code applications (confidential & public clients) and performs bulk deletion from the list toolbar', () => {
    cy.verifyPageTitle('Applications');
    cy.filterTableByMultiSelect('name', [`${awxAEApplication1.name}`, `${awxAEApplication2.name}`]);
    cy.selectTableRow(`${awxAEApplication1.name}`, false);
    cy.selectTableRow(`${awxAEApplication2.name}`, false);
    cy.clickToolbarKebabAction('delete-selected-applications');
    cy.clickModalConfirmCheckbox();
    cy.intercept('DELETE', awxAPI`/applications/*/`).as('deleteOAuthApp1');
    cy.intercept('DELETE', awxAPI`/applications/*/`).as('deleteOAuthApp2');
    cy.getModal().within(() => {
      cy.clickButton(/^Delete application/);
      cy.wait(['@deleteOAuthApp1', '@deleteOAuthApp2']).then((deleteOAuthApp) => {
        expect(deleteOAuthApp[0]?.response?.statusCode).to.eql(204);
        expect(deleteOAuthApp[1]?.response?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
      });
    });
    cy.clickButton(/^Clear all filters$/);
  });
});

describe('AAP OAuth Application Creation and AAP token association with it', () => {
  let awxApplication: Application;
  let awxOrganization: Organization;
  beforeEach(() => {
    cy.createAwxOrganization().then((organization) => {
      awxOrganization = organization;
      cy.createAwxApplication('authorization-code', 'public', awxOrganization).then(
        (awxOAuthApplication: Application) => {
          awxApplication = awxOAuthApplication;
        }
      );
    });
    cy.navigateTo('awx', 'applications');
  });

  it('admin user creates an oauth application and associates an awx token with it, verifies the association in the application token tab', () => {
    cy.verifyPageTitle('Applications');
    cy.clickTableRowLink('name', `${awxApplication.name}`, { disableFilter: true });
    cy.verifyPageTitle(`${awxApplication.name}`);
    cy.clickTab('Tokens', true);
    // verifies initially the oauth application has no tokens associated with it
    cy.contains('h4', 'There are currently no tokens associated with this application');
    cy.contains('.pf-v5-c-empty-state__body', 'You can create a token from your user page.');
    cy.getCurrentUser().then((currentAwxUser: AwxUser) => {
      cy.createAwxToken({ application: awxApplication.id, scope: 'write' }).then(
        (createdAwxToken: AwxToken) => {
          cy.wrap(createdAwxToken)
            .its('summary_fields.user.username')
            .then((userAssociatedWithOAuthApp: string) => {
              expect(userAssociatedWithOAuthApp).to.eql(currentAwxUser.username);
            });
        }
      );
      cy.verifyPageTitle(awxApplication.name);
      // verifies the oauth application has tokens associated with it by searching
      cy.selectTableRow(currentAwxUser.username);
    });
    cy.clickToolbarKebabAction('delete-selected-tokens');
    cy.clickModalConfirmCheckbox();
    cy.intercept('DELETE', awxAPI`/tokens/*/`).as('deleteAAPToken');
    cy.getModal().within(() => {
      cy.clickButton(/^Delete token/);
      cy.wait('@deleteAAPToken').then((deleteAAPToken) => {
        expect(deleteAAPToken?.response?.statusCode).to.eql(204);
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
      });
    });
    cy.clickButton(/^Clear all filters$/);
  });
});
