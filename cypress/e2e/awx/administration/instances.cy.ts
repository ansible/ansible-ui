import { randomString } from '../../../../framework/utils/random-string';
import { Instance } from '../../../../frontend/awx/interfaces/Instance';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Instances', () => {
  let instance: Instance;

  beforeEach(() => {
    cy.awxLogin();
    cy.navigateTo('awx', 'instances');
    cy.createAwxInstance().then((ins: Instance) => {
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
    const instanceHostname = 'E2EInstanceTest' + randomString(5);

    cy.get('[data-cy="add-instance"]').click();
    cy.get('[data-cy="page-title"]').should('contain', 'Add instance');

    cy.get('[data-cy="hostname"]').type(instanceHostname);
    cy.get('[data-cy="listener-port"]').type('9999');
    cy.get('[data-cy="enabled"]').click();
    cy.get('[data-cy="managed_by_policy"]').click();
    cy.get('[data-cy="peers_from_control_nodes"]').click();

    cy.intercept('POST', awxAPI`/instances/`).as('newInstance');
    cy.get('[data-cy="Submit"]').click();
    cy.wait('@newInstance')
      .its('response.body')
      .then((instance: Instance) => {
        cy.navigateTo('awx', 'instances');
        cy.clickTableRow(instanceHostname);
        cy.get('[data-cy="name"]').should('contain', instanceHostname);
        cy.get('[data-cy="node-type"]').should('contain', 'Execution');
        cy.get('[data-cy="status"]').should('contain', 'Installed');
        cy.get('[data-cy="listener-port"]').should('contain', '9999');
        cy.removeAwxInstance(instance.id.toString(), { failOnStatusCode: false });
      });
  });

  it('user can edit an instance and navigate to details page', () => {
    cy.intercept('PATCH', '/api/v2/instances/*').as('editedInstance');

    cy.clickTableRow(instance.hostname);
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
    });
    cy.get('[data-cy="edit-instance"]').click();
    cy.get('[data-cy="listener-port"]').type('9999');
    cy.get('[data-cy="enabled"]').check();
    cy.get('[data-cy="managed_by_policy"]').check();
    cy.get('[data-cy="peers_from_control_nodes"]').check();

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
