import { randomString } from '../../../framework/utils/random-string';
import { UpgradeUserType, usersForMigration } from '../../support/constants';

describe('Controller LDAP user migration flow', () => {
  let hubPassword: string;
  let hubUsername: string;
  let controllerLdapUsername: string;
  let controllerLdapPassword: string;

  before(() => {
    cy.getUserForMigration(UpgradeUserType.hubLegacy).then((user) => {
      hubUsername = user.username;
      hubPassword = user.password;
    });
  });

  beforeEach(() => {
    cy.getUserForMigration(UpgradeUserType.controllerLdap).then((user) => {
      controllerLdapUsername = user.username;
      controllerLdapPassword = user.password;
    });
    cy.platformLogout();
  });

  it('Successfully logs in with an unmigrated controller LDAP user', () => {
    cy.clickLink('I have an Automation Controller account');
    cy.contains('Log in to Automation Controller and migrate your account').should('be.visible');
    cy.get('input[id*="login-username-id"]').type(controllerLdapUsername);
    cy.get('input[id*="login-password-id"]').type(controllerLdapPassword);
    cy.clickButton('Log in');
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.checkLinkedButton('Automation Controller');
    cy.clickButton('Next');
    cy.contains('Complete your AAP migration').should('be.visible');
    cy.clickButton('Submit');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    //Log in with newly migrated user
    cy.platformLogout();
    cy.get('input[id*="login-username-id"]').type(controllerLdapUsername);
    cy.get('input[id*="login-password-id"]').type(controllerLdapPassword);
    cy.clickButton('Log in');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
  });

  it('Links additional accounts in user details', () => {
    cy.clickLink('I have an Automation Controller account');
    cy.contains('Log in to Automation Controller and migrate your account').should('be.visible');
    cy.get('input[id*="login-username-id"]').type(controllerLdapUsername);
    cy.get('input[id*="login-password-id"]').type(controllerLdapPassword);
    cy.clickButton('Log in');
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.checkLinkedButton('Automation Controller');
    cy.clickButton('Next');
    cy.contains('Complete your AAP migration').should('be.visible');
    cy.clickButton('Submit');
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');

    cy.getByDataCy('account-menu').click();
    cy.get('#user-details').click();
    cy.clickKebabAction('actions-dropdown', 'link-user-accounts');
    cy.verifyPageTitle('Link user accounts');
    cy.getByDataCy('hub-username').type(hubUsername);
    cy.getByDataCy('hub-password').type(hubPassword);
    cy.get('button[value="hub"]').click();
    cy.checkLinkedButton('Automation Hub');
    cy.clickButton('Close');
    cy.getByDataCy('actions-dropdown').click();
    cy.contains('Link user accounts').should('not.exist');
  });
});

describe('Negative paths for controller LDAP authentication', () => {
  const controllerLdapUsername = usersForMigration[UpgradeUserType.controllerLdap][0].username;

  before(() => {
    cy.platformLogin();
  });

  beforeEach(() => {
    cy.platformLogout();
  });

  it('tests an incorrect username password', () => {
    const errorControllerLdapPassword = 'E2Epass ' + randomString(4);

    cy.clickLink('I have an Automation Controller account');
    cy.get('input[id*="login-username-id"]').type(controllerLdapUsername);
    cy.get('input[id*="login-password-id"]').type(errorControllerLdapPassword);
    cy.clickButton('Log in');
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });

  it('tests a user that does not exist', () => {
    const errorControllerLdapUsername = 'E2Epass ' + randomString(4);
    const errorControllerLdapPassword = 'E2Epass ' + randomString(4);

    cy.clickLink('I have an Automation Controller account');
    cy.get('input[id*="login-username-id"]').type(errorControllerLdapUsername);
    cy.get('input[id*="login-password-id"]').type(errorControllerLdapPassword);
    cy.clickButton('Log in');
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });
});
