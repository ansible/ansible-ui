import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Label } from '../../../../frontend/awx/interfaces/Label';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';

describe('Workflow Job Templates Tests', () => {
  let organization: Organization;
  let inventory: Inventory;
  let label: Label;

  beforeEach(() => {
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxInventory(organization).then((i) => {
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

  describe('Workflow Job Templates: Create', function () {
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
              expect(editedWFJT.organization?.toString()).contains(organization.id.toString());
              expect(editedWFJT.inventory?.toString()).contains(inventory.id.toString());
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
    let newOrganization: Organization;
    let inventory: Inventory;
    let tokenCredential: Credential;

    beforeEach(function () {
      cy.createAwxOrganization().then((orgA) => {
        newOrganization = orgA;
      });
      cy.createAwxInventory(organization).then((i) => {
        inventory = i;

        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfJT) => {
          workflowJobTemplate = wfJT;
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxOrganization(newOrganization, { failOnStatusCode: false });
    });

    it('can edit a workflow job template from the details view', () => {
      const newName = (workflowJobTemplate.name ?? '') + ' edited';

      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate?.name]);
      cy.clickTableRowLink('name', workflowJobTemplate?.name, { disableFilter: true });
      cy.verifyPageTitle(workflowJobTemplate.name);
      cy.clickLink('Edit template');
      cy.get('[data-cy="name"]').clear().type(newName);
      cy.get('[data-cy="description"]').type('this is a new description');
      cy.singleSelectByDataCy('organization', newOrganization.name);
      cy.clickButton(/^Save workflow job template$/);
      cy.verifyPageTitle(newName);
      cy.getByDataCy('name').should('contain', newName);
      cy.getByDataCy('description').should('contain', 'this is a new description');
    });

    it('can edit a WFJT to add, save, and then remove a webhook credential for github', () => {
      cy.createAWXCredential({
        kind: 'github-token',
        organization: organization.id,
        credential_type: 11,
      }).then((cred) => {
        tokenCredential = cred;
        cy.navigateTo('awx', 'templates');
        cy.filterTableByMultiSelect('name', [workflowJobTemplate?.name]);
        //Assert original values
        expect(workflowJobTemplate.webhook_service).equals('');
        //Edit WFJT to add webhook credential
        cy.clickTableRowAction('name', workflowJobTemplate.name, 'edit-template', {
          disableFilter: true,
        });
        cy.get('[data-cy="isWebhookEnabled"]').click();
        cy.selectDropdownOptionByResourceName('webhook-service', 'GitHub');
        cy.singleSelectByDataCy('webhook_credential', tokenCredential.name);
        cy.intercept(
          'PATCH',
          awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
        ).as('editWFJT');
        cy.clickButton(/^Save workflow job template$/);
        cy.wait('@editWFJT')
          .its('response.body')
          .then((editedWFJT: WorkflowJobTemplate) => {
            expect(editedWFJT.webhook_service).contains('github');
          });
        //Edit to remove webhook credential
        cy.clickLink('Edit template');
        cy.get('[data-cy="isWebhookEnabled"]').click();
        cy.intercept(
          'PATCH',
          awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
        ).as('editWFJT');
        cy.clickButton(/^Save workflow job template$/);
        cy.wait('@editWFJT')
          .its('response.body')
          .then((editedWFJT: WorkflowJobTemplate) => {
            expect(editedWFJT.webhook_service).contains('');
          });
        //Delete credential
        cy.deleteAwxCredential(tokenCredential, { failOnStatusCode: false });
      });
    });

    it('can edit a WFJT to add, save, and then remove a webhook credential for gitlab', () => {
      cy.createAWXCredential({
        kind: 'gitlab-token',
        organization: organization.id,
        credential_type: 12,
      }).then((cred) => {
        tokenCredential = cred;
        cy.navigateTo('awx', 'templates');
        cy.filterTableByMultiSelect('name', [workflowJobTemplate?.name]);

        //Assert original values
        expect(workflowJobTemplate.webhook_service).equals('');

        //Edit WFJT to add webhook credential
        cy.clickTableRowAction('name', workflowJobTemplate.name, 'edit-template', {
          disableFilter: true,
        });
        cy.get('[data-cy="isWebhookEnabled"]').click();
        cy.selectDropdownOptionByResourceName('webhook-service', 'GitLab');
        cy.singleSelectByDataCy('webhook_credential', tokenCredential.name);
        cy.intercept(
          'PATCH',
          awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
        ).as('editWFJT');
        cy.clickButton(/^Save workflow job template$/);
        cy.wait('@editWFJT')
          .its('response.body')
          .then((editedWFJT: WorkflowJobTemplate) => {
            expect(editedWFJT.webhook_service).contains('gitlab');
          });

        //Edit to remove webhook credential
        cy.clickLink('Edit template');
        cy.get('[data-cy="isWebhookEnabled"]').click();
        cy.intercept(
          'PATCH',
          awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
        ).as('editWFJT');
        cy.clickButton(/^Save workflow job template$/);
        cy.wait('@editWFJT')
          .its('response.body')
          .then((editedWFJT: WorkflowJobTemplate) => {
            expect(editedWFJT.webhook_service).contains('');
          });

        //Delete credential
        cy.deleteAwxCredential(tokenCredential, { failOnStatusCode: false });
      });
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
    let inventory: Inventory;

    beforeEach(function () {
      cy.createAwxInventory(organization).then((i) => {
        inventory = i;

        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfjt) => {
          workflowJobTemplate = wfjt;
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can copy an existing workflow job template from the list', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate.name]);
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/copy/`
      ).as('copiedWFJT');
      cy.clickTableRowAction('name', workflowJobTemplate?.name, 'copy-template', {
        inKebab: true,
        disableFilter: true,
      });
      cy.wait('@copiedWFJT')
        .its('response.body')
        .then((response: WorkflowJobTemplate) => {
          cy.filterTableByMultiSelect('name', [
            workflowJobTemplate.name,
            workflowJobTemplate.name,
            response.name,
          ]).then(() => {
            cy.get('#filter-input').click();
            cy.getTableRow('name', workflowJobTemplate.name, { disableFilter: true }).should(
              'be.visible'
            );
            cy.getTableRow('name', response.name, { disableFilter: true }).should('be.visible');
            cy.clickTableRowAction('name', `${response.name}`, 'delete-template', {
              inKebab: true,
              disableFilter: true,
            });
            cy.getModal().within(() => {
              cy.get('#confirm').click();
              cy.get('[data-ouia-component-id="submit"]').click();
              cy.clickButton('Close');
            });
          });
        });
    });

    it('can copy an existing workflow job template from the details page', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate.name]);
      cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/copy/`
      ).as('copiedWFJT');
      cy.clickKebabAction('actions-dropdown', 'copy-template');
      cy.wait('@copiedWFJT')
        .its('response.body')
        .then((response: WorkflowJobTemplate) => {
          cy.navigateTo('awx', 'templates');
          cy.filterTableByMultiSelect('name', [
            workflowJobTemplate.name,
            workflowJobTemplate.name,
            response.name,
          ]).then(() => {
            cy.get('#filter-input').click();
            cy.getTableRow('name', workflowJobTemplate.name, { disableFilter: true }).should(
              'be.visible'
            );
            cy.getTableRow('name', response.name, { disableFilter: true }).should('be.visible');
            cy.clickTableRowAction('name', `${response.name}`, 'delete-template', {
              inKebab: true,
              disableFilter: true,
            });
            cy.getModal().within(() => {
              cy.get('#confirm').click();
              cy.get('[data-ouia-component-id="submit"]').click();
              cy.clickButton('Close');
            });
          });
        });
    });
  });

  describe('Workflow Job Templates: Delete', function () {
    let workflowJobTemplate: WorkflowJobTemplate;
    let inventory: Inventory;

    beforeEach(function () {
      cy.createAwxInventory(organization).then((i) => {
        inventory = i;

        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfjt) => {
          workflowJobTemplate = wfjt;
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can bulk delete multiple workflow job templates from the list toolbar', () => {
      let newWorkflowJobTemplate: WorkflowJobTemplate;
      cy.createAwxWorkflowJobTemplate({
        organization: organization.id,
        inventory: inventory.id,
      }).then((wfJT) => {
        newWorkflowJobTemplate = wfJT;
        cy.navigateTo('awx', 'templates');
        cy.filterTableByMultiSelect('name', [
          workflowJobTemplate.name,
          newWorkflowJobTemplate?.name,
        ]);
        cy.selectTableRowByCheckbox('name', workflowJobTemplate.name, { disableFilter: true });
        cy.selectTableRowByCheckbox('name', newWorkflowJobTemplate.name, { disableFilter: true });
        cy.clickToolbarKebabAction('delete-selected-templates');
        cy.clickModalConfirmCheckbox();
        cy.intercept(
          'DELETE',
          awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
        ).as('deleteWFJT');
        cy.intercept(
          'DELETE',
          awxAPI`/workflow_job_templates/${newWorkflowJobTemplate.id.toString()}/`
        ).as('deleteWFJT2');
        cy.clickModalButton('Delete template');
        cy.wait('@deleteWFJT')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
        cy.wait('@deleteWFJT2').then((deletedWFJT2) => {
          expect(deletedWFJT2?.response?.statusCode).to.eql(204);
        });
        cy.assertModalSuccess();
        cy.clickButton(/^Close$/);
        cy.clearAllFilters();
      });
    });
  });

  describe('Workflow Job Templates: Delete without using org and inventory', function () {
    let workflowJobTemplate: WorkflowJobTemplate;
    let inventory: Inventory;

    before(function () {
      cy.createAwxInventory(organization).then((i) => {
        inventory = i;
      });
    });

    beforeEach(function () {
      cy.createAwxWorkflowJobTemplate({
        organization: organization.id,
        inventory: inventory.id,
      }).then((wfjt) => (workflowJobTemplate = wfjt));
    });

    afterEach(() => {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
    });

    after(() => {
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can delete a workflow job template from the details page', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate.name]);
      cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
      cy.clickKebabAction('actions-dropdown', 'delete-template');
      cy.clickModalConfirmCheckbox();
      cy.intercept(
        'DELETE',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/`
      ).as('deleted');
      cy.clickButton('Delete template');
      cy.wait('@deleted')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
          cy.clearAllFilters();
        });
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
    let inventory: Inventory;
    let project: Project;

    beforeEach(function () {
      cy.createAwxInventory(organization).then((i) => {
        inventory = i;

        cy.createAwxProject(organization).then((proj) => {
          project = proj;

          cy.createAwxJobTemplate({
            organization: organization.id,
            project: project.id,
            inventory: inventory.id,
          }).then((jt) => {
            jobTemplate = jt;

            cy.createAwxWorkflowJobTemplate({
              organization: organization.id,
              inventory: inventory.id,
            }).then((wfjt) => {
              workflowJobTemplate = wfjt;

              cy.createAwxWorkflowVisualizerProjectNode(workflowJobTemplate, project).then(
                (projectNode) => {
                  cy.createAwxWorkflowVisualizerJobTemplateNode(
                    workflowJobTemplate,
                    jobTemplate
                  ).then((jobTemplateNode) => {
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
                            cy.createWorkflowJTFailureNodeLink(inventorySourceNode, managementNode);
                          }
                        );
                      });
                    });
                  });
                }
              );
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
    });

    it('can save and launch a workflow job template from list view', function () {
      cy.navigateTo('awx', 'templates');
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
      ).as('launchWJT-WithNodes');
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

    it('can save and launch a workflow job template from details view', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [workflowJobTemplate?.name]);
      cy.clickTableRowLink('name', workflowJobTemplate?.name, { disableFilter: true });
      cy.verifyPageTitle(workflowJobTemplate.name);
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
      ).as('launchWJT-WithNodes');
      cy.get('button[data-cy="launch-template"]').click();
      cy.wait('@launchWJT-WithNodes')
        .its('response.body.id')
        .then((jobId: string) => {
          /*there is a known React error, `create request error` happening due the output tab work in progress,but the test executes fine since there is no ui interaction here*/
          cy.waitForWorkflowJobStatus(jobId);
        });
    });
  });
});
