import { Namespaces } from './constants';

describe('Namespaces', () => {
  before(() => {
    cy.hubLogin();
  });
  it('it should render the namespaces page', () => {
    cy.navigateTo('hub', Namespaces.url);
    cy.verifyPageTitle(Namespaces.title);
  });
});
