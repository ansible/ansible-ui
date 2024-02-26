import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('Workflow Job templates form', () => {
  //these tests need to be enabled when workflow job templates are working
  let organization: Organization;
  let inventory: Inventory;
  let label: Label;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxInventory({ organization: organization.id }).then((i) => {
        inventory = i;
      });
      cy.createAwxLabel({ organization: organization.id }).then((l) => {
        label = l;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxLabel(label, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('Should create workflow job template', () => {
    const jtName = 'E2E ' + randomString(4);

    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);

    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('this is a description');
    cy.selectSingleSelectOption('[data-cy="organization"]', organization.name);
    cy.selectDropdownOptionByResourceName('inventory', inventory.name);
    cy.get('[data-cy="limit"]').type('mock-limit');
    cy.get('[data-cy="scm-branch"]').type('mock-scm-branch');
    cy.selectDropdownOptionByResourceName('labels', label.name.toString());
    cy.get('[data-cy="job_tags-form-group"]').within(() => {
      cy.get('input[type="text"]').type('test job tag');
      cy.contains('Create "test job tag"').click();
    });
    cy.get('[data-cy="skip_tags-form-group"]').within(() => {
      cy.get('input[type="text"]').type('test skip tag');
      cy.contains('Create "test skip tag"').click();
    });

    cy.get('[data-cy="Submit"]').click();
    cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').should('be.visible');
  });

  it('Should edit a workflow job template', () => {
    cy.navigateTo('awx', 'templates');
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      const newName = (workflowJobTemplate.name ?? '') + ' edited';
      if (!workflowJobTemplate.name) return;

      cy.clickTableRowPinnedAction(workflowJobTemplate?.name, 'edit-template', true);
      cy.get('[data-cy="name"]').clear().type(newName);
      cy.get('[data-cy="description"]').type('this is a new description');
      cy.clickButton(/^Save workflow job template$/);
      cy.verifyPageTitle(newName);
    });
  });

  it('Should delete a workflow job template', () => {
    cy.navigateTo('awx', 'templates');
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      if (!workflowJobTemplate.name) return;
      cy.clickTableRowKebabAction(workflowJobTemplate?.name, 'delete-template');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete template/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
