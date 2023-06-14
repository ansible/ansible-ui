import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('Job templates form', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let executionEnvironment: ExecutionEnvironment;
  // let githubTokenCrendential: Credential;
  let machineCredential: Credential;
  let label: Label;
  let instanceGroup: InstanceGroup;

  before(() => {
    cy.awxLogin();

    cy.createAwxOrganization().then((o) => {
      organization = o;

      cy.createAwxProject({ organization: organization.id }, { skipSync: true }).then((p) => {
        project = p;

        cy.createAwxInventory({ organization: organization.id }).then((i) => {
          inventory = i;
        });

        cy.createAwxExecutionEnvironment({ organization: organization.id }).then((ee) => {
          executionEnvironment = ee;
        });

        // cy.createAWXCredential({
        //   kind: 'github_token',
        //   organization: organization.id,
        //   credential_type: 11,
        // }).then((cred) => {
        //   githubTokenCrendential = cred;
        // });

        cy.createAWXCredential({
          kind: 'machine',
          organization: organization.id,
          credential_type: 1,
        }).then((cred) => {
          machineCredential = cred;
        });

        cy.createAwxInstanceGroup().then((ig) => {
          instanceGroup = ig;
        });

        cy.createAwxLabel({ organization: organization.id }).then((l) => {
          label = l;
        });

        cy.waitAwxProjectSync(project);
      });
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
    cy.deleteAwxInstanceGroup(instanceGroup);
  });

  it('Should create job template with all fields except for prompt on launch values', () => {
    const jtName = 'E2E ' + randomString(4);

    cy.navigateTo(/^Templates$/);
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);

    // Name
    cy.typeInputByLabel(/^Name$/, jtName);

    // Description
    cy.typeInputByLabel(/^Description$/, 'this is a description');

    // Inventory
    cy.get('input[placeholder="Enter inventory"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      });
    cy.selectTableRowInDialog(inventory.name, true, 'radio').click();
    cy.clickModalButton('Confirm');

    // Project
    cy.get('input[placeholder="Add project"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      });
    cy.selectTableRowInDialog(project.name, true, 'radio').click();
    cy.clickModalButton('Confirm');

    // Playbook
    cy.selectDropdownOptionByLabel(/^Playbook$/, 'hello_world.yml');

    // Execution Environment
    cy.get('input[placeholder="Add execution environment"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      });
    cy.selectTableRowInDialog(executionEnvironment.name, true, 'radio').click();
    cy.clickModalButton('Confirm');

    // Credentials
    cy.get('input[placeholder="Add credentials"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      });
    cy.selectTableRowInDialog(machineCredential.name, true, 'checkbox').click();
    cy.clickModalButton('Confirm');

    // Labels
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

    // Instance Groups
    cy.get('input[placeholder="Add instance groups"]')
      .parent()
      .within(() => {
        cy.get('button[aria-label="Options menu"]').click();
      });
    cy.selectTableRowInDialog(instanceGroup.name, true, 'checkbox').click();
    cy.clickModalButton('Confirm');

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

    cy.get('input#become_enabled').click();
    cy.get('input#isProvisioningCallbackEnabled').click();
    // cy.get('input#isWebhookEnabled').click();
    cy.get('input#allow_simultaneous').click();
    cy.get('input#use_fact_cache').click();
    cy.get('input#prevent_instance_group_fallback').click();
    cy.typeInputByLabel(/^Host config key$/, 'test config key');

    // cy.selectDropdownOptionByLabel(/^Webhook service$/, 'GitHub');

    // cy.get('input[placeholder="Add webhook credential"]')
    //   .parent()
    //   .within(() => {
    //     cy.get('button[aria-label="Options menu"]').click();
    //   });
    // cy.selectTableRowInDialog(githubTokenCrendential.name, true, 'radio').click();
    // cy.clickModalButton('Confirm');

    cy.clickButton(/^Create job template$/);
    cy.hasTitle(jtName);
  });

  it('Should edit a job template', () => {
    cy.navigateTo(/^Templates$/);
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      const newName = (jobTemplate.name ?? '') + ' edited';
      cy.clickTableRowKebabAction(jobTemplate.name, /^Edit template$/);
      cy.typeInputByLabel(/^Name$/, newName);
      cy.typeInputByLabel(/^Description$/, 'this is a new description');
      cy.clickButton(/^Save job template$/);
      cy.hasTitle(newName);
    });
  });

  it('Should delete a job template', () => {
    cy.navigateTo(/^Templates$/);
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      cy.clickTableRowKebabAction(jobTemplate.name, /^Delete template$/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete template/);
      cy.contains(/^Success$/);
      cy.clickButton(/^Close$/);
      cy.clickButton(/^Clear all filters$/);
    });
  });
});
