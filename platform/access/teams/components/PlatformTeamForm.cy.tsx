import { gatewayAPI } from '../../../api/gateway-api-utils';
import { CreatePlatformTeam } from './PlatformTeamForm';

describe('PlatformTeamForm.cy.ts', () => {
  it('Create Team - Validation on name and organization', () => {
    cy.intercept(
      { method: 'GET', url: gatewayAPI`/organizations/*` },
      {
        count: 2,
        results: [
          { id: 0, name: 'Default' },
          { id: 1, name: 'Organization 1' },
        ],
      }
    );
    cy.mount(<CreatePlatformTeam />);
    cy.clickButton(/^Create team$/);
    cy.contains('Name is required.').should('be.visible');
    cy.contains('Organization is required.').should('be.visible');
  });
});
