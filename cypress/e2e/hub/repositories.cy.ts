import { Repositories } from './constants';

describe('Repositories', () => {
  before(() => {
    cy.hubLogin();
  });
  it('it should render the repositories page', () => {
    cy.navigateTo('hub', Repositories.url);
    cy.verifyPageTitle(Repositories.title);
  });
});
