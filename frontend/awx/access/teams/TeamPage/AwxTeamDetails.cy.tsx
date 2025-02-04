/* eslint-disable i18next/no-literal-string */
import { formatDateString } from '@ansible/ansible-ui-framework/utils/formatDateString';
import mockAwxTeam from '@ansible/cypress/fixtures/team.json';
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { AwxTeamDetails } from './AwxTeamDetails';

describe('TeamDetails', () => {
  it('Component renders and displays team details', () => {
    cy.intercept(awxAPI`/teams/*`, { fixture: 'team.json' });
    cy.mount(<AwxTeamDetails />);
    cy.get('[data-cy="name"]').should('have.text', 'Team 2 Org 0');
    cy.get('[data-cy="description"]').should('have.text', 'This is a description');
    cy.get('[data-cy="organization"]').should('contain', 'Organization 0');
    cy.get('[data-cy="created"]').should('contain', formatDateString(mockAwxTeam.created));
    cy.get('[data-cy="created"]').should(
      'contain',
      mockAwxTeam.summary_fields?.created_by?.username
    );
    cy.get('[data-cy="last-modified"]').should('contain', formatDateString(mockAwxTeam.modified));
    cy.get('[data-cy="last-modified"]').should(
      'contain',
      mockAwxTeam.summary_fields?.modified_by?.username
    );
  });
});
