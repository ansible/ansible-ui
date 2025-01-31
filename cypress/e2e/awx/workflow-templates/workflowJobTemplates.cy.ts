import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { JobTemplate } from '@ansible/awx-ui/interfaces/JobTemplate';
import { Label } from '@ansible/awx-ui/interfaces/Label';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { WorkflowJobTemplate } from '@ansible/awx-ui/interfaces/WorkflowJobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';

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
          cy.filterTableBySingleSelect('name', newWfjt.name);
          cy.clickTableRowAction('name', newWfjt.name, 'edit-template', {
            disableFilter: true,
          });
          cy.get('[data-cy="description"]').type('this is a new description');
          cy.singleSelectBy('[data-cy="organization"]', organization.name);
          const endOfInvName = inventory.name.split(' ').slice(-1).toString();
          cy.get('input[id="inventory-select-typeahead"]').click();
          cy.get('[data-cy="inventory-form-group"]').within(() => {
            cy.get('[data-ouia-component-id="menu-select"] input').type(`${endOfInvName}`, {
              delay: 200,
            });
          });
          cy.get('li').contains(`${inventory.name}`).click();
          cy.get('[data-cy="limit"]').type('mock-limit');
          cy.get('[data-cy="scm-branch"]').type('mock-scm-branch');
          cy.get('[data-cy="labels-typeahead-input"]').type(label.name.toString());
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
      const endOfInvName = inventory.name.split(' ').slice(-1).toString();
      cy.get('input[id="inventory-select-typeahead"]').click();
      cy.get('[data-cy="inventory-form-group"]').within(() => {
        cy.get('[data-ouia-component-id="menu-select"] input').type(`${endOfInvName}`, {
          delay: 200,
        });
      });
      cy.get('[data-cy="limit"]').type('mock-limit');
      cy.get('[data-cy="scm-branch"]').type('mock-scm-branch');
      cy.get('[data-cy="labels-typeahead-input"]').type(label.name.toString());
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
      cy.filterTableBySingleSelect('name', workflowJobTemplate?.name);
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
        cy.filterTableBySingleSelect('name', workflowJobTemplate?.name);
        expect(workflowJobTemplate.webhook_service).equals('');
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
        cy.filterTableBySingleSelect('name', workflowJobTemplate?.name);
        expect(workflowJobTemplate.webhook_service).equals('');
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
        cy.deleteAwxCredential(tokenCredential, { failOnStatusCode: false });
      });
    });

    it('can edit a workflow job template from the list row', () => {
      const newName = (workflowJobTemplate.name ?? '') + ' edited';
      cy.navigateTo('awx', 'templates');
      cy.filterTableBySearch(workflowJobTemplate?.name);
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
      cy.filterTableBySingleSelect('name', workflowJobTemplate.name);
      cy.contains(workflowJobTemplate.name).should('be.visible');
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/copy/`
      ).as('copiedWFJT');
      cy.get('table').find('tr', { timeout: 10000 }).should('have.length', 2);
      cy.clickTableRowAction('name', workflowJobTemplate?.name, 'duplicate-template', {
        inKebab: true,
        disableFilter: true,
      });
      cy.wait('@copiedWFJT')
        .its('response.body')
        .then((response: WorkflowJobTemplate) => {
          cy.filterTableBySingleSelect('name', response.name);
          cy.contains(response.name).should('be.visible');
          cy.clickTableRowAction('name', `${response.name}`, 'delete-template', {
            inKebab: true,
            disableFilter: true,
          });
          cy.getModal().within(() => {
            cy.get('#confirm').click();
            cy.get('[data-ouia-component-id="submit"]').click();
          });
        });
    });

    it('can copy an existing workflow job template from the details page', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableBySearch(workflowJobTemplate.name);
      cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/copy/`
      ).as('copiedWFJT');
      cy.getBy(`[data-cy="actions-dropdown"]`).click();
      cy.getBy('[data-cy="duplicate-template"]').click();
      cy.wait('@copiedWFJT')
        .its('response.body')
        .then((response: WorkflowJobTemplate) => {
          cy.navigateTo('awx', 'templates');
          cy.selectTableRow(response.name);
          cy.get('table').find('tr', { timeout: 10000 }).should('have.length', 2);
          cy.clickTableRowAction('name', `${response.name}`, 'delete-template', {
            inKebab: true,
            disableFilter: true,
          });
          cy.getModal().within(() => {
            cy.get('#confirm').click();
            cy.get('[data-ouia-component-id="submit"]').click();
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
        cy.selectTableRow(workflowJobTemplate.name);
        cy.selectTableRow(newWorkflowJobTemplate?.name);
        cy.clickToolbarKebabAction('delete-templates');
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
        cy.clearAllFilters();
      });
    });
  });

  describe('Workflow Job Templates: Delete without using org and inventory', function () {
    let workflowJobTemplate: WorkflowJobTemplate;
    let inventory: Inventory;

    beforeEach(function () {
      cy.createAwxInventory(organization).then((i) => {
        inventory = i;

        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
        }).then((wfjt) => (workflowJobTemplate = wfjt));
      });
    });

    afterEach(() => {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can delete a workflow job template from the details page', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableBySearch(workflowJobTemplate.name);
      cy.clickTableRowLink('name', workflowJobTemplate.name, { disableFilter: true });
      cy.getBy(`[data-cy="actions-dropdown"]`).click();
      cy.getBy('[data-cy="delete-template"]').click();
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
      cy.filterTableBySingleSelect('name', workflowJobTemplate?.name);
      cy.contains(workflowJobTemplate?.name).should('be.visible');
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

              cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate);
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
      cy.filterTableBySearch(workflowJobTemplate.name);
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
      cy.filterTableBySearch(workflowJobTemplate?.name);
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

  describe('Notifications Tab for Workflow Job Templates', () => {
    const wfJobTemplateName = randomE2Ename();
    const inventoryName = randomE2Ename();
    let wfJobTemplate: WorkflowJobTemplate;
    let inventory: Inventory;

    beforeEach(() => {
      cy.createAwxInventory(organization, { name: inventoryName }).then((inv) => {
        inventory = inv;
        cy.createAwxWorkflowJobTemplate({
          organization: organization.id,
          inventory: inventory.id,
          name: wfJobTemplateName,
        }).then((jt) => {
          wfJobTemplate = jt;
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxWorkflowJobTemplate(wfJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can navigate to the Workflow Job Templates -> Notifications list and then to the details page of the Notification', () => {
      const notificationName = randomE2Ename();
      cy.createNotificationTemplate(notificationName, organization).then(() => {
        moveToNotification('templates', wfJobTemplateName, notificationName);
      });
    });

    it('can toggle the Workflow Job Templates -> Notification on and off for job approval', () => {
      testToggle(
        'templates',
        wfJobTemplateName,
        'Click to enable approval',
        'Click to disable approval',
        organization
      );
    });

    it('can toggle the Workflow Job Templates -> Notification on and off for job start', () => {
      testToggle(
        'templates',
        wfJobTemplateName,
        'Click to enable start',
        'Click to disable start',
        organization
      );
    });

    it('can toggle the Workflow Job Templates -> Notification on and off for job success', () => {
      testToggle(
        'templates',
        wfJobTemplateName,
        'Click to enable success',
        'Click to disable success',
        organization
      );
    });

    it('can toggle the Workflow Job Templates -> Notification on and off for job failure', () => {
      testToggle(
        'templates',
        wfJobTemplateName,
        'Click to enable failure',
        'Click to disable failure',
        organization
      );
    });
  });

  function testToggle(
    type: string,
    typeEntityName: string,
    type_enable: string,
    type_disable: string,
    awxOrganization: Organization
  ) {
    const notificationName = randomE2Ename();
    cy.createNotificationTemplate(notificationName, awxOrganization).then(() => {
      moveToNotificationList(type, typeEntityName);
      filterNotification(notificationName);
      cy.get(`[aria-label="${type_enable}"]`).click();
      cy.get(`[aria-label="${type_disable}"]`, { timeout: 5000 }).click();
      cy.get(`[aria-label="${type_enable}"]`, { timeout: 5000 });
    });
  }

  function moveToNotification(type: string, typeEntityName: string, notificationName: string) {
    moveToNotificationList(type, typeEntityName);
    filterNotification(notificationName);
    cy.get('[data-cy="name-column-cell"] a').click();
  }

  function filterNotification(notificationName: string) {
    cy.get(`[aria-label="Type to filter"]`).type(notificationName);
    cy.get(`[aria-label="Simple table"] tbody`).find('tr').should('have.length', 1);
    cy.contains(notificationName).should('be.visible');
  }

  function moveToNotificationList(type: string, typeEntityName: string) {
    cy.navigateTo('awx', type);
    cy.filterTableBySingleSelect('name', typeEntityName);
    cy.contains(typeEntityName).should('be.visible');
    cy.get('table').find('tr', { timeout: 10000 }).should('have.length', 2);
    cy.get('[data-cy="name-column-cell"] a').click();
    cy.contains(typeEntityName);
    cy.contains(`a[role="tab"]`, 'Notifications').click();
  }

  describe('Schedules - Create schedule of resource type Workflow job template', () => {
    let organization: Organization;
    let inventory: Inventory;
    let workflowTemplate: WorkflowJobTemplate;

    beforeEach(() => {
      cy.createAwxOrganization().then((o) => {
        organization = o;
        cy.createAwxInventory(organization).then((i) => {
          inventory = i;
          cy.createAwxWorkflowJobTemplate({
            name: 'E2E Workflow Job Template ' + randomString(4),
            organization: organization.id,
            inventory: inventory.id,
          }).then((wfjt) => {
            workflowTemplate = wfjt;
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxWorkflowJobTemplate(workflowTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can create a simple schedule of resource type Workflow job template, then delete the schedule', () => {
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      const scheduleName = 'E2E Simple Schedule WFJT' + randomString(4);
      cy.getByDataCy('create-schedule').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Workflow job template');
      const templateID = workflowTemplate.name
        .split(' ')
        .map((i) => i.toLowerCase())
        .join('-');
      cy.getBy('button[id="workflow-job-template-select"]').click();
      cy.get('div#workflow-job-template-select-select').within(() => {
        cy.get("input[aria-label='Search input']").type(`${workflowTemplate.name}`);
        cy.get(`button#${templateID}`).click();
      });
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.singleSelectByDataCy('timezone', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.getByDataCy('interval').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.getByDataCy('add-rule-button').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.getByDataCy('rrule-column-cell').contains('RRULE:FREQ=HOURLY;INTERVAL=100');
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.get('tr[data-cy="row-id-1"]').should('be.visible');
      cy.clickButton(/^Finish$/);
      cy.verifyPageTitle(`${scheduleName}`);
      cy.navigateTo('awx', 'schedules');
      cy.filterTableBySingleSelect('name', scheduleName);
      cy.get('table').find('tr', { timeout: 10000 }).should('have.length', 2);
      cy.getBy('tbody').within(() => {
        cy.getBy(`[data-cy="actions-dropdown"]`).click();
      });
      cy.getBy('[data-cy="delete-schedule"]').click();
      cy.intercept('DELETE', awxAPI`/schedules/*`).as('deleted');
      cy.getModal().within(() => {
        cy.getBy('input[id="confirm"]').click();
        cy.getBy('[data-ouia-component-id="submit"]').click();
        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response?.statusCode).to.eql(204);
          });
      });
      cy.clickButton('Clear all filters');
      const dataCy = 'name';
      cy.get('#filter').click();
      cy.document().its('body').find('#filter-search').type(dataCy.replaceAll('-', ' '));
      cy.document()
        .its('body')
        .find('#filter-select')
        .within(() => {
          cy.getByDataCy(dataCy).click();
        });
      cy.getBy('#filter-input').click();
      cy.document()
        .its('body')
        .find('.pf-v5-c-menu__content')
        .within(() => {
          cy.getByDataCy('search-input').type(scheduleName);
          cy.contains('No results found');
        });
      cy.deleteAwxWorkflowJobTemplate(workflowTemplate, { failOnStatusCode: false });
    });
  });

  describe('Prompt on Launch', () => {
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
              ask_limit_on_launch: true,
            }).then((wfjt) => {
              workflowJobTemplate = wfjt;
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

    it('Can launch a workflow job template with prompt on launch values.', () => {
      cy.navigateTo('awx', 'templates');
      cy.verifyPageTitle('Templates');
      cy.filterTableBySingleSelect('name', workflowJobTemplate.name);
      cy.getByDataCy('launch-template').click();
      cy.get('[data-cy="limit"]').should('exist').type('localhost');
      cy.clickButton(/^Next/);
      cy.get('[data-cy="limit"]').should('have.text', 'localhost');
      cy.clickButton(/^Finish/);
    });
  });

  describe('Workflow template: Output and Details Screen', () => {
    let workflowJobTemplate: WorkflowJobTemplate;
    let jobTemplate: JobTemplate;
    let inventory: Inventory;
    let project: Project;

    beforeEach(function () {
      cy.createAwxProject(organization).then((p) => {
        project = p;
      });
      cy.createAwxInventory(organization).then((i) => {
        inventory = i;
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
            cy.createAwxWorkflowVisualizerJobTemplateNode(workflowJobTemplate, jobTemplate).then(
              (jobTemplateNode) => {
                cy.createAwxWorkflowVisualizerManagementNode(workflowJobTemplate, 2).then(
                  (managementNode) => {
                    cy.createWorkflowJTFailureNodeLink(jobTemplateNode, managementNode);
                  }
                );
              }
            );
          });
        });
      });
    });

    afterEach(function () {
      cy.deleteAwxWorkflowJobTemplate(workflowJobTemplate, { failOnStatusCode: false });
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can launch a Workflow job, let it finish, and assert expected results on the output screen', () => {
      cy.navigateTo('awx', 'templates');
      cy.verifyPageTitle('Templates');
      cy.filterTableBySingleSelect('name', workflowJobTemplate.name);
      cy.intercept(
        'POST',
        awxAPI`/workflow_job_templates/${workflowJobTemplate.id.toString()}/launch/`
      ).as('postLaunch');
      cy.getByDataCy('launch-template').click();
      cy.wait('@postLaunch')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((wfJob: WorkflowJobTemplate) => {
          cy.waitForWorkflowJobStatus(wfJob.id.toString());
          cy.verifyPageTitle(workflowJobTemplate.name);
          cy.url().then((currentUrl) => {
            expect(currentUrl.includes(`/jobs/workflow/${wfJob.id}/output`)).to.be.true;
          });
          cy.clickTab(/^Details$/, true);
          cy.url().then((currentUrl) => {
            expect(currentUrl.includes(`/jobs/workflow/${wfJob.id}/details`)).to.be.true;
          });
          cy.getByDataCy('name').should('contain', workflowJobTemplate.name);
          cy.getByDataCy('type').should('contain', 'Workflow job');
          cy.getByDataCy('inventory').should('contain', inventory.name);
        });
    });
  });
});
