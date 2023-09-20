import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('Workflow Job templates form', () => {
  let organization: Organization;
  let inventory: Inventory;
  let label: Label;

  before(() => {
    cy.awxLogin();

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

  after(() => {
    cy.deleteAwxOrganization(organization);
  });

  it('Should create job template with all fields except for prompt on launch values', () => {
    const jtName = 'E2E ' + randomString(4);

    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);
    cy.typeInputByLabel(/^Name$/, jtName);
    cy.typeInputByLabel(/^Description$/, 'this is a description');
    cy.selectDropdownOptionByLabel(/^Labels$/, label.name.toString(), true);
    cy.addAndSelectItemFromMulitSelectDropdown('Job tags', 'test job tag');
    cy.addAndSelectItemFromMulitSelectDropdown(/^Skip tags$/, 'test skip tag');
    cy.clickButton(/^Create workflow job template$/);
    cy.hasTitle(jtName);
  });

  it('Should edit a workflow job template', () => {
    cy.navigateTo('awx', 'templates');
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      const newName = (workflowJobTemplate.name ?? '') + ' edited';
      if (!workflowJobTemplate.name) return;

      cy.clickTableRowPinnedAction(workflowJobTemplate?.name, 'Edit template', true);
      cy.typeInputByLabel(/^Name$/, newName);
      cy.typeInputByLabel(/^Description$/, 'this is a new description');
      cy.clickButton(/^Save workflow job template$/);
      cy.hasTitle(newName);
    });
  });

  it('Should delete a workflow job template', () => {
    cy.navigateTo('awx', 'templates');
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      if (!workflowJobTemplate.name) return;
      cy.clickTableRowKebabAction(workflowJobTemplate?.name, /^Delete template$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete template/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
