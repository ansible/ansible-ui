import { randomString } from '../../../../../framework/utils/random-string';
import { Authenticator } from '../../../../../platform/interfaces/Authenticator';

describe('Authenticators - Local CRUD UI', () => {
  beforeEach(() => {
    cy.platformLogin();
    cy.navigateTo('platform', 'authenticators');
    cy.verifyPageTitle('Authentication Methods');
  });

  it('creates a local authenticator, search and delete', () => {
    const localAuthenticatorName = `Platform Local Authenticator ${randomString(4)}`;
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.clickTableRowLink('name', createdLocalAuthenticator.name);
        cy.verifyPageTitle(localAuthenticatorName);
        cy.get('a[data-cy="Authenticators"]').click();
        cy.deleteLocalPlatformAuthenticator(createdLocalAuthenticator);
      }
    );
  });

  it('creates a local authenticator, delete from the list view', () => {
    const localAuthenticatorName = `Platform Local Authenticator ${randomString(4)}`;
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator.name, 'name');
        cy.clickTableRowAction('name', createdLocalAuthenticator.name, 'delete-authentication', {
          inKebab: true,
        });
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.get('#submit').click();
          cy.contains(/^Success$/).should('be.visible');
          cy.containsBy('button', /^Close$/).click();
        });
      }
    );
  });

  it('create local authenticator via wizard, authenticator details, review and render the authenticator', () => {
    const localAuthenticator = `Platform Local Authenticator Enabled ${randomString(4)}`;
    cy.get('[data-cy="create-authentication"]').click();
    cy.url().should('contain', '/access/authenticators/create');
    cy.selectAuthenticationType('local');
    cy.clickButton('Next');
    cy.get('[data-cy="name"]').type(localAuthenticator);
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.verifyPageTitle(localAuthenticator);
    cy.navigateTo('platform', 'authenticators');
    cy.searchAndDisplayResourceByFilterOption(localAuthenticator, 'name');
    cy.clickTableRowAction('name', localAuthenticator, 'delete-authentication', {
      inKebab: true,
    });
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains(/^Success$/).should('be.visible');
      cy.containsBy('button', /^Close$/).click();
    });
    cy.clickButton(/^Clear all filters$/);
  });

  it('user can toggle a created authenticator, can enable or disable it', () => {
    const localAuthenticatorName = `Platform Local Authenticator ${randomString(4)}`;
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.verifyPageTitle('Authentication Methods');
        cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator.name, 'name');
        cy.contains('tr', createdLocalAuthenticator.name).within(() => {
          cy.get('[data-cy=toggle-switch]').click();
          cy.get('.pf-v5-c-switch__label.pf-m-on')
            .should('contain.text', 'Enabled')
            .should('be.be.visible');
        });
        cy.contains('h4', `${createdLocalAuthenticator.name} enabled.`);
        cy.contains('tr', createdLocalAuthenticator.name).within(() => {
          cy.get('[data-cy=toggle-switch]').click();
          cy.get('.pf-v5-c-switch__label.pf-m-off')
            .should('contain.text', 'Disabled')
            .should('be.be.visible');
        });
        cy.contains('h4', `${createdLocalAuthenticator.name} disabled.`);
        cy.clickButton(/^Clear all filters$/);
        cy.deleteLocalPlatformAuthenticator(createdLocalAuthenticator);
      }
    );
  });

  it('should be able to edit the authenticator from the list page', () => {
    const localAuthenticatorName = `Platform Local Authenticator ${randomString(4)}`;
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator.name, 'name');
        cy.clickTableRowAction('name', createdLocalAuthenticator.name, 'edit-authenticator', {
          inKebab: true,
        });
        cy.get('[data-cy="name"]').clear().type(`${createdLocalAuthenticator.name} Edited`);
        cy.clickButton('Next');
        cy.clickButton('Next');
        cy.clickButton('Finish');
        cy.verifyPageTitle(`${createdLocalAuthenticator.name} Edited`);
        cy.deleteLocalPlatformAuthenticator(createdLocalAuthenticator, { failOnStatusCode: false });
      }
    );
  });

  it('should be able to edit the authenticator from the details page', () => {
    const localAuthenticatorName = `Platform Local Authenticator ${randomString(4)}`;
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.clickTableRowLink('name', createdLocalAuthenticator.name);
        cy.get('[data-cy="edit-authenticator"]').click();
        cy.get('[data-cy="name"]').clear().type(`${createdLocalAuthenticator.name} Edited`);
        cy.clickButton('Next');
        cy.clickButton('Next');
        cy.clickButton('Finish');
        cy.verifyPageTitle(`${createdLocalAuthenticator.name} Edited`);
        cy.deleteLocalPlatformAuthenticator(createdLocalAuthenticator, { failOnStatusCode: false });
      }
    );
  });

  it('should be able to bulk delete authenticators using the page toolbar', () => {
    const localAuthenticatorName1 = `Platform Local Authenticator ${randomString(4)}`;
    const localAuthenticatorName2 = `Platform Local Authenticator ${randomString(4)}`;
    cy.createLocalPlatformAuthenticator(localAuthenticatorName1).then(
      (createdLocalAuthenticator1: Authenticator) => {
        cy.createLocalPlatformAuthenticator(localAuthenticatorName2).then(
          (createdLocalAuthenticator2: Authenticator) => {
            cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator1.name, 'name').then(
              () => {
                cy.get('td[data-cy="name-column-cell"]')
                  .contains(createdLocalAuthenticator1.name)
                  .parents('tr')
                  .find('td[data-cy="checkbox-column-cell"]')
                  .click();
              }
            );
            cy.clickButton(/^Clear all filters$/);
            cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator2.name, 'name').then(
              () => {
                cy.get('td[data-cy="name-column-cell"]')
                  .should('have.text', createdLocalAuthenticator2.name)
                  .parents('tr')
                  .find('td[data-cy="checkbox-column-cell"]')
                  .click();
              }
            );
            cy.clickToolbarKebabAction('delete-selected-authentications');
            cy.getModal().within(() => {
              cy.get('#confirm').click();
              cy.get('#submit').click();
              cy.contains(/^Success$/).should('be.visible');
              cy.containsBy('button', /^Close$/).click();
            });
            cy.clickButton(/^Clear all filters$/);
          }
        );
      }
    );
  });

  //passes locally but not on the CI server as the manage order modal doesn't display paginated authenticators
  //discussed with Laura, needs some BE work, bug ticket #
  it.skip('should be able to manage the order the authenticators', () => {
    const localAuthenticatorName1 = `Platform Local Authenticator ${randomString(4)}`;
    const localAuthenticatorName2 = `Platform Local Authenticator ${randomString(4)}`;
    cy.createLocalPlatformAuthenticator(localAuthenticatorName1).then(
      (createdLocalAuthenticator1: Authenticator) => {
        cy.createLocalPlatformAuthenticator(localAuthenticatorName2).then(
          (createdLocalAuthenticator2: Authenticator) => {
            cy.reload(); //bug created for this #
            cy.get(
              '.pf-v5-c-toolbar__group .pf-v5-c-dropdown [data-cy="actions-dropdown"]'
            ).click();
            cy.get('[data-cy=manage-authenticators]').click();
            cy.get(`tr[id="${createdLocalAuthenticator1.name}"] button`).drag(
              `tr[id="${createdLocalAuthenticator2.name}"] button`,
              {
                source: { x: 100, y: 100 }, // applies to the element being dragged
                force: true,
              }
            );
            cy.contains('button', 'Apply').click();
          }
        );
      }
    );
  });
});
