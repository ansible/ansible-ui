import { HubDashboard, HubRoutes } from './constants';

describe('hub dashboard', () => {
  before(() => {
    cy.hubLogin();
  });
  it('render the hub dashboard', () => {
    cy.visit(HubRoutes.dashboard);
    cy.get('.pf-c-title').contains(HubDashboard.title);
  });
});
