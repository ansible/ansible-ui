import { awxAPI } from '../../../../cypress/support/formatApiPathForAwx';
import * as useOptions from '../../../common/crud/useOptions';
import { Instances } from './Instances';

describe('Instances list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/instances/*',
      },
      {
        fixture: 'instances.json',
      }
    );
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
  });

  it('Instances list renders with k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');

    cy.mount(<Instances />);
    cy.wait('@isK8s');

    cy.verifyPageTitle('Instances');
    cy.get('[data-cy="app-description"]').should(
      'contain',
      'Ansible node instances dedicated for a particular purpose indicated by node type.'
    );
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="add-instance"]').should('be.visible');
    cy.get('[data-cy="remove-instance"]').should('be.visible');
    cy.get('#remove-instance').should('have.attr', 'aria-disabled', 'true');
    cy.get('tbody').find('tr').should('have.length', 10);
  });

  it('Instances list renders with non k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: false,
    }).as('isK8s');

    cy.mount(<Instances />);
    cy.wait('@isK8s');

    cy.verifyPageTitle('Instances');
    cy.get('[data-cy="app-description"]').should(
      'contain',
      'Ansible node instances dedicated for a particular purpose indicated by node type.'
    );
    cy.get('[data-cy="add-instance"]').should('not.exist');
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="remove-instance"]').should('not.exist');
    cy.get('tbody').find('tr').should('have.length', 10);
  });

  it('Filter instances by name', () => {
    cy.intercept(
      { method: 'OPTIONS', url: '/api/v2/instances/' },
      { fixture: 'mock_options.json' }
    );
    cy.mount(<Instances />);
    cy.filterTableBySingleSelect('hostname', 'test');
    cy.get('tr').should('have.length.greaterThan', 0);
    cy.getByDataCy('filter-input').click();
    cy.clickButton(/^Clear all filters$/);
  });

  it('Filter instances by node', () => {
    cy.intercept(
      { method: 'OPTIONS', url: '/api/v2/instances/' },
      { fixture: 'mock_options.json' }
    );
    cy.mount(<Instances />);
    cy.filterTableBySingleSelect('node-type', 'Control plane node');
    cy.getByDataCy('filter-input').click();
    cy.clickButton(/^Clear all filters$/);
  });

  it('remove instance button should be disable if instance with node type control is selected', () => {
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/*` },
      { fixture: 'instance_list_control.json' }
    ).as('getInstance');
    cy.mount(<Instances />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="checkbox-column-cell"]').first().click();
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('#remove-instance').should('be.visible');
        cy.get('#remove-instance').should('have.attr', 'aria-disabled', 'true');
      });
  });

  it('remove instance button should be enabled if instance with node type hop is selected', () => {
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/*` },
      { fixture: 'instance_list_hop.json' }
    ).as('getInstance');
    cy.mount(<Instances />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="checkbox-column-cell"]').first().click();
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('#remove-instance').should('be.visible');
        cy.get('#remove-instance').should('not.have.attr', 'aria-disabled', 'true');
      });
  });

  it('remove instance button should be enabled if instance with node type execution is selected', () => {
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/*` },
      { fixture: 'instance_execution.json' }
    ).as('getInstance');
    cy.mount(<Instances />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="checkbox-column-cell"]').first().click();
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('#remove-instance').should('be.visible');
        cy.get('#remove-instance').should('not.have.attr', 'aria-disabled', 'true');
      });
  });

  it('remove instance button should be disabled if instance with node type hybrid is selected', () => {
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/*` },
      { fixture: 'instance_list_hybrid.json' }
    ).as('getInstance');
    cy.mount(<Instances />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="checkbox-column-cell"]').first().click();
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.get('#remove-instance').should('be.visible');
        cy.get('#remove-instance').should('have.attr', 'aria-disabled', 'true');
      });
  });
});

describe('Instance Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/instances/*',
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });

  it('Empty state is displayed correctly for instances with permission', () => {
    cy.stub(useOptions, 'useOptions').callsFake(() => ({
      data: {
        actions: {
          POST: {
            name: {
              type: 'string',
              required: true,
              label: 'Name',
              max_length: 512,
              help_text: 'Name of this instance.',
              filterable: true,
            },
          },
        },
      },
    }));
    cy.mount(<Instances />);
    cy.contains(/^There are currently no instances added$/);
    cy.contains(/^Please create an instance by using the button below.$/);
    cy.contains('button', /^Create instance$/).should('be.visible');
  });

  it('Empty state is displayed correctly for user without permission to create instances', () => {
    cy.stub(useOptions, 'useOptions').callsFake(() => ({
      data: {
        actions: {},
      },
    }));
    cy.mount(<Instances />);
    cy.contains(/^You do not have permission to create an instance.$/);
    cy.contains(
      /^Please contact your organization administrator if there is an issue with your access.$/
    );
    cy.contains('button', /^Create instance$/).should('not.exist');
  });
});
