import { randomString } from '../../../framework/utils/random-string';
import { Tasks } from './constants';

describe('Tasks', () => {
  before(() => {
    cy.hubLogin();
  });

  it('should render the tasks page', () => {
    cy.navigateTo('hub', Tasks.url);
    cy.verifyPageTitle(Tasks.title);
  });

  it('should search for a task', () => {
    const remoteName = `test-remote-${randomString(5, undefined, { isLowercase: true })}`;
    cy.searchAndDisplayResource(remoteName);
    cy.contains(Tasks.noResults);
    cy.clickButton(/^Clear all filters$/);
  });
});
