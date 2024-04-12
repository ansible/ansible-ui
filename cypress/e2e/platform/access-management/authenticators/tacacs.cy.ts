import { randomE2Ename } from '../../../../support/utils';
import { Tacacs } from '../../../../../platform/interfaces/Tacacs';

describe('TACACS Authentication form - create, edit, update and delete', () => {
  it('creates a TACACS authenticator', () => {
    const tacacsAuthenticator = randomE2Ename();
    cy.platformLogin();

    cy.fixture('platform-authenticators/tacacs').then((tacacsData: Tacacs) => {
      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');

      // Click on the Create Authentication button
      cy.containsBy('a', 'Create authentication').click();

      // Authentication Wizard - Authentication Type Step
      cy.verifyPageTitle('Create Authentication');
      cy.selectAuthenticationType('tacacs');
      cy.clickButton('Next');

      // Authentication Wizard - Authentication Details Step
      cy.get('[data-cy="name"]').type(tacacsAuthenticator);
      cy.get('[data-cy="configuration-input-HOST"]').type(tacacsData.hostname);
      cy.selectResourceFromDropDown(tacacsData.protocol);
      cy.get('[data-cy="configuration-input-SECRET"]').type(tacacsData.sharedSecret);
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      // Authentication Details Page
      cy.verifyPageTitle(tacacsAuthenticator);
      cy.get('[data-cy="name"]').should('have.text', tacacsAuthenticator);
      cy.get('[data-cy="hostname-of-tacacs+-server"]').should('have.text', tacacsData.hostname);
      cy.get('[data-cy="tacacs+-authentication-protocol"]').should(
        'have.text',
        tacacsData.protocol
      );
      cy.get('[data-cy="shared-secret-for-authenticating-to-tacacs+-server-"]').should(
        'have.text',
        '$encrypted$'
      );
      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');

      // Enables the TACACS authenticator
      cy.getTableRow('name', tacacsAuthenticator).within(() => {
        cy.get('[data-cy=toggle-switch]').click();
      });

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');

      // Edit the TACACS authenticator
      cy.clickTableRowAction('name', tacacsAuthenticator, 'edit-authenticator');

      // Authentication Wizard
      cy.get('[data-cy="name"]')
        .clear()
        .type(tacacsAuthenticator + '_edited');
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');

      // Authentication Details Page
      // Verify the edited TACACS authenticator
      cy.verifyPageTitle(tacacsAuthenticator + '_edited');
      cy.get('[data-cy="name"]').should('have.text', tacacsAuthenticator + '_edited');

      // Authentication List Page
      cy.navigateTo('platform', 'authenticators');
      cy.verifyPageTitle('Authentication');

      // Delete the TACACS authenticator
      cy.clickTableRowAction('name', tacacsAuthenticator + '_edited', 'delete-authentication', {
        inKebab: true,
      });
      cy.getModal().within(() => {
        cy.get('#confirm').click();
        cy.get('#submit').click();
        cy.contains(/^Success$/).should('be.visible');
        cy.containsBy('button', /^Close$/).click();
      });
      cy.getModal().should('not.exist');
    });
  });
});
