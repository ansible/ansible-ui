import { Tasks } from './constants';

describe('Tasks', () => {
  before(() => {
    cy.hubLogin();
  });

  it('should render the tasks page', () => {
    cy.navigateTo('hub', Tasks.url);
    cy.verifyPageTitle(Tasks.title);
  });
});
