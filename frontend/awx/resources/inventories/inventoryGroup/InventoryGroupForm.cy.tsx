import { InventoryGroup } from '../../../interfaces/InventoryGroup';
import { CreateGroup, EditGroup } from './InventoryGroupForm';

describe('CreateGroup', () => {
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
    cy.mount(<CreateGroup />);
    cy.fixture('inventories.json')
      .its('results')
      .should('be.an', 'array')
      .then(() => {
        cy.contains('Create new group');
      });
  });

  it('disables save button when name is empty', () => {
    cy.mount(<CreateGroup />);
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

describe('EditGroup', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/groups/**',
        hostname: 'localhost',
      },
      {
        fixture: 'groupDetails.json',
      }
    );
  });

  it('renders and functions correctly', () => {
    cy.mount(<EditGroup />, { path: '/:group_id/', initialEntries: ['/433'] });
    cy.fixture('groupDetails.json').then((group: InventoryGroup) => {
      cy.get('[data-cy="name"]').should('have.value', group.name);
      cy.get('[data-cy="description"]').should('have.value', group.description);
      cy.get('.view-lines').contains('test: true');
    });
  });
});
