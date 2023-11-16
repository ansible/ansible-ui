import { MeshVisualizer } from '../../interfaces/MeshVisualizer';
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
