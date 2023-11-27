import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('Workflow Job templates visualizer', () => {
  let organization: Organization;
  let inventory: Inventory;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxInventory({ organization: organization.id }).then((i) => {
        inventory = i;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('should render a workflow visualizer view with multiple nodes present', () => {
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      cy.renderWorkflowVisualizerNodesFromFixtureFile(
        `${workflowJobTemplate.name}`,
        'wf_vis_testing_A.json'
      );
      cy.get('[class*="66-node-label"]')
        .should('exist')
        .should('contain', 'Cleanup Activity Stream');
      cy.get('[class*="43-node-label"]').should('exist').should('contain', 'bar');
      cy.get('[class*="42-node-label"]').should('exist').should('contain', '1');
      cy.get('[class*="41-node-label"]').should('exist').should('contain', 'Demo Project');
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate);
    });
  });

  it('Should create a workflow job template and then navigate to the visualizer, and then navigate to the details view after clicking cancel', () => {
    const jtName = 'E2E ' + randomString(4);
    // Create workflow job template
    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('this is a description');
    cy.get('[data-cy="Submit"]').click();

    cy.get('[data-cy="workflow-visualizer"]').should('be.visible');
    cy.get('h4.pf-v5-c-empty-state__title-text').should(
      'have.text',
      'There are currently no nodes in this workflow'
    );
    cy.get('div.pf-v5-c-empty-state__actions').within(() => {
      cy.get('[data-cy="add-node-button"]').should('be.visible');
    });

    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').click();

    // Clean up - delete workflow job template
    cy.clickPageAction(/^Delete template/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete template/);
    cy.verifyPageTitle('Template');
  });
});
