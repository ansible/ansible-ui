import { UpgradeUserType } from '../../support/constants';
import { randomString } from '../../../framework/utils/random-string';

describe('Linking accounts - Controller', () => {
  let controllerPassword: string;
  let controllerUsername: string;
  let hubPassword: string;
  let hubUsername: string;
  let edaPassword: string;
  let edaUsername: string;
  let newPwd: string;

  beforeEach(() => {
    newPwd = 'password' + randomString(6);
    cy.getUserForMigration(UpgradeUserType.hubLegacy).then((user) => {
      hubUsername = user.username;
      hubPassword = user.password;
    });
    cy.getUserForMigration(UpgradeUserType.controllerLegacy).then((user) => {
      controllerUsername = user.username;
      controllerPassword = user.password;
    });
    cy.getUserForMigration(UpgradeUserType.eda).then((user) => {
      edaUsername = user.username;
      edaPassword = user.password;
    });
    cy.platformLogout();
  });

  it('Login using an Automation Controller account and use migration form to link both Hub and EDA account', () => {
    cy.clickLink(/^I have an Automation Controller account$/);
    cy.get('input[id*="login-username-id"]').type(controllerUsername);
    cy.get('input[id*="login-password-id"]').type(controllerPassword);
    cy.clickButton(/^Log in$/);
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.checkLinkedButton('Automation Controller');

    //Link Hub account
    cy.getByDataCy('Link your Automation Hub account').should('be.visible');
    cy.getByDataCy('hub-username').type(hubUsername);
    cy.getByDataCy('hub-password').type(hubPassword);
    cy.get('[class="pf-v5-c-form"]').within(() => {
      cy.contains('div', 'Link your Automation Hub account')
        .parent()
        .parent()
        .contains('button', 'Link')
        .should('be.visible')
        .click();
    });
    cy.checkLinkedButton('Automation Hub');

    //Link EDA account
    cy.getByDataCy('Link your Event-Driven Ansible account').should('be.visible');
    cy.getByDataCy('eda-username').type(edaUsername);
    cy.getByDataCy('eda-password').type(edaPassword);
    cy.get('[class="pf-v5-c-form"]').within(() => {
      cy.contains('div', 'Link your Event-Driven Ansible account')
        .parent()
        .parent()
        .contains('button', 'Link')
        .should('be.visible')
        .click();
    });
    cy.checkLinkedButton('Event-Driven Ansible');
    cy.clickButton(/^Next$/);

    cy.getByDataCy('set-app-credentials').contains('Set your AAP credentials');
    cy.getByDataCy('aap-password').type(newPwd);
    cy.clickButton(/^Submit$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');

    //Log in with newly migrated user
    cy.platformLogout();
    cy.get('input[id*="login-username-id"]').type(controllerUsername);
    cy.get('input[id*="login-password-id"]').type(newPwd);
    cy.clickButton(/^Log in$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
  });

  it('Login using a Automation Hub account and link Controller and EDA accounts from the Login page', () => {
    cy.clickLink(/^I have an Automation Hub account$/);
    cy.get('input[id*="login-username-id"]').type(hubUsername);
    cy.get('input[id*="login-password-id"]').type(hubPassword);
    cy.clickButton(/^Log in$/);
    cy.getByDataCy('link-accounts').contains('Link your Ansible Automation Platform accounts');
    cy.checkLinkedButton('Automation Hub');

    //Link Controller account
    cy.getByDataCy('Link your Automation Controller account').should('be.visible');
    cy.getByDataCy('controller-username').type(controllerUsername);
    cy.getByDataCy('controller-password').type(controllerPassword);
    cy.clickOnLinkAccount('Link your Automation Controller account');
    cy.checkLinkedButton('Automation Controller');

    //Link EDA account
    cy.getByDataCy('Link your Event-Driven Ansible account').should('be.visible');
    cy.getByDataCy('eda-username').type(edaUsername);
    cy.getByDataCy('eda-password').type(edaPassword);
    cy.clickOnLinkAccount('Link your Event-Driven Ansible account');
    cy.checkLinkedButton('Event-Driven Ansible');
    cy.clickButton(/^Next$/);

    cy.getByDataCy('set-app-credentials').contains('Set your AAP credentials');
    cy.getByDataCy('aap-password').type(newPwd);
    cy.clickButton(/^Submit$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');

    //Log in with newly migrated user
    cy.platformLogout();
    cy.get('input[id*="login-username-id"]').type(hubUsername);
    cy.get('input[id*="login-password-id"]').type(newPwd);
    cy.clickButton(/^Log in$/);
    cy.verifyPageTitle('Welcome to the Ansible Automation Platform');
  });
});
