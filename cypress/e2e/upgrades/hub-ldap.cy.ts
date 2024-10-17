import { randomString } from '../../../framework/utils/random-string';
import { UpgradeUserType, usersForMigration } from '../../support/constants';

describe('Authenticate and migrate a Hub LDAP account', () => {
  let hubLdapPassword: string;
  let hubLdapUsername: string;
  let controllerUsername: string;
  let controllerPassword: string;

  beforeEach(() => {
    cy.getUserForMigration(UpgradeUserType.controllerLegacy).then((user) => {
      controllerUsername = user.username;
      controllerPassword = user.password;
    });
    cy.getUserForMigration(UpgradeUserType.hubLdap).then((user) => {
      hubLdapUsername = user.username;
      hubLdapPassword = user.password;
    });
    cy.platformLogout();
  });

  it('successfully logs in using hub ldap username and password and link controller account', () => {
    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubLdapUsername);
    cy.get('input[id*="login-password-id"]').type(hubLdapPassword);
    cy.clickButton(/^Log in$/);
    cy.checkLinkedButton('Automation Hub');
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.clickButton(/^Next$/);
    cy.contains('Complete your AAP migration').should('be.visible');
    cy.clickButton(/^Submit$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    // Link a controller service account
    cy.navigateTo('platform', 'users');
    cy.clickTableRowLink('username', hubLdapUsername);
    cy.clickTab(/^Details$/, true);
    cy.clickKebabAction('actions-dropdown', 'link-user-accounts');
    cy.verifyPageTitle('Link user accounts');
    cy.checkLinkedButton('Automation Hub');
    cy.getByDataCy('controller-username').type(controllerUsername);
    cy.getByDataCy('controller-password').type(controllerPassword);
    cy.get('button[value="controller"]').click();
    cy.checkLinkedButton('Automation Controller');
    cy.clickButton('Close');
    cy.getByDataCy('actions-dropdown').click();
    cy.contains('Link user accounts').should('not.exist');
  });
});

describe('Negative paths for hub legacy authentication', () => {
  const hubLdapUsername = usersForMigration[UpgradeUserType.hubLdap][0].username;

  beforeEach(() => {
    cy.platformLogout();
  });

  it('fails authentication with incorrect username and password', () => {
    const errorHubPassword = 'E2Epass ' + randomString(4);

    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubLdapUsername);
    cy.get('input[id*="login-password-id"]').type(errorHubPassword);
    cy.clickButton(/^Log in$/);
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });

  it('fails to authenticate with a user that does not exist', () => {
    const errorHubPassword = 'E2Epass ' + randomString(4);
    const errorHubUsername = 'E2EUser ' + randomString(4);
    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(errorHubUsername);
    cy.get('input[id*="login-password-id"]').type(errorHubPassword);
    cy.clickButton(/^Log in$/);
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });
});
