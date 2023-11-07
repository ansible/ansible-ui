/* eslint-disable i18next/no-literal-string */
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { AwxTeamDetails } from './AwxTeamDetails';
import mockAwxTeam from '../../../../../cypress/fixtures/team.json';

describe('TeamDetails', () => {
  it('Component renders and displays team details', () => {
    cy.intercept('/api/v2/teams/*', { fixture: 'team.json' });
    cy.mount(<AwxTeamDetails />);
    cy.get('[data-cy="name"]').should('have.text', 'Team 2 Org 0');
    cy.get('[data-cy="description"]').should('have.text', 'test');
    cy.get('[data-cy="organization"]').should('contain', 'Organization 0');
    cy.get('[data-cy="created"]').should('have.text', formatDateString(mockAwxTeam.created));
    cy.get('[data-cy="created"]').should(
      'have.text',
      mockAwxTeam.summary_fields?.created_by?.username
    );
    cy.get('[data-cy="modified"]').should('have.text', formatDateString(mockAwxTeam.modified));
    cy.get('[data-cy="modified"]').should(
      'have.text',
      mockAwxTeam.summary_fields?.modified_by?.username
    );
  });
});
