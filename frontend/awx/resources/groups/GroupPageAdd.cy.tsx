import { GroupPageAdd } from './GroupPageAdd';

describe('GroupPageAdd', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/inventories/**',
        hostname: 'localhost',
      },
      {
        fixture: 'inventories.json',
      }
    );
  });

  it('renders create new group page', () => {
    cy.mount(<GroupPageAdd />);
    cy.fixture('inventories.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.contains('Create new group');
      });
  });

  it('disables save button when name is empty', () => {
    cy.mount(<GroupPageAdd />);
    cy.fixture('inventories.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.get('[data-cy="Submit"]').click();
        cy.contains('Name is required.');
        cy.get('[data-cy="Submit"]').should('have.class', 'pf-m-danger');
      });
  });
});
