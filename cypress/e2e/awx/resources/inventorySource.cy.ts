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
  const credentialName = 'e2e-' + randomString(4);
  const executionEnvironmentName = 'e2e-' + randomString(4);
  const scheduleName = 'e2e-' + randomString(4);
  const scheduleName2 = 'e2e-' + randomString(4);

  let organization: Organization;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let inventorySource2: InventorySource;
  let credential: Credential;
  let schedA: Schedule;
  let schedB: Schedule;
  let notification: NotificationTemplate;

  let executionEnvironment: ExecutionEnvironment;
  before(() => {
    cy.awxLogin();
  });

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

      cy.createAwxExecutionEnvironment({ name: executionEnvironmentName }).then((ee) => {
        executionEnvironment = ee;
      });
      cy.createAWXCredential({
        name: credentialName,
        kind: 'gce',
        organization: organization.id,
        credential_type: 9,
      }).then((cred) => {
        credential = cred;
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
    cy.deleteAwxCredential(credential, { failOnStatusCode: false });
  });

  describe('Inventory Source List', () => {
    it('inventory source tab - user can create an inventory and create a source from a project', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.clickButton(/^Add source/);
      cy.verifyPageTitle('Add new source');
      cy.getBy('[data-cy="name"]').type('project source');
      cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
      cy.selectDropdownOptionByResourceName('project', project.name);
      cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
      cy.singleSelectBy('[data-cy="executionEnvironment-form-group"]', executionEnvironment.name);
      cy.get('[data-cy="credential-select-form-group"]')
        .click()
        .within(() => {
          cy.get('button[aria-label="Options menu"]').click();
        });
      cy.getModal().within(() => {
        cy.selectTableRowByCheckbox('name', credentialName);
        cy.getBy('#submit').click();
      });
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
    });

    it('can sync a Source from its table view action on the list view and and confirm completed sync action', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.clickTableRowAction('name', inventorySource.name, 'launch-inventory-update', {
        disableFilter: true,
      });
      cy.getTableRow('name', inventorySource.name, { disableFilter: true }).within(() => {
        cy.getTableCell('status', 'Running', { disableFilter: true });
      });
      cy.getTableRow('name', inventorySource.name, { disableFilter: true }).within(() => {
        cy.get('a').click();
      });
      cy.getByDataCy('last-job-status')
        .should('contain', 'Running')
        .within(() => {
          cy.clickLink('Running');
        });
      cy.verifyPageTitle(`${inventory.name} - ${inventorySource.name}`);
      cy.clickLink(/^Details$/);
      cy.getByDataCy('name').should('contain', `${inventory.name} - ${inventorySource.name}`);
    });

    it('can sync all Sources on the list view and and confirm completed sync action', () => {
      cy.createAwxInventorySource(inventory, project).then((invSrc2) => {
        inventorySource2 = invSrc2;
        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickLink(/^Sources$/);
        cy.clickToolbarKebabAction('launch-inventory-updates');
        cy.getTableRow('name', inventorySource.name, { disableFilter: true }).within(() => {
          cy.getTableCell('status', 'Running', { disableFilter: true });
        });
        cy.getTableRow('name', inventorySource2.name, { disableFilter: true }).within(() => {
          cy.getTableCell('status', 'Running', { disableFilter: true });
        });
        cy.getTableRow('name', inventorySource2.name, { disableFilter: true }).within(() => {
          cy.get('a').click();
        });
        cy.getByDataCy('last-job-status')
          .should('contain', 'Running')
          .within(() => {
            cy.clickLink('Running');
          });
        cy.verifyPageTitle(`${inventory.name} - ${inventorySource2.name}`);
        cy.clickLink(/^Details$/);
        cy.getByDataCy('name').should('contain', `${inventory.name} - ${inventorySource2.name}`);
      });
    });

    it('can access the Edit form of an existing Source from the list view, update info, and verify the presence of edited info on the details page', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
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

    it('can create an Amazon EC2 Inventory Source and edit the form', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
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
      cy.getByDataCy('source-variables').should('contain', '---');
      cy.getByDataCy('created').should('exist');
      cy.getByDataCy('last-modified').should('exist');
    });
  });

  describe('Inventory Details Page', () => {
    it('can access the Edit form of an existing source from the details page, update information, and verify the presence of the edited information on the details page', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getByDataCy('name-column-cell')
        .should('contain', inventorySource.name)
        .within(() => {
          cy.clickLink(inventorySource.name);
        });
      cy.clickButton(/^Edit inventory source$/);
      cy.getByDataCy('description').should('be.empty');
      cy.getByDataCy('description').type('mock description');
      cy.getByDataCy('overwrite').should('not.be.checked');
      cy.getByDataCy('overwrite').check();
      cy.clickButton(/^Save$/);
      cy.getByDataCy('description').should('contain', 'mock description');
      cy.getByDataCy('enabled-options').should('contain', 'Overwrite');
    });

    it('can sync a Source from its details page and view the output screen for the completed sync job', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getByDataCy('name-column-cell')
        .should('contain', inventorySource.name)
        .within(() => {
          cy.clickLink(inventorySource.name);
        });
      cy.clickButton(/^Launch inventory update$/);
      cy.getByDataCy('last-job-status')
        .should('contain', 'Running')
        .within(() => {
          cy.clickLink('Running');
        });
      cy.verifyPageTitle(`${inventory.name} - ${inventorySource.name}`);
      cy.clickLink(/^Details$/);
      cy.getByDataCy('name').should('contain', `${inventory.name} - ${inventorySource.name}`);
    });

    it('can sync a Source from its details page, cancel the sync before completion, and verify the canceled sync', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getByDataCy('name-column-cell')
        .should('contain', inventorySource.name)
        .within(() => {
          cy.clickLink(inventorySource.name);
        });
      cy.clickButton(/^Launch inventory update$/);
      cy.getByDataCy('last-job-status')
        .should('contain', 'Running')
        .within(() => {
          cy.clickLink('Running');
        });
      cy.verifyPageTitle(`${inventory.name} - ${inventorySource.name}`);
      cy.clickButton(/^Cancel job$/);
      cy.clickModalConfirmCheckbox();
      cy.getBy('#submit').click();
      cy.verifyPageTitle('Jobs');
    });

    it('can delete a Source from its details page and confirm the delete', () => {
      cy.visit(
        `/infrastructure/inventories/inventory/${inventorySource.inventory}/sources/${inventorySource.id}/details`
      );
      cy.verifyPageTitle(inventorySource.name);
      cy.clickPageAction('delete-inventory-source');
      cy.getBy('#confirm').click();
      cy.clickButton(/^Delete inventory source/);
      cy.contains('name-column-cell', inventorySource.name).should('not.exist');
    });
  });

  describe('Inventory Source Schedules List Page', () => {
    it('can navigate to the Create Schedules form, create a new Schedule, verify schedule is enabled, and verify all expected information is showing on the details page', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getByDataCy('name-column-cell')
        .should('contain', inventorySource.name)
        .within(() => {
          cy.clickLink(inventorySource.name);
        });
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
        schedA = schedule1;
        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickLink(/^Sources$/);
        cy.getByDataCy('name-column-cell')
          .should('contain', inventorySource.name)
          .within(() => {
            cy.clickLink(inventorySource.name);
          });
        cy.clickTab('Schedules', true);
        cy.clickTableRowAction('name', scheduleName, 'edit-schedule', {
          disableFilter: true,
        });
        cy.intercept('PATCH', awxAPI`/schedules/${schedA.id.toString()}/`).as('editSchedule');
        cy.getByDataCy('description').should('be.empty');
        cy.getByDataCy('description').type('mock description');
        cy.getByDataCy('timezone').should('contain', schedA.timezone);
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
        schedA = schedule1;
        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickLink(/^Sources$/);
        cy.getByDataCy('name-column-cell')
          .should('contain', inventorySource.name)
          .within(() => {
            cy.clickLink(inventorySource.name);
          });
        cy.clickTab('Schedules', true);
        cy.clickTableRowKebabAction(scheduleName, 'delete-schedule', false);
        cy.intercept('DELETE', awxAPI`/schedules/${schedA.id.toString()}/`).as('deleteSchedule');
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Delete schedule');
        cy.wait('@deleteSchedule').then((response) => {
          expect(response?.response?.statusCode).to.eql(204);
        });
        cy.clickButton('Close');
        cy.contains('name-column-cell', scheduleName).should('not.exist');
      });
    });

    it.skip('can bulk delete multiple schedules from the Source Schedule list and confirm delete', () => {
      //bug in API, skipping for now
      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule1: Schedule) => {
        schedA = schedule1;
      });
      cy.createAWXSchedule({
        name: scheduleName2,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule2: Schedule) => {
        schedB = schedule2;
        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickLink(/^Sources$/);
        cy.getByDataCy('name-column-cell')
          .should('contain', inventorySource.name)
          .within(() => {
            cy.clickLink(inventorySource.name);
          });
        cy.clickTab('Schedules', true);
        cy.selectTableRowByCheckbox('name', scheduleName, { disableFilter: true });
        cy.selectTableRowByCheckbox('name', scheduleName2, { disableFilter: true });
        cy.clickToolbarKebabAction('delete-selected-schedules');
        cy.intercept('DELETE', awxAPI`/schedules/${schedA.id.toString()}/`).as('deleteSchedule1');
        cy.intercept('DELETE', awxAPI`/schedules/${schedB.id.toString()}/`).as('deleteSchedule2');
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Delete schedule');
        cy.wait('@deleteSchedule1').then((response) => {
          expect(response?.response?.statusCode).to.eql(204);
        });
        cy.wait('@deleteSchedule2').then((response) => {
          expect(response?.response?.statusCode).to.eql(204);
        });
        cy.clickButton('Close');
        cy.contains('name-column-cell', scheduleName).should('not.exist');
        cy.contains('name-column-cell', scheduleName2).should('not.exist');
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
        schedA = schedule1;
        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickLink(/^Sources$/);
        cy.getByDataCy('name-column-cell')
          .should('contain', inventorySource.name)
          .within(() => {
            cy.clickLink(inventorySource.name);
          });
        cy.clickTab('Schedules', true);
        cy.getByDataCy('name-column-cell')
          .should('contain', scheduleName)
          .within(() => {
            cy.clickLink(scheduleName);
          });
        cy.clickLink(/^Edit schedule$/);
        cy.intercept('PATCH', awxAPI`/schedules/${schedA.id.toString()}/`).as('editSchedule');
        cy.getByDataCy('description').should('be.empty');
        cy.getByDataCy('description').type('mock description');
        cy.getByDataCy('timezone').should('contain', schedA.timezone);
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
        schedA = schedule1;
        cy.navigateTo('awx', 'inventories');
        cy.filterTableBySingleSelect('name', inventory.name);
        cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
        cy.verifyPageTitle(inventory.name);
        cy.clickLink(/^Sources$/);
        cy.getByDataCy('name-column-cell')
          .should('contain', inventorySource.name)
          .within(() => {
            cy.clickLink(inventorySource.name);
          });
        cy.clickTab('Schedules', true);
        cy.getByDataCy('name-column-cell')
          .should('contain', scheduleName)
          .within(() => {
            cy.clickLink(scheduleName);
          });
        cy.clickKebabAction('actions-dropdown', 'delete-schedule');
        cy.intercept('DELETE', awxAPI`/schedules/${schedA.id.toString()}/`).as('deleteSchedule');
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Delete schedule');
        cy.wait('@deleteSchedule').then((response) => {
          expect(response?.response?.statusCode).to.eql(204);
        });
      });
    });
  });

  describe('Inventory Source Notifications Page', () => {
    beforeEach(() => {
      cy.createNotificationTemplate('e2e-' + randomString(4)).then((notificationTemplate) => {
        notification = notificationTemplate;
      });
    });

    afterEach(() => {
      cy.deleteNotificationTemplate(notification, { failOnStatusCode: false });
    });

    it('can visit the Notifications tab of an Inventory Source and enable a notification upon Start', () => {
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getByDataCy('name-column-cell')
        .should('contain', inventorySource.name)
        .within(() => {
          cy.clickLink(inventorySource.name);
        });
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
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getByDataCy('name-column-cell')
        .should('contain', inventorySource.name)
        .within(() => {
          cy.clickLink(inventorySource.name);
        });
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
      cy.navigateTo('awx', 'inventories');
      cy.filterTableBySingleSelect('name', inventory.name);
      cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
      cy.verifyPageTitle(inventory.name);
      cy.clickLink(/^Sources$/);
      cy.getByDataCy('name-column-cell')
        .should('contain', inventorySource.name)
        .within(() => {
          cy.clickLink(inventorySource.name);
        });
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
