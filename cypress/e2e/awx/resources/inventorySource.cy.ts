import { randomString } from '../../../../framework/utils/random-string';
import { Credential } from '../../../../frontend/awx/interfaces/Credential';
import { ExecutionEnvironment } from '../../../../frontend/awx/interfaces/ExecutionEnvironment';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { NotificationTemplate } from '../../../../frontend/awx/interfaces/NotificationTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Inventory Sources', () => {
  const scheduleName = 'e2e-' + randomString(4);

  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;

  beforeEach(function () {
    project = this.globalProject as Project;
    cy.createAwxOrganization().then(function (org) {
      organization = org;
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
        cy.createAwxInventorySource(inv, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  function goToSourceList(inventoryName: string) {
    cy.navigateTo('awx', 'inventories');
    cy.filterTableBySingleSelect('name', inventoryName);
    cy.clickTableRowLink('name', inventoryName, { disableFilter: true });
    cy.verifyPageTitle(inventoryName);
    cy.clickLink(/^Sources$/);
  }

  function goToSourceDetails(inventoryName: string, sourceName: string) {
    goToSourceList(inventoryName);
    cy.getByDataCy('name-column-cell')
      .should('contain', sourceName)
      .within(() => {
        cy.clickLink(sourceName);
      });
  }

  describe('Inventory Source List', () => {
    it('inventory source tab - user can create an inventory and create a source from a project', () => {
      const credentialName = 'e2e-' + randomString(4);
      const executionEnvironmentName = 'e2e-' + randomString(4);

      let credential: Credential;
      let executionEnvironment: ExecutionEnvironment;

      cy.createAwxExecutionEnvironment({ name: executionEnvironmentName }).then((ee) => {
        executionEnvironment = ee;
        cy.createAWXCredential({
          name: credentialName,
          kind: 'gce',
          organization: organization.id,
          credential_type: 9,
        }).then((cred) => {
          credential = cred;

          goToSourceList(inventory.name);

          cy.clickButton(/^Add source/);
          cy.verifyPageTitle('Add new source');
          cy.getBy('[data-cy="name"]').type('project source');
          cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
          cy.selectDropdownOptionByResourceName('project', project.name);
          cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
          cy.singleSelectBy(
            '[data-cy="executionEnvironment-form-group"]',
            executionEnvironment.name
          );
          cy.selectSingleSelectOption('[data-cy="credential"]', credentialName);
          cy.getBy('[data-cy="host-filter"]').type('/^test$/');
          cy.getBy('[data-cy="verbosity"]').type('1');
          cy.getBy('[data-cy="enabled-var"]').type('foo.bar');
          cy.getBy('[data-cy="enabled-value"]').type('test');
          cy.getBy('[data-cy="overwrite"]').check();
          cy.getBy('[data-cy="overwrite_vars"]').check();
          cy.getBy('[data-cy="update_on_launch"]').check();
          cy.getBy('[data-cy="update-cache-timeout"]').type('1');
          cy.getBy('.view-lines').type('test: "output"');
          cy.getBy('[data-cy="Submit"]').click();
          cy.verifyPageTitle('project source');
          cy.getByDataCy('name').should('contain', 'project source');
          cy.getByDataCy('source').should('contain', 'Sourced from a Project');
          cy.getByDataCy('organization').should('contain', organization.name);
          cy.getByDataCy('execution-environment').should('contain', executionEnvironment.name);
          cy.getByDataCy('project').should('contain', project.name);
          cy.getByDataCy('inventory-file').should('contain', 'Dockerfile');
          cy.getByDataCy('verbosity').should('contain', '1 (Verbose)');
          cy.getByDataCy('cache-timeout').should('contain', '1 seconds');
          cy.getByDataCy('host-filter').should('contain', '/^test$/');
          cy.getByDataCy('enabled-variable').should('contain', 'foo.bar');
          cy.getByDataCy('enabled-value').should('contain', 'test');
          cy.getByDataCy('credential').should('contain', credential.name);
          cy.getByDataCy('enabled-options').should(
            'contain',
            'Overwrite' && 'Overwrite variables' && 'Update on launch'
          );
          cy.getByDataCy('source-variables').should('contain', 'test: output');
          cy.getByDataCy('created').should('exist');
          cy.getByDataCy('last-modified').should('exist');
          // Cleanup credential and execution environment
          cy.deleteAwxCredential(credential, { failOnStatusCode: false });
          cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
        });
      });
    });

    it('can launch and cancel a Source sync via list row actions', () => {
      goToSourceList(inventory.name);
      // Launch sync from table row
      cy.clickTableRowAction('name', inventorySource.name, 'launch-inventory-update', {
        disableFilter: true,
      });
      cy.getTableRow('name', inventorySource.name, { disableFilter: true }).within(() => {
        cy.getTableCell('status', 'Running', { disableFilter: true });
      });
      // Cancel sync from table row
      cy.clickTableRowAction('name', inventorySource.name, 'cancel-inventory-update', {
        disableFilter: true,
      });
      cy.clickModalConfirmCheckbox();
      cy.clickButton(/^Cancel Update/);
      cy.assertModalSuccess();
      cy.clickModalButton(/^Close/);
      cy.getTableRow('name', inventorySource.name, { disableFilter: true }).within(() => {
        cy.get(`[data-cy='status-column-cell']`).should('not.contain.text', 'Running');
      });
    });

    it('can sync all Sources from the list toolbar and cancel via list row actions', () => {
      cy.createAwxInventorySource(inventory, project).then((inventorySource2: InventorySource) => {
        goToSourceList(inventory.name);
        // Launch sync all from table toolbar
        cy.clickToolbarKebabAction('launch-inventory-updates');
        // Cancel each sync from table row
        [inventorySource, inventorySource2].forEach((sourceItem) => {
          cy.getTableRow('name', sourceItem.name, { disableFilter: true }).within(() => {
            cy.getTableCell('status', 'Running', { disableFilter: true });
          });
          cy.clickTableRowAction('name', sourceItem.name, 'cancel-inventory-update', {
            disableFilter: true,
          });
          cy.clickModalConfirmCheckbox();
          cy.clickButton(/^Cancel Update/);
          cy.assertModalSuccess();
          cy.clickModalButton(/^Close/);
          cy.getTableRow('name', sourceItem.name, { disableFilter: true }).within(() => {
            cy.get(`[data-cy='status-column-cell']`).should('not.contain.text', 'Running');
          });
        });
      });
    });

    it('can access the Edit form of an existing Source from the list view, update info, and verify the presence of edited info on the details page', () => {
      goToSourceList(inventory.name);

      cy.clickTableRowAction('name', inventorySource.name, 'edit-inventory-source', {
        disableFilter: true,
      });
      cy.getByDataCy('description').should('be.empty');
      cy.getByDataCy('description').type('mock description');
      cy.getByDataCy('overwrite').should('not.be.checked');
      cy.getByDataCy('overwrite').check();
      cy.clickButton(/^Save$/);
      cy.getByDataCy('description').should('contain', 'mock description');
      cy.getByDataCy('enabled-options').should('contain', 'Overwrite');
    });

    it('can create an Amazon EC2 Inventory Source and access the Edit form from its details page, ', () => {
      goToSourceList(inventory.name);

      cy.getBy('#add-source').click();
      cy.verifyPageTitle('Add new source');
      cy.getBy('[data-cy="name"]').type('amazon ec2 source');
      cy.selectDropdownOptionByResourceName('source_control_type', 'Amazon EC2');
      cy.getBy('[data-cy="host-filter"]').type('/^test$/');
      cy.getBy('[data-cy="verbosity"]').type('1');
      cy.getBy('[data-cy="enabled-var"]').type('foo.bar');
      cy.getBy('[data-cy="enabled-value"]').type('test');
      cy.getBy('[data-cy="overwrite"]').check();
      cy.getBy('[data-cy="Submit"]').click();
      cy.verifyPageTitle('amazon ec2 source');
      cy.clickButton('Edit inventory source');
      cy.verifyPageTitle('Edit source');
      cy.getBy('[data-cy="name"]').clear().type('updated amazon ec2 source');
      cy.getBy('[data-cy="overwrite_vars"]').check();
      cy.getBy('[data-cy="Submit"]').click();
      cy.verifyPageTitle('updated amazon ec2 source');
      cy.clickButton('Edit inventory source');
      cy.intercept('PATCH', awxAPI`/inventory_sources/${(inventorySource.id + 1).toString()}/`).as(
        'editSource'
      );
      cy.verifyPageTitle('Edit source');
      cy.getBy('[data-cy="name"]').clear().type('new project');
      cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
      cy.getBy('[data-cy="overwrite_vars"]').check();
      cy.getBy('[data-cy="update_on_launch"]').check();
      cy.selectDropdownOptionByResourceName('project', project.name);
      cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
      cy.getBy('[data-cy="Submit"]').click();
      cy.wait('@editSource')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(200);
        })
        .its('response.body')
        .then((response: InventorySource) => {
          expect(response.name).contains('new project');
          expect(response.source).contains('scm');
          expect(response.overwrite_vars).equal(true);
          expect(response.update_on_launch).equal(true);
          expect(response.source_project).to.equal(project.id);
          expect(response.inventory).to.equal(inventory.id);
        });
      cy.verifyPageTitle('new project');
      cy.getByDataCy('name').should('contain', 'new project');
      cy.getByDataCy('organization').should('contain', organization.name);
      cy.getByDataCy('project').should('contain', project.name);
      cy.getByDataCy('inventory-file').should('contain', 'Dockerfile');
      cy.getByDataCy('verbosity').should('contain', '1 (Verbose)');
      cy.getByDataCy('cache-timeout').should('contain', '0 seconds');
      cy.getByDataCy('host-filter').should('contain', '/^test$/');
      cy.getByDataCy('enabled-variable').should('contain', 'foo.bar');
      cy.getByDataCy('enabled-value').should('contain', 'test');
      cy.getByDataCy('enabled-options').should(
        'contain',
        'Overwrite' && 'Overwrite variables' && 'Update on launch'
      );
      cy.getByDataCy('source-variables').should('contain', '');
      cy.getByDataCy('created').should('exist');
      cy.getByDataCy('last-modified').should('exist');
    });
  });

  describe('Inventory Details Page', () => {
    it('can sync a Source from its details page, view the job output/detail, and cancel sync from its details page', () => {
      goToSourceDetails(inventory.name, inventorySource.name);
      // Launch sync from Source details
      cy.clickButton(/^Launch inventory update$/);
      cy.getByDataCy('last-job-status')
        .should('contain', 'Running')
        .within(() => {
          cy.clickLink('Running');
        });
      cy.verifyPageTitle(`${inventory.name} - ${inventorySource.name}`);
      cy.clickLink(/^Details$/);
      cy.getByDataCy('name').should('contain', `${inventory.name} - ${inventorySource.name}`);
      goToSourceDetails(inventory.name, inventorySource.name);
      // Cancel sync from Source details
      cy.clickButton(/^Cancel inventory update$/);
      cy.clickModalConfirmCheckbox();
      cy.clickButton(/^Cancel Update/);
      cy.assertModalSuccess();
      cy.clickModalButton(/^Close/);
      cy.getByDataCy('last-job-status').should('contain', 'Canceled');
    });

    it('can delete a Source from its details page and confirm the delete', () => {
      goToSourceDetails(inventory.name, inventorySource.name);

      cy.verifyPageTitle(inventorySource.name);
      cy.clickPageAction('delete-inventory-source');
      cy.getBy('#confirm').click();
      cy.clickButton(/^Delete inventory source/);
      cy.contains('name-column-cell', inventorySource.name).should('not.exist');
    });
  });

  describe('Inventory Source Schedules List Page', () => {
    it('can navigate to the Create Schedules form, create a new Schedule, verify schedule is enabled, and verify all expected information is showing on the details page', () => {
      goToSourceDetails(inventory.name, inventorySource.name);

      cy.clickTab('Schedules', true);
      cy.clickButton('Create schedule');
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.getByDataCy('name').clear().type('new schedule');
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Save rule$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Finish$/);
      cy.verifyPageTitle('new schedule');
      cy.get('.pf-v5-c-switch__label.pf-m-on')
        .should('have.text', 'Schedule enabled')
        .should('be.visible');
      cy.getByDataCy('name').should('contain', 'new schedule');
      cy.getByDataCy('next-run').should('exist');
      cy.getByDataCy('first-run').should('exist');
      cy.getByDataCy('time-zone').should('contain', 'America/New_York');
    });

    it("can access the Edit form of an existing Schedule, update information, and verify the presence of the edited information on the schedule's details page", () => {
      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule1: Schedule) => {
        goToSourceDetails(inventory.name, inventorySource.name);

        cy.clickTab('Schedules', true);
        cy.clickTableRowAction('name', scheduleName, 'edit-schedule', {
          disableFilter: true,
        });
        cy.intercept('PATCH', awxAPI`/schedules/${schedule1.id.toString()}/`).as('editSchedule');
        cy.getByDataCy('description').should('be.empty');
        cy.getByDataCy('description').type('mock description');
        cy.getByDataCy('timezone').should('contain', schedule1.timezone);
        cy.singleSelectByDataCy('timezone', 'America/New_York');
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Finish$/);
        cy.wait('@editSchedule')
          .then((response) => {
            expect(response?.response?.statusCode).to.eql(200);
          })
          .its('response.body')
          .then((response: Schedule) => {
            expect(response.name).contains(scheduleName);
            expect(response.description).contains('mock description');
            expect(response.timezone).contains('America/New_York');
          });
      });
    });

    it('can delete a single schedule from the Source Schedule list and confirm delete', () => {
      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule1: Schedule) => {
        goToSourceDetails(inventory.name, inventorySource.name);

        cy.clickTab('Schedules', true);
        cy.clickTableRowKebabAction(scheduleName, 'delete-schedule', false);
        cy.intercept('DELETE', awxAPI`/schedules/${schedule1.id.toString()}/`).as('deleteSchedule');
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Delete schedule');
        cy.wait('@deleteSchedule').then((response) => {
          expect(response?.response?.statusCode).to.eql(204);
        });
        cy.clickButton('Close');
        cy.contains('name-column-cell', scheduleName).should('not.exist');
      });
    });

    it('can bulk delete multiple schedules from the Source Schedule list and confirm delete', () => {
      const scheduleName2 = 'e2e-' + randomString(4);
      let schedB: Schedule;

      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule1: Schedule) => {
        cy.createAWXSchedule({
          name: scheduleName2,
          unified_job_template: inventorySource.id,
          rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
        }).then((schedule2: Schedule) => {
          schedB = schedule2;
          goToSourceDetails(inventory.name, inventorySource.name);

          cy.clickTab('Schedules', true);
          cy.selectTableRowByCheckbox('name', scheduleName, { disableFilter: true });
          cy.selectTableRowByCheckbox('name', scheduleName2, { disableFilter: true });
          cy.clickToolbarKebabAction('delete-selected-schedules');
          cy.intercept('DELETE', awxAPI`/schedules/${schedule1.id.toString()}/`, (req) => {
            req.reply((res) => {
              expect(res.statusCode).to.equal(204);
            });
          }).as('deleteSchedule1');
          cy.intercept('DELETE', awxAPI`/schedules/${schedB.id.toString()}/`, (req) => {
            req.reply((res) => {
              expect(res.statusCode).to.equal(204);
            });
          }).as('deleteSchedule2');
          cy.clickModalConfirmCheckbox();
          cy.clickButton('Delete schedule');
          cy.clickButton('Close');
          cy.contains('name-column-cell', scheduleName).should('not.exist');
          cy.contains('name-column-cell', scheduleName2).should('not.exist');
        });
      });
    });
  });

  describe('Inventory Source Schedules Details Page', () => {
    it("can access the Edit form of an existing Schedule, update information, and verify the presence of the edited information on the schedule's details page", () => {
      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule1: Schedule) => {
        goToSourceDetails(inventory.name, inventorySource.name);
        cy.clickTab('Schedules', true);
        cy.getByDataCy('name-column-cell')
          .should('contain', scheduleName)
          .within(() => {
            cy.clickLink(scheduleName);
          });
        cy.clickLink(/^Edit schedule$/);
        cy.intercept('PATCH', awxAPI`/schedules/${schedule1.id.toString()}/`).as('editSchedule');
        cy.getByDataCy('description').should('be.empty');
        cy.getByDataCy('description').type('mock description');
        cy.getByDataCy('timezone').should('contain', schedule1.timezone);
        cy.singleSelectByDataCy('timezone', 'America/New_York');
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Finish$/);
        cy.wait('@editSchedule')
          .then((response) => {
            expect(response?.response?.statusCode).to.eql(200);
          })
          .its('response.body')
          .then((response: Schedule) => {
            expect(response.name).contains(scheduleName);
            expect(response.description).contains('mock description');
            expect(response.timezone).contains('America/New_York');
          });
      });
    });

    it('can delete a single schedule from the Source Schedule details page and confirm delete', () => {
      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule1: Schedule) => {
        goToSourceDetails(inventory.name, inventorySource.name);
        cy.clickTab('Schedules', true);
        cy.getByDataCy('name-column-cell')
          .should('contain', scheduleName)
          .within(() => {
            cy.clickLink(scheduleName);
          });
        cy.clickKebabAction('actions-dropdown', 'delete-schedule');
        cy.intercept('DELETE', awxAPI`/schedules/${schedule1.id.toString()}/`).as('deleteSchedule');
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Delete schedule');
        cy.wait('@deleteSchedule').then((response) => {
          expect(response?.response?.statusCode).to.eql(204);
        });
      });
    });
  });

  describe('Inventory Source Notifications Page', () => {
    let notification: NotificationTemplate;

    beforeEach(() => {
      cy.createNotificationTemplate('e2e-' + randomString(4)).then((notificationTemplate) => {
        notification = notificationTemplate;
      });
    });

    afterEach(() => {
      cy.deleteNotificationTemplate(notification, { failOnStatusCode: false });
    });

    it('can visit the Notifications tab of an Inventory Source and enable a notification upon Start', () => {
      goToSourceDetails(inventory.name, inventorySource.name);

      cy.clickTab('Notifications', true);
      cy.intercept(
        'POST',
        awxAPI`/inventory_sources/${inventorySource.id.toString()}/notification_templates_started/`
      ).as('toggleStart');
      cy.getTableRow('name', notification.name).within(() => {
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get('[data-cy="toggle-switch"]').first().click();
        });
      });
      cy.wait('@toggleStart').then((response) => {
        expect(response?.response?.statusCode).to.eql(204);
      });
      cy.get(`input[aria-label="Click to disable start"]`).should('exist');
    });

    it('can visit the Notifications tab of an Inventory Source and enable a notification upon Success', () => {
      goToSourceDetails(inventory.name, inventorySource.name);
      cy.clickTab('Notifications', true);
      cy.intercept(
        'POST',
        awxAPI`/inventory_sources/${inventorySource.id.toString()}/notification_templates_success/`
      ).as('toggleSuccess');
      cy.getTableRow('name', notification.name).within(() => {
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get('[data-cy="toggle-switch"]').eq(1).click();
        });
      });
      cy.wait('@toggleSuccess').then((response) => {
        expect(response?.response?.statusCode).to.eql(204);
      });
      cy.get(`input[aria-label="Click to disable success"]`).should('exist');
    });

    it('can visit the Notifications tab of an Inventory Source and enable a notification upon Failure', () => {
      goToSourceDetails(inventory.name, inventorySource.name);

      cy.clickTab('Notifications', true);
      cy.intercept(
        'POST',
        awxAPI`/inventory_sources/${inventorySource.id.toString()}/notification_templates_error/`
      ).as('toggleFailure');
      cy.getTableRow('name', notification.name).within(() => {
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get('[data-cy="toggle-switch"]').eq(2).click();
        });
      });
      cy.wait('@toggleFailure').then((response) => {
        expect(response?.response?.statusCode).to.eql(204);
      });
      cy.get(`input[aria-label="Click to disable failure"]`).should('exist');
    });
  });
});
