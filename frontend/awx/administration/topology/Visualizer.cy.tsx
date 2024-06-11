import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
import { Instance } from '../../interfaces/Instance';
import { awxAPI } from '../../common/api/awx-utils';
import { Topology } from './Topology';

describe('Mesh Visualizer', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/mesh_visualizer/' },
      { fixture: 'mesh_visualizer.json' }
    ).as('getMeshVisualizer');
    cy.intercept({ method: 'GET', url: '/api/v2/instances/*' }, { fixture: 'instance.json' }).as(
      'getInstance'
    );
    cy.intercept(
      { method: 'GET', url: '/api/v2/instances/*/instance_groups/' },
      { fixture: 'instance_groups.json' }
    ).as('getInstanceGroups');
    cy.intercept(
      { method: 'PATCH', url: `api/v2/instances/1/` },
      { fixture: 'instance_without_install_bundle.json' }
    ).as('editInstance');
  });

  it('should render mesh viz with nodes and links', () => {
    cy.mount(<Topology />);
    cy.wait('@getMeshVisualizer')
      .its('response.body')
      .then((data: MeshVisualizer) => {
        data.nodes.forEach((n) => {
          cy.get(`[data-id="${n.id}"]`).should('be.visible');
          cy.get(`[data-id="${n.id}"] text`).should('have.text', n.hostname);
        });
        data.links.forEach((l) => {
          cy.get(`[data-id="edge-${l.source}-${l.target}"]`).should('be.visible');
        });
      });
  });
  it('should show sidebar details when a node is selected', () => {
    cy.mount(<Topology />);
    cy.get('[data-id="1"]').click();
    cy.get('[data-cy="mesh-viz-sidebar"]').should('be.visible');
  });
  it('should toggle legend when legend button is clicked', () => {
    cy.mount(<Topology />);
    cy.get('#legend').click();
    cy.get('[data-cy="mesh-viz-legend"]').should('be.visible');
    cy.get('#legend').click();
    cy.get('[data-cy="mesh-viz-legend"]').should('not.exist');
  });
  it('should show adjust instance forks when instance forks slider is adjusted', () => {
    // Adjusting instance capacity while other concurrent tests are running could have unwanted
    // side-effects affecting job runs. We should mock the response data in this scenario.
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/1/` },
      { fixture: 'instance_without_install_bundle.json' }
    ).as('getInstance');
    cy.mount(<Topology />);
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
    cy.mount(<Topology />);
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
    cy.mount(<Topology />);
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
  it('should zoom in', () => {
    cy.mount(<Topology />);
    cy.get('#zoom-in').click();
    cy.get('[data-surface="true"]').then((g) => {
      expect(g)
        .to.have.attr('transform')
        .contain(`scale(${4 / 3})`);
    });
  });
  it('should zoom out', () => {
    cy.mount(<Topology />);
    cy.get('#zoom-out').click();
    cy.get('[data-surface="true"]').then((g) => {
      expect(g).to.have.attr('transform').contain('scale(0.75)');
    });
  });
  it('should zoom fit to screen', () => {
    cy.mount(<Topology />);
    cy.get('#fit-to-screen').click();
    cy.get('[data-surface="true"]').then((g) => {
      expect(g).to.have.attr('transform').contain('scale(1)');
    });
  });
  it('should reset zoom', () => {
    cy.mount(<Topology />);
    cy.get('#reset-view').click();
    cy.get('[data-surface="true"]').then((g) => {
      expect(g).to.have.attr('transform').contain('scale(1)');
    });
  });
});
