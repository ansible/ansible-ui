//Tests a user's ability to create, edit, and delete a custom role in the EDA UI.
import { randomString } from '../../../../framework/utils/random-string';
import { cyLabel } from '../../../support/cyLabel';

cyLabel(['upstream'], () => {
  describe('EDA Custom Roles- Create', () => {
    const name = 'E2E Custom Role ' + randomString(4);

    it('can create a custom role', () => {
      cy.navigateTo('eda', 'roles');
      cy.get('h1').should('contain', 'Roles');
      cy.get('[id="create-role"]').click();
      cy.get('[data-cy="name"]').type(name);
      cy.get('[data-cy="description"]').type('This is a Custom Role.');
      cy.get('[data-cy="content-type-form-group"]').click();
      cy.get('[id="activation"]').click();
      cy.get('[data-cy="permissions"]').click();
      cy.get('[data-cy="view-activation"] input').click();
      cy.clickButton(/^Create role$/);
      cy.hasDetail('Name', name);
      cy.hasDetail('Description', 'This is a Custom Role.');
    });

    it('can edit a custom role', () => {
      cy.navigateTo('eda', 'roles');
      cy.get('h1').should('contain', 'Roles');
      cy.clickTableRow(name, true);
      cy.clickButton(/^Edit role$/);
      cy.verifyPageTitle(`Edit ${name}`);
      cy.get('[data-cy="description"]').clear().type('this custom role has been changed');
      cy.clickButton(/^Save role$/);
      cy.hasDetail('Description', 'this custom role has been changed');
    });

    it('can delete a custom role', () => {
      cy.navigateTo('eda', 'roles');
      cy.get('h1').should('contain', 'Roles');
      cy.clickTableRow(name);
      cy.verifyPageTitle(name);
      cy.clickPageAction('delete-role');
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete role');
      cy.verifyPageTitle('Roles');
    });
  });
});
