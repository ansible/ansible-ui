import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { NotificationTemplate } from '../../../../frontend/awx/interfaces/NotificationTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';
import { randomE2Ename } from '../../../support/utils';

describe('Job Templates Tests', function () {
  let awxOrganization: Organization;
  let awxProject: Project;
  let awxInventory: Inventory;
  let jobTemplate: JobTemplate;

  before(function () {
    cy.createAwxOrganization().then((thisAwxOrg) => {
      awxOrganization = thisAwxOrg;
      cy.createAwxProject(awxOrganization).then((proj) => {
        awxProject = proj;
      });
      cy.createAwxInventory(awxOrganization).then((inv) => {
        awxInventory = inv;
      });
    });
  });

  after(function () {
    awxInventory && cy.deleteAwxInventory(awxInventory, { failOnStatusCode: false });
    awxProject && cy.deleteAwxProject(awxProject, { failOnStatusCode: false });
    awxOrganization && cy.deleteAwxOrganization(awxOrganization, { failOnStatusCode: false });
  });

  afterEach(function () {
    jobTemplate && cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
  });

  describe('Job Templates Tests: Create', function () {
    let machineCredential: Credential;

    afterEach(function () {
      machineCredential && cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
    });

    it('can create a job template and assert the information showing on the details page', function () {
      const jtName = 'E2E-JT ' + randomString(4);
      const jtDescription = 'This is a JT description';

      cy.intercept('POST', awxAPI`/job_templates`).as('createJT');
      cy.navigateTo('awx', 'templates');
      cy.getBy('[data-cy="create-template"]').click();
      cy.clickLink(/^Create job template$/);
      cy.getBy('[data-cy="name"]').type(jtName);
      cy.getBy('[data-cy="description"]').type(jtDescription);
      cy.selectDropdownOptionByResourceName('inventory', awxInventory.name);
      cy.selectDropdownOptionByResourceName('project', awxProject.name);
      cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
      cy.getBy('[data-cy="Submit"]').click();
      cy.wait('@createJT')
        .its('response.body')
        .then((result: JobTemplate) => {
          jobTemplate = result;
        });

      cy.verifyPageTitle(jtName);
      cy.hasDetail(/^Name$/, jtName);
      cy.hasDetail(/^Description$/, jtDescription);
      cy.hasDetail(/^Job type$/, 'run');
      cy.hasDetail(/^Organization$/, awxOrganization.name);
      cy.hasDetail(/^Inventory$/, awxInventory.name);
      cy.hasDetail(/^Project$/, awxProject.name);
      cy.hasDetail(/^Playbook$/, 'hello_world.yml');
    });

    it('can create a job template with prompted fields, launch from the list view, and complete launch via wizard', function () {
      const jtName = 'E2E-POLJT ' + randomString(4);

      cy.createAWXCredential({
        kind: 'machine',
        organization: awxOrganization.id,
        credential_type: 1,
      }).then((cred) => {
        machineCredential = cred;

        cy.intercept('POST', awxAPI`/job_templates`).as('createPOLJT');
        cy.navigateTo('awx', 'templates');
        cy.getBy('[data-cy="create-template"]').click();
        cy.clickLink(/^Create job template$/);
        cy.getBy('[data-cy="name"]').type(jtName);
        cy.getBy('[data-cy="description"]').type('This is a JT with POL wizard description');
        cy.selectPromptOnLaunch('inventory');
        cy.selectDropdownOptionByResourceName('project', `${awxProject.name}`);
        cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
        cy.selectPromptOnLaunch('execution_environment');
        cy.selectPromptOnLaunch('credential');
        cy.selectPromptOnLaunch('instance_groups');
        cy.getBy('[data-cy="Submit"]').click();
        cy.wait('@createPOLJT')
          .its('response.body')
          .then((jt: JobTemplate) => {
            jobTemplate = jt;
            cy.verifyPageTitle(jtName);
            cy.navigateTo('awx', 'templates');
            cy.filterTableByMultiSelect('name', [jtName]);
            cy.getTableRow('name', jtName, { disableFilter: true }).should('be.visible');
            cy.clickTableRowAction('name', jtName, 'launch-template', { disableFilter: true });
            cy.selectDropdownOptionByResourceName('inventory', awxInventory.name);
            cy.multiSelectByDataCy('credential', [machineCredential.name]);
            // close credential select dropdown
            cy.get('body').click(0, 0);
            cy.singleSelectBy(
              '[data-cy="executionEnvironment"]',
              'Control Plane Execution Environment'
            );
            cy.multiSelectByDataCy('instance-group-select-form-group', ['default']);
            cy.clickButton(/^Next/);
            cy.intercept('POST', awxAPI`/job_templates/${jobTemplate.id.toString()}/launch/`).as(
              'postLaunch'
            );
            cy.clickButton(/^Finish/);
            cy.wait('@postLaunch')
              .its('response.body.id')
              .then((jobId: string) => {
                cy.log(jobId);
                cy.waitForTemplateStatus(jobId);
              });
            cy.getByDataCy('job-status-label').should('not.contain', 'Running');
          });
      });
    });

    it('can launch a job template from the details page launch button using the prompt on launch', function () {
      const jtName = 'E2E-POLJT ' + randomString(4);

      cy.createAWXCredential({
        kind: 'machine',
        organization: awxOrganization.id,
        credential_type: 1,
      }).then((cred) => {
        machineCredential = cred;
        cy.intercept('POST', awxAPI`/job_templates`).as('createPOLJT');
        cy.navigateTo('awx', 'templates');
        cy.getBy('[data-cy="create-template"]').click();
        cy.clickLink(/^Create job template$/);
        cy.getBy('[data-cy="name"]').type(jtName);
        cy.getBy('[data-cy="description"]').type('This is a JT with POL wizard description');
        cy.selectPromptOnLaunch('inventory');
        cy.selectDropdownOptionByResourceName('project', awxProject.name);
        cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
        cy.selectPromptOnLaunch('execution_environment');
        cy.selectPromptOnLaunch('credential');
        cy.selectPromptOnLaunch('instance_groups');
        cy.getBy('[data-cy="Submit"]').click();
        cy.wait('@createPOLJT')
          .its('response.body')
          .then((jt: JobTemplate) => {
            jobTemplate = jt;
            cy.verifyPageTitle(jtName);
            cy.clickButton(/^Launch template$/);
            cy.selectDropdownOptionByResourceName('inventory', awxInventory.name);
            cy.multiSelectByDataCy('credential', [machineCredential.name]);
            // close credential select dropdown
            cy.get('body').click(0, 0);
            cy.singleSelectBy(
              '[data-cy="executionEnvironment"]',
              'Control Plane Execution Environment'
            );
            cy.multiSelectByDataCy('instance-group-select-form-group', ['default']);
            cy.clickButton(/^Next/);
            cy.intercept('POST', awxAPI`/job_templates/${jobTemplate.id.toString()}/launch/`).as(
              'postLaunch'
            );
            cy.clickButton(/^Finish/);
            cy.wait('@postLaunch')
              .its('response.body.id')
              .then((jobId: string) => {
                cy.waitForTemplateStatus(jobId);
              });
            cy.getByDataCy('job-status-label').should('not.contain', 'Running');
          });
      });
    });
  });

  describe('Job Templates Tests: Edit', function () {
    let inventoryToAssign: Inventory;
    let inventoryToDelete: Inventory;
    let jobTemplateToEdit: JobTemplate;
    let githubCredential: Credential;

    beforeEach(function () {
      cy.createAwxJobTemplate({
        organization: awxOrganization.id,
        project: awxProject.id,
        inventory: awxInventory.id,
      }).then((jt) => {
        jobTemplate = jt;
      });
    });

    afterEach(function () {
      jobTemplateToEdit && cy.deleteAwxJobTemplate(jobTemplateToEdit, { failOnStatusCode: false });
      githubCredential && cy.deleteAwxCredential(githubCredential, { failOnStatusCode: false });
      inventoryToAssign && cy.deleteAwxInventory(inventoryToAssign, { failOnStatusCode: false });
      inventoryToDelete && cy.deleteAwxInventory(inventoryToDelete, { failOnStatusCode: false });
    });

    it('can edit a job template using the kebab menu of the template list page', function () {
      const newName = (jobTemplate.name ?? '') + ' edited';
      const newDescription = 'this is a new description after editing';

      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.getTableRow('name', jobTemplate.name, { disableFilter: true }).should('be.visible');
      cy.selectTableRow(jobTemplate.name, false);
      cy.getBy('[data-cy="edit-template"]').click();
      cy.verifyPageTitle(`Edit ${jobTemplate.name}`);
      cy.getBy('[data-cy="name"]').clear().type(newName);
      cy.getBy('[data-cy="description"]').type(newDescription);
      cy.intercept('PATCH', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as('editJT');
      cy.clickButton(/^Save job template$/);
      cy.wait('@editJT')
        .its('response.body.name')
        .then((name: string) => {
          expect(newName).to.be.equal(name);
        });

      cy.verifyPageTitle(newName);
      cy.hasDetail(/^Name$/, newName);
      cy.hasDetail(/^Description$/, newDescription);
    });

    it('can edit a job template using the edit template button on details page', function () {
      const newName = (jobTemplate.name ?? '') + ' edited';
      const newDescription = 'this is a new description after editing';

      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, { disableFilter: true });
      cy.verifyPageTitle(jobTemplate.name);
      cy.clickLink(/^Edit template$/);
      cy.verifyPageTitle(`Edit ${jobTemplate.name}`);
      cy.getBy('[data-cy="name"]').clear().type(newName);
      cy.getBy('[data-cy="description"]').type(newDescription);
      cy.intercept('PATCH', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as('editJT');
      cy.clickButton(/^Save job template$/);
      cy.wait('@editJT')
        .its('response.body')
        .then((response: JobTemplate) => {
          expect(response.name).to.eql(newName);
        });

      cy.verifyPageTitle(newName);
      cy.hasDetail(/^Name$/, newName);
      cy.hasDetail(/^Description$/, newDescription);
    });

    it('can assign a new inventory to a job template if the originally assigned inventory was deleted', function () {
      cy.createAwxInventory(awxOrganization).then((inv1) => {
        inventoryToAssign = inv1;
        cy.createAwxInventory(awxOrganization).then((inv2) => {
          inventoryToDelete = inv2;

          cy.createAwxJobTemplate({
            organization: awxOrganization.id,
            project: awxProject.id,
            inventory: inventoryToDelete.id,
          }).then((jt) => {
            jobTemplateToEdit = jt;

            cy.navigateTo('awx', 'templates');
            cy.filterTableByMultiSelect('name', [jobTemplateToEdit.name]);
            cy.clickTableRowLink('name', jobTemplateToEdit.name, {
              disableFilter: true,
            });
            // verify job template inventory detail
            cy.verifyPageTitle(jobTemplateToEdit.name);
            cy.getByDataCy('inventory')
              .contains(jobTemplateToEdit.summary_fields.inventory.name)
              .click();
            // delete job template inventory
            cy.clickKebabAction('actions-dropdown', 'delete-inventory');
            cy.clickModalConfirmCheckbox();
            cy.intercept('DELETE', awxAPI`/inventories/${inventoryToDelete.id.toString()}/`).as(
              'deleteInventory'
            );
            cy.clickModalButton('Delete inventory');
            cy.wait('@deleteInventory');
            cy.navigateTo('awx', 'templates');
            cy.filterTableByMultiSelect('name', [jobTemplateToEdit.name]);
            cy.clickTableRowLink('name', jobTemplateToEdit.name, {
              disableFilter: true,
            });
            // verify job template inventory deleted detail
            cy.verifyPageTitle(jobTemplateToEdit.name);
            cy.hasDetail(/^Inventory$/, 'Deleted');
            // edit job template inventory
            cy.clickLink('Edit template');
            cy.selectDropdownOptionByResourceName('inventory', inventoryToAssign.name);
            cy.intercept('PATCH', awxAPI`/job_templates/${jobTemplateToEdit.id.toString()}/`).as(
              'saveJT'
            );
            cy.clickButton('Save job template');
            cy.wait('@saveJT');
            // verify job template edited inventory detail
            cy.verifyPageTitle(jobTemplateToEdit.name);
            cy.hasDetail(/^Name$/, jobTemplateToEdit.name);
            cy.hasDetail(/^Inventory$/, inventoryToAssign.name);
          });
        });
      });
    });

    it('can edit a job template to enable provisioning callback and enable webhook, then edit again to disable those options', function () {
      const jtURL = document.location.origin + awxAPI`/job_templates/${jobTemplate.id.toString()}`;
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, { disableFilter: true });
      cy.get('[data-cy="enabled-options"]').should('not.exist');
      cy.clickLink('Edit template');
      cy.getByDataCy('isWebhookEnabled').should('not.be.checked');
      cy.getByDataCy('isProvisioningCallbackEnabled').should('not.be.checked');
      // Enable webhook
      cy.getByDataCy('isWebhookEnabled').click();
      cy.getByDataCy('isWebhookEnabled').should('be.checked');
      cy.get('[data-cy="related-webhook-receiver"]').should('have.value', '');
      cy.selectDropdownOptionByResourceName('webhook-service', 'GitLab');
      cy.getByDataCy('related-webhook-receiver').should('have.attr', 'readonly');
      cy.getByDataCy('related-webhook-receiver').should('have.value', `${jtURL}/gitlab/`);
      cy.selectDropdownOptionByResourceName('webhook-service', 'GitHub');
      cy.getByDataCy('related-webhook-receiver').should('have.value', `${jtURL}/github/`);
      cy.getByDataCy('related-webhook-receiver').should('have.attr', 'readonly');
      cy.getByDataCy('webhook-key').should(
        'have.value',
        'A NEW WEBHOOK KEY WILL BE GENERATED ON SAVE.'
      );
      cy.intercept('PATCH', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as('editJT');
      cy.clickButton('Save job template');
      cy.wait('@editJT');
      cy.getByDataCy('enabled-options').contains('Webhooks');
      cy.clickLink('Edit template');
      cy.getByDataCy('isWebhookEnabled').should('be.checked');
      cy.getByDataCy('webhook-service-form-group').contains('GitHub');
      cy.getByDataCy('related-webhook-receiver').should('have.value', `${jtURL}/github/`);
      cy.getByDataCy('webhook-key').should(
        'not.have.value',
        'A NEW WEBHOOK KEY WILL BE GENERATED ON SAVE.'
      );
      cy.getByDataCy('isWebhookEnabled').click();
      cy.getByDataCy('isWebhookEnabled').should('not.be.checked');
      cy.contains('Webhook details').should('not.exist');
      cy.getByDataCy('isWebhookEnabled').click();
      cy.getByDataCy('isWebhookEnabled').should('be.checked');
      cy.getByDataCy('webhook-service-form-group').contains('GitHub');
      cy.getByDataCy('related-webhook-receiver').should('have.value', `${jtURL}/github/`);
      // Enable provisioning callback
      cy.getByDataCy('isProvisioningCallbackEnabled').click();
      cy.contains('Provisioning callback details');
      cy.getByDataCy('host-config-key').type('foobar');
      cy.clickButton('Save job template');
      cy.getByDataCy('enabled-options').contains('Provisioning Callbacks');
      cy.clickLink('Edit template');
      cy.getByDataCy('isProvisioningCallbackEnabled').should('be.checked');
      cy.get('[data-cy="host-config-key"]').should('have.value', 'foobar');
      cy.get('[data-cy="related-callback"]').should('have.attr', 'disabled');
      cy.get('[data-cy="related-callback"]').should('have.value', `${jtURL}/callback/`);
      cy.getByDataCy('isProvisioningCallbackEnabled').click();
      cy.getByDataCy('isProvisioningCallbackEnabled').should('not.be.checked');
      cy.clickButton('Save job template');
      cy.getByDataCy('enabled-options').contains('Provisioning Callbacks').should('not.exist');
    });

    it('can edit a job template to enable webhook, regenerate webhook key and set webhook credentials', function () {
      cy.createAWXCredential({
        kind: 'github_token',
        organization: awxOrganization.id,
        credential_type: 11,
      }).then((ghCred) => {
        githubCredential = ghCred;

        cy.navigateTo('awx', 'templates');
        cy.verifyPageTitle('Templates');
        cy.filterTableByMultiSelect('name', [jobTemplate.name]);
        cy.clickTableRowAction('name', jobTemplate.name, 'edit-template', {
          inKebab: false,
          disableFilter: true,
        });
        cy.getByDataCy('isWebhookEnabled').click();
        cy.selectDropdownOptionByResourceName('webhook-service', 'GitHub');
        cy.singleSelectByDataCy('webhook_credential', ghCred.name);
        cy.clickButton('Save job template');
        cy.contains('Webhook credential');
        cy.getByDataCy('webhook-credential').contains(ghCred.name);
        cy.intercept('GET', awxAPI`/job_templates/${jobTemplate.id.toString()}/webhook_key/`).as(
          'getWebhookKey'
        );
        cy.clickLink('Edit template');
        cy.wait('@getWebhookKey')
          .its('response.body.webhook_key')
          .then((webhook_key: string) => {
            let webhookKey: string = webhook_key;

            cy.getByDataCy('webhook_credential').should('have.text', ghCred.name);
            cy.getByDataCy('webhook-service-form-group').contains('GitHub');
            cy.getByDataCy('webhook-key').should('have.value', webhookKey);
            cy.intercept(
              'POST',
              awxAPI`/job_templates/${jobTemplate.id.toString()}/webhook_key/`
            ).as('generateWebhookKey');
            cy.getByDataCy('webhook-key-form-group').within(() => {
              cy.get('button').click();
            });
            cy.wait('@generateWebhookKey')
              .its('response.body.webhook_key')
              .then((webhook_key: string) => {
                webhookKey = webhook_key;
                cy.intercept('PATCH', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as(
                  'saveJT'
                );
                cy.clickButton('Save job template');
                cy.wait('@saveJT');
                cy.getByDataCy('webhook-service').contains('GitHub');
                cy.clickLink('Edit template');
                cy.getByDataCy('webhook-key').should('have.value', webhookKey);
              });
          });
      });
    });
  });

  describe('Job Templates Tests: Copy', function () {
    let copiedJobTemplate: JobTemplate;

    beforeEach(function () {
      cy.createAwxJobTemplate({
        organization: awxOrganization.id,
        project: awxProject.id,
        inventory: awxInventory.id,
      }).then((jt) => {
        jobTemplate = jt;
      });
    });

    afterEach(function () {
      copiedJobTemplate && cy.deleteAwxJobTemplate(copiedJobTemplate, { failOnStatusCode: false });
    });

    it('can copy an existing job template from the list', function () {
      cy.navigateTo('awx', 'templates');
      cy.filterTableBySingleSelect('name', jobTemplate.name);
      cy.intercept('POST', awxAPI`/job_templates/${jobTemplate.id.toString()}/copy/`).as(
        'copyTemplate'
      );
      cy.clickTableRowAction('name', jobTemplate.name, 'copy-template', {
        inKebab: true,
        disableFilter: true,
      });
      cy.wait('@copyTemplate')
        .its('response.body')
        .then((jt: JobTemplate) => {
          copiedJobTemplate = jt;
          cy.clearAllFilters();
          cy.filterTableBySingleSelect('name', copiedJobTemplate.name);
          cy.clickTableRowLink('name', copiedJobTemplate.name, {
            disableFilter: true,
          });
          cy.verifyPageTitle(copiedJobTemplate.name);
        });
    });

    it('can copy an existing job template from the details page', function () {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(jobTemplate.name);
      cy.intercept('POST', awxAPI`/job_templates/${jobTemplate.id.toString()}/copy/`).as(
        'copyTemplate'
      );
      cy.clickKebabAction('actions-dropdown', 'copy-template');
      cy.getByDataCy('alert-toaster').contains(`${jobTemplate.name} copied.`);
      cy.wait('@copyTemplate')
        .its('response.body')
        .then((jt: JobTemplate) => {
          copiedJobTemplate = jt;
          cy.navigateTo('awx', 'templates');
          cy.filterTableByMultiSelect('name', [copiedJobTemplate.name]);
          cy.clickTableRowLink('name', copiedJobTemplate.name, {
            disableFilter: true,
          });
          cy.verifyPageTitle(copiedJobTemplate.name);
        });
    });
  });

  describe('Job Templates Tests: Delete', function () {
    let jobTemplate2: JobTemplate;

    beforeEach(function () {
      cy.createAwxJobTemplate({
        organization: awxOrganization.id,
        project: awxProject.id,
        inventory: awxInventory.id,
      }).then((jt) => {
        jobTemplate = jt;
      });
    });

    afterEach(function () {
      jobTemplate2 && cy.deleteAwxJobTemplate(jobTemplate2, { failOnStatusCode: false });
    });

    it('can delete a job template from the list line item', function () {
      cy.navigateTo('awx', 'templates');
      cy.filterTableBySingleSelect('name', jobTemplate.name);
      cy.clickTableRowAction('name', jobTemplate.name, 'delete-template', {
        inKebab: true,
        disableFilter: true,
      });
      cy.clickModalConfirmCheckbox();
      cy.intercept('DELETE', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as('deleteJT');
      cy.clickModalButton('Delete template');
      cy.wait('@deleteJT')
        .its('response')
        .then((response) => {
          expect(response?.statusCode).to.eql(204);
        });
      cy.getModal().within(() => {
        cy.contains(jobTemplate.name);
        cy.contains('Success');
        cy.clickButton('Close');
      });
    });

    it('can delete a job template from the details page', function () {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, { disableFilter: true });
      cy.verifyPageTitle(jobTemplate.name);
      cy.intercept('OPTIONS', awxAPI`/unified_job_templates/`).as('options');
      cy.intercept('DELETE', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as(
        'deleteJobTemplate'
      );
      cy.selectDetailsPageKebabAction('delete-template');
      cy.wait('@options');
      cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
        expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
      });
      cy.verifyPageTitle('Templates');
    });

    it('can bulk delete job templates from the list page', function () {
      cy.createAwxJobTemplate({
        organization: awxOrganization.id,
        project: awxProject.id,
        inventory: awxInventory.id,
      }).then((jt) => {
        jobTemplate2 = jt;
        cy.navigateTo('awx', 'templates');
        cy.filterTableByMultiSelect('name', [jobTemplate.name, jobTemplate2.name]);
        cy.selectTableRow(jobTemplate.name, false);
        cy.selectTableRow(jobTemplate2.name, false);
        cy.clickToolbarKebabAction('delete-selected-templates');
        cy.intercept('DELETE', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as(
          'deleteJobTemplate1'
        );
        cy.intercept('DELETE', awxAPI`/job_templates/${jobTemplate2.id.toString()}/`).as(
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
        cy.clearAllFilters();
      });
    });
  });

  describe('Notifications Tab for Job Templates', () => {
    let notification: NotificationTemplate;

    function toggleNotificationType(type: 'start' | 'success' | 'failure') {
      const switchType = type === 'start' ? 'Start' : type === 'success' ? 'Success' : 'Failure';
      const apiSuffix = type === 'start' ? 'started' : type === 'success' ? 'success' : 'error';

      cy.filterTableByTextFilter('name', notification.name);
      cy.getByDataCy(`row-id-${notification.id}`).within(() => {
        cy.getByDataCy('name-column-cell').contains(notification.name);
        cy.getByDataCy('type-column-cell').contains('Email');
        cy.getByDataCy('toggle-switch').contains('Start');
        cy.getByDataCy('toggle-switch').contains('Success');
        cy.getByDataCy('toggle-switch').contains('Failure');
        cy.intercept(
          'POST',
          awxAPI`/job_templates/${jobTemplate.id.toString()}/notification_templates_${apiSuffix}/`
        ).as('toggleStart');
        cy.getByDataCy('toggle-switch').contains(switchType).click();
        cy.wait('@toggleStart');
        cy.getByDataCy('toggle-switch')
          .contains(switchType)
          .within(() => {
            cy.get(`[aria-label="Click to disable ${type}"]`);
          });
        cy.intercept(
          'POST',
          awxAPI`/job_templates/${jobTemplate.id.toString()}/notification_templates_${apiSuffix}/`
        ).as('toggleStart');
        cy.getByDataCy('toggle-switch').contains(switchType).click();
        cy.wait('@toggleStart');
        cy.getByDataCy('toggle-switch')
          .contains(switchType)
          .within(() => {
            cy.get(`[aria-label="Click to enable ${type}"]`);
          });
      });
    }

    beforeEach(function () {
      cy.createAwxJobTemplate({
        organization: awxOrganization.id,
        project: awxProject.id,
        inventory: awxInventory.id,
      }).then((jt) => {
        jobTemplate = jt;

        cy.createNotificationTemplate(randomE2Ename(), awxOrganization).then((n) => {
          notification = n;
        });
      });
    });

    afterEach(function () {
      cy.deleteNotificationTemplate(notification, { failOnStatusCode: false });
    });

    it('can navigate to the Job Templates -> Notifications list and then to the details page of the Notification', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(jobTemplate.name);
      cy.clickTab('Notifications', true);
      cy.filterTableByTextFilter('name', notification.name);
      cy.getByDataCy('name-column-cell').contains(notification.name).click();
      cy.url().should('contain', `/administration/notifiers/${notification.id}/details`);
      cy.getByDataCy('name').contains(notification.name);
    });

    it('can toggle the Job Templates -> Notification on and off for job start', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(jobTemplate.name);
      cy.clickTab('Notifications', true);
      toggleNotificationType('start');
    });

    it('can toggle the Job Templates -> Notification on and off for job success', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(jobTemplate.name);
      cy.clickTab('Notifications', true);
      toggleNotificationType('success');
    });

    it('can toggle the Job Templates -> Notification on and off for job failure', () => {
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, {
        disableFilter: true,
      });
      cy.verifyPageTitle(jobTemplate.name);
      cy.clickTab('Notifications', true);
      toggleNotificationType('failure');
    });
  });
  describe.skip('Job Template Form:Validation', () => {
    it('Cannot create a job template with more than 1 machine credential', function () {
      let machineCredential1: Credential;
      let machineCredential2: Credential;
      /**
       * This test is meant to prevent regression.  This particular error comes from the api as a generic error and
       * we need it to be a field error.  This test ensures that this error is placed on the credential field
       * instead of a generic form error.
       */
      cy.createAWXCredential({
        name: 'E2E' + randomE2Ename(),
        kind: 'machine',
        organization: awxOrganization.id,
        credential_type: 1,
      }).then((cred) => {
        machineCredential2 = cred;
        cy.createAWXCredential({
          name: 'E2E' + randomE2Ename(),
          kind: 'machine',
          organization: awxOrganization.id,
          credential_type: 1,
        }).then((cred) => {
          machineCredential1 = cred;

          cy.intercept('POST', awxAPI`/job_templates`).as('createPOLJT');
          const jtName = 'E2E-POLJT ' + randomString(4);
          cy.navigateTo('awx', 'templates');
          cy.getBy('[data-cy="create-template"]').click();
          cy.clickLink(/^Create job template$/);
          cy.getBy('[data-cy="name"]').type(jtName);
          cy.selectPromptOnLaunch('inventory');
          cy.selectDropdownOptionByResourceName('project', `${awxProject.name}`);
          cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
          cy.multiSelectByDataCy('credential', [machineCredential1.name, machineCredential2.name]);
          cy.getBy('[data-cy="Submit"]').click();
          cy.get('[data-cy="credential-form-group"]').within(() => {
            cy.get('span.pf-v5-c-helper-text__item-text').should(
              'have.text',
              'Cannot assign multiple credentials of the same type. Duplicated credential types are: Machine'
            );
          });
        });
        cy.deleteAwxCredential(machineCredential1, { failOnStatusCode: false });
        cy.deleteAwxCredential(machineCredential2, { failOnStatusCode: false });
      });
    });

    it('Cannot create a job template with more than credential per vault_id', function () {
      let vaultCredential1: Credential;
      let vaultCredential2: Credential;
      /**
       * This test is meant to prevent regression.  This particular error comes from the api as a generic error and
       * we need it to be a field error.  This test ensures that this error is placed on the credential field
       * instead of a generic form error.
       */

      cy.createAWXCredential({
        name: 'E2E' + randomE2Ename(),
        kind: 'vault',
        organization: awxOrganization.id,
        credential_type: 3,
        inputs: {
          vault_id: 1,
          vault_password: 'rd',
        },
      }).then((cred) => {
        vaultCredential1 = cred;
        cy.createAWXCredential({
          name: 'E2E' + randomE2Ename(),
          kind: 'vault',
          organization: awxOrganization.id,
          credential_type: 3,
          inputs: {
            vault_id: 1,
            vault_password: 'rd',
          },
        }).then((credential) => {
          vaultCredential2 = credential;

          cy.intercept('POST', awxAPI`/job_templates`).as('createPOLJT');
          const jtName = 'E2E-POLJT ' + randomString(4);
          cy.navigateTo('awx', 'templates');
          cy.getBy('[data-cy="create-template"]').click();
          cy.clickLink(/^Create job template$/);
          cy.getBy('[data-cy="name"]').type(jtName);
          cy.selectPromptOnLaunch('inventory');
          cy.selectDropdownOptionByResourceName('project', `${awxProject.name}`);
          cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
          cy.multiSelectByDataCy('credential', [vaultCredential1.name, vaultCredential2.name]);
          cy.getBy('[data-cy="Submit"]').click();
          cy.get('[data-cy="credential-form-group"]').within(() => {
            cy.get('span.pf-v5-c-helper-text__item-text').should(
              'have.text',
              'Cannot assign multiple vault credentials of the same vault id.'
            );
          });
        });
        cy.deleteAwxCredential(vaultCredential1);
        cy.deleteAwxCredential(vaultCredential2);
      });
    });
  });
});
