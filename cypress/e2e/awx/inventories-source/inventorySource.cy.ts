import { randomString } from '@ansible/ansible-ui-framework/utils/random-string';
import { Credential } from '@ansible/awx-ui/interfaces/Credential';
import { ExecutionEnvironment } from '@ansible/awx-ui/interfaces/ExecutionEnvironment';
import { Inventory } from '@ansible/awx-ui/interfaces/Inventory';
import { InventorySource } from '@ansible/awx-ui/interfaces/InventorySource';
import { NotificationTemplate } from '@ansible/awx-ui/interfaces/NotificationTemplate';
import { Organization } from '@ansible/awx-ui/interfaces/Organization';
import { Project } from '@ansible/awx-ui/interfaces/Project';
import { Schedule } from '@ansible/awx-ui/interfaces/Schedule';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Inventory Sources', () => {
  const scheduleName = 'e2e-' + randomString(4);

  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let organization: Organization;

  beforeEach(function () {
    cy.createAwxOrganization().then(function (org) {
      organization = org;
      cy.createAwxInventory(organization).then((inv) => {
        inventory = inv;
        cy.createAwxProject(organization).then((proj) => {
          project = proj;
          cy.createAwxInventorySource(inv, project).then((invSrc) => {
            inventorySource = invSrc;
          });
        });
      });
    });
  });

  afterEach(() => {
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    cy.deleteAwxProject(project, { failOnStatusCode: false });
  });

  function goToSourceList(inventoryName: string) {
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
    cy.filterTableBySingleSelect('name', inventoryName);
    cy.clickTableRowLink('name', inventoryName, { disableFilter: true });
    cy.verifyPageTitle(inventoryName);
    cy.clickTab(/^Sources$/, true);
  }

  describe('Inventory Source List', () => {
    it('inventory source tab - user can create an inventory and create a source from a project', () => {
      const credentialName = 'e2e-' + randomString(4);
      const executionEnvironmentName = 'e2e-' + randomString(4);
      let credential: Credential;
      let executionEnvironment: ExecutionEnvironment;

      cy.createAwxExecutionEnvironment({ name: executionEnvironmentName }).then((ee) => {
        executionEnvironment = ee;
        cy.createAWXCredential(
          {
            name: credentialName,
            kind: 'gce',
            organization: organization.id,
          },
          'Google Compute Engine'
        ).then((cred) => {
          credential = cred;
          goToSourceList(inventory.name);
          cy.clickButton(/^Create source/);
          cy.verifyPageTitle('Create source');
          cy.getByDataCy('name').type('project source');
          cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
          cy.selectAsyncSingleSelectOption('project-select', `${project.name}`);
          cy.get('div#inventory-file-toggle').within(() => {
            cy.get('button').click();
            cy.get('input[aria-label="Type to filter"]').type('Dockerfile');
          });
          cy.get('div#inventory-typeahead-select').within(() => {
            cy.get('li.pf-v5-c-menu__list-item').within(() => {
              cy.get('button#select-create-typeahead-CREATE_NEW_VALUE').click();
            });
          });
          cy.singleSelectByDataCy('executionEnvironment-form-group', executionEnvironment.name);
          cy.singleSelectByDataCy('credential', credentialName);
          cy.getByDataCy('host-filter').type('/^test$/');
          cy.getByDataCy('verbosity').type('1');
          cy.getByDataCy('enabled-var').type('foo.bar');
          cy.getByDataCy('enabled-value').type('test');
          cy.getByDataCy('overwrite').check();
          cy.getByDataCy('overwrite_vars').check();
          cy.getByDataCy('update_on_launch').check();
          cy.getByDataCy('update-cache-timeout').type('1');
          cy.getBy('.view-lines').type('test: "output"');
          cy.getByDataCy('Submit').click();
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
          cy.getByDataCy('enabled-options').should('contain', 'Overwrite');
          cy.getByDataCy('enabled-options').should('contain', 'Overwrite variables');
          cy.getByDataCy('enabled-options').should('contain', 'Update on launch');
          cy.getByDataCy('source-variables').should('contain', 'test: output');
          cy.getByDataCy('created').should('exist');
          cy.getByDataCy('last-modified').should('exist');
          cy.deleteAwxCredential(credential, { failOnStatusCode: false });
          cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
        });
      });
    });

    it('can access the Edit form of an existing Source from the list view, update info, and verify the presence of edited info on the details page', () => {
      goToSourceList(inventory.name);
      cy.clickTableRowAction('name', inventorySource.name, 'edit-inventory-source', {
        disableFilter: true,
      });
      cy.getByDataCy('description').clear().type('mock description');
      cy.getByDataCy('overwrite').check();
      cy.clickButton(/^Save source$/);
      cy.getByDataCy('description').should('contain', 'mock description');
      cy.getByDataCy('enabled-options').should('contain', 'Overwrite');
    });
  });

  describe('Inventory Source Schedules List Page', () => {
    it("can access the Edit form of an existing Schedule, update information, and verify the presence of the edited information on the schedule's details page", () => {
      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: inventorySource.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      }).then((schedule1: Schedule) => {
        goToSourceList(inventory.name);
        cy.clickTableRowLink('name', inventorySource.name, { disableFilter: true });
        cy.verifyPageTitle(inventorySource.name);
        cy.clickTab('Schedules', true);
        cy.clickTableRowAction('name', scheduleName, 'edit-schedule', {
          disableFilter: true,
        });
        cy.intercept('PATCH', awxAPI`/schedules/${schedule1.id.toString()}/`).as('editSchedule');
        cy.getByDataCy('description').clear().type('mock description');
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
        goToSourceList(inventory.name);
        cy.clickTableRowLink('name', inventorySource.name, { disableFilter: true });
        cy.clickTab('Schedules', true);
        cy.clickTableRowAction('name', scheduleName, 'delete-schedule', {
          inKebab: true,
          disableFilter: true,
        });
        cy.intercept('DELETE', awxAPI`/schedules/${schedule1.id.toString()}/`).as('deleteSchedule');
        cy.clickModalConfirmCheckbox();
        cy.clickButton('Delete schedule');
        cy.wait('@deleteSchedule').then((response) => {
          expect(response?.response?.statusCode).to.eql(204);
        });
        cy.contains('name-column-cell', scheduleName).should('not.exist');
      });
    });
  });

  describe('Inventory Source Notifications Page', () => {
    let notification: NotificationTemplate;

    beforeEach(() => {
      cy.createNotificationTemplate('e2e-' + randomString(4), organization).then(
        (notificationTemplate) => {
          notification = notificationTemplate;
        }
      );
    });

    afterEach(() => {
      cy.deleteNotificationTemplate(notification, { failOnStatusCode: false });
    });

    it('can visit the Notifications tab of an Inventory Source and enable a notification upon Start', () => {
      goToSourceList(inventory.name);
      cy.clickTableRowLink('name', inventorySource.name, { disableFilter: true });
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
      goToSourceList(inventory.name);
      cy.clickTableRowLink('name', inventorySource.name, { disableFilter: true });
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
      goToSourceList(inventory.name);
      cy.clickTableRowLink('name', inventorySource.name, { disableFilter: true });
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

describe('Inventory Source - Source Control Type: Amazon EC2', () => {
  let ec2Credential: Credential;
  let organizationEC2: Organization;
  let inventory: Inventory;
  let project: Project;
  let executionEnvironment: ExecutionEnvironment;
  const credentialName = 'E2E EC2 Credential' + randomString(5);
  const executionEnvironmentName = 'E2E Execution Environment ' + randomString(5);

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organizationEC2 = org;
      cy.createAwxExecutionEnvironment({ name: executionEnvironmentName }).then((ee) => {
        executionEnvironment = ee;
        cy.createAwxInventory(organizationEC2).then((inv) => {
          inventory = inv;
          cy.createAwxProject(organizationEC2).then((proj) => {
            project = proj;
            cy.createAWXCredential(
              {
                name: credentialName,
                inputs: { username: 'test', password: 'test' },
                kind: 'aws',
                organization: organizationEC2.id,
              },
              'Amazon Web Services'
            ).then((credential) => {
              ec2Credential = credential;
            });
          });
        });
      });
    });
  });

  after(() => {
    cy.deleteAwxCredential(ec2Credential, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organizationEC2, { failOnStatusCode: false });
    cy.deleteAwxExecutionEnvironment(executionEnvironment, { failOnStatusCode: false });
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  it('can create an Amazon EC2 Inventory Source and access the Edit form from its details page', () => {
    cy.navigateTo('awx', 'inventories');
    cy.verifyPageTitle('Inventories');
    cy.filterTableBySingleSelect('name', inventory.name);
    cy.clickTableRowLink('name', inventory.name, { disableFilter: true });
    cy.verifyPageTitle(inventory.name);
    cy.clickTab(/^Sources$/, true);
    cy.contains('Create source').click();
    cy.verifyPageTitle('Create source');
    cy.getByDataCy('name').type('amazon ec2 source');
    cy.selectDropdownOptionByResourceName('source_control_type', 'Amazon EC2');
    cy.singleSelectByDataCy('credential', credentialName);
    cy.getByDataCy('host-filter').type('/^test$/');
    cy.getByDataCy('verbosity').type('1');
    cy.getByDataCy('enabled-var').type('foo.bar');
    cy.getByDataCy('enabled-value').type('test');
    cy.getByDataCy('overwrite').check();
    cy.getByDataCy('Submit').click();
    cy.verifyPageTitle('amazon ec2 source');
    cy.clickButton('Edit inventory source');
    cy.verifyPageTitle(`Edit amazon ec2 source`);
    cy.getByDataCy('name').clear().type('updated amazon ec2 source');
    cy.getByDataCy('overwrite_vars').check();
    cy.getByDataCy('Submit').click();
    cy.location('pathname').should('match', /\/details$/);
    cy.verifyPageTitle('updated amazon ec2 source');
    cy.clickButton('Edit inventory source');
    cy.location('pathname').should('match', /\/edit$/);
    cy.verifyPageTitle(`Edit updated amazon ec2 source`);
    cy.getByDataCy('name').clear().type('new project');
    cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
    cy.getByDataCy('overwrite_vars').check();
    cy.getByDataCy('update_on_launch').check();
    cy.selectAsyncSingleSelectOption('project-select', `${project.name}`);
    cy.get('div#inventory-file-toggle').within(() => {
      cy.get('button').click();
      cy.get('input[aria-label="Type to filter"]').type('Dockerfile');
    });
    cy.get('div#inventory-typeahead-select').within(() => {
      cy.get('li.pf-v5-c-menu__list-item').within(() => {
        cy.get('button#select-create-typeahead-CREATE_NEW_VALUE').click();
      });
    });
    cy.getByDataCy('Submit').click();
    cy.location('pathname').should('match', /\/details$/);
    cy.verifyPageTitle('new project');
    cy.getByDataCy('name').should('contain', 'new project');
    cy.getByDataCy('organization').should('contain', organizationEC2.name);
    cy.getByDataCy('project').should('contain', project.name);
    cy.getByDataCy('inventory-file').should('contain', 'Dockerfile');
    cy.getByDataCy('verbosity').should('contain', '1 (Verbose)');
    cy.getByDataCy('cache-timeout').should('contain', '0 seconds');
    cy.getByDataCy('host-filter').should('contain', '/^test$/');
    cy.getByDataCy('enabled-variable').should('contain', 'foo.bar');
    cy.getByDataCy('enabled-value').should('contain', 'test');
    cy.getByDataCy('enabled-options').should('contain', 'Overwrite');
    cy.getByDataCy('enabled-options').should('contain', 'Overwrite variables');
    cy.getByDataCy('enabled-options').should('contain', 'Update on launch');
    cy.getByDataCy('source-variables').should('contain', '');
    cy.getByDataCy('created').should('exist');
    cy.getByDataCy('last-modified').should('exist');
  });
});
