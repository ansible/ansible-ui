import { InstancePage } from './InstancesPage';

describe('Instances Page', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: '/api/v2/instances/*' }, { fixture: 'instance.json' }).as(
      'getInstance'
    );
  });

  it('Component renders, displays instance in breadcrumb and buttons enabled', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.getByDataCy('page-title').should('have.text', 'receptor-1');
    cy.contains('nav[aria-label="Breadcrumb"]', 'receptor-1').should('exist');
    cy.getByDataCy('back-to instances').should('be.visible');
    cy.getByDataCy('back-to instances').should('be.enabled');
    cy.getByDataCy('instances-details-tab').should('be.visible');
    cy.getByDataCy('instances-details-tab').should('be.enabled');
    cy.getByDataCy('instances-peers-tab').should('be.visible');
    cy.getByDataCy('instances-peers-tab').should('be.enabled');
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('edit-instance').should('be.visible');
    cy.getByDataCy('edit-instance').should('have.attr', 'aria-disabled', 'false');
    cy.getByDataCy('remove-instance').should('be.visible');
    cy.getByDataCy('remove-instance').should('have.attr', 'aria-disabled', 'false');
    cy.getByDataCy('run-health-check').should('be.visible');
    cy.getByDataCy('run-health-check').should('have.attr', 'aria-disabled', 'false');
    cy.getByDataCy('toggle-switch').should('be.visible');
  });

  it('edit instance button should be hidden for non-k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: false,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.get('[data-cy="edit-instance"]').should('not.exist');
  });

  it('edit instance button should be shown for k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="edit-instance"]').should('have.attr', 'aria-disabled', 'false');
  });

  it('only admin users can edit instance', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="actions-dropdown"]').click();
        cy.getByDataCy('edit-instance').should('be.visible');
        cy.getByDataCy('edit-instance').should('have.attr', 'aria-disabled', 'false');
      });
  });

  it('edit instance button should be hidden for managed instance', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.intercept('GET', '/api/v2/instances/*', {
      fixture: 'instance_control.json',
    }).as('getInstance');
    cy.mount(<InstancePage />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="edit-instance"]').should('not.exist');
      });
  });

  it('non admin users cannot remove instance', () => {
    cy.mount(<InstancePage />, undefined, 'normalUser');
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="actions-dropdown"]').should('not.exist');
        cy.get('[data-cy="remove-instance"]').should('not.exist');
      });
  });

  it('remove instance button should be hidden for non-k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: false,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.get('[data-cy="actions-dropdown"]').click();
    cy.get('[data-cy="remove-instance"]').should('not.exist');
  });

  it('remove instance button should be shown for k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.getByDataCy('actions-dropdown').click();
    cy.getByDataCy('remove-instance').should('be.visible');
    cy.getByDataCy('remove-instance').should('have.attr', 'aria-disabled', 'false');
  });

  it('only admin users can remove instance', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.getByDataCy('actions-dropdown').click();
        cy.getByDataCy('remove-instance').should('be.visible');
        cy.getByDataCy('remove-instance').should('have.attr', 'aria-disabled', 'false');
      });
  });

  it('remove instance button should be hidden for managed instance', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.intercept('GET', '/api/v2/instances/*', {
      fixture: 'instance_control.json',
    }).as('getInstance');
    cy.mount(<InstancePage />);
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('[data-cy="actions-dropdown"]').should('not.exist');
        cy.get('[data-cy="remove-instance"]').should('not.exist');
      });
  });

  it('peers tab should be hidden for non-k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: false,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.get('[data-cy="instances-peers-tab"]').should('not.exist');
  });

  it('peers tab should be shown for k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.getByDataCy('instances-peers-tab').should('be.visible');
    cy.getByDataCy('instances-peers-tab').should('be.enabled');
  });

  it('listener addresses tab should be hidden for non-k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: false,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.get('[data-cy="instances-listener-addresses-tab"]').should('not.exist');
  });

  it('listener addresses tab should be shown for k8s system', () => {
    cy.intercept('GET', '/api/v2/settings/system*', {
      IS_K8S: true,
    }).as('isK8s');
    cy.mount(<InstancePage />);
    cy.getByDataCy('instances-listener-addresses-tab').should('be.visible');
    cy.getByDataCy('instances-listener-addresses-tab').should('be.enabled');
  });

  it('Enabled/Disabled switch is disabled if user does not have the right permissions', () => {
    cy.mount(<InstancePage />, undefined, 'normalUser');
    cy.wait('@getInstance')
      .its('response.body')
      .then(() => {
        cy.get('.pf-v5-c-switch__input').should('be.disabled');
      });
  });
});
