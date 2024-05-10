import { randomString } from '../../../../framework/utils/random-string';
import { Instance } from '../../../../frontend/awx/interfaces/Instance';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Instances: Add/Edit', () => {
  let instance: Instance;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxInstance('E2EInstanceTestAddEdit' + randomString(5)).then((ins: Instance) => {
      instance = ins;
    });
  });

  it('can add a new instance and navigate to the details page', () => {
    const instanceHostname = 'E2EInstanceTestAddEdit' + randomString(5);
    cy.navigateTo('awx', 'instances');
    cy.getByDataCy('add-instance').click();
    cy.getByDataCy('page-title').should('contain', 'Add instance');
    cy.getByDataCy('hostname').type(instanceHostname);
    cy.getByDataCy('listener-port').type('9999');
    cy.getByDataCy('managed_by_policy').click();
    cy.getByDataCy('peers_from_control_nodes').click();
    cy.intercept('POST', awxAPI`/instances/`).as('newInstance');
    cy.getByDataCy('Submit').click();
    cy.wait('@newInstance')
      .its('response.body')
      .then((thisInstance: Instance) => {
        cy.navigateTo('awx', 'instances');
        expect(thisInstance.hostname).to.eql(instanceHostname);
        cy.filterTableBySingleSelect('hostname', instanceHostname);
        cy.clickTableRowLink('name', instanceHostname, { disableFilter: true });
        cy.getByDataCy('name').should('contain', instanceHostname);
        cy.getByDataCy('node-type').should('contain', 'Execution');
        cy.getByDataCy('status').should('contain', 'Installed');
        cy.getByDataCy('listener-port').should('contain', '9999');
        cy.getByDataCy('actions-dropdown').click();
        cy.getByDataCy('remove-instance').click();
        cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
          cy.get('header').contains('Permanently remove instances');
          cy.get('button').contains('Remove instance').should('have.attr', 'aria-disabled', 'true');
          cy.getByDataCy('name-column-cell').should('have.text', thisInstance.hostname);
          cy.get('input[id="confirm"]').click();
          cy.get('button').contains('Remove instance').click();
        });
      });
    cy.verifyPageTitle('Instances');
  });

  it('can edit an instance from the instances list and assert info on details page', () => {
    cy.intercept('PATCH', '/api/v2/instances/*').as('editedInstance');
    cy.navigateTo('awx', 'instances');
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
          cy.get('button').contains('Remove instance').should('have.attr', 'aria-disabled', 'true');
          cy.getByDataCy('name-column-cell').should('have.text', instance.hostname);
          cy.get('input[id="confirm"]').click();
          cy.get('button').contains('Remove instance').click();
        });
      });
  });

  it.skip('can visit the details page of an Instance and verify the bundle download feature', () => {
    //Use Instance created in beforeEach block
    //Assert details page info
    //After download, assert that the download was successful
  });

  it.skip('can uncheck the Enable Instance checkbox on the edit form, save form, and see the toggle is off', () => {
    //Use Instance created in beforeEach block, make sure it is enabled
    //Assert original info on instance
    //On edit form, uncheck the 'Enable Instance' box
    //after saving the form, assert that the toggle is in the Off position
  });

  it.skip('can edit an instance from the details page, disable the instance, and assert all edits', () => {
    //Use Instance created in beforeEach block
    //Assert original info on instance
    //After edit, assert edited changes; intercept the edited object returned by the API
  });
});

describe('Instances: Delete', () => {
  let instance: Instance;
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateInstanceName(): string {
    return `test-${testSignature}-instance-${randomString(5, undefined, { isLowercase: true })}`;
  }

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxInstance('E2EInstanceTestRemove' + randomString(5)).then((ins: Instance) => {
      instance = ins;
    });
  });

  it('can remove an instance from details page', () => {
    cy.navigateTo('awx', 'instances');
    cy.intercept('PATCH', '/api/v2/instances/*').as('removedInstance');
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
    cy.navigateTo('awx', 'instances');
    cy.intercept('PATCH', '/api/v2/instances/*').as('removedInstance');
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
    //***This test needs to be edited*** to test bulk deletion.
    //Currently it only tests the deletion of a single instance.
    for (let i = 0; i < 5; i++) {
      const instanceName = generateInstanceName();
      cy.createAwxInstance(instanceName);
    }
    cy.navigateTo('awx', 'instances');
    cy.intercept('PATCH', '/api/v2/instances/*').as('removedInstance');
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="remove-instance"]').should('have.attr', 'aria-disabled', 'true');
    cy.filterTableBySingleSelect('hostname', testSignature);
    cy.selectTableRowByCheckbox('name', testSignature, { disableFilter: true });
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

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxInstance('E2EInstanceTestAddEdit' + randomString(5)).then((ins: Instance) => {
      instance = ins;
    });
  });

  afterEach(() => {
    cy.removeAwxInstance(instance.id.toString());
  });

  it.skip('can run a health check on an Instance in the instance list and assert the expected results', () => {
    //use the instance in the beforeEach block
    //assert the presence of the instance in the list
    //after running the health check, assert the expected UI results
  });

  it.skip('can run a health check on an Instance in the instance details page and assert the expected results', () => {
    //use the instance in the beforeEach block
    //navigate and assert the redirect to the details page of the instance
    //after running the health check, assert the expected UI results
  });
});

describe('Instances: Peers', () => {
  let instance: Instance;
  let instanceToAssociate: Instance;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxInstance('E2EInstanceTestLA' + randomString(5), 8888).then((ins: Instance) => {
      instance = ins;
    });
  });

  afterEach(() => {
    cy.removeAwxInstance(instance?.id.toString());
    cy.removeAwxInstance(instanceToAssociate?.id.toString());
  });

  it('can associate peers to an instance', () => {
    //This test needs to visit the Peers tab of the second instance to verify that the
    //peer association worked properly. Right now it is not working properly. See AAP-23669.
    cy.createAwxInstance('E2EInstanceTestToAssociate' + randomString(5), 9999).then(
      (ins: Instance) => {
        instanceToAssociate = ins;
      }
    );
    cy.navigateTo('awx', 'instances');
    cy.intercept('PATCH', '/api/v2/instances/*').as('associatePeer');
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
      cy.intercept('GET', awxAPI`/instances/${instanceToAssociate.id.toString()}/`).as('instanceA');
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
      expect(currentUrl.includes('details')).to.be.true;
    });
    cy.getByDataCy('instances-details-tab').should('be.visible');
    //Navigate to the second instance peers tab and verify that the association worked
  });

  it.skip('can disassociate a peer from an instance', () => {
    //Create the association first and verify
    //Disassociate them from one another and assert the disassociation by visiting
    //the peers tab of both instances
  });
});

describe('Instances: Listener Addresses Tab', () => {
  let instance: Instance;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxInstance('E2EInstanceTestLA' + randomString(5), 8888).then((ins: Instance) => {
      instance = ins;
    });
  });

  afterEach(() => {
    cy.removeAwxInstance(instance?.id.toString());
  });

  it('can navigate to the instance listener addresses tab and view the designated listener port', () => {
    cy.navigateTo('awx', 'instances');
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
