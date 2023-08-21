import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';

describe('Workflow Job templates form', () => {
  let organization: Organization;

  let inventory: Inventory;

  // let githubTokenCrendential: Credential;
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

  it.skip('Should create job template with all fields except for prompt on launch values', () => {
    const jtName = 'E2E ' + randomString(4);

    cy.navigateTo(/^Templates$/);
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create workflow job template$/);

    // Name
    cy.typeInputByLabel(/^Name$/, jtName);

    // Description
    cy.typeInputByLabel(/^Description$/, 'this is a description');

    cy.selectDropdownOptionByLabel(/^Labels$/, label.name.toString(), true);

    // Job tags
    cy.contains('.pf-c-form__label-text', /^Job tags$/)
      .parent()
      .parent()
      .parent()
      .parent()
      .within(() => {
        cy.get('.pf-c-form__group-control').within(() => {
          cy.get("input[type='text']")
            .click()
            .type('test job tag')
            .parent()
            .parent()
            .parent()
            .within(() => {
              cy.get('.pf-c-select__menu').within(() => {
                cy.get('button').contains('test job tag').click();
              });
            });
        });
      });

    // Skip tags
    cy.contains('.pf-c-form__label-text', /^Skip tags$/)
      .parent()
      .parent()
      .parent()
      .parent()
      .within(() => {
        cy.get('.pf-c-form__group-control').within(() => {
          cy.get("input[type='text']")
            .click()
            .type('test skip tag')
            .parent()
            .parent()
            .parent()
            .within(() => {
              cy.get('.pf-c-select__menu').within(() => {
                cy.get('button').contains('test skip tag').click();
              });
            });
        });
      });

    cy.get('input#allow_simultaneous').click();

    cy.clickButton(/^Create workflow job template$/);
    cy.hasTitle(jtName);
  });

  it.skip('Should edit a workflow job template', () => {
    cy.navigateTo(/^Templates$/);
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
    }).then((workflowJobTemplate) => {
      const newName = (workflowJobTemplate.name ?? '') + ' edited';
      if (!workflowJobTemplate.name) return;

      cy.clickTableRowKebabAction(workflowJobTemplate?.name, /^Edit template$/);
      cy.typeInputByLabel(/^Name$/, newName);
      cy.typeInputByLabel(/^Description$/, 'this is a new description');
      cy.clickButton(/^Save workflow job template$/);
      cy.hasTitle(newName);
    });
  });

  it('Should delete a workflow job template', () => {
    cy.navigateTo(/^Templates$/);
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
