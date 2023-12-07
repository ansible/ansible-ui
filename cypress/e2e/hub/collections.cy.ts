import { Collections } from './constants';

describe('Collections', () => {
  before(() => {
    cy.hubLogin();
  });

  it('it should render the collections page', () => {
    cy.navigateTo('hub', Collections.url);
    cy.verifyPageTitle(Collections.title);
  });
});
