import { randomString } from '../../../../framework/utils/random-string';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { MeshVisualizer } from '../../../../frontend/awx/interfaces/MeshVisualizer';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Settings } from '../../../../frontend/awx/interfaces/Settings';
import { AwxUser } from '../../../../frontend/awx/interfaces/User';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { tag } from '../../../support/tag';

describe('Topology view', () => {
  let user: AwxUser;
  let organization: Organization;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  beforeEach(() => {
    cy.intercept({ method: 'GET', url: awxAPI`/mesh_visualizer/` }).as('getMeshVisualizer');
    cy.intercept(
      { method: 'GET', url: awxAPI`/instances/*/instance_groups/` },
      { fixture: 'instance_groups.json' }
    ).as('getInstanceGroups');
  });

  after(() => {
    user?.id && cy.deleteAwxUser(user, { failOnStatusCode: false });
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

  it.skip('navigate to instance group detail when instance group is clicked from sidebar', () => {
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
            cy.url().should('contain', `/instance-groups/${instanceGroups[0].id}`);
            cy.verifyPageTitle(instanceGroups[0].name);
          });
      });
  });

  it('will allow the user to view a large number of nodes', () => {
    cy.fixture('instance_nodes').then((instanceNodes: MeshVisualizer) => {
      cy.intercept('GET', awxAPI`/mesh_visualizer/`, instanceNodes);

      cy.navigateTo('awx', 'topology-view');

      instanceNodes.nodes.forEach((node) => {
        cy.contains(node.hostname);
      });
    });
  });

  it('will allow the user to select node and delete it', () => {
    cy.requestGet<Settings>(awxAPI`/settings/system/`).then((data) => {
      if (!data?.IS_K8S) {
        cy.log('TEST SKIPPED | IS_K8S: False');
        return;
      }
      const node = 'E2EInstance' + randomString(4);
      cy.createAwxInstance(node).then(() => {
        cy.navigateTo('awx', 'topology-view');
        cy.contains(node).click({ force: true });
        cy.getByDataCy('mesh-viz-sidebar').within(() => {
          cy.getByDataCy('name').contains(node).click();
        });
        cy.url().should('include', '/infrastructure/instances/');
        cy.getByDataCy('page-title').contains(node);
        cy.getByDataCy('actions-dropdown').click();
        cy.getBy('#remove-instance').click();
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Remove instance');
        cy.navigateTo('awx', 'topology-view');
        cy.contains(node).should('not.exist');
      });
    });
  });

  it('will allow the user to view a large number of nodes', () => {
    cy.fixture('instance_nodes').then((instanceNodes: MeshVisualizer) => {
      cy.intercept('GET', awxAPI`/mesh_visualizer/`, instanceNodes);
      cy.navigateTo('awx', 'topology-view');
      instanceNodes.nodes.forEach((node) => {
        cy.contains(node.hostname);
      });
    });
  });

  tag(['upstream'], () => {
    it('does not show Topology View in sidebar for non admins', function () {
      cy.createAwxUser({ organization: organization.id }).then((awxUser) => {
        user = awxUser;
        cy.awxLoginTestUser(user.username, 'pw');
        cy.getByDataCy('page-navigation').then((nav) => {
          if (!nav.is(':visible')) cy.getByDataCy('nav-toggle').click();
        });
        cy.get('[data-cy="awx-topology-view"]').should('not.exist');
        cy.navigateTo('awx', 'topology-view');
        cy.contains('Page not found');
        cy.contains('We could not find that page.');
      });
    });
  });
});
