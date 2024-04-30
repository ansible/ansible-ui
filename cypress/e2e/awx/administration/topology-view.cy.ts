import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { MeshVisualizer } from '../../../../frontend/awx/interfaces/MeshVisualizer';
import { Instance } from '../../../../frontend/awx/interfaces/generated-from-swagger/api';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Topology view', () => {
  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.intercept({ method: 'GET', url: awxAPI`/mesh_visualizer/` }).as('getMeshVisualizer');
    cy.intercept({ method: 'GET', url: awxAPI`/instances/*/instance_groups/` }).as(
      'getInstanceGroups'
    );
    cy.intercept(
      { method: 'PATCH', url: `api/v2/instances/1/` },
      { fixture: 'instance_without_install_bundle.json' }
    ).as('editInstance');
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
            cy.url().should('contain', `/instance_groups/${instanceGroups[0].id}`);
          });
      });
  });

  it('should show adjust instance forks when instance forks slider is adjusted', () => {
    // Adjusting instance capacity while other concurrent tests are running could have unwanted
    // side-effects affecting job runs. We should mock the response data in this scenario.
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/1/` },
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

  it('should show no forks slider when instance has 0 cpu and memory capacity', () => {
    // Adjusting instance capacity while other concurrent tests are running could have
    // unwanted side-effects affecting job runs. We should mock the response data in this scenario.
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/1/` },
      { fixture: 'instance_hop.json' }
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
              cy.get('.pf-v5-c-slider__thumb').should('not.exist');
            }
          });
        cy.get('button[aria-label="Close"]').click();
      });
  });

  it('should render download icon for instance that has an install bundle', () => {
    /**
     Only certain node types have install bundles, however creating an instance via the 
     API requires that a user also manually download the respective install bundle and 
     SSH into the machine in order to run a few scripts to register the new instance(s) 
     and update the mesh. 
     See https://docs.ansible.com/automation-controller/4.4/html/administration/instances.html#add-an-instance.
     In our current automated test environment this would be complicated to replicate so 
     a fixture with the requisite field is provided instead. This also means we can skip 
     the resources clean up step.
    */
    cy.intercept({ method: 'GET', url: awxAPI`/instances/1/` }, { fixture: 'instance.json' }).as(
      'getInstanceWithInstallBundle'
    );
    cy.navigateTo('awx', 'topology-view');
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        cy.get(`[data-id="${data.nodes[0].id}"]`).click();
        cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
        cy.get('[data-cy="download-bundle"]').should('be.visible');
        // testing and verifying downloaded file contents requires extensive setup to work
        // locally as well as in an automated test environment; it should be sufficient to
        // assert that the download icon is a proper download link
        cy.get('[data-cy="download-bundle"] a').should('have.attr', 'download');
        cy.get('[data-cy="download-bundle"] a').should('have.attr', 'href');
        cy.get('button[aria-label="Close"]').click();
      });
  });

  it.skip('does not show Topology View in sidebar for non admins', () => {
    // TODO: add this test case once RBAC to routes and sidebar have been implemented
  });

  it.skip('will allow the user to view and then delete a large number of nodes', () => {
    // Implement this using a fixture file to quickly populate a high number of nodes
  });
});
