import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { NotificationTemplate } from '../../../../frontend/awx/interfaces/NotificationTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Job Templates Tests', function () {
  before(function () {
    cy.awxLogin();
  });

  describe('Job Templates Tests: Create', function () {
    let inventory: Inventory;
    let machineCredential: Credential;
    const executionEnvironment = 'Control Plane Execution Environment';
    const instanceGroup = 'default';

    beforeEach(function () {
      cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
        (inv) => {
          inventory = inv;

          cy.createAWXCredential({
            kind: 'machine',
            organization: (this.globalOrganization as Organization).id,
            credential_type: 1,
          }).then((cred) => {
            machineCredential = cred;
          });
        }
      );
    });

    afterEach(function () {
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
    });

    it('can create a job template with all fields without prompt on launch option', function () {
      cy.intercept('POST', awxAPI`/job_templates`).as('createJT');
      const jtName = 'E2E-JT ' + randomString(4);
      cy.navigateTo('awx', 'templates');
      cy.getBy('[data-cy="create-template"]').click();
      cy.clickLink(/^Create job template$/);
      cy.getBy('[data-cy="name"]').type(jtName);
      cy.getBy('[data-cy="description"]').type('This is a JT description');
      cy.selectDropdownOptionByResourceName('inventory', inventory.name);
      cy.selectDropdownOptionByResourceName('project', `${(this.globalProject as Project).name}`);
      cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
      cy.getBy('[data-cy="Submit"]').click();
      cy.wait('@createJT')
        .its('response.body.id')
        .then((id: string) => {
          cy.log(id);
          cy.verifyPageTitle(jtName);
          cy.navigateTo('awx', 'templates');
          cy.filterTableByMultiSelect('name', [jtName]);
          cy.getTableRow('name', jtName, { disableFilter: true }).should('be.visible');
          cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
          cy.clickTableRowAction('name', jtName, 'launch-template', { disableFilter: true });
          cy.wait('@postLaunch')
            .its('response.body.id')
            .then((jobId: string) => {
              cy.waitForTemplateStatus(jobId);
            });
          cy.navigateTo('awx', 'templates');
          cy.filterTableByMultiSelect('name', [jtName]);
          cy.clickTableRowAction('name', jtName, 'delete-template', {
            inKebab: true,
            disableFilter: true,
          });
          cy.intercept('DELETE', awxAPI`/job_templates/${id}/`).as('deleteJobTemplate');
          cy.clickModalConfirmCheckbox();
          cy.getBy('[data-ouia-component-id="submit"]').click();
          cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
            expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
          });
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clearAllFilters();
        });
    });

    it.skip('can create a job template that inherits the execution environment from the project', function () {
      //This test cannot be written until https://issues.redhat.com/browse/AAP-23776 is fixed
      //Create an EE in the beforeEach hook
      //Create a project in the beforeEach hook, assign the EE to the project
      //Create a JT within this test and assign the project to the JT
      //Assert that the project's EE shows on the job template details page as the EE of the JT
    });

    it('can create a job template using the prompt on launch wizard', function () {
      cy.intercept('POST', awxAPI`/job_templates`).as('createPOLJT');
      const jtName = 'E2E-POLJT ' + randomString(4);
      cy.navigateTo('awx', 'templates');
      cy.getBy('[data-cy="create-template"]').click();
      cy.clickLink(/^Create job template$/);
      cy.getBy('[data-cy="name"]').type(jtName);
      cy.getBy('[data-cy="description"]').type('This is a JT with POL wizard description');
      cy.selectPromptOnLaunch('inventory');
      cy.selectDropdownOptionByResourceName('project', `${(this.globalProject as Project).name}`);
      cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
      cy.selectPromptOnLaunch('execution_environment');
      cy.selectPromptOnLaunch('credential');
      cy.selectPromptOnLaunch('instance_groups');
      cy.getBy('[data-cy="Submit"]').click();
      cy.wait('@createPOLJT')
        .its('response.body.id')
        .then((id: string) => {
          cy.verifyPageTitle(jtName);
          cy.navigateTo('awx', 'templates');
          cy.filterTableByMultiSelect('name', [jtName]);
          cy.getTableRow('name', jtName, { disableFilter: true }).should('be.visible');
          cy.clickTableRowAction('name', jtName, 'launch-template', { disableFilter: true });
          cy.selectDropdownOptionByResourceName('inventory', inventory.name);
          cy.clickButton(/^Next/);
          cy.selectItemFromLookupModal('credential-select', machineCredential.name);
          cy.clickButton(/^Next/);
          cy.get(`[data-cy*="execution-environment-select-form-group"]`).within(() => {
            cy.get('button').eq(1).click();
          });
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.filterTableBySingleSelect('name', executionEnvironment);
            cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
              cy.get('[data-cy="checkbox-column-cell"] input').click();
            });
            cy.clickButton(/^Confirm/);
          });
          cy.clickButton(/^Next/);
          cy.get(`[data-cy*="instance-group-select-form-group"]`).within(() => {
            cy.get('button').eq(1).click();
          });
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.filterTableBySingleSelect('name', instanceGroup);
            cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
              cy.get('[data-cy="checkbox-column-cell"] input').click();
            });
            cy.clickButton(/^Confirm/);
          });
          cy.clickButton(/^Next/);
          cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
          cy.clickButton(/^Finish/);
          cy.wait('@postLaunch')
            .its('response.body.id')
            .then((jobId: string) => {
              cy.log(jobId);
              cy.waitForTemplateStatus(jobId);
            });
          cy.navigateTo('awx', 'templates');
          cy.intercept('DELETE', awxAPI`/job_templates/${id}/`).as('deleteJobTemplate');
          cy.filterTableByMultiSelect('name', [jtName]);
          cy.clickTableRowAction('name', jtName, 'delete-template', {
            inKebab: true,
            disableFilter: true,
          });
          cy.clickModalConfirmCheckbox();
          cy.getBy('[data-ouia-component-id="submit"]').click();
          cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
            expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
          });
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clearAllFilters();
        });
    });

    it('can launch a job template from the details page launch button using the prompt on launch', function () {
      cy.intercept('POST', awxAPI`/job_templates`).as('createPOLJT');
      const jtName = 'E2E-POLJT ' + randomString(4);
      cy.navigateTo('awx', 'templates');
      cy.getBy('[data-cy="create-template"]').click();
      cy.clickLink(/^Create job template$/);
      cy.getBy('[data-cy="name"]').type(jtName);
      cy.getBy('[data-cy="description"]').type('This is a JT with POL wizard description');
      cy.selectPromptOnLaunch('inventory');
      cy.selectDropdownOptionByResourceName('project', `${(this.globalProject as Project).name}`);
      cy.selectDropdownOptionByResourceName('playbook', 'hello_world.yml');
      cy.selectPromptOnLaunch('execution_environment');
      cy.selectPromptOnLaunch('credential');
      cy.selectPromptOnLaunch('instance_groups');
      cy.getBy('[data-cy="Submit"]').click();
      cy.wait('@createPOLJT')
        .its('response.body.id')
        .then((id: string) => {
          cy.verifyPageTitle(jtName);
          cy.clickButton(/^Launch template$/);
          cy.selectDropdownOptionByResourceName('inventory', inventory.name);
          cy.clickButton(/^Next/);
          cy.selectItemFromLookupModal('credential-select', machineCredential.name);
          cy.clickButton(/^Next/);
          cy.get(`[data-cy*="execution-environment-select-form-group"]`).within(() => {
            cy.get('button').eq(1).click();
          });
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.filterTableBySingleSelect('name', executionEnvironment);
            cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
              cy.get('[data-cy="checkbox-column-cell"] input').click();
            });
            cy.clickButton(/^Confirm/);
          });
          cy.clickButton(/^Next/);
          cy.get(`[data-cy*="instance-group-select-form-group"]`).within(() => {
            cy.get('button').eq(1).click();
          });
          cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
            cy.filterTableBySingleSelect('name', instanceGroup);
            cy.get('[data-ouia-component-id="simple-table"] tbody').within(() => {
              cy.get('[data-cy="checkbox-column-cell"] input').click();
            });
            cy.clickButton(/^Confirm/);
          });
          cy.clickButton(/^Next/);
          cy.intercept('POST', `api/v2/job_templates/${id}/launch/`).as('postLaunch');
          cy.clickButton(/^Finish/);
          cy.wait('@postLaunch')
            .its('response.body.id')
            .then((jobId: string) => {
              cy.waitForTemplateStatus(jobId);
            });
          cy.navigateTo('awx', 'templates');
          cy.intercept('DELETE', awxAPI`/job_templates/${id}/`).as('deleteJobTemplate');
          cy.filterTableByMultiSelect('name', [jtName]);
          cy.clickTableRowAction('name', jtName, 'delete-template', {
            inKebab: true,
            disableFilter: true,
          });
          cy.clickModalConfirmCheckbox();
          cy.getBy('[data-ouia-component-id="submit"]').click();
          cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
            expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
          });
          cy.contains(/^Success$/);
          cy.clickButton(/^Close$/);
          cy.clearAllFilters();
        });
    });

    it.skip('can create a job template, select concurrent jobs, and verify that two jobs will run concurrently', function () {
      //Utilize the job template created in the beforeEach hook
      //choose a playbook that will be long running in order to allow the test to assert the two jobs running concurrently
      //Assert that the details page reflects concurrent jobs as an enabled option
      //Have the test click the launch button twice in succession
      //Assert two jobs running at the same time
    });
  });

  describe('Job Templates Tests: Edit', function () {
    let inventory: Inventory;
    let inventory2: Inventory;
    let machineCredential: Credential;
    let githubCredential: Credential;
    let jobTemplate: JobTemplate;

    beforeEach(function () {
      cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
        (inv) => {
          inventory = inv;

          cy.createAWXCredential({
            kind: 'machine',
            organization: (this.globalOrganization as Organization).id,
            credential_type: 1,
          }).then((cred) => {
            machineCredential = cred;

            cy.createAwxJobTemplate({
              organization: (this.globalOrganization as Organization).id,
              project: (this.globalProject as Project).id,
              inventory: inventory.id,
            }).then((jt1) => {
              jobTemplate = jt1;
            });
          });
        }
      );
    });

    afterEach(function () {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      inventory2?.id && cy.deleteAwxInventory(inventory2, { failOnStatusCode: false });
      cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
      githubCredential?.id && cy.deleteAwxCredential(githubCredential, { failOnStatusCode: false });
    });

    it('can edit a job template using the kebab menu of the template list page', function () {
      const newName = (jobTemplate.name ?? '') + ' edited';
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.getTableRow('name', jobTemplate.name, { disableFilter: true }).should('be.visible');
      cy.selectTableRow(jobTemplate.name, false);
      cy.getBy('[data-cy="edit-template"]').click();
      cy.verifyPageTitle('Edit Job Template');
      cy.getBy('[data-cy="name"]').clear().type(newName);
      cy.getBy('[data-cy="description"]').type('this is a new description after editing');
      cy.intercept('PATCH', `api/v2/job_templates/${jobTemplate.id}/`).as('editJT');
      cy.clickButton(/^Save job template$/);
      cy.wait('@editJT')
        .its('response.body.name')
        .then((name: string) => {
          expect(newName).to.be.equal(name);
        });
      cy.verifyPageTitle(newName);
      cy.intercept('DELETE', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as(
        'deleteJobTemplate'
      );
      cy.selectDetailsPageKebabAction('delete-template');
      cy.wait('@deleteJobTemplate').then((deleteJobTemplate) => {
        expect(deleteJobTemplate?.response?.statusCode).to.eql(204);
      });
      cy.verifyPageTitle('Templates');
    });

    it('can assign a new inventory to a job template if the originally assigned inventory was deleted', function () {
      cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
        (inv) => {
          inventory2 = inv;

          cy.visit(`templates/job-template/${jobTemplate.id}/details`);
          cy.contains(jobTemplate.name);
          cy.getByDataCy('inventory').contains(jobTemplate.summary_fields.inventory.name).click();

          cy.clickKebabAction('actions-dropdown', 'delete-inventory');
          cy.clickModalConfirmCheckbox();
          cy.intercept('DELETE', awxAPI`/inventories/${inventory.id.toString()}/`).as(
            'deleteInventory'
          );
          cy.clickModalButton('Delete inventory');
          cy.wait('@deleteInventory');

          cy.visit(`templates/job-template/${jobTemplate.id}/details`);
          cy.contains(jobTemplate.name);
          cy.getByDataCy('inventory').contains('Deleted');
          cy.clickLink('Edit template');

          cy.selectDropdownOptionByResourceName('inventory', inv.name);
          cy.intercept('PATCH', awxAPI`/job_templates/${jobTemplate.id.toString()}/`).as('saveJT');
          cy.clickButton('Save job template');
          cy.wait('@saveJT');

          cy.contains(inv.name);
        }
      );
    });

    it('can edit a job template to enable provisioning callback and enable webhook, then edit again to disable those options', function () {
      const jtURL = document.location.origin + awxAPI`/job_templates/${jobTemplate.id.toString()}`;

      cy.visit(`templates/job-template/${jobTemplate.id}/details`);
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

      cy.intercept('PATCH', `api/v2/job_templates/${jobTemplate.id}/`).as('editJT');
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
        organization: (this.globalOrganization as Organization).id,
        credential_type: 11,
      }).then((ghCred) => {
        githubCredential = ghCred;
        let webhookKey: string;
        cy.intercept('GET', awxAPI`/credential_types/*`).as('getCredTypes');

        cy.navigateTo('awx', 'templates');
        cy.verifyPageTitle('Templates');
        cy.filterTableByMultiSelect('name', [jobTemplate.name]);
        cy.clickTableRowAction('name', jobTemplate.name, 'edit-template', {
          inKebab: false,
          disableFilter: true,
        });

        cy.getByDataCy('isWebhookEnabled').click();
        cy.selectDropdownOptionByResourceName('webhook-service', 'GitHub');
        cy.wait('@getCredTypes');

        cy.intercept('GET', awxAPI`/credentials/?credential_type*`).as('getCredType');
        // modal is closed instanly, possible cause: https://issues.redhat.com/browse/AAP-23766
        cy.get('[data-ouia-component-id="lookup-webhook_credential.name-button"]').click();
        cy.get('[data-ouia-component-id="lookup-webhook_credential.name-button"]').click();
        cy.wait('@getCredType');

        cy.getModal().within(() => {
          cy.selectTableRowByCheckbox('name', ghCred.name);
          cy.clickButton('Confirm');
        });
        cy.contains('Webhook details')
          .parent()
          .parent()
          .within(() => {
            cy.getByDataCy('credential-select').should('have.value', ghCred.name);
          });

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
            webhookKey = webhook_key;

            cy.contains('Webhook details')
              .parent()
              .parent()
              .within(() => {
                cy.getByDataCy('credential-select').should('have.value', ghCred.name);
              });

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

    it('can edit a job template using the edit template button on details page', function () {
      const newName = (jobTemplate.name ?? '') + ' edited';
      cy.navigateTo('awx', 'templates');
      cy.filterTableByMultiSelect('name', [jobTemplate.name]);
      cy.clickTableRowLink('name', jobTemplate.name, { disableFilter: true });
      cy.verifyPageTitle(jobTemplate.name);
      cy.clickLink(/^Edit template$/);
      cy.verifyPageTitle('Edit Job Template');
      cy.getBy('[data-cy="name"]').clear().type(newName);
      cy.getBy('[data-cy="description"]').type('this is a new description after editing');
      cy.intercept('PATCH', `api/v2/job_templates/${jobTemplate.id}/`).as('editJT');
      cy.clickButton(/^Save job template$/);
      cy.wait('@editJT')
        .its('response.body')
        .then((response: JobTemplate) => {
          expect(response.name).to.eql(newName);
          cy.verifyPageTitle(response.name);
          cy.getByDataCy('name').should('contain', response.name);
        });
    });
  });

  describe('Job Templates Tests: Copy', function () {
    let inventory: Inventory;
    let jobTemplate: JobTemplate;

    beforeEach(function () {
      cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
        (inv) => {
          inventory = inv;

          cy.createAwxJobTemplate({
            organization: (this.globalOrganization as Organization).id,
            project: (this.globalProject as Project).id,
            inventory: inventory.id,
          }).then((jt) => {
            jobTemplate = jt;
          });
        }
      );
    });

    afterEach(function () {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    });

    it('can copy an existing job template from the list', function () {
      cy.visit('/templates');
      cy.filterTableBySingleSelect('name', jobTemplate.name);
      cy.intercept('POST', awxAPI`/job_templates/${jobTemplate.id.toString()}/copy/`).as(
        'copyTemplate'
      );
      cy.getByDataCy('actions-column-cell').within(() => {
        cy.getByDataCy('actions-dropdown').click();
        cy.getByDataCy('copy-template').click();
      });
      cy.wait('@copyTemplate')
        .its('response.body.name')
        .then((copiedName: string) => {
          cy.clearAllFilters();
          cy.filterTableBySingleSelect('name', copiedName);
        });
    });

    it('can copy an existing job template from the details page', function () {
      cy.visit(`/templates/job-template/${jobTemplate.id.toString()}/details`);
      cy.intercept('POST', awxAPI`/job_templates/${jobTemplate.id.toString()}/copy/`).as(
        'copyTemplate'
      );
      cy.clickKebabAction('actions-dropdown', 'copy-template');
      cy.getByDataCy('alert-toaster').contains(`${jobTemplate.name} copied.`);
      cy.wait('@copyTemplate')
        .its('response.body')
        .then(({ id, name }: { id: number; name: string }) => {
          cy.visit(`/templates/job-template/${id}/details`);
          cy.contains(name);
        });
    });
  });

  describe('Job Templates Tests: Delete', function () {
    let inventory: Inventory;
    let machineCredential: Credential;
    let jobTemplate: JobTemplate;
    let jobTemplate2: JobTemplate;

    beforeEach(function () {
      cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
        (inv) => {
          inventory = inv;

          cy.createAWXCredential({
            kind: 'machine',
            organization: (this.globalOrganization as Organization).id,
            credential_type: 1,
          }).then((cred) => {
            machineCredential = cred;

            cy.createAwxJobTemplate({
              organization: (this.globalOrganization as Organization).id,
              project: (this.globalProject as Project).id,
              inventory: inventory.id,
            }).then((jt1) => {
              jobTemplate = jt1;
            });
            cy.createAwxJobTemplate({
              organization: (this.globalOrganization as Organization).id,
              project: (this.globalProject as Project).id,
              inventory: inventory.id,
            }).then((jt2) => {
              jobTemplate2 = jt2;
            });
          });
        }
      );
    });

    afterEach(function () {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxJobTemplate(jobTemplate2, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxCredential(machineCredential, { failOnStatusCode: false });
    });

    it.skip('can delete a job template from the list line item', function () {
      //Use a job template created in the beforeEach hook
      //Assert the presence of the job template
      //Assert the deletion by intercepting the API call
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

    it.skip('can delete a resource related to a JT and view warning on the JT', function () {
      //create a job template with a specific inventory in the beforeEach hook
      //Delete the inventory
      //Assert that the job template details page shows the inventory as having been deleted
    });

    it('can bulk delete job templates from the list page', function () {
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

  describe('Schedules Tab for Job Templates', () => {
    //These tests live on the schedules.cy.ts spec file
  });

  describe('Surveys Tab for Job Templates', () => {
    //These tests live on the jobTemplateSurvey.cy.ts spec file
  });

  describe('Notifications Tab for Job Templates', () => {
    //This describe block should create a Job Template to use in these tests
    //The Job Template needs to be deleted after the tests run
    let inventory: Inventory;
    let jobTemplate: JobTemplate;
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
      cy.createAwxInventory({ organization: (this.globalOrganization as Organization).id }).then(
        (inv) => {
          inventory = inv;

          cy.createAwxJobTemplate({
            organization: (this.globalOrganization as Organization).id,
            project: (this.globalProject as Project).id,
            inventory: inventory.id,
          }).then((jt) => {
            jobTemplate = jt;

            cy.createNotificationTemplate({
              organization: (this.globalOrganization as Organization).id,
              notification_type: 'email',
            }).then((n) => {
              notification = n;
            });
          });
        }
      );
    });

    afterEach(function () {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteNotificationTemplate(notification, { failOnStatusCode: false });
    });

    it('can navigate to the Job Templates -> Notifications list and then to the details page of the Notification', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the navigation to the details page of the notification
      cy.visit(`/templates/job_template/${jobTemplate.id}/details`);
      cy.clickTab('Notifications', true);
      cy.filterTableByTextFilter('name', notification.name);
      cy.getByDataCy('name-column-cell').contains(notification.name).click();
      cy.url().should('contain', `/administration/notifiers/${notification.id}/details`);
      cy.getByDataCy('name').contains(notification.name);
    });

    it('can toggle the Job Templates -> Notification on and off for job start', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the start toggling on
      //Assert the start toggling off
      cy.visit(`/templates/job_template/${jobTemplate.id}/notifications`);
      toggleNotificationType('start');
    });

    it('can toggle the Job Templates -> Notification on and off for job success', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the success toggling on
      //Assert the success toggling off
      cy.visit(`/templates/job_template/${jobTemplate.id}/notifications`);
      toggleNotificationType('success');
    });

    it('can toggle the Job Templates -> Notification on and off for job failure', () => {
      //Assert the navigation to the notifications tab of the Job Template
      //Assert the failure toggling on
      //Assert the failure toggling off
      cy.visit(`/templates/job_template/${jobTemplate.id}/notifications`);
      toggleNotificationType('failure');
    });
  });
});
