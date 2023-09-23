import { randomString } from '../../../../framework/utils/random-string';
//import { Credential } from '../../../../frontend/awx/interfaces/Credential';
//import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
//import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
//import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('Job templates form', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  //let jobId: string;
  const executionEnvironment = 'Control Plane Execution Environment';
  //: ExecutionEnvironment;
  //let githubTokenCredential: Credential;
  const machineCredential = 'Demo Credential';
  //: Credential;
  //let label: Label;
  const instanceGroup = 'controlplane';
  //: InstanceGroup;

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

      // cy.createAwxExecutionEnvironment({ organization: organization.id }).then((ee) => {
      //   executionEnvironment = ee;
      // });

      // cy.createAWXCredential({
      //   kind: 'github_token',
      //   organization: organization.id,
      //   credential_type: 11,
      // }).then((cred) => {
      //   githubTokenCredential = cred;
      // });

      // cy.createAWXCredential({
      //   kind: 'machine',
      //   organization: organization.id,
      //   credential_type: 1,
      // }).then((cred) => {
      //   machineCredential = cred;
      // });

      // cy.createAwxInstanceGroup().then((ig) => {
      //   instanceGroup = ig;
      // });

      // cy.createAwxLabel({ organization: organization.id }).then((l) => {
      //   label = l;
      // });
    });
  });

  after(() => {
    //cy.deleteAwxOrganization(organization, jobId);
    cy.deleteAwxInstanceGroup(instanceGroup);
  });

  it.only('should create job template with all fields without prompt on launch option', () => {
    cy.intercept('POST', `/api/v2/job_templates`).as('launchJT');
    const jtName = 'E2E-JT ' + randomString(4);
    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);
    cy.typeInputByLabel(/^Name$/, jtName);
    cy.typeInputByLabel(/^Description$/, 'This is a JT description');
    cy.selectPromptOnLaunchByLabel('Inventory', false, inventory.name);
    cy.selectDropdownOptionByLabel(/^Project$/, project.name);
    cy.selectDropdownOptionByLabel(/^Playbook$/, 'hello_world.yml');
    cy.selectPromptOnLaunchByLabel('Execution environment', false, executionEnvironment);
    cy.selectPromptOnLaunchByLabel('Credentials', false, machineCredential);
    cy.clickButton(/^Create job template$/);
    cy.wait('@launchJT')
      .its('response.body.id')
      .then((id: string) => {
        cy.log(id);
        cy.hasTitle(jtName);
        cy.intercept('GET', `api/v2/job_templates/${id}/launch`).as('launchIcon');
        cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.contains('Launch template').click();
        cy.wait('@launchIcon').then((launchIcon) => {
          expect(launchIcon?.response?.statusCode).to.eq(200);
        });
        //cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.wait('@postLaunch')
          .its('response.body.id')
          .then((jobId: string) => {
            cy.waitForTemplateStatus(jobId);
          });
      });
  });

  it('creation of job template using values from the prompt on launch wizard', () => {
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
        cy.selectRowItemInFormGroupLookupModal(/^Credentials$/, machineCredential);
        cy.clickButton(/^Next/);
        cy.selectRowItemInFormGroupLookupModal(/^Execution environment$/, executionEnvironment);
        cy.clickButton(/^Next/);
        cy.selectRowItemInFormGroupLookupModal(/^Instance group$/, instanceGroup);
        cy.clickButton(/^Next/);
        cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.clickButton(/^Finish/);
      });
    cy.wait('@postLaunch')
      .its('response.body.id')
      .then((jobId: string) => {
        cy.navigateTo('awx', 'jobs');
        cy.clickTableRow(jtName);
        cy.waitForTemplateStatus(jobId);
        cy.deleteAwxOrganization(organization);
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
