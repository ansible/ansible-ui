import { formatDateString } from '../../../../framework/utils/formatDateString';
import mockEdaBuiltInRole from '../../../../cypress/fixtures/edaBuiltInRoleDefinition.json';
import mockEdaCustomRole from '../../../../cypress/fixtures/edaCustomRoleDefinition.json';
import { EdaRoleDetails } from './EdaRoleDetails';

describe('EdaRoleDetails', () => {
  it('Component renders and displays team details for built in roles', () => {
    cy.intercept('/api/eda/v1/role_definitions/*', { fixture: 'edaBuiltInRoleDefinition.json' });
    cy.mountEda(<EdaRoleDetails />);
    cy.get('[data-cy="name"]').should('have.text', mockEdaBuiltInRole.name);
    cy.get('[data-cy="description"]').should('have.text', mockEdaBuiltInRole.description);
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockEdaBuiltInRole.created));
    cy.get('[data-cy="modified"]').should('contain', formatDateString(mockEdaBuiltInRole.modified));
    cy.get('[data-cy="eda.project"]').should('contain', 'Project');
    cy.get('[data-cy="permissions"]').should('contain', 'Change project');
    cy.get('[data-cy="permissions"]').should('contain', 'View project');
    cy.get('[data-cy="permissions"]').should('contain', 'Delete project');
  });
  it('Component renders and displays team details for custom roles', () => {
    cy.intercept('/api/eda/v1/role_definitions/*', { fixture: 'edaCustomRoleDefinition.json' });
    cy.mountEda(<EdaRoleDetails />);
    cy.get('[data-cy="name"]').should('have.text', mockEdaCustomRole.name);
    cy.get('[data-cy="description"]').should('have.text', mockEdaCustomRole.description);
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockEdaCustomRole.created));
    cy.get('[data-cy="modified"]').should('contain', formatDateString(mockEdaCustomRole.modified));
    cy.get('[data-cy="eda.project"]').should('contain', 'Project');
    cy.get('[data-cy="permissions"]').should('contain', 'View project');
  });
});
