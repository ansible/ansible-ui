import { ExecutionEnvironment } from '@ansible/hub-ui/execution-environments/ExecutionEnvironment';
import { ExecutionEnvironments } from '../hub/constants';
import { RemoteRegistry } from '@ansible/hub-ui/administration/remote-registries/RemoteRegistry';
import { AAP_DEV_LOCALHOST_URL, AZURE_URL, OCP_A_URL, SAAS_URL } from '../../support/constants';

describe('If SaaS Build', () => {
  before(function () {
    cy.checkBuildType().then((buildType) => {
      if ([SAAS_URL, AZURE_URL, OCP_A_URL, AAP_DEV_LOCALHOST_URL].includes(buildType as string)) {
        cy.log('Test/tests should not run on this deployment.');
        this.skip();
      } else {
        cy.log('Run these tests');
      }
    });
  });

  describe('Execution Environments: Signing', () => {
    let execEnv: ExecutionEnvironment;
    let remoteReg: RemoteRegistry;

    beforeEach(() => {
      cy.createHubRemoteRegistry().then((remoteRegistry) => {
        remoteReg = remoteRegistry;
        cy.createHubExecutionEnvironment({
          executionEnvironment: {
            include_tags: ['latest'],
            registry: remoteRegistry.id,
          },
        }).then((executionEnvironment) => {
          execEnv = executionEnvironment;
        });
      });
    });

    afterEach(() => {
      cy.deleteHubExecutionEnvironment(execEnv).then(() => {
        cy.deleteHubRemoteRegistry(remoteReg);
      });
    });

    it('should successfully sign execution environment from Docker registry', () => {
      cy.syncRemoteExecutionEnvironment(execEnv);
      cy.navigateTo('hub', ExecutionEnvironments.url);
      cy.verifyPageTitle('Execution Environments');
      cy.filterTableBySingleText(execEnv.name);
      cy.get('a').contains(execEnv.name).click();
      cy.verifyPageTitle(execEnv.name);
      cy.getByDataCy('actions-dropdown').click();
      cy.getByDataCy('sign-execution-environment').click();
      cy.clickModalConfirmCheckbox();
      cy.clickButton('Sign execution environments');
      cy.contains('Success', { timeout: 100000 });
    });
  });
});
