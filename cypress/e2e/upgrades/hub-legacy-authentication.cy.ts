import { randomString } from '../../../framework/utils/random-string';
import { UpgradeUserType } from '../../support/constants';
describe('Successfully authenticate hub legacy credentials', () => {
  let hubPassword: string;
  let hubUsername: string;
  let controllerUsername: string;
  let controllerPassword: string;

  before(() => {
    cy.platformLogin();
    cy.getUserForMigration(UpgradeUserType.controllerLegacy).then((user) => {
      controllerUsername = user.username;
      controllerPassword = user.password;
    });
    cy.platformLogout();
  });

  beforeEach(() => {
    cy.platformLogin();
    cy.getUserForMigration(UpgradeUserType.hubLegacy).then((user) => {
      hubUsername = user.username;
      hubPassword = user.password;
    });
    cy.platformLogout();
  });

  it('successfully logs in using hub legacy username and password', () => {
    const newHubPassword = 'E2EPass ' + randomString(4);

    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubUsername);
    cy.get('input[id*="login-password-id"]').type(hubPassword);
    cy.clickButton(/^Log in$/);
    cy.checkLinkedButton('Automation Hub');
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');

    cy.clickButton(/^Next$/);
    cy.getByDataCy('aap-password').type(newHubPassword);
    cy.clickButton(/^Submit$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    cy.platformLogout();
    cy.get('input[id*="login-username-id"]').type(hubUsername);
    cy.get('input[id*="login-password-id"]').type(newHubPassword);
    cy.clickButton(/^Log in$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
  });

  it('Link additional accounts page under user settings', () => {
    const newHubPassword = 'E2Epass ' + randomString(4);
    const newHubUsername = 'E2Euser ' + randomString(4);

    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubUsername);
    cy.get('input[id*="login-password-id"]').type(hubPassword);
    cy.clickButton(/^Log in$/);
    cy.checkLinkedButton('Automation Hub');
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');

    cy.clickButton(/^Next$/);
    cy.getByDataCy('new-username').should('have.value', hubUsername);
    cy.getByDataCy('new-username').clear().type(newHubUsername);

    cy.getByDataCy('aap-password').type(newHubPassword);
    cy.clickButton(/^Submit$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
    cy.navigateTo('platform', 'users');
    cy.clickTableRowLink('username', newHubUsername);
    cy.clickTab(/^Details$/, true);

    cy.clickKebabAction('actions-dropdown', 'link-user-accounts');
    cy.verifyPageTitle('Link user accounts');
    cy.getByDataCy('controller-username').type(controllerUsername);
    cy.getByDataCy('controller-password').type(controllerPassword);
    cy.get('button[value="controller"]').click();
    cy.checkLinkedButton('Automation Controller');
  });
});

describe('Negative paths for hub legacy authentication', () => {
  let hubPassword: string;
  let hubUsername: string;
  let controllerUsername: string;
  let controllerPassword: string;

  before(() => {
    cy.platformLogin();
    cy.getUserForMigration(UpgradeUserType.hubLegacy).then((user) => {
      hubUsername = user.username;
      hubPassword = user.password;
    });

    cy.getUserForMigration(UpgradeUserType.controllerLegacy).then((user) => {
      controllerUsername = user.username;
      controllerPassword = user.password;
    });
  });

  beforeEach(() => {
    cy.platformLogout();
  });

  it('fails authentication with incorrect username and password', () => {
    const errorHubPassword = 'E2Epass ' + randomString(4);

    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubUsername);
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
    cy.platformLogin();
  });

  it('fails to authenticate a user that is already linked with other account', () => {
    const extraControllerPassword = 'E2Epass ' + randomString(4);
    const extraControllerUsername = 'E2Euser ' + randomString(4);
    cy.clickLink(/^I have an Automation Controller account$/);
    cy.get('input[id*="login-username-id"]').type(controllerUsername);
    cy.get('input[id*="login-password-id"]').type(controllerPassword);
    cy.clickButton(/^Log in$/);

    // link Hub user
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.getByDataCy('hub-username').type(hubUsername);
    cy.getByDataCy('hub-password').type(hubPassword);
    cy.get('button[value="hub"]').click();
    cy.checkLinkedButton('Automation Hub');
    cy.clickButton(/^Next$/);
    cy.getByDataCy('new-username').should('have.value', controllerUsername);
    cy.getByDataCy('new-username').clear().type(extraControllerUsername);

    cy.getByDataCy('aap-password').type(extraControllerPassword);
    cy.clickButton(/^Submit$/);

    cy.platformLogout();

    //attempt to log in using previously linked Hub account
    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubUsername);
    cy.get('input[id*="login-password-id"]').type(hubPassword);
    cy.clickButton(/^Log in$/);
    //expect error message
    cy.get('.pf-v5-c-helper-text__item-text').contains(
      'Invalid username or password. Please try again.'
    );
  });
});
