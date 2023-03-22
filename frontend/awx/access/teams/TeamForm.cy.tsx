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
    cy.mount(<CreateTeam />);
    cy.typeByLabel(/^Name$/, 'Test');
    cy.typeByLabel(/^Organization$/, 'Default');
    cy.clickButton(/^Create team$/);
    cy.contains('Error validating organization').should('be.visible');
  });
  it('Create Team - Validation on name and organization', () => {
    cy.mount(<CreateTeam />);
    cy.clickButton(/^Create team$/);
    cy.contains('Name is required.').should('be.visible');
    cy.contains('Organization is required.').should('be.visible');
  });
});
