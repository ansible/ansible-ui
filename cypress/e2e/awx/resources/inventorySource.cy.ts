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
    cy.createAwxOrganization().then(function (org) {
      organization = org;
      cy.createAwxInventory({ organization: organization.id }).then((inv) => {
        inventory = inv;
        cy.createAwxProject({ organization: organization.id }).then((proj) => {
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
          cy.singleSelectBy('[data-cy="credential"]', credentialName);
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
      // Create inventory source
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
      // Verify details
      cy.location('pathname').should('match', /\/details$/);
      cy.verifyPageTitle('updated amazon ec2 source');
      // Edit inventory source
      cy.clickButton('Edit inventory source');
      cy.location('pathname').should('match', /\/edit$/);
      cy.verifyPageTitle('Edit source');
      cy.getBy('[data-cy="name"]').clear().type('new project');
      cy.selectDropdownOptionByResourceName('source_control_type', 'Sourced from a Project');
      cy.getBy('[data-cy="overwrite_vars"]').check();
      cy.getBy('[data-cy="update_on_launch"]').check();
      cy.selectDropdownOptionByResourceName('project', project.name);
      cy.selectDropdownOptionByResourceName('inventory', 'Dockerfile');
      cy.getBy('[data-cy="Submit"]').click();
      // Verify edited details
      cy.location('pathname').should('match', /\/details$/);
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

  describe('Inventory Source Schedules List Page', () => {
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
