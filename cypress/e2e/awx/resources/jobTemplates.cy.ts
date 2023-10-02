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
    });
  });

  after(() => {
    cy.deleteAwxOrganization(organization);
    cy.deleteAwxInstanceGroup(instanceGroup);
  });

  it.skip('Should create job template with all fields except for prompt on launch values', () => {
    //this test requires refactoring when Job Template creation is enabled
    const jtName = 'E2E ' + randomString(4);

    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);

    // Name
    cy.get('[data-cy="name"]').type(jtName);

    // Description
    cy.get('[data-cy="description"]').type('this is a description');

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
    cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');

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
    cy.selectDropdownOptionByResourceName('labels.select', label.name.toString());

    cy.get('[data-cy="forks"]').type('10');
    cy.get('[data-cy="limit"]').type('10');
    cy.get('[data-cy="verbosity"]').type('1');
    cy.get('[data-cy="job-slicing"]').type('10');
    cy.get('[data-cy="timeout"]').type('10');
    cy.get('[data-cy="show-changes-toggle"]').click();

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
    cy.get('[data-cy="host-config-key"]').type('test config key');

    // cy.selectDropdownOptionByResourceName('webhook-service', 'GitHub');

    // cy.get('input[placeholder="Add webhook credential"]')
    //   .parent()
    //   .within(() => {
    //     cy.get('button[aria-label="Options menu"]').click();
    //   });
    // cy.selectTableRowInDialog(githubTokenCrendential.name, true, 'radio').click();
    // cy.clickModalButton('Confirm');

    cy.clickButton(/^Create job template$/);
    cy.verifyPageTitle(jtName);
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
