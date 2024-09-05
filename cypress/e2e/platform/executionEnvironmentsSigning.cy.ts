import { ExecutionEnvironments } from '../hub/constants';

describe('Execution Environments: Signing', () => {
  //https://issues.redhat.com/browse/AAP-30525
  it.skip('should successfully sign execution environment from Docker registry', () => {
    cy.createHubRemoteRegistry().then((remoteRegistry) => {
      cy.createHubExecutionEnvironment({
        executionEnvironment: {
          include_tags: ['latest'],
          registry: remoteRegistry.id,
        },
      }).then((executionEnvironment) => {
        cy.syncRemoteExecutionEnvironment(executionEnvironment);
        // sign ee from ui
        cy.navigateTo('hub', ExecutionEnvironments.url);
        cy.verifyPageTitle('Execution Environments');
        cy.filterTableBySingleText(executionEnvironment.name);
        cy.get('a').contains(executionEnvironment.name).click();
        cy.verifyPageTitle(executionEnvironment.name);
        cy.getByDataCy('actions-dropdown').click();
        cy.getByDataCy('sign-execution-environment').click();
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Sign execution environments');
        cy.contains('Success');
        cy.clickButton('Close');
        cy.deleteHubExecutionEnvironment(executionEnvironment).then(() => {
          cy.deleteHubRemoteRegistry(remoteRegistry);
        });
      });
    });
  });
});
