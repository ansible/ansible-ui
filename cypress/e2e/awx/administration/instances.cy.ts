import * as path from 'path';
import { randomString } from '../../../../framework/utils/random-string';
import { Instance } from '../../../../frontend/awx/interfaces/Instance';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Settings } from '../../../../frontend/awx/interfaces/Settings';

describe('Instances: All Tests', () => {
  let isK8S = false;

  before(() => {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      if (data?.IS_K8S) {
        isK8S = true;
      } else {
        cy.log('Skip test not running on IS_K8S');
      }
    });
  });

  describe('Instances: Add/Edit', () => {
    let instance: Instance;

    beforeEach(() => {
      if (isK8S) {
        cy.createAwxInstance('E2EInstanceTestAddEdit' + randomString(5)).then((ins: Instance) => {
          instance = ins;
        });
        cy.navigateTo('awx', 'instances');
        cy.verifyPageTitle('Instances');
      }
    });

    afterEach(() => {
      if (instance && isK8S) {
        cy.removeAwxInstance(instance.id.toString());
      }
    });

    it('can add a new instance and navigate to the details page', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      const instanceHostname = 'E2EInstanceTestAddEdit' + randomString(5);
      // Navigate to the create instance page
      cy.getByDataCy('add-instance').click();
      cy.getByDataCy('page-title').should('contain', 'Add instance');
      // Create a new instance
      cy.getByDataCy('hostname').type(instanceHostname);
      cy.getByDataCy('listener-port').type('9999');
      cy.getByDataCy('managed_by_policy').click();
      cy.getByDataCy('peers_from_control_nodes').click();
      cy.getByDataCy('Submit').click();
      // Verify the instance was created by checking the page title
      // as the instance detail page is navigated to after creation
      cy.verifyPageTitle(instanceHostname);
      // Verify the instance details
      cy.getByDataCy('name').should('contain', instanceHostname);
      cy.getByDataCy('node-type').should('contain', 'Execution');
      cy.getByDataCy('status').should('contain', 'Installed');
      cy.getByDataCy('listener-port').should('contain', '9999');
      cy.getByDataCy('actions-dropdown').click();
      cy.getByDataCy('remove-instance').click();
      cy.getModal().within(() => {
        cy.get('header').contains('Permanently remove instances');
        cy.get('button').contains('Remove instance').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('name-column-cell').should('have.text', instanceHostname);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove instance').click();
      });
    });

    it('can edit an instance from the instances list view and assert info on details page', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.intercept('PATCH', awxAPI`/instances/*/`).as('editedInstance');
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
      });
      cy.getByDataCy('actions-dropdown').click();
      cy.getByDataCy('edit-instance').click();
      cy.getByDataCy('listener-port').type('9999');
      cy.getByDataCy('enabled').check();
      cy.getByDataCy('managed_by_policy').check();
      cy.getByDataCy('peers_from_control_nodes').check();
      cy.clickButton(/^Save$/);
      cy.wait('@editedInstance')
        .its('response.body')
        .then((body: Instance) => {
          expect(body.hostname).to.eql(instance.hostname);
          expect(body.listener_port).to.eql(9999);
          expect(body.enabled).to.eql(true);
          expect(body.managed_by_policy).to.eql(true);
          expect(body.peers_from_control_nodes).to.eql(true);
          cy.getByDataCy('actions-dropdown').click();
          cy.getByDataCy('remove-instance').click();
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.get('header').contains('Permanently remove instances');
            cy.get('button')
              .contains('Remove instance')
              .should('have.attr', 'aria-disabled', 'true');
            cy.getByDataCy('name-column-cell').should('have.text', instance.hostname);
            cy.get('input[id="confirm"]').click();
            cy.get('button').contains('Remove instance').click();
          });
        });
    });

    it('can visit the details page of an Instance and verify the bundle download feature', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
      cy.verifyPageTitle(instance.hostname);
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes('infrastructure/instances/')).to.be.true;
      });
      cy.getByDataCy('name').should('contain', instance.hostname);
      cy.getByDataCy('node-type').should('contain', 'Execution');
      cy.getByDataCy('status').should('contain', 'Installed');
      cy.get('[data-cy="download-bundle"]').within(() => {
        cy.get('a').click();
      });
      const downloadsFolder = Cypress.config('downloadsFolder');
      const downloadedFilename = path.join(
        downloadsFolder,
        `${instance.hostname}_install_bundle.tar.gz`
      );
      cy.readFile(downloadedFilename, null, { timeout: 45000 }).then((buffer: Buffer) => {
        expect(Cypress.Buffer.isBuffer(buffer)).to.be.true;
        expect(buffer.length).to.be.gt(5000);
      });
    });

    it('can uncheck the Enable Instance checkbox on the edit form, save form, and see the toggle is off', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes(`/infrastructure/instances/${instance.id}/details`)).to.be.true;
      });
      cy.get('input[aria-label="Enabled"]').should('exist');
      cy.getByDataCy('actions-dropdown').click();
      cy.getByDataCy('edit-instance').click();
      cy.getByDataCy('enabled').uncheck();
      cy.intercept('PATCH', awxAPI`/instances/*/`).as('editedInstance');
      cy.clickButton(/^Save$/);
      cy.wait('@editedInstance')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(200);
        })
        .its('response.body')
        .then((response: Instance) => {
          expect(response.enabled).to.be.false;
        });
      cy.get('input[aria-label="Disabled"]').should('exist');
    });
  });

  describe('Instances: Delete', () => {
    let instance: Instance;
    const testSignature: string = randomString(5, undefined, { isLowercase: true });
    function generateInstanceName(): string {
      return `test-${testSignature}-instance-${randomString(5, undefined, { isLowercase: true })}`;
    }

    beforeEach(() => {
      if (isK8S) {
        cy.createAwxInstance('E2EInstanceTestRemove' + randomString(5)).then((ins: Instance) => {
          instance = ins;
        });
        cy.navigateTo('awx', 'instances');
        cy.verifyPageTitle('Instances');
      }
    });

    it('can remove an instance from details page', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.intercept('PATCH', awxAPI`/instances/*`).as('removedInstance');
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
      });
      cy.getByDataCy('actions-dropdown').click();
      cy.getByDataCy('remove-instance').click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Permanently remove instances');
        cy.get('button').contains('Remove instance').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('name-column-cell').should('have.text', instance.hostname);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove instance').click();
      });
      cy.wait('@removedInstance')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(200);
        });
    });

    it('can remove an instance from instance list toolbar', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.intercept('PATCH', awxAPI`/instances/*`).as('removedInstance');
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="remove-instance"]').should('have.attr', 'aria-disabled', 'true');
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.contains('tr', instance.hostname).find('input').check();
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="remove-instance"]').should('have.attr', 'aria-disabled', 'false');
      cy.get('[data-cy="remove-instance"]').click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Permanently remove instances');
        cy.get('button').contains('Remove instance').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('name-column-cell').should('have.text', instance.hostname);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove instance').click();
      });
      cy.wait('@removedInstance')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(200);
        });
      cy.clickButton('Close');
    });

    it('can bulk remove instances', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      const arrayOfElementText = [];
      for (let i = 0; i < 5; i++) {
        const instanceName = generateInstanceName();
        cy.createAwxInstance(instanceName);
        arrayOfElementText.push(instanceName);
      }
      arrayOfElementText.push(instance.hostname);
      cy.intercept('PATCH', awxAPI`/instances/*`).as('removedInstance');
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="remove-instance"]').should('have.attr', 'aria-disabled', 'true');
      cy.filterTableByMultiSelect('hostname', arrayOfElementText);
      cy.get('tbody tr').should('have.length', 6);
      cy.getByDataCy('select-all').click();
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="remove-instance"]').should('have.attr', 'aria-disabled', 'false');
      cy.get('[data-cy="remove-instance"]').click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Permanently remove instances');
        cy.get('button').contains('Remove instance').should('have.attr', 'aria-disabled', 'true');
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Remove instance').click();
      });
      cy.wait('@removedInstance')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(200);
        });
    });
  });

  describe('Instances: Run Health Check', () => {
    let instance: Instance;

    beforeEach(() => {
      if (isK8S) {
        cy.createAwxInstance('E2EInstanceRunHealthCheck' + randomString(5)).then(
          (ins: Instance) => {
            instance = ins;
          }
        );
        cy.navigateTo('awx', 'instances');
        cy.verifyPageTitle('Instances');
      }
    });

    afterEach(() => {
      if (isK8S) {
        cy.removeAwxInstance(instance.id.toString());
      }
    });

    it('can run a health check on an Instance in the instance list toolbar and assert the expected results', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="run-health-check"]').should('have.attr', 'aria-disabled', 'true');
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.contains('tr', instance.hostname).find('input').check();
      cy.get('[data-cy="actions-dropdown"]').click();
      cy.get('[data-cy="run-health-check"]').should('have.attr', 'aria-disabled', 'false');
      cy.getBy('[data-ouia-component-id="page-toolbar"]').within(() => {
        cy.getByDataCy('run-health-check').click();
      });
      cy.intercept('POST', awxAPI`/instances/*/health_check/`).as('runHealthCheck');
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Run health checks on these instances');
        cy.get('button').contains('Run health check').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('name-column-cell').should('have.text', instance.hostname);
        cy.get('input[id="confirm"]').click();
        cy.get('button').contains('Run health check').click();
      });
      cy.wait('@runHealthCheck')
        .then((response) => {
          expect(response.response?.statusCode).to.eql(200);
        })
        .its('response.body.msg')
        .then((response) => {
          expect(response).contains(`Health check is running for ${instance.hostname}.`);
        });
      cy.clickModalButton('Close');
      cy.get('[data-cy="status-column-cell"]').contains('Running');
    });

    it('can run a health check on an Instance in the instance details page and assert the expected results', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
      cy.verifyPageTitle(instance.hostname);
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes(`/infrastructure/instances/${instance.id}/details`)).to.be.true;
      });
      cy.intercept('POST', awxAPI`/instances/*/health_check/`).as('runHealthCheck');
      cy.getByDataCy('run-health-check').click();
      cy.wait('@runHealthCheck')
        .then((response) => {
          expect(response.response?.statusCode).to.eql(200);
        })
        .its('response.body.msg')
        .then((response) => {
          expect(response).contains(`Health check is running for ${instance.hostname}.`);
        });
      cy.get('[data-cy="run-health-check"]').should('have.attr', 'aria-disabled', 'true');
    });

    it('can run a health check on an Instance in the instance list from row action and assert the expected results', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.intercept('POST', awxAPI`/instances/*/health_check/`).as('runHealthCheck');
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowPinnedAction(instance.hostname, 'run-health-check', false);
      cy.wait('@runHealthCheck')
        .then((response) => {
          expect(response.response?.statusCode).to.eql(200);
        })
        .its('response.body.msg')
        .then((response) => {
          expect(response).contains(`Health check is running for ${instance.hostname}.`);
        });
      cy.get('[data-cy="status-column-cell"]').contains('Running');
    });
  });

  describe('Instances: Peers', () => {
    let instance: Instance;
    let instanceToAssociate: Instance;

    beforeEach(() => {
      if (isK8S) {
        cy.createAwxInstance('E2EInstanceTestPeers' + randomString(5), 8888).then(
          (ins: Instance) => {
            instance = ins;
            cy.createAwxInstance('E2EInstanceTestToAssociate' + randomString(5), 9999).then(
              (ins: Instance) => {
                instanceToAssociate = ins;
              }
            );
          }
        );
        cy.navigateTo('awx', 'instances');
        cy.verifyPageTitle('Instances');
      }
    });

    afterEach(() => {
      if (isK8S) {
        cy.removeAwxInstance(instance?.id.toString());
        cy.removeAwxInstance(instanceToAssociate?.id.toString());
      }
    });

    it('can associate peers to an instance, navigate to associated peer details page and then disassociate peer', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.intercept('PATCH', awxAPI`/instances/*`).as('associatePeer');
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
      cy.getByDataCy('instances-peers-tab').click();
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('peers')).to.be.true;
      });
      cy.getByDataCy('associate-peer').click();
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Select Peer Addresses');
        cy.get('button').contains('Associate peer(s)').should('have.attr', 'aria-disabled', 'true');
        cy.filterTableBySingleText(instanceToAssociate.hostname, true);
        cy.intercept('GET', awxAPI`/instances/${instanceToAssociate.id.toString()}/`).as(
          'instanceA'
        );
        cy.getByDataCy('checkbox-column-cell').find('input').click();
        cy.wait('@instanceA');
        cy.get('button').contains('Associate peer(s)').click();
        cy.get('button').contains('Close').click();
      });
      cy.wait('@associatePeer')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(200);
          cy.filterTableBySingleText(instanceToAssociate.hostname, true);
          cy.getByDataCy('instance-name-column-cell').click();
        });
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes(`infrastructure/instances/${instanceToAssociate.id}/details`)).to
          .be.true;
      });
      cy.getByDataCy('instances-details-tab').should('be.visible');
      cy.go('back');
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes(`infrastructure/instances/${instance.id}/peers`)).to.be.true;
      });
      cy.verifyPageTitle(instance.hostname);
      cy.filterTableBySingleText(instanceToAssociate.hostname, true);
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('tbody tr').should('have.length', 1);
        cy.get('[data-cy="checkbox-column-cell"] input').click();
      });
      cy.clickToolbarKebabAction('disassociate');
      cy.intercept('PATCH', awxAPI`/instances/*/`).as('disassociatePeer');
      cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
        cy.get('header').contains('Disassociate peers');
        cy.get('button').contains('Disassociate peer').should('have.attr', 'aria-disabled', 'true');
        cy.getByDataCy('address-column-cell').should('have.text', instanceToAssociate.hostname);
        cy.get('input[id="confirm"]').click();
        cy.get('button')
          .contains('Disassociate peer')
          .should('have.attr', 'aria-disabled', 'false')
          .click();
      });
      cy.assertModalSuccess();
      cy.wait('@disassociatePeer')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(200);
        });
    });
  });

  describe('Instances: Listener Addresses Tab', () => {
    let instance: Instance;

    beforeEach(() => {
      if (isK8S) {
        cy.createAwxInstance('E2EInstanceTestLA' + randomString(5), 8888).then((ins: Instance) => {
          instance = ins;
        });
        cy.navigateTo('awx', 'instances');
        cy.verifyPageTitle('Instances');
      }
    });

    afterEach(() => {
      if (isK8S) {
        cy.removeAwxInstance(instance?.id.toString());
      }
    });

    it('can navigate to the instance listener addresses tab and view the designated listener port', () => {
      if (!isK8S) {
        cy.log('Skip test not running on IS_K8S');
        return;
      }
      cy.filterTableBySingleSelect('hostname', instance.hostname);
      cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
      cy.getByDataCy('instances-listener-addresses-tab').click();
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('listener-addresses')).to.be.true;
      });
      cy.getByDataCy('address-column-cell').contains(instance?.hostname);
      cy.getByDataCy('port-column-cell').contains(instance?.listener_port);
      cy.getByDataCy('protocol-column-cell').contains(instance?.protocol);
    });
  });
});
