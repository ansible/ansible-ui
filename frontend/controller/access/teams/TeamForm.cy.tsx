import { MemoryRouter } from 'react-router-dom';
import { CreateTeam } from './TeamForm';

describe('TeamForm.cy.ts', () => {
  it('Create Team - Displays error message on internal server error', () => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations/*',
      },
      {
        statusCode: 500,
        message: 'Internal Server Error',
      }
    );
    cy.intercept(
      {
        method: 'POST',
        url: '/api/v2/teams',
      },
      {
        statusCode: 500,
        message: 'Internal Server Error',
      }
    );
    cy.mount(
      <MemoryRouter>
        <CreateTeam />
      </MemoryRouter>
    );
    cy.clickButton(/^Create team$/);
    cy.typeByLabel(/^Name$/, 'Test');
    cy.typeByLabel(/^Organization$/, 'Default');
    cy.clickButton(/^Create team$/);
    cy.contains('Error validating organization').should('be.visible');
  });
});
