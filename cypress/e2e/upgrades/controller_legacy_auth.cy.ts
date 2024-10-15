import { UpgradeUserType } from '../../support/constants';

describe('Authenticate using Controller legacy login', () => {
  let awxPassword: string;
  let awxUsername: string;
  let hubPassword: string;
  let hubUsername: string;

  before(() => {
    cy.platformLogin();
    cy.getUserForMigration(UpgradeUserType.hubLegacy).then((user) => {
      hubUsername = user.username;
      hubPassword = user.password;
    });
    cy.platformLogout();
  });

  beforeEach(() => {
    cy.platformLogin();
    cy.getUserForMigration(UpgradeUserType.controllerLegacy).then((user) => {
      awxUsername = user.username;
      awxPassword = user.password;
    });
    cy.platformLogout();
  });

  it('successfully logs in using controller legacy username and password', () => {
    const newPassword = awxPassword + '-test';
    cy.clickLink(/^I have an Automation Controller account$/);
    cy.get('input[id*="login-username-id"]').type(awxUsername);
    cy.get('input[id*="login-password-id"]').type(awxPassword);
    cy.clickButton(/^Log in$/);
    //assert that user has been taken to migration form
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.checkLinkedButton('Automation Controller');
    cy.clickButton(/^Next$/);
    cy.getByDataCy('aap-password').type(newPassword);
    cy.clickButton(/^Submit$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');

    //log in with newly migrated user
    cy.platformLogout();
    cy.get('input[id*="login-username-id"]').type(awxUsername);
    cy.get('input[id*="login-password-id"]').type(newPassword);
    cy.clickButton(/^Log in$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
  });

  it('Link additional accounts from user settings', () => {
    // log in with controller user
    cy.clickLink(/^I have an Automation Controller account$/);
    cy.get('input[id*="login-username-id"]').type(awxUsername);
    cy.get('input[id*="login-password-id"]').type(awxPassword);
    cy.clickButton(/^Log in$/);

    // verify Controller account was linked
    cy.checkLinkedButton('Automation Controller');

    // verify on correct step of migration form
    cy.get('.pf-v5-c-card__title-text').contains('Link your Ansible Automation Platform accounts');

    cy.clickButton(/^Next$/);

    // verify that username is auto-filled
    cy.getByDataCy('new-username').should('have.value', awxUsername);

    cy.getByDataCy('aap-password').type('testPassword');
    cy.clickButton(/^Submit$/);

    // verify that user is navigated to overview
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');

    // navigate to user settings and link other accounts
    cy.navigateTo('platform', 'users');
    //cy.getTableRow('username', controller_user.username).click();
    cy.clickTableRowLink('username', awxUsername);
    cy.clickKebabAction('actions-dropdown', 'link-user-accounts');
    cy.verifyPageTitle('Link user accounts');
    //link hub account
    cy.getByDataCy('hub-username').type(hubUsername);
    cy.getByDataCy('hub-password').type(hubPassword);
    cy.getBy('button[value="hub"]').click();
    cy.checkLinkedButton('Automation Hub');
  });
});

describe('Negative paths for controller legacy authentication', () => {
  let awxUsername: string;
  let awxPassword: string;
  let hubPassword: string;
  let hubUsername: string;

  before(() => {
    cy.platformLogin();
    cy.getUserForMigration(UpgradeUserType.controllerLegacy).then((user) => {
      awxUsername = user.username;
      awxPassword = user.password;
    });
    cy.getUserForMigration(UpgradeUserType.hubLegacy).then((user) => {
      hubUsername = user.username;
      hubPassword = user.password;
    });
  });

  beforeEach(() => {
    cy.platformLogout();
  });

  it('attempt to log in with invalid username/password combination', () => {
    cy.clickLink(/^I have an Automation Controller account$/);
    cy.get('input[id*="login-username-id"]').type(awxUsername);
    cy.get('input[id*="login-password-id"]').type('incorrectPassword');
    cy.clickButton(/^Log in$/);
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });

  it('attempt to log in with user that does not exist', () => {
    cy.clickLink(/^I have an Automation Controller account$/);
    cy.get('input[id*="login-username-id"]').type('non-existentUser');
    cy.get('input[id*="login-password-id"]').type('non-existentPassword');
    cy.clickButton(/^Log in$/);
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });

  it('attempt to log in with user that is already linked to another account', () => {
    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubUsername);
    cy.get('input[id*="login-password-id"]').type(hubPassword);
    cy.clickButton(/^Log in$/);
    // link Controller user
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.getByDataCy('controller-username').type(awxUsername);
    cy.getByDataCy('controller-password').type(awxPassword);
    cy.getBy('button[value="controller"]').click();
    //verify that green linked status appears
    cy.checkLinkedButton('Automation Controller');
    cy.clickButton(/^Next$/);
    cy.getByDataCy('aap-password').type('newPassword');
    cy.clickButton(/^Submit$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    cy.platformLogout();

    //attempt to log in using previously linked Controller account
    cy.clickLink(/^I have an Automation Controller account$/);
    cy.get('input[id*="login-username-id"]').type(awxUsername);
    cy.get('input[id*="login-password-id"]').type(awxPassword);
    cy.clickButton(/^Log in$/);
    //expect error message
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });
});
