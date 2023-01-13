/* eslint-disable i18next/no-literal-string */
import { Team } from '../../../interfaces/Team';
import { TeamDetails } from './TeamDetails';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

describe('TeamDetails', () => {
  it('Component renders and displays team', () => {
    cy.fixture('team').then((team: Team) => {
      cy.mount(
        <MemoryRouter initialEntries={['/teams']} initialIndex={0}>
          <TeamDetails team={team} />
        </MemoryRouter>
      );
      cy.get('dd').first().should('have.text', 'Team 2 Org 0');
      cy.get('a[href*="/controller/organizations/details/2"]').should(
        'have.text',
        'Organization 0'
      );
    });
  });
  it('Triggers navigation to user details on click', () => {
    cy.fixture('team').then((team: Team) => {
      cy.mount(
        <MemoryRouter initialEntries={['/controller/teams/2/details']}>
          <Routes>
            <Route element={<TeamDetails team={team} />} path="/controller/teams/2/details" />
            <Route
              element={<div data-test-id="user-details">user-8 details</div>}
              path="/controller/users/15/details"
            />
          </Routes>
        </MemoryRouter>
      );
      cy.get('button')
        .contains(/^user-8$/) // Team created by user with name 'user-8'
        .click();
      cy.get('div[data-test-id="user-details"]').should('have.text', 'user-8 details');
    });
  });
});
