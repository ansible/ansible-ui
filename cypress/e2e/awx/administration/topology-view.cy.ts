import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { MeshVisualizer } from '../../../../frontend/awx/interfaces/MeshVisualizer';
import { Instance } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';

beforeEach(() => {
  cy.intercept({ method: 'GET', url: '/api/v2/mesh_visualizer/' }).as('getMeshVisualizer');
  cy.intercept({ method: 'GET', url: '/api/v2/instances/*/instance_groups/' }).as(
    'getInstanceGroups'
  );
  cy.intercept(
    { method: 'PATCH', url: `api/v2/instances/1/` },
    { fixture: 'instance_without_install_bundle.json' }
  ).as('editInstance');
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
  // // TODO: add this test case once RBAC to routes and sidebar have been implemented
  it.skip('does not show Topology View in sidebar for non admins', () => {});
  it('show sidebar when node is clicked', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        cy.get(`[data-id="${data.nodes[0].id}"]`).click();
        cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
        cy.get('button[aria-label="Close"]').click();
      });
  });
  it('navigate to instance detail when instance name is clicked from sidebar', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        cy.get(`[data-id="${data.nodes[0].id}"]`).click();
        cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
        cy.get('[data-cy="name"] button').click();
        cy.verifyPageTitle(`${data.nodes[0].hostname}`);
      });
  });
  it('navigate to instance group detail when instance group is clicked from sidebar', () => {
    cy.navigateTo('awx', 'topology-view');
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        cy.get(`[data-id="${data.nodes[0].id}"]`).click();
        cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
        cy.wait('@getInstanceGroups')
          .its('response.body.results')
          .then((instanceGroups: InstanceGroup[]) => {
            cy.clickLink(`${instanceGroups[0].name}`);
            // TODO Instance groups detail page not yet implemented; check URL for now
            cy.url().should('contain', `/instance-groups/${instanceGroups[0].id}`);
          });
      });
  });
  it('should show adjust instance forks when instance forks slider is adjusted', () => {
    // Adjusting instance capacity while other concurrent tests are running could have unwanted side-effects affecting job runs. We should mock the response data in this scenario.
    cy.intercept(
      { method: 'GET', url: '/api/v2/instances/1/' },
      { fixture: 'instance_without_install_bundle.json' }
    ).as('getInstance');
    cy.navigateTo('awx', 'topology-view');
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        cy.get(`[data-id="${data.nodes[0].id}"]`).click();
        cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
        cy.wait('@getInstance')
          .its('response.body')
          .then((instance: Instance) => {
            if (instance.enabled) {
              cy.get('.pf-v5-c-slider__thumb').click({ multiple: true, force: true });
              cy.get('.pf-v5-c-slider__thumb').type('{rightarrow}');
              cy.wait('@editInstance')
                .its('response')
                .then((res) => {
                  expect(res?.statusCode).to.eql(200);
                });
            }
          });
        cy.get('button[aria-label="Close"]').click();
      });
  });
  it('should show enabled/disabled when instance is toggled from sidebar', () => {
    // Enabling/disabling an instance while other concurrent tests are running could have unwanted side-effects affecting job runs. We should mock the response data in this scenario.
    cy.intercept({ method: 'GET', url: '/api/v2/instances/1/' }).as('getInstance');
    cy.navigateTo('awx', 'topology-view');
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        cy.get(`[data-id="${data.nodes[0].id}"]`).click();
        cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
        cy.wait('@getInstance')
          .its('response.body')
          .then((instance: Instance) => {
            if (instance.enabled) {
              cy.get('#enable-instance-on').should('have.text', 'Enabled');
              cy.get('[data-cy="enabled"] .pf-v5-c-switch__toggle').click();
              cy.wait('@editInstance')
                .its('response')
                .then((res) => {
                  expect(res?.statusCode).to.eql(200);
                });
            }
            if (!instance.enabled) {
              cy.get('#enable-instance-off').should('have.text', 'Disabled');
              cy.get('[data-cy="enabled"] .pf-v5-c-switch__toggle').click();
              cy.wait('@editInstance')
                .its('response')
                .then((res) => {
                  expect(res?.statusCode).to.eql(200);
                });
            }
          });
        cy.get('button[aria-label="Close"]').click();
      });
  });
  it('should render download icon for instance that has an install bundle', () => {
    /**
     Only certain node types have install bundles, however creating an instance via the API requires that a user also manually download the respective install bundle and SSH into the machine in order to run a few scripts to register the new instance(s) and update the mesh. See https://docs.ansible.com/automation-controller/4.4/html/administration/instances.html#add-an-instance. In our current automated test environment this would be complicated to replicate so a fixture with the requisite field is provided instead. This also means we can skip the resources clean up step.
    */
    cy.intercept({ method: 'GET', url: '/api/v2/instances/1/' }, { fixture: 'instance.json' }).as(
      'getInstanceWithInstallBundle'
    );
    cy.navigateTo('awx', 'topology-view');
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        cy.get(`[data-id="${data.nodes[0].id}"]`).click();
        cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
        cy.get('[data-cy="download-bundle"]').should('be.visible');
        // testing and verifying downloaded file contents requires extensive setup to work locally as well as in an automated test environment; it should be sufficient to assert that the download icon is a proper download link
        cy.get('[data-cy="download-bundle"] a').should('have.attr', 'download');
        cy.get('[data-cy="download-bundle"] a').should('have.attr', 'href');
        cy.get('button[aria-label="Close"]').click();
      });
  });
});
