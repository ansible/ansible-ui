/* eslint-disable @typescript-eslint/no-non-null-assertion */
/// <reference types="cypress" />
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';

describe('schedules', () => {
  let schedule: Schedule;
  let organization: Organization;
  let inventory: Inventory;
  let project: Project;
  let inventorySource: InventorySource;

  before(function () {
    cy.awxLogin();
    organization = this.globalOrganization as Organization;
    project = this.globalProject as Project;
  });

  beforeEach(() => {
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
    cy.createAwxInventory({ organization: organization.id }).then((i) => {
      inventory = i;
      cy.createAwxInventorySource(i, project).then((invSrc) => {
        inventorySource = invSrc;
      });
    });
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
  });

  it('renders schedules list', () => {
    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
    cy.getTableRowByText(schedule.name);
    cy.deleteAWXSchedule(schedule);
  });

  it('renders the toolbar and row actions', () => {
    cy.navigateTo('awx', 'schedules');
    cy.get('.pf-v5-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-v5-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected schedules$/).should('exist');
      cy.deleteAWXSchedule(schedule);
    });
  });

  it('deletes a schedule from the schedules list row', () => {
    cy.navigateTo('awx', 'schedules');
    cy.clickTableRowKebabAction(schedule.name, 'delete-schedule', true);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.filterTableByText(schedule.name);
    cy.contains('No results found');
  });

  it('deletes a schedule from the schedules list toolbar', () => {
    cy.navigateTo('awx', 'schedules');
    cy.getTableRowByText(schedule.name).within(() => {
      cy.get('input[aria-label="Select all rows"]').click();
    });
    cy.clickToolbarKebabAction('delete-selected-schedules');
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.contains('tr', schedule.name).should('not.exist');
    cy.clickButton(/^Clear all filters$/);
  });

  it('loads the correct options for the schedule wizard', () => {
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.get('.pf-v5-c-form__label-text').contains(/Resource type/);
  });

  it('job template renders prompt step', () => {
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
      ask_variables_on_launch: true,
    }).then((jobTemplate) => {
      cy.navigateTo('awx', 'schedules');
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('resource-type', 'Job Template');
      cy.selectDropdownOptionByResourceName('job-template-select', jobTemplate.name);
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
    });
  });

  it('workflow job template renders prompt step', () => {
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
      ask_variables_on_launch: true,
    }).then((workflowJobTemplate) => {
      cy.navigateTo('awx', 'schedules');
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('resource-type', 'Workflow Job Template');
      cy.selectDropdownOptionByResourceName('job-template-select', workflowJobTemplate.name);
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
    });
  });

  it('project does not render prompt step', () => {
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.getBy('[data-cy="resource-type-form-group"]').click();
    cy.getBy('[data-cy="project-sync"]').click();
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('management jobs does not renders prompt step', () => {
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.getBy('[data-cy="resource-type-form-group"]').click();
    cy.getBy('[data-cy="management-job"]').click();
    cy.selectDropdownOptionByResourceName(
      'management-job-template-select',
      'Cleanup Activity Stream'
    );
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('inventory source does not renders prompt step', () => {
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.getBy('[data-cy="resource-type-form-group"]').click();
    cy.getBy('[data-cy="inventory-source-sync"]').click();
    cy.selectDropdownOptionByResourceName('inventory', inventory.name);
    cy.selectDropdownOptionByResourceName('inventory-source-select', inventorySource.name);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });
});
