import { CreateInventorySource } from './InventorySourceForm';

describe('CreateInventorySource', () => {
  it('renders create new source page', () => {
    cy.mount(<CreateInventorySource />);
    cy.contains('Add new source');
  });

  it('disables save button when name is empty', () => {
    cy.mount(<CreateInventorySource />);
    cy.get('[data-cy="Submit"]').click();
    cy.contains('Name is required.');
    cy.get('[data-cy="Submit"]').should('have.class', 'pf-m-danger');
  });
});
