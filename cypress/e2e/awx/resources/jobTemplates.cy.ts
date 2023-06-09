import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { randomString } from '../../../../framework/utils/random-string';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';

describe('Job templates Form', () => {
  before(() => {
    cy.awxLogin();
  });

  it('can render the templates list page', () => {
    cy.navigateTo(/^Templates$/);
    cy.hasTitle(/^Templates$/);
  });

  it('Should throw create job template form validation error and not navigate to details view', () => {
    cy.navigateTo(/^Templates$/);
    cy.contains(/^Create template$/).click();
    cy.contains(/^Create job template$/).click();

    cy.clickButton(/^Create job template$/);

    cy.hasTitle(/^Create Job Template$/);
  });
});

describe('Job templates form', () => {
  let project: Project;
  let inventory: Inventory;
  let executionEnvironment: ExecutionEnvironment;
  let webhookcredential: Credential;
  let credential: Credential;
  let label: Label;
  let instanceGroup: InstanceGroup;
  let jtName: string;

  before(() => {
    cy.awxLogin();
    cy.createAwxOrganization().then((org) => {
      cy.createAwxProject().then((p) => (project = p));
      cy.createAwxInventory().then((i) => (inventory = i));
      cy.createAwxExecutionEnvironment().then((ee) => {
        executionEnvironment = ee;
      });
      cy.createAWXCredential('github_token', org.id, 11).then((cred) => {
        webhookcredential = cred;
      });
      cy.createAWXCredential('machine', org.id, 1).then((cred) => {
        credential = cred;
      });
      cy.createAwxInstanceGroup().then((ig) => {
        instanceGroup = ig;
      });
      cy.createAwxLabel(org).then((l) => {
        label = l;
      });
    });
  });

  after(() => {
    cy.awxRequestDelete(`/api/v2/projects/${project.id}/`);
    cy.awxRequestDelete(`/api/v2/inventories/${inventory.id}/`);
    cy.awxRequestDelete(`/api/v2/execution_environments/${executionEnvironment.id}/`);
    cy.awxRequestDelete(`/api/v2/credentials/${webhookcredential.id}/`);
    cy.awxRequestDelete(`/api/v2/credentials/${credential.id}/`);
  });

  it('Should create job template with all fields except for prompt on launch values', () => {
    jtName = 'test job template' + randomString(4);
    cy.navigateTo(/^Templates$/);

    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);
    cy.typeInputByLabel(/^Name$/, jtName);
    cy.typeInputByLabel(/^Description$/, 'this is a description');
    cy.get('input[placeholder="Enter inventory"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      })
      .then(() => {
        cy.selectTableRowInDialog(inventory.name, true, 'radio').click();
      });
    cy.clickModalButton('Confirm');

    cy.get('input[placeholder="Add project"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      })
      .then(() => {
        cy.selectTableRowInDialog(project.name, true, 'radio').click();
      });
    cy.clickModalButton('Confirm');

    cy.selectDropdownOptionByLabel(/^Playbook$/, 'hello_world.yml');

    cy.get('input[placeholder="Add execution environment"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      })
      .then(() => {
        cy.selectTableRowInDialog(executionEnvironment.name, true, 'radio').click();
      });
    cy.clickModalButton('Confirm');

    cy.get('input[placeholder="Add credentials"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      })
      .then(() => {
        cy.selectTableRowInDialog(credential.name, true, 'checkbox').click();
      });
    cy.clickModalButton('Confirm');
    cy.selectDropdownOptionByLabel(/^Labels$/, label.name.toString(), true);
    cy.typeInputByLabel(/^Forks$/, '10');
    cy.typeInputByLabel(/^Limit$/, '10');
    cy.typeInputByLabel(/^Verbosity$/, '1');
    cy.typeInputByLabel(/^Job slicing$/, '10');
    cy.typeInputByLabel(/^Timeout$/, '10');
    cy.getFormGroupByLabel(/^Show changes$/)
      .parent()
      .within(() => {
        cy.get('.pf-c-switch__toggle').click();
      });

    cy.get('input[placeholder="Add instance groups"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      })
      .then(() => {
        cy.selectTableRowInDialog(instanceGroup.name, true, 'checkbox').click();
      });
    cy.clickModalButton('Confirm');
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
    cy.get('input#become_enabled').click();
    cy.get('input#isProvisioningCallbackEnabled').click();
    cy.get('input#isWebhookEnabled').click();
    cy.get('input#allow_simultaneous').click();
    cy.get('input#use_fact_cache').click();
    cy.get('input#prevent_instance_group_fallback').click();
    cy.typeInputByLabel(/^Host config key$/, 'test config key');

    cy.selectDropdownOptionByLabel(/^Webhook service$/, 'GitHub');
    cy.wait(1000);
    cy.get('input[placeholder="Add webhook credential"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      })
      .then(() => {
        cy.selectTableRowInDialog(webhookcredential.name, true, 'radio').click();
      });
    cy.clickModalButton('Confirm');
    cy.clickButton(/^Create job template$/);
    cy.hasTitle(jtName);
  });

  it('Should edit and then delete the job template just created above', () => {
    const newJTName = jtName + 'new random string' + randomString(4);
    cy.navigateTo(/^Templates$/);
    cy.clickTableRowKebabAction(jtName, /^Edit template$/);

    cy.typeInputByLabel(/^Name$/, newJTName);
    cy.typeInputByLabel(/^Description$/, 'this is a new description');

    cy.clickButton(/^Save job template$/);
    cy.hasTitle(newJTName);

    cy.navigateTo(/^Templates$/);
    cy.clickTableRowKebabAction(jtName, /^Delete template$/);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete template/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.clickButton(/^Clear all filters$/);
  });
});
