import { PlatformTeamDetails } from './PlatformTeamDetails';
import mockPlatformTeams from '../../../../cypress/fixtures/platformTeams.json';
import { formatDateString } from '../../../../framework/utils/formatDateString';
import { gatewayAPI } from '../../../api/gateway-api-utils';

const mockPlatformTeam = mockPlatformTeams.results[0];

describe('PlatformTeamDetails', () => {
  it('Component renders and displays team details', () => {
    cy.intercept({ method: 'GET', path: gatewayAPI`/v1/teams/*` }, { body: mockPlatformTeam });
    cy.mount(<PlatformTeamDetails />);
    cy.get('[data-cy="name"]').should('have.text', mockPlatformTeam.name);
    cy.get('[data-cy="description"]').should('have.text', 'This is a description');
    cy.get('[data-cy="organization"]').should(
      'contain',
      mockPlatformTeam.summary_fields.organization.name
    );
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockPlatformTeam.created_on));
    cy.get('[data-cy="created"]').should(
      'contain',
      mockPlatformTeam.summary_fields.created_by.username
    );
    cy.get('[data-cy="modified"]').should(
      'contain',
      formatDateString(mockPlatformTeam.modified_on)
    );
    cy.get('[data-cy="modified"]').should(
      'contain',
      mockPlatformTeam.summary_fields.modified_by.username
    );
  });
});
