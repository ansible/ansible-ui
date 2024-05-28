import { formatDateString } from '../../../../framework/utils/formatDateString';
import mockBuiltInRole from '../../../../cypress/fixtures/awxBuiltInRoleDefinition.json';
import mockCustomRole from '../../../../cypress/fixtures/awxCustomRoleDefinition.json';
import { AwxRoleDetails } from './AwxRoleDetails';

describe('AwxRoleDetails', () => {
  it('should display team details for built in roles', () => {
    cy.intercept('/api/v2/role_definitions/*', { fixture: 'awxBuiltInRoleDefinition.json' });
    cy.mount(<AwxRoleDetails />);
    cy.get('[data-cy="name"]').should('have.text', mockBuiltInRole.name);
    cy.get('[data-cy="description"]').should('have.text', mockBuiltInRole.description);
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockBuiltInRole.created));
    cy.get('[data-cy="awx.credential"]').should('contain', 'Credential');
    cy.get('[data-cy="permissions"]').should('contain', 'Change credential');
    cy.get('[data-cy="permissions"]').should('contain', 'Delete credential');
    cy.get('[data-cy="permissions"]').should('contain', 'Use credential');
  });

  it('should display team details for custom roles', () => {
    cy.intercept('/api/v2/role_definitions/*', { fixture: 'awxCustomRoleDefinition.json' });
    cy.mount(<AwxRoleDetails />);
    cy.get('[data-cy="name"]').should('have.text', mockCustomRole.name);
    cy.get('[data-cy="description"]').should('have.text', mockCustomRole.description);
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockCustomRole.created));
    cy.get('[data-cy="awx.inventory"]').should('contain', 'Inventory');
    cy.get('[data-cy="permissions"]').should('contain', 'View inventory');
  });
});
