/* eslint-disable i18next/no-literal-string */
import { Team } from '../../../interfaces/Team';
import { TeamDetails } from './TeamDetails';

describe('TeamDetails', () => {
  it('Component renders and displays team', () => {
    cy.fixture('team').then((team: Team) => {
      cy.mount(<TeamDetails team={team} />);
      cy.get('#name').should('have.text', 'Team 2 Org 0');
      cy.get('a[href*="/ui_next/organizations/details/2"]').should('have.text', 'Organization 0');
    });
  });
});
