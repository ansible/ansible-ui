import { randomString } from '../../../../framework/utils/random-string';
import { Instance } from '../../../../frontend/awx/interfaces/Instance';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Instances - Add/Edit', () => {
  let instance: Instance;

  beforeEach(() => {
    cy.awxLogin();
    cy.navigateTo('awx', 'instances');
    cy.createAwxInstance('E2EInstanceTestAddEdit' + randomString(5)).then((ins: Instance) => {
      instance = ins;
    });
  });

  afterEach(() => {
    cy.removeAwxInstance(instance.id.toString(), { failOnStatusCode: false });
  });

  it('render the instances list page', () => {
    cy.verifyPageTitle('Instances');
  });

  it('user can add a new instance and navigate to the details page', () => {
    const instanceHostname = 'E2EInstanceTestAddEdit' + randomString(5);

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
      .then((instance: Instance) => {
        cy.navigateTo('awx', 'instances');
        cy.filterTableBySingleSelect('hostname', instanceHostname);
        cy.clickTableRowLink('name', instanceHostname, { disableFilter: true });
        cy.getByDataCy('name').should('contain', instanceHostname);
        cy.getByDataCy('node-type').should('contain', 'Execution');
        cy.getByDataCy('status').should('contain', 'Installed');
        cy.getByDataCy('listener-port').should('contain', '9999');
        cy.removeAwxInstance(instance.id.toString(), { failOnStatusCode: false });
      });
  });

  it('user can edit an instance and navigate to details page', () => {
    cy.intercept('PATCH', '/api/v2/instances/*').as('editedInstance');

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
      });
  });
});

describe('Instances - Remove', () => {
  let instance: Instance;
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateInstanceName(): string {
    return `test-${testSignature}-instance-${randomString(5, undefined, { isLowercase: true })}`;
  }

  beforeEach(() => {
    cy.awxLogin();
    cy.navigateTo('awx', 'instances');
    cy.createAwxInstance('E2EInstanceTestRemove' + randomString(5)).then((ins: Instance) => {
      instance = ins;
    });
  });

  after(() => {
    cy.removeAwxInstance(instance.id.toString(), { failOnStatusCode: false });
  });
  it('user can remove an instance from details page', () => {
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

  it('user can remove an instance from instance page toolbar', () => {
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
  });

  it('user can bulk remove instances', () => {
    for (let i = 0; i < 5; i++) {
      const instanceName = generateInstanceName();
      cy.createAwxInstance(instanceName);
    }
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

describe('Instances - Peers', () => {
  let instance: Instance;
  let instanceToAssociate: Instance;

  before(() => {
    cy.awxLogin();
    cy.navigateTo('awx', 'instances');
    cy.createAwxInstance('E2EInstanceTestLA' + randomString(5), 8888).then((ins: Instance) => {
      instance = ins;
    });
  });

  after(() => {
    cy.removeAwxInstance(instance?.id.toString(), { failOnStatusCode: false });
    cy.removeAwxInstance(instanceToAssociate?.id.toString(), { failOnStatusCode: false });
  });

  it('user can associate peers to instance', () => {
    //Create an extra instance to be associated
    cy.createAwxInstance('E2EInstanceTestToAssociate' + randomString(5), 9999).then(
      (ins: Instance) => {
        instanceToAssociate = ins;
      }
    );

    cy.intercept('PATCH', '/api/v2/instances/*').as('associatePeer');
    cy.filterTableBySingleSelect('hostname', instance.hostname);
    cy.clickTableRowLink('name', instance.hostname, { disableFilter: true });
    cy.getByDataCy('instances-peers-tab').click();
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('peers')).to.be.true;
    });
    cy.getByDataCy('associate-peer').click();
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Select peer addresses');
      cy.get('button').contains('Associate peer(s)').should('have.attr', 'aria-disabled', 'true');
      cy.filterTableBySingleText(instanceToAssociate.hostname, true);
      cy.intercept('GET', awxAPI`/instances/${instance.id.toString()}/`).as('instanceA');
      cy.intercept('GET', awxAPI`/instances/${instanceToAssociate.id.toString()}/`).as('instanceB');
      cy.getByDataCy('checkbox-column-cell').find('input').click();
      cy.wait(['@instanceA', '@instanceB']);
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
  });
});

describe('Instances - Listener Addresses', () => {
  let instance: Instance;

  beforeEach(() => {
    cy.awxLogin();
    cy.navigateTo('awx', 'instances');
    cy.createAwxInstance('E2EInstanceTestLA' + randomString(5), 8888).then((ins: Instance) => {
      instance = ins;
    });
  });

  after(() => {
    cy.removeAwxInstance(instance?.id.toString(), { failOnStatusCode: false });
  });

  it('user can navigate to the listener addresses tab in details page', () => {
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
