import { randomString } from '../../../../../framework/utils/random-string';
import { Application } from '../../../../../frontend/awx/interfaces/Application';
import { AwxToken } from '../../../../../frontend/awx/interfaces/AwxToken';
import { Organization } from '../../../../../frontend/awx/interfaces/Organization';
import { AwxUser } from '../../../../../frontend/awx/interfaces/User';
import { PlatformOrganization } from '../../../../../platform/interfaces/PlatformOrganization';
import { awxAPI } from '../../../../support/formatApiPathForAwx';

describe('AAP Automation Execution OAuth Applications CRUD actions List page', () => {
  let platformOrganization: PlatformOrganization;
  beforeEach(() => {
    cy.createPlatformOrganization().then((organization) => {
      platformOrganization = organization;
    });
    cy.navigateTo('platform', 'applications-page');
    cy.verifyPageTitle('Applications');
  });

  afterEach(() => {
    cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
  });

  const authorizationGrantTypes = ['Authorization code', 'Password'];
  const clientTypes = ['Confidential', 'Public'];
  authorizationGrantTypes.forEach((grantType) => {
    clientTypes.forEach((clientType) => {
      it(`creates a new AAP AE OAuth application with grant type ${grantType} and client type ${clientType} and deletes from the details page`, () => {
        const oauthApplicationName = `AE OAuth Application ${randomString(2)}`;
        const authGrantType = grantType.replace(/ /g, '-').toLowerCase();
        const appClientType = clientType.toLowerCase();
        cy.clickTab(/^Automation Execution$/, true);
        cy.contains(
          'h4',
          'These OAuth Applications only apply to resources in the context of automation execution.'
        );
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
        cy.hasDetail('Name', oauthApplicationName);
        cy.hasDetail('Description', `${authGrantType} with ${appClientType} description`);
        //edit from list row and delete from details page
        cy.navigateTo('platform', 'applications-page');
        cy.clickTab(/^Automation Execution$/, true);
        cy.filterTableByMultiSelect('name', [oauthApplicationName]);
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
  let platformOrganization: PlatformOrganization;
  beforeEach(() => {
    cy.createPlatformOrganization().then((organization) => {
      platformOrganization = organization;
    });
    cy.navigateTo('platform', 'applications-page');
    cy.verifyPageTitle('Applications');
  });

  afterEach(() => {
    cy.deletePlatformOrganization(platformOrganization, { failOnStatusCode: false });
  });

  const authorizationGrantTypes = ['Authorization code', 'Password'];
  const clientTypes = ['Confidential', 'Public'];
  authorizationGrantTypes.forEach((grantType) => {
    clientTypes.forEach((clientType) => {
      it(`creates a new AAP AE OAuth application with grant type ${grantType} and client type ${clientType} and deletes from the list page`, () => {
        const oauthApplicationName = `AE OAuth Application ${randomString(2)}`;
        const authGrantType = grantType.replace(/ /g, '-').toLowerCase();
        const appClientType = clientType.toLowerCase();
        cy.clickTab(/^Automation Execution$/, true);
        cy.contains(
          'h4',
          'These OAuth Applications only apply to resources in the context of automation execution.'
        );
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
        cy.hasDetail('Name', oauthApplicationName);
        cy.hasDetail('Description', `${authGrantType} with ${appClientType} description`);
        //delete from list page
        cy.navigateTo('platform', 'applications-page');
        cy.verifyPageTitle('Applications');
        cy.clickTab('Automation Execution', true);
        cy.contains(
          'h4',
          'These OAuth Applications only apply to resources in the context of automation execution.'
        );
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
  let platformAEApplication1: Application;
  let platformAEApplication2: Application;
  beforeEach(() => {
    cy.createAwxApplication('authorization-code', 'public').then((aapAEApplication) => {
      platformAEApplication1 = aapAEApplication;
    });
    cy.createAwxApplication('authorization-code', 'confidential').then((aapAEApplication) => {
      platformAEApplication2 = aapAEApplication;
    });
    cy.navigateTo('platform', 'applications-page');
    cy.verifyPageTitle('Applications');
  });

  it('creates auth code applications (confidential & public clients) and performs bulk deletion from the list toolbar', () => {
    cy.verifyPageTitle('Applications');
    cy.clickTab('Automation Execution', true);
    cy.contains(
      'h4',
      'These OAuth Applications only apply to resources in the context of automation execution.'
    );
    cy.filterTableByMultiSelect('name', [platformAEApplication1.name, platformAEApplication2.name]);
    cy.selectTableRow(platformAEApplication1.name, false);
    cy.selectTableRow(platformAEApplication2.name, false);
    cy.clickToolbarKebabAction('delete-selected-applications');
    cy.clickModalConfirmCheckbox();
    cy.intercept('DELETE', 'api/controller/v2/applications/*/').as('deleteOAuthAEApp1');
    cy.intercept('DELETE', 'api/controller/v2/applications/*/').as('deleteOAuthAEApp2');
    cy.getModal().within(() => {
      cy.clickButton(/^Delete application/);
      cy.wait(['@deleteOAuthAEApp1', '@deleteOAuthAEApp2']).then((deleteTeamArr) => {
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
  let platformAEApplication: Application;
  let awxOrganization: Organization;
  beforeEach(() => {
    cy.createAwxOrganization().then((organization) => {
      cy.log('Organization created', organization);
      awxOrganization = organization;
      cy.createAwxApplication('authorization-code', 'public', awxOrganization).then(
        (aapAEApplication) => {
          platformAEApplication = aapAEApplication;
        }
      );
    });
    cy.navigateTo('platform', 'applications-page');
  });

  afterEach(() => {
    cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  it('admin user creates an AAP AE oauth application and associates an AAP token with it, verifies the association in the application token tab', () => {
    cy.verifyPageTitle('Applications');
    cy.clickTab('Automation Execution', true);
    cy.contains(
      'h4',
      'These OAuth Applications only apply to resources in the context of automation execution.'
    );
    cy.clickTableRowLink('name', platformAEApplication.name, { disableFilter: true });
    cy.verifyPageTitle(platformAEApplication.name);
    cy.clickTab('Tokens', true);
    cy.contains('h4', 'There are currently no tokens associated with this application');
    cy.contains('.pf-v5-c-empty-state__body', 'You can create a token from your user page.');
    cy.getCurrentUser().then((currentAwxUser: AwxUser) => {
      cy.createAwxToken({ application: platformAEApplication.id, scope: 'write' }).then(
        (createdAwxToken: AwxToken) => {
          cy.wrap(createdAwxToken)
            .its('summary_fields.user.username')
            .then((userAssociatedWithOAuthApp: string) => {
              expect(userAssociatedWithOAuthApp).to.eql(currentAwxUser.username);
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
