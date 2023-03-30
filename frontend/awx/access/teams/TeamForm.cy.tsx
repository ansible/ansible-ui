import { CreateTeam } from './TeamForm';

describe('TeamForm.cy.ts', () => {
  it('Create Team - Displays organization error message on internal server error', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/organizations/*' },
      { statusCode: 500, message: 'Internal Server Error' }
    );
    cy.mount(<CreateTeam />);
    cy.contains('Error loading organizations').should('be.visible');
  });
  it('Create Team - Submit error message on internal server error', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/organizations/*' },
      { count: 1, results: [{ id: 0, name: 'Default' }] }
    );
    cy.mount(<CreateTeam />);
    cy.typeByLabel(/^Name$/, 'Test');
    cy.selectByLabel(/^Organization$/, 'Default');
    cy.intercept(
      { method: 'POST', url: '/api/v2/teams' },
      { statusCode: 500, message: 'Internal Server Error' }
    );
    cy.clickButton(/^Create team$/);
    cy.contains('Internal Server Error').should('be.visible');
  });
  it('Create Team - Validation on name and organization', () => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/organizations/*' },
      {
        count: 2,
        results: [
          { id: 0, name: 'Default' },
          { id: 1, name: 'Organization 1' },
        ],
      }
    );
    cy.mount(<CreateTeam />);
    cy.clickButton(/^Create team$/);
    cy.contains('Name is required.').should('be.visible');
    cy.contains('Organization is required.').should('be.visible');
  });
});
