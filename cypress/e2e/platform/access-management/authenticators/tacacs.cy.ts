import { randomString } from '../../../../../framework/utils/random-string';
import { Tacacs } from '../../../../../platform/interfaces/Tacacs';

describe('TACACS Authentication form - create, edit, update and delete', () => {
  it('creates a TACACS authenticator', () => {
    const tacacsAuthenticator = `E2E TACACS Authenticator ${randomString(4)}`;
    cy.platformLogin();

    cy.fixture('platform-authenticators/tacacs').then((data: Tacacs) => {
      const tacacsData = data;
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');
      // creates a new TACACS authenticator

      cy.containsBy('a', 'Create authentication').click();
      cy.selectAuthenticationType('tacacs');
      cy.clickButton('Next');
      cy.get('[data-cy="name"]').type(tacacsAuthenticator);
      cy.get('[data-cy="configuration-input-HOST"]').type(tacacsData.hostname);
      cy.selectResourceFromDropDown(tacacsData.protocol);
      cy.get('[data-cy="configuration-input-SECRET"]').type(tacacsData.sharedSecret);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');
      cy.verifyPageTitle(tacacsAuthenticator);

      cy.get('[data-cy="name"]').should('have.text', tacacsAuthenticator);
      cy.get('[data-cy="hostname-of-tacacs+-server"]').should('have.text', tacacsData.hostname);
      cy.get('[data-cy="tacacs+-authentication-protocol"]').should(
        'have.text',
        tacacsData.protocol
      );
      cy.navigateTo('platform', 'authenticators');

      // reads, edits and updates the TACACS authenticator
      // enables the TACACS authenticator
      cy.searchAndDisplayResourceByFilterOption(tacacsAuthenticator, 'name').then(() => {
        cy.contains('tr', tacacsAuthenticator).within(() => {
          cy.get('[data-cy=toggle-switch]').click();
          cy.getByDataCy('actions-column-cell').within(() => {
            cy.getByDataCy('edit-authenticator').click();
          });
        });
      });
      cy.get('[data-cy="name"]').clear().type(`${tacacsAuthenticator} Updated`);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      cy.verifyPageTitle(`${tacacsAuthenticator} Updated`);

      //deletes the created TACACS authenticator
      cy.navigateTo('platform', 'authenticators');
      cy.clickTableRowAction('name', `${tacacsAuthenticator} Updated`, 'delete-authentication', {
        inKebab: true,
        disableFilter: true,
      });
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
        cy.contains(/^Success$/).should('be.visible');
        cy.containsBy('button', /^Close$/).click();
      });
    });
  });
});
