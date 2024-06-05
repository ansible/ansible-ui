import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Workflow Job Templates Tests', () => {
  before(() => {
    cy.awxLogin();
  });

  describe('Workflow Job Templates: Create', function () {
    let organization: Organization;
    let inventory: Inventory;
    let label: Label;

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

    it('can create a WFJT with only a name and then edit it to add all optional fields, including extra vars', () => {
      const jtName = 'E2E ' + randomString(4);

      cy.navigateTo('awx', 'templates');
      cy.clickButton(/^Create template$/);
      cy.clickLink(/^Create workflow job template$/);
      cy.get('[data-cy="name"]').type(jtName);
      cy.intercept('POST', awxAPI`/workflow_job_templates/`).as('newWfjt');
      cy.get('[data-cy="Submit"]').click();
      cy.wait('@newWfjt')
        .its('response.body')
        .then((newWfjt: WorkflowJobTemplate) => {
          cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').should('be.visible');
          cy.navigateTo('awx', 'templates');
          cy.filterTableByMultiSelect('name', [newWfjt.name]);
          cy.clickTableRowAction('name', newWfjt.name, 'edit-template', {
            disableFilter: true,
          });
          cy.get('[data-cy="description"]').type('this is a new description');
          cy.singleSelectBy('[data-cy="organization"]', organization.name);
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
          cy.intercept('PATCH', awxAPI`/workflow_job_templates/${newWfjt.id.toString()}/`).as(
            'editWFJT'
          );
          cy.clickButton(/^Save workflow job template$/);
          cy.verifyPageTitle(newWfjt.name);
          cy.wait('@editWFJT')
            .its('response.body')
            .then((editedWFJT: WorkflowJobTemplate) => {
              expect(editedWFJT.description).contains('this is a new description');
              expect(editedWFJT.organization.toString()).contains(organization.id.toString());
              expect(editedWFJT.inventory.toString()).contains(inventory.id.toString());
              expect(editedWFJT.limit).contains('mock-limit');
              expect(editedWFJT.scm_branch).contains('mock-scm-branch');
            });
          cy.deleteAwxWorkflowJobTemplate(newWfjt, { failOnStatusCode: false });
        });
    });

    it('can create a workflow job template using all optional fields', () => {
      const jtName = 'E2E ' + randomString(4);

      cy.navigateTo('awx', 'templates');
      cy.clickButton(/^Create template$/);
      cy.clickLink(/^Create workflow job template$/);
      cy.get('[data-cy="name"]').type(jtName);
      cy.get('[data-cy="description"]').type('this is a description');
      cy.singleSelectBy('[data-cy="organization"]', organization.name);
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
      cy.intercept('POST', awxAPI`/workflow_job_templates/`).as('newWfjt');
      cy.get('[data-cy="Submit"]').click();
      cy.wait('@newWfjt')
        .its('response.body')
        .then((newWfjt: WorkflowJobTemplate) => {
          cy.get('button[data-cy="workflow-visualizer-toolbar-close"]').should('be.visible');
          cy.deleteAwxWorkflowJobTemplate(newWfjt, { failOnStatusCode: false });
        });
    });
  });

  describe('Workflow Job Templates: Edit', function () {
    let workflowJobTemplate: WorkflowJobTemplate;
    let organization: Organization;
    let newOrganization: Organization;
    let inventory: Inventory;

    beforeEach(function () {
      cy.createAwxOrganization().then((orgA) => {
        newOrganization = orgA;
      });
      cy.createAwxOrganization().then((orgB) => {
        organization = orgB;
        cy.createAwxInventory({ organization: organization.id }).then((i) => {
          inventory = i;

          cy.createAwxWorkflowJobTemplate({
            organization: organization.id,
            inventory: inventory.id,
          }).then((wfJT) => {
            workflowJobTemplate = wfJT;
          });
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
      cy.deleteAwxOrganization(newOrganization, { failOnStatusCode: false });
    });

    it.only('can edit a workflow job template from the details view', () => {
      //Utilize a workflow job template created in the beforeEach block
      //Assert original values on the WFJT
      //After edit, intercept the API response and assert the edited values
      const newName = (workflowJobTemplate.name ?? '') + ' edited';

      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate?.name]);
      cy.clickTableRowLink('name', workflowJobTemplate?.name, { disableFilter: true });
      cy.verifyPageTitle(workflowJobTemplate.name);
      cy.clickButton(/^Edit template$/);
      cy.get('[data-cy="name"]').clear().type(newName);
      cy.get('[data-cy="description"]').type('this is a new description');
      cy.singleSelectByDataCy('organization', newOrganization.name);
      cy.clickButton(/^Save workflow job template$/);
      cy.verifyPageTitle(newName);
      cy.getByDataCy('name').should('contain', newName);
      cy.getByDataCy('description').should('contain', 'this is a new description');
    });

    it.skip('can edit a WFJT to add, save, and then remove a webhook credential for github', () => {
      //Utilize a workflow job template created in the beforeEach block
      //Create a github credential
      //Assert original values on the WFJT
      //After edit, intercept the API response and assert the edited values
    });

    it.skip('can edit a WFJT to add, save, and then remove a webhook credential for gitlab', () => {
      //Utilize a workflow job template created in the beforeEach block
      //Create a gitlab credential
      //Assert original values on the WFJT
      //After edit, intercept the API response and assert the edited values
    });

    it('can edit a workflow job template from the list row', () => {
      const newName = (workflowJobTemplate.name ?? '') + ' edited';

      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate?.name]);
      cy.clickTableRowAction('name', workflowJobTemplate?.name, 'edit-template', {
        disableFilter: true,
      });
      cy.get('[data-cy="name"]').clear().type(newName);
      cy.get('[data-cy="description"]').type('this is a new description');
      cy.singleSelectByDataCy('organization', newOrganization.name);
      cy.clickButton(/^Save workflow job template$/);
      cy.verifyPageTitle(newName);
      cy.getByDataCy('name').should('contain', newName);
      cy.getByDataCy('description').should('contain', 'this is a new description');
    });
  });

  describe('Workflow Job Templates: Copy', function () {
    let workflowJobTemplate: WorkflowJobTemplate;
    let organization: Organization;
    let inventory: Inventory;

    beforeEach(function () {
      cy.createAwxOrganization().then((orgB) => {
        organization = orgB;
        cy.createAwxInventory({ organization: organization.id }).then((i) => {
          inventory = i;

          cy.createAwxWorkflowJobTemplate({
            organization: organization.id,
            inventory: inventory.id,
          }).then((wfjt) => {
            workflowJobTemplate = wfjt;
          });
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it.skip('can copy an existing workflow job template from the list', function () {
      //Use a WFJT created in the beforeEach hook
      cy.log('WFJT', workflowJobTemplate); //delete this line when the test is written
    });

    it.skip('can copy an existing workflow job template from the details page', function () {
      //Use a WFJT created in the beforeEach hook
    });
  });

  describe('Workflow Job Templates: Delete', function () {
    let workflowJobTemplate: WorkflowJobTemplate;
    let organization: Organization;
    let inventory: Inventory;

    beforeEach(function () {
      cy.createAwxOrganization().then((orgB) => {
        organization = orgB;
        cy.createAwxInventory({ organization: organization.id }).then((i) => {
          inventory = i;

          cy.createAwxWorkflowJobTemplate({
            organization: organization.id,
            inventory: inventory.id,
          }).then((wfjt) => {
            workflowJobTemplate = wfjt;
          });
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it.skip('can delete a workflow job template from the details page', () => {
      //Utilize a workflow job template created in the beforeEach block
      //Assert original values on the WFJT
      //After delete, intercept the API response and assert the deletion
    });

    it.skip('can bulk delete multiple workflow job templates from the list toolbar', () => {
      //Utilize a workflow job template created in the beforeEach block
      //have this test create one additional WFJT
      //Assert the presence of the two WFJTs on the list view
      //After delete, intercept the API response and assert the deletion of the two WFJTs
    });

    it('can delete a workflow job template from the list row', () => {
      cy.navigateTo('awx', 'templates');
      cy.intercept(
        'DELETE',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
      ).as('deleted');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate?.name]);
      cy.clickTableRowAction('name', workflowJobTemplate?.name, 'delete-template', {
        inKebab: true,
        disableFilter: true,
      });
      cy.get('#confirm').click();
      cy.clickButton(/^Delete template/);
      cy.wait('@deleted')
        .its('response.statusCode')
        .then((statusCode) => {
          expect(statusCode).to.eql(204);
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clickButton(/^Clear all filters$/);
        });
    });
  });

  describe('Workflow Job Templates: Launch', function () {
    let workflowJobTemplate: WorkflowJobTemplate;
    let jobTemplate: JobTemplate;
    let organization: Organization;
    let newOrg: Organization;
    let inventory: Inventory;
    let project: Project;

    beforeEach(function () {
      cy.createAwxOrganization().then((orgB) => {
        organization = orgB;
        cy.createAwxInventory({ organization: organization.id }).then((i) => {
          inventory = i;

          cy.createAwxJobTemplate({
            organization: organization.id,
            project: (this.globalProject as Project).id,
            inventory: inventory.id,
          }).then((jt) => {
            jobTemplate = jt;

            cy.createAwxWorkflowJobTemplate({
              organization: organization.id,
              inventory: inventory.id,
            }).then((wfjt) => {
              workflowJobTemplate = wfjt;

              cy.createAwxWorkflowVisualizerProjectNode(
                workflowJobTemplate,
                this.globalProject as Project
              ).then((projectNode) => {
                cy.createAwxWorkflowVisualizerJobTemplateNode(
                  workflowJobTemplate,
                  jobTemplate
                ).then((jobTemplateNode) => {
                  cy.createAwxOrganization().then((org) => {
                    newOrg = org;
                    cy.createAwxProject({ organization: organization.id }).then((p) => {
                      project = p;
                      let inventorySource: InventorySource;
                      cy.createAwxInventorySource(inventory, project).then((invSrc) => {
                        inventorySource = invSrc;
                        cy.createAwxWorkflowVisualizerInventorySourceNode(
                          workflowJobTemplate,
                          inventorySource
                        ).then((inventorySourceNode) => {
                          cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 2).then(
                            (managementNode) => {
                              cy.createWorkflowJTSuccessNodeLink(projectNode, jobTemplateNode);
                              cy.createWorkflowJTSuccessNodeLink(
                                jobTemplateNode,
                                inventorySourceNode
                              );
                              cy.createWorkflowJTFailureNodeLink(
                                inventorySourceNode,
                                managementNode
                              );
                            }
                          );
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxProject(project, { failOnStatusCode: false });
      cy.deleteAwxOrganization(newOrg, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can save and launch a workflow job template from list view', function () {
      cy.navigateTo('awx', 'templates');
      cy.intercept('POST', `api/v2/workflow_job_templates/${workflowJobTemplate.id}/launch/`).as(
        'launchWJT-WithNodes'
      );
      cy.filterTableByMultiSelect('name', [workflowJobTemplate.name]);
      cy.clickTableRowLink('name', workflowJobTemplate.name, {
        disableFilter: true,
      });
      cy.get('button[data-cy="launch-template"]').click();
      cy.wait('@launchWJT-WithNodes')
        .its('response.body.id')
        .then((jobId: string) => {
          /*there is a known React error, `create request error` happening due the output tab work in progress,but the test executes fine since there is no ui interaction here*/
          cy.waitForWorkflowJobStatus(jobId);
        });
    });

    it.skip('can save and launch a workflow job template from details view', function () {
      //Utilize the resources created in the beforeEach block
      //Navigate to the details page of the WFJT, assert values there
      //After launch, assert the redirect to the job output screen
    });
  });
});
