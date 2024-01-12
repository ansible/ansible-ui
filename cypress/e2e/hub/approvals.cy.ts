import { Approvals } from './constants';

describe('Approvals', () => {
  before(() => {
    cy.hubLogin();
  });

  it('it should render the approvals page', () => {
    cy.navigateTo('hub', Approvals.url);
    cy.verifyPageTitle(Approvals.title);
  });
});
