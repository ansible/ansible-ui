import { EdaRolePermissions } from './EdaRolePermissions';
import mockEdaCustomRole from '../../../../../cypress/fixtures/edaCustomRoleDefinition.json';

describe('EdaRolePermissions', () => {
  it('renders correctly', () => {
    cy.mountEda(<EdaRolePermissions role={mockEdaCustomRole} />);
    cy.get('[data-cy="permissions-description-list"]').should('exist');
    cy.get('[data-cy="eda.project"]').should('exist');
    cy.get('[data-cy="eda.project"]').contains('Project');
    cy.get('[data-cy="permissions-description-list"]').contains('View project');
  });
});
