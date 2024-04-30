import { EdaRolePermissions } from './EdaRolePermissions';
import { ContentTypeEnum, PermissionsEnum } from '../../../interfaces/generated/eda-api';
import mockEdaCustomRole from '../../../../../cypress/fixtures/edaCustomRoleDefinition.json';

describe('EdaRolePermissions', () => {
  it('renders correctly', () => {
    const role = {
      ...mockEdaCustomRole,
      content_type: mockEdaCustomRole.content_type as ContentTypeEnum,
      permissions: mockEdaCustomRole.permissions as PermissionsEnum[],
    };
    cy.mountEda(<EdaRolePermissions role={role} />);
    cy.get('[data-cy="permissions-description-list"]').should('exist');
    cy.get('[data-cy="eda.project"]').should('exist');
    cy.get('[data-cy="eda.project"]').contains('Project');
    cy.get('[data-cy="permissions-description-list"]').contains('View project');
  });
});
