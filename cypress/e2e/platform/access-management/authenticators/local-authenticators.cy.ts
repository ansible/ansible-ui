import { Authenticator } from '@ansible/platform-ui/interfaces/Authenticator';
import { randomE2Ename } from '../../../../support/utils';

describe('Authenticators - Local CRUD UI', () => {
  beforeEach(() => {
    cy.navigateTo('platform', 'authentications');
    cy.verifyPageTitle('Authentication Methods');
  });

  it('creates a local authenticator, search and delete', () => {
    const localAuthenticatorName = randomE2Ename();
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.clickTableRowLink('name', createdLocalAuthenticator.name);
        cy.verifyPageTitle(localAuthenticatorName);
        cy.get('li[data-cy="Authentication Methods"]').click();
        cy.deleteLocalPlatformAuthenticator(createdLocalAuthenticator);
      }
    );
  });

  it('creates a local authenticator, delete from the list view', () => {
    const localAuthenticatorName = randomE2Ename();
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.clickTableRowAction('name', createdLocalAuthenticator.name, 'delete-authentication', {
          inKebab: true,
        });
        cy.getModal().within(() => {
          cy.get('#confirm').click();
          cy.get('#submit').click();
          cy.contains(/^Success$/).should('be.visible');
        });
      }
    );
  });

  it('create local authenticator via wizard, authenticator details, review and render the authenticator', () => {
    const localAuthenticator = randomE2Ename();
    cy.get('[data-cy="create-authentication"]').click();
    cy.url().should('contain', '/access/authenticators/create');
    cy.selectAuthenticationType('Local');
    cy.clickButton('Next');
    cy.getByDataCy('name').type(localAuthenticator);
    cy.clickButton('Next');
    cy.clickButton('Next');
    cy.clickButton('Finish');
    cy.verifyPageTitle(localAuthenticator);
    cy.navigateTo('platform', 'authentications');
    cy.verifyPageTitle('Authentication Methods');
    cy.clickTableRowAction('name', localAuthenticator, 'delete-authentication', {
      inKebab: true,
    });
    cy.getModal().within(() => {
      cy.get('#confirm').click();
      cy.get('#submit').click();
      cy.contains(/^Success$/).should('be.visible');
    });
    cy.clickButton(/^Clear all filters$/);
  });

  it('user can toggle a created authenticator, can enable or disable it', () => {
    const localAuthenticatorName = randomE2Ename();
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.verifyPageTitle('Authentication Methods');
        cy.getBy('[data-cy="text-input"]').type(createdLocalAuthenticator.name);
        cy.getBy('[data-cy="apply-filter"]').click();
        cy.contains('tr', createdLocalAuthenticator.name).within(() => {
          cy.get('[data-cy=toggle-switch]').click();
          cy.get('.pf-v5-c-switch__label.pf-m-on')
            .should('contain.text', 'Enabled')
            .should('be.be.visible');
        });
        cy.contains('h4', `${createdLocalAuthenticator.name} enabled.`);
        cy.contains('tr', createdLocalAuthenticator.name).within(() => {
          cy.getByDataCy('toggle-switch').click();
          cy.get('.pf-v5-c-switch__label.pf-m-off')
            .should('contain.text', 'Disabled')
            .should('be.be.visible');
        });
        cy.contains('h4', `${createdLocalAuthenticator.name} disabled.`);
        cy.deleteLocalPlatformAuthenticator(createdLocalAuthenticator);
      }
    );
  });

  it('should be able to edit the authenticator from the list page', () => {
    const localAuthenticatorName = randomE2Ename();
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator.name, 'name');
        cy.clickTableRowAction('name', createdLocalAuthenticator.name, 'edit-authentication', {
          inKebab: false,
        });
        cy.getByDataCy('name').clear().type(`${createdLocalAuthenticator.name} Edited`);
        cy.clickButton('Next');
        cy.clickButton('Next');
        cy.clickButton('Finish');
        cy.verifyPageTitle(`${createdLocalAuthenticator.name} Edited`);
        cy.deleteLocalPlatformAuthenticator(createdLocalAuthenticator, { failOnStatusCode: false });
      }
    );
  });

  it('should be able to edit the authenticator from the details page', () => {
    const localAuthenticatorName = randomE2Ename();
    cy.createLocalPlatformAuthenticator(localAuthenticatorName).then(
      (createdLocalAuthenticator: Authenticator) => {
        cy.clickTableRowLink('name', createdLocalAuthenticator.name);
        cy.get('[data-cy="edit-authentication"]').click();
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
    const localAuthenticatorName1 = randomE2Ename();
    const localAuthenticatorName2 = randomE2Ename();
    cy.createLocalPlatformAuthenticator(localAuthenticatorName1).then(
      (createdLocalAuthenticator1: Authenticator) => {
        cy.createLocalPlatformAuthenticator(localAuthenticatorName2).then(
          (createdLocalAuthenticator2: Authenticator) => {
            cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator1.name, 'name').then(
              () => {
                cy.selectTableRowByCheckbox('name', createdLocalAuthenticator1.name, {
                  disableFilter: true,
                });
              }
            );
            cy.clickButton(/^Clear all filters$/);
            cy.searchAndDisplayResourceByFilterOption(createdLocalAuthenticator2.name, 'name').then(
              () => {
                cy.selectTableRowByCheckbox('name', createdLocalAuthenticator2.name, {
                  disableFilter: true,
                });
              }
            );
            cy.clickToolbarKebabAction('delete-authentications');
            cy.getModal().within(() => {
              cy.get('#confirm').click();
              cy.get('#submit').click();
              cy.contains(/^Success$/).should('be.visible');
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
    const localAuthenticatorName1 = randomE2Ename();
    const localAuthenticatorName2 = randomE2Ename();
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
