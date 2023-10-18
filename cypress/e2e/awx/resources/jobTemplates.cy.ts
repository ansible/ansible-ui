import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
//import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
import { InstanceGroup } from '../../../../frontend/awx/interfaces/InstanceGroup';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
// import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';

describe('Job templates form Create, Edit, Delete', () => {
  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let instanceGroup: InstanceGroup;
  let machineCredential: Credential;
  //let executionEnvironment: ExecutionEnvironment;
  const executionEnvironment = 'Control Plane Execution Environment';

  before(() => {
    cy.awxLogin();

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
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    cy.deleteAwxInstanceGroup(instanceGroup);
  });

  it('should create a job template with all fields without prompt on launch option', () => {
    cy.intercept('POST', `/api/v2/job_templates`).as('createJT');
    const jtName = 'E2E-JT ' + randomString(4);
    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('This is a JT description');
    cy.selectDropdownOptionByResourceName('inventory', inventory.name);
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
    cy.selectDropdownOptionByResourceName(
      'execution-environment-select',
      executionEnvironment,
      true
    );
    cy.selectDropdownOptionByResourceName('credential-select', machineCredential.name, true);
    cy.clickButton(/^Create job template$/);
    cy.wait('@createJT')
      .its('response.body.id')
      .then((id: string) => {
        cy.verifyPageTitle(jtName);
        cy.navigateTo('awx', 'templates');
        cy.getTableRowByText(jtName).should('be.visible');
        cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.searchAndDisplayResource(jtName);
        cy.get(`[data-cy="row-id-${id}"]`).within(() => {
          cy.get('[data-cy="launch-template"]').click();
        });
        cy.wait('@postLaunch')
          .its('response.body.id')
          .then((jobId: string) => {
            cy.waitForTemplateStatus(jobId);
          });
        cy.navigateTo('awx', 'templates');
        cy.clickTableRowKebabAction(jtName, /^Delete template$/);
        cy.get('#confirm').click();
        cy.intercept('DELETE', `/api/v2/job_templates/${id}/`).as('deleteJobTemplate');
        cy.clickButton(/^Delete template/);
        cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
          expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
        });
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
  });

  it('creation of job template using the prompt on launch wizard', () => {
    cy.intercept('POST', `/api/v2/job_templates`).as('createPOLJT');
    const jtName = 'E2E-POLJT ' + randomString(4);

    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('This is a JT with POL wizard description');
    cy.selectPromptOnLaunch('inventory');
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
    cy.selectPromptOnLaunch('execution_environment');
    cy.selectPromptOnLaunch('credential');
    cy.selectPromptOnLaunch('instance_groups');
    cy.clickButton(/^Create job template$/);
    cy.wait('@createPOLJT')
      .its('response.body.id')
      .then((id: string) => {
        cy.verifyPageTitle(jtName);
        cy.navigateTo('awx', 'templates');
        cy.getTableRowByText(jtName).should('be.visible');
        cy.searchAndDisplayResource(jtName);
        cy.get(`[data-cy="row-id-${id}"]`).within(() => {
          cy.get('[data-cy="launch-template"]').click();
        });
        cy.selectDropdownOptionByResourceName('inventory', inventory.name);
        cy.clickButton(/^Next/);
        cy.selectItemFromLookupModal('credential-select', machineCredential.name);
        cy.clickButton(/^Next/);
        cy.selectItemFromLookupModal('execution-environment-select', executionEnvironment);
        cy.clickButton(/^Next/);
        cy.selectItemFromLookupModal('instance-group-select', instanceGroup.name);
        cy.clickButton(/^Next/);
        cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.clickButton(/^Finish/);
        cy.wait('@postLaunch')
          .its('response.body.id')
          .then((jobId: string) => {
            cy.waitForTemplateStatus(jobId);
          });
        cy.navigateTo('awx', 'templates');
        cy.intercept('DELETE', `/api/v2/job_templates/${id}/`).as('deleteJobTemplate');
        cy.clickTableRowKebabAction(jtName, /^Delete template$/);
        cy.get('#confirm').click();
        cy.clickButton(/^Delete template/);
        cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
          expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
        });
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
  });

  it('launch a job template from the details page launch cta using the prompt on launch', () => {
    cy.intercept('POST', `/api/v2/job_templates`).as('createPOLJT');
    const jtName = 'E2E-POLJT ' + randomString(4);

    cy.navigateTo('awx', 'templates');
    cy.clickButton(/^Create template$/);
    cy.clickLink(/^Create job template$/);
    cy.get('[data-cy="name"]').type(jtName);
    cy.get('[data-cy="description"]').type('This is a JT with POL wizard description');
    cy.selectPromptOnLaunch('inventory');
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
    cy.selectPromptOnLaunch('execution_environment');
    cy.selectPromptOnLaunch('credential');
    cy.selectPromptOnLaunch('instance_groups');
    cy.clickButton(/^Create job template$/);
    cy.wait('@createPOLJT')
      .its('response.body.id')
      .then((id: string) => {
        cy.verifyPageTitle(jtName);
        cy.clickButton(/^Launch template$/);
        cy.selectDropdownOptionByResourceName('inventory', inventory.name);
        cy.clickButton(/^Next/);
        cy.selectItemFromLookupModal('credential-select', machineCredential.name);
        cy.clickButton(/^Next/);
        cy.selectItemFromLookupModal('execution-environment-select', executionEnvironment);
        cy.clickButton(/^Next/);
        cy.selectItemFromLookupModal('instance-group-select', instanceGroup.name);
        cy.clickButton(/^Next/);
        cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
        cy.clickButton(/^Finish/);
        cy.wait('@postLaunch')
          .its('response.body.id')
          .then((jobId: string) => {
            cy.waitForTemplateStatus(jobId);
          });
        cy.navigateTo('awx', 'templates');
        cy.intercept('DELETE', `/api/v2/job_templates/${id}/`).as('deleteJobTemplate');
        cy.clickTableRowKebabAction(jtName, /^Delete template$/);
        cy.get('#confirm').click();
        cy.clickButton(/^Delete template/);
        cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
          expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
        });
        cy.contains(/^Success$/);
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
  });

  it('should edit a job template using the kebab menu of the template list page page', () => {
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      cy.navigateTo('awx', 'templates');
      const newName = (jobTemplate.name ?? '') + ' edited';
      cy.getTableRowByText(jobTemplate.name).should('be.visible');
      cy.get('[data-cy="edit-template"]').click();
      cy.verifyPageTitle('Edit Job Template');
      cy.get('[data-cy="name"]').clear().type(newName);
      cy.get('[data-cy="description"]').type('this is a new description after editing');
      cy.intercept('PATCH', `api/v2/job_templates/${jobTemplate.id}/`).as('editJT');
      cy.clickButton(/^Save job template$/);
      cy.wait('@editJT')
        .its('response.body.name')
        .then((name: string) => {
          expect(newName).to.be.equal(name);
        });
      cy.verifyPageTitle(newName);
      cy.intercept('DELETE', `/api/v2/job_templates/${jobTemplate.id}/`).as('deleteJobTemplate');
      cy.clickPageAction(/^Delete template/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete template/);
      cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
        expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
      });
      cy.verifyPageTitle('Templates');
    });
  });

  it('should edit a job template using the edit template cta on details page', () => {
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      cy.navigateTo('awx', 'templates');
      const newName = (jobTemplate.name ?? '') + ' edited';
      cy.navigateTo('awx', 'templates');
      cy.clickTableRow(jobTemplate.name);
      cy.verifyPageTitle(jobTemplate.name);
      cy.clickLink(/^Edit template$/);
      cy.verifyPageTitle('Edit Job Template');
      cy.get('[data-cy="name"]').clear().type(newName);
      cy.get('[data-cy="description"]').type('this is a new description after editing');
      cy.intercept('PATCH', `api/v2/job_templates/${jobTemplate.id}/`).as('editJT');
      cy.clickButton(/^Save job template$/);
      cy.wait('@editJT')
        .its('response.body.name')
        .then((name: string) => {
          expect(newName).to.be.equal(name);
        });
      cy.verifyPageTitle(newName);
      cy.intercept('DELETE', `/api/v2/job_templates/${jobTemplate.id}/`).as('deleteJobTemplate');
      cy.clickPageAction(/^Delete template/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete template/);
      cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
        expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
      });
      cy.verifyPageTitle('Templates');
    });
  });

  it('should delete a job template from the details page', () => {
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jobTemplate) => {
      cy.navigateTo('awx', 'templates');
      cy.clickTableRow(jobTemplate.name);
      cy.verifyPageTitle(jobTemplate.name);
      cy.intercept('DELETE', `/api/v2/job_templates/${jobTemplate.id}/`).as('deleteJobTemplate');
      cy.clickPageAction(/^Delete template/);
      cy.get('#confirm').click();
      cy.clickButton(/^Delete template/);
      cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
        expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
      });
      cy.verifyPageTitle('Templates');
    });
  });

  it('should bulk delete job templates from the list page', () => {
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jobTemplate1) => {
      cy.createAwxJobTemplate({
        organization: organization.id,
        project: project.id,
        inventory: inventory.id,
      }).then((jobTemplate2) => {
        cy.navigateTo('awx', 'templates');
        cy.selectTableRow(jobTemplate1.name);
        cy.selectTableRow(jobTemplate2.name);
        cy.clickToolbarKebabAction(/^Delete selected templates$/);
        cy.intercept('DELETE', `/api/v2/job_templates/${jobTemplate1.id}/`).as(
          'deleteJobTemplate1'
        );
        cy.intercept('DELETE', `/api/v2/job_templates/${jobTemplate2.id}/`).as(
          'deleteJobTemplate2'
        );
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete template');
        cy.wait(['@deleteJobTemplate1', '@deleteJobTemplate2']).then((jtArray) => {
          expect(jtArray[0]?.response?.statusCode).to.eql(204);
          expect(jtArray[1]?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clickButton(/^Clear all filters$/);
      });
    });
  });
});
