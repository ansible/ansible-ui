import { ExecutionEnvironments } from './constants';

describe('Execution Environments', () => {
  before(() => {
    cy.hubLogin();
  });

  it('it should render the execution environments page', () => {
    cy.navigateTo('hub', ExecutionEnvironments.url);
    cy.verifyPageTitle(ExecutionEnvironments.title);
  });
});
