import { DateTime } from 'luxon';
import mockPlatformTeams from '../../../../cypress/fixtures/platformTeams.json';
import { gatewayV1API } from '../../../api/gateway-api-utils';
import { PlatformTeamDetails } from './PlatformTeamDetails';
import { formatDateString } from '../../../../framework/utils/formatDateString';

const mockPlatformTeam = mockPlatformTeams.results[0];

describe('PlatformTeamDetails', () => {
  it('Component renders and displays team details', () => {
    cy.intercept({ method: 'GET', path: gatewayV1API`/teams/*` }, { body: mockPlatformTeam });
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
