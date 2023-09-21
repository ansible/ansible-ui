import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
//import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('Job templates form', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let executionEnvironment: ExecutionEnvironment;
  //let githubTokenCredential: Credential;
  let machineCredential: Credential;
  //let label: Label;
  let instanceGroup: InstanceGroup;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAwxOrganization().then((o) => {
      organization = o;

      cy.createAwxProject({ organization: organization.id }).then((p) => {
        project = p;
      });

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
      //   githubTokenCredential = cred;
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

      // cy.createAwxLabel({ organization: organization.id }).then((l) => {
      //   label = l;
      // });
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
    //cy.deleteAwxInstanceGroup(instanceGroup);
  });

  it('Should create job template with all fields except for prompt on launch values', () => {
    cy.intercept('POST', `/api/v2/job_templates`).as('launchJT');
    const jtName = 'E2E-JT ' + randomString(4);

    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);
    cy.typeInputByLabel(/^Name$/, jtName);
    cy.typeInputByLabel(/^Description$/, 'This is a JT description');
    cy.selectPromptOnLaunchByLabel(/^Inventory$/, false, inventory.name);
    cy.selectDropdownOptionByLabel(/^Project$/, project.name);
    cy.selectDropdownOptionByLabel(/^Playbook$/, 'hello_world.yml');
    cy.selectDropdownOptionByLabel(/^Execution environment$/, executionEnvironment.name);
    cy.clickButton(/^Create job template$/);
    cy.wait('@launchJT')
      .its('response.body.id')
      .then((id: string) => {
        cy.log(id);
        cy.hasTitle(jtName);
        cy.navigateTo(/^Template$/);
        cy.getTableRowByText(jtName).should('be.visible');
        cy.clickTableRowActionIcon(jtName, 'Launch template');
        cy.intercept('GET', `api/v2/job_templates/${id}/launch`).as('launchIcon');
        cy.wait('@launchIcon').then((launchIcon) => {
          expect(launchIcon?.response?.statusCode).to.eq(200);
        });
        cy.selectDropdownOptionByLabel(/^Inventory$/, inventory.name);
        cy.clickButton(/^Next/);
        cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.clickButton(/^Launch/);
      });
    cy.wait('@postLaunch')
      .its('response.body.id')
      .then((jobId: string) => {
        //cy.navigateTo(/^Jobs$/);
        cy.navigateTo('awx', 'jobs');
        cy.clickTableRow(jtName);
        cy.waitForTemplateStatus(jobId);
      });

    //cy.hasTitle(jtName);
    // cy.getCheckboxByLabel('Prompt on launch');
    // Inventory
    // cy.get('input[placeholder="Enter inventory"]')
    //   .parent()
    //   .within(() => {
    //     cy.get('button[aria-label="Options menu"]').click();
    //   });
    // cy.selectTableRowInDialog(inventory.name, true, 'radio').click();
    // cy.clickModalButton('Confirm');

    // Project
    // cy.get('input[placeholder="Add project"]')
    //   .parent()
    //   .within(() => {
    //     cy.get('button[aria-label="Options menu"]').click();
    //   });
    // cy.selectTableRowInDialog(project.name, true, 'radio').click();
    // cy.clickModalButton('Confirm');

    // // Playbook
    // cy.selectDropdownOptionByLabel(/^Playbook$/, 'hello_world.yml');

    // // Execution Environment
    // cy.get('input[placeholder="Add execution environment"]')
    //   .parent()
    //   .within(() => {
    //     cy.get('button[aria-label="Options menu"]').click();
    //   });
    // cy.selectTableRowInDialog(executionEnvironment.name, true, 'radio').click();
    // cy.clickModalButton('Confirm');

    // // Credentials
    // cy.get('input[placeholder="Add credentials"]')
    //   .parent()
    //   .within(() => {
    //     cy.get('button[aria-label="Options menu"]').click();
    //   });
    // cy.selectTableRowInDialog(machineCredential.name, true, 'checkbox').click();
    // cy.clickModalButton('Confirm');

    // // Labels
    // cy.selectDropdownOptionByLabel(/^Labels$/, label.name.toString(), true);

    // cy.typeInputByLabel(/^Forks$/, '10');
    // cy.typeInputByLabel(/^Limit$/, '10');
    // cy.typeInputByLabel(/^Verbosity$/, '1');
    // cy.typeInputByLabel(/^Job slicing$/, '10');
    // cy.typeInputByLabel(/^Timeout$/, '10');
    // cy.getFormGroupByLabel(/^Show changes$/)
    //   .parent()
    //   .within(() => {
    //     cy.get('.pf-c-switch__toggle').click();
    //   });

    // // Instance Groups
    // cy.get('input[placeholder="Add instance groups"]')
    //   .parent()
    //   .within(() => {
    //     cy.get('button[aria-label="Options menu"]').click();
    //   });
    // cy.selectTableRowInDialog(instanceGroup.name, true, 'checkbox').click();
    // cy.clickModalButton('Confirm');

    // // Job tags
    // cy.contains('.pf-c-form__label-text', /^Job tags$/)
    //   .parent()
    //   .parent()
    //   .parent()
    //   .parent()
    //   .within(() => {
    //     cy.get('.pf-c-form__group-control').within(() => {
    //       cy.get("input[type='text']")
    //         .click()
    //         .type('test job tag')
    //         .parent()
    //         .parent()
    //         .parent()
    //         .within(() => {
    //           cy.get('.pf-c-select__menu').within(() => {
    //             cy.get('button').contains('test job tag').click();
    //           });
    //         });
    //     });
    //   });

    // // Skip tags
    // cy.contains('.pf-c-form__label-text', /^Skip tags$/)
    //   .parent()
    //   .parent()
    //   .parent()
    //   .parent()
    //   .within(() => {
    //     cy.get('.pf-c-form__group-control').within(() => {
    //       cy.get("input[type='text']")
    //         .click()
    //         .type('test skip tag')
    //         .parent()
    //         .parent()
    //         .parent()
    //         .within(() => {
    //           cy.get('.pf-c-select__menu').within(() => {
    //             cy.get('button').contains('test skip tag').click();
    //           });
    //         });
    //     });
    //   });

    // cy.get('input#become_enabled').click();
    // cy.get('input#isProvisioningCallbackEnabled').click();
    // // cy.get('input#isWebhookEnabled').click();
    // cy.get('input#allow_simultaneous').click();
    // cy.get('input#use_fact_cache').click();
    // cy.get('input#prevent_instance_group_fallback').click();
    // cy.typeInputByLabel(/^Host config key$/, 'test config key');

    // // cy.selectDropdownOptionByLabel(/^Webhook service$/, 'GitHub');

    // // cy.get('input[placeholder="Add webhook credential"]')
    // //   .parent()
    // //   .within(() => {
    // //     cy.get('button[aria-label="Options menu"]').click();
    // //   });
    // // cy.selectTableRowInDialog(githubTokenCrendential.name, true, 'radio').click();
    // // cy.clickModalButton('Confirm');

    // cy.clickButton(/^Create job template$/);
    // cy.hasTitle(jtName);
  });

  it.only('creation of job template using values from the prompt on launch wizard', () => {
    cy.intercept('POST', `/api/v2/job_templates`).as('launchJT');
    const jtName = 'E2E-POLJT ' + randomString(4);

    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);
    cy.typeInputByLabel(/^Name$/, jtName);
    cy.typeInputByLabel(/^Description$/, 'This is a JT with POL wizard description');
    cy.selectPromptOnLaunchByLabel(/^Inventory$/);
    cy.selectDropdownOptionByLabel(/^Project$/, project.name);
    cy.selectDropdownOptionByLabel(/^Playbook$/, 'hello_world.yml');
    cy.selectPromptOnLaunchByLabel(/^Execution environment$/);
    cy.selectPromptOnLaunchByLabel(/^Credentials$/);
    cy.selectPromptOnLaunchByLabel(/^Instance group$/);
    cy.clickButton(/^Create job template$/);
    cy.wait('@launchJT')
      .its('response.body.id')
      .then((id: string) => {
        cy.log(id);
        cy.hasTitle(jtName);
        cy.navigateTo('awx', 'templates');
        cy.getTableRowByText(jtName).should('be.visible');
        cy.clickTableRowActionIcon(jtName, 'Launch template');
        cy.intercept('GET', `api/v2/job_templates/${id}/launch`).as('launchIcon');
        cy.wait('@launchIcon').then((launchIcon) => {
          expect(launchIcon?.response?.statusCode).to.eq(200);
        });
        cy.selectDropdownOptionByLabel(/^Inventory$/, inventory.name);
        cy.clickButton(/^Next/);
        cy.selectRowItemInFormGroupLookupModal(/^Credentials$/, machineCredential.name);
        cy.clickButton(/^Next/);
        cy.selectRowItemInFormGroupLookupModal(
          /^Execution environment$/,
          executionEnvironment.name
        );
        cy.clickButton(/^Next/);
        cy.selectRowItemInFormGroupLookupModal(/^Instance group$/, instanceGroup.name);
        cy.clickButton(/^Next/);
        cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.clickButton(/^Launch/);
      });
    cy.wait('@postLaunch')
      .its('response.body.id')
      .then((jobId: string) => {
        cy.navigateTo('awx', /^Jobs$/);
        cy.clickTableRow(jtName);
        cy.waitForTemplateStatus(jobId);
      });
  });

  it.skip('Should edit a job template', () => {
    //this test requires refactoring when Job Template creation is enabled
    cy.navigateTo('awx', 'templates');
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      const newName = (jobTemplate.name ?? '') + ' edited';
      cy.clickTableRowKebabAction(jobTemplate.name, /^Edit template$/);
      cy.get('[data-cy="name"]').type(newName);
      cy.get('[data-cy="description"]').type('this is a new description');
      cy.clickButton(/^Save job template$/);
      cy.verifyPageTitle(newName);
    });
  });

  it('Should delete a job template', () => {
    cy.navigateTo('awx', 'templates');
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
