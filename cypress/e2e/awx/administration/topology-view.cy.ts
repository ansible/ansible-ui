// seed api with sample topology layout
beforeEach(() => {
  cy.intercept(
    { method: 'GET', url: '/api/v2/mesh_visualizer/' },
    { fixture: 'mesh_visualizer.json' }
  ).as('getMeshVisualizer');
  cy.intercept({ method: 'GET', url: '/api/v2/instances/1/' }, { fixture: 'instance.json' }).as(
    'getInstance'
  );
  cy.intercept(
    { method: 'GET', url: '/api/v2/instances/3/' },
    { fixture: 'instance_with_install_bundle.json' }
  ).as('getInstance3');
  cy.intercept(
    { method: 'GET', url: '/api/v2/instances/*/instance_groups/' },
    { fixture: 'instance_groups.json' }
  ).as('getInstanceGroups');
  cy.intercept('PATCH', `api/v2/instances/1/`).as('editInstance');
});
describe('Topology view', () => {
  before(() => {
    cy.awxLogin();
  });
  it('render the Topology page', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.verifyPageTitle('Topology View');
  });
  it('refresh the Topology page', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.verifyPageTitle('Topology View');
    cy.get('#refresh').click();
    cy.verifyPageTitle('Topology View');
  });
  // TODO: add this test case once RBAC has been implemented
  xit('does not show Topology View in sidebar for non admins', () => {});
  it('show sidebar when node is clicked', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.get('[data-id="1"]').click();
    cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
    cy.get('button[aria-label="Close"]').click();
  });
  it('navigate to instance detail when instance name is clicked from sidebar', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.get('[data-id="1"]').click();
    cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
    cy.get('[data-cy="name"] button').click();
    cy.verifyPageTitle('awx_1');
  });
  it('navigate to instance group detail when instance group is clicked from sidebar', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.get('[data-id="1"]').click();
    cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
    cy.clickLink('default');
    // TODO Instance groups detail page not yet implemented; check URL for now
    // cy.verifyPageTitle('default');
    cy.url().should('contain', '/instance-groups/2');
  });
  it('should show adjust instance forks when instance forks slider is adjusted', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.get('[data-id="1"]').click();
    cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
    cy.get('.pf-v5-c-slider__thumb').click({ multiple: true, force: true });
    cy.get('.pf-v5-c-slider__thumb').type('{rightarrow}');
    cy.wait('@editInstance')
      .its('response')
      .then((res) => {
        expect(res?.statusCode).to.eql(200);
      });
    cy.get('button[aria-label="Close"]').click();
  });
  it('should show enabled/disabled when instance is toggled from sidebar', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.get('[data-id="1"]').click();
    cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
    cy.get('#enable-instance-on').should('have.text', 'Enabled');
    cy.get('[data-cy="enabled"] .pf-v5-c-switch__toggle').click();
    cy.wait('@editInstance')
      .its('response')
      .then((res) => {
        expect(res?.statusCode).to.eql(200);
      });
    cy.get('#enable-instance-off').should('have.text', 'Disabled');
    cy.get('[data-cy="enabled"] .pf-v5-c-switch__toggle').click();
    cy.wait('@editInstance')
      .its('response')
      .then((res) => {
        expect(res?.statusCode).to.eql(200);
      });
    cy.get('button[aria-label="Close"]').click();
  });
  it('should render download icon for instance that has an install bundle', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.get('[data-id="3"]').click();
    cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
    // testing and verifying downloaded file contents requires extensive setup to work locally; it should be sufficient to assert that the download icon is a proper download link
    cy.get('[data-cy="download-bundle"]').should('be.visible');
    cy.get('[data-cy="download-bundle"] a').should('have.attr', 'download');
    cy.get('[data-cy="download-bundle"] a').should('have.attr', 'href');
    cy.get('button[aria-label="Close"]').click();
  });
});
