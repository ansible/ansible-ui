import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';

describe('Schedules', () => {
  let schedule: Schedule;
  let organization: Organization;
  let inventory: Inventory;
  let project: Project;
  let inventorySource: InventorySource;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(function () {
    project = this.globalProject as Project;
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxInventory({ organization: organization.id }).then((i) => {
        inventory = i;
        cy.createAwxInventorySource(i, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });
    });
    cy.navigateTo('awx', 'schedules');
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
  });

  it('renders schedules list', () => {
    cy.verifyPageTitle('Schedules');
    cy.deleteAWXSchedule(schedule);
  });

  it('renders the toolbar and row actions', () => {
    cy.get('.pf-v5-c-toolbar__group button.toggle-kebab').click();
    cy.get('.pf-v5-c-dropdown__menu').within(() => {
      cy.contains(/^Delete selected schedules$/).should('exist');
      cy.deleteAWXSchedule(schedule);
    });
  });

  it('loads the correct options for the schedule wizard', () => {
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
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
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
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Workflow job template');
      cy.selectDropdownOptionByResourceName('job-template-select', workflowJobTemplate.name);
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
    });
  });

  it('project does not renders prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.getBy('[data-cy="schedule_type-form-group"]').click();
    cy.getBy('[data-cy="project-sync"]').click();
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('management jobs does not renders prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Management job template');
    cy.selectDropdownOptionByResourceName(
      'management-job-template-select',
      'Cleanup Activity Stream'
    );
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('inventory source does not renders prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Inventory source');
    cy.selectDropdownOptionByResourceName('inventory', inventory.name);
    cy.selectDropdownOptionByResourceName('inventory-source-select', inventorySource.name);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });
});

describe('Schedules - Create', function () {
  let organization: Organization;
  let jobTemplate: JobTemplate;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  before(() => {
    cy.awxLogin();
  });
  beforeEach(function () {
    project = this.globalProject as Project;
    this.globalInventory;
    cy.createAwxOrganization().then((o) => {
      organization = o;
      cy.createAwxInventory({ organization: organization.id }).then((i) => {
        inventory = i;
        cy.createAwxInventorySource(i, project).then((invSrc) => {
          inventorySource = invSrc;
        });
      });
    });
    cy.navigateTo('awx', 'schedules');
  });

  it('can create a simple schedule and navigate to the schedule details page', () => {
    cy.createAwxJobTemplate({
      name: 'E2E Credentials ' + randomString(4),
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jt) => {
      jobTemplate = jt;
      const scheduleName = 'E2E ' + randomString(4);
      cy.getBy('[data-cy="create-schedule"]').click();

      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', `${jobTemplate.name}`);
      cy.get('[data-cy="name"]').type(`${scheduleName}`);
      cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="count-form-group"]').type('17');
      cy.get('[data-cy="add-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU'
        );
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.get('dl[data-cy="rule-1"]').should('be.visible');
      cy.clickButton(/^Finish$/);
      cy.verifyPageTitle(`${scheduleName}`);
      cy.get('button[data-cy="actions-dropdown"]').click();
      cy.getBy('[data-cy="delete-schedule"]').click();
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete schedule');
    });
  });

  it('can create a simple schedule of resource type Workflow job template', () => {
    let wfjt: WorkflowJobTemplate;
    cy.createAwxWorkflowJobTemplate({
      name: 'E2E Workflow Job Template ' + randomString(4),
      organization: organization.id,
      inventory: inventory.id,
    }).then((jt) => {
      wfjt = jt;
      const scheduleName = 'E2E ' + randomString(4);
      cy.getBy('[data-cy="create-schedule"]').click();

      cy.selectDropdownOptionByResourceName('schedule_type', 'Workflow job template');
      cy.selectDropdownOptionByResourceName('workflow-job-template-select', `${wfjt.name}`);
      cy.get('[data-cy="name"]').type(`${scheduleName}`);
      cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="count-form-group"]').type('17');
      cy.get('[data-cy="add-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU'
        );
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.get('dl[data-cy="rule-1"]').should('be.visible');
      cy.clickButton(/^Finish$/);
      cy.verifyPageTitle(`${scheduleName}`);
      cy.deleteAwxWorkflowJobTemplate(wfjt, { failOnStatusCode: false });
      cy.get('button[data-cy="actions-dropdown"]').click();
      cy.getBy('[data-cy="delete-schedule"]').click();
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete schedule');
    });
  });

  it('can create a simple schedule of resource type Inventory source', () => {
    let specificInventory: Inventory;
    let specificInventorySource: InventorySource;
    cy.createAwxInventory({ organization: organization.id }).then((i) => {
      specificInventory = i;
      cy.createAwxInventorySource(i, project).then((invSrc) => {
        specificInventorySource = invSrc;

        const scheduleName = 'E2E ' + randomString(4);
        cy.getBy('[data-cy="create-schedule"]').click();

        cy.selectDropdownOptionByResourceName('schedule_type', 'Inventory source');
        cy.selectDropdownOptionByResourceName('inventory', `${specificInventory.name}`);
        cy.selectDropdownOptionByResourceName(
          'inventory-source-select',
          `${specificInventorySource.name}`
        );
        cy.get('[data-cy="name"]').type(`${scheduleName}`);
        cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
        cy.clickButton(/^Next$/);
        cy.get('[data-cy="interval"]').clear().type('100');
        cy.selectDropdownOptionByResourceName('freq', 'Hourly');
        cy.get('[data-cy="count-form-group"]').type('17');
        cy.get('[data-cy="add-rule-button"]').click();
        cy.get('tr[data-cy="row-id-1"]').within(() => {
          cy.get('td[data-cy="rrule-column-cell"]').should(
            'contains.text',
            'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU'
          );
        });
        cy.clickButton(/^Next$/);
        cy.clickButton(/^Next$/);
        cy.get('dl[data-cy="rule-1"]').should('be.visible');
        cy.clickButton(/^Finish$/);
        cy.verifyPageTitle(`${scheduleName}`);
        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
        cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
        cy.get('button[data-cy="actions-dropdown"]').click();
        cy.getBy('[data-cy="delete-schedule"]').click();
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete schedule');
      });
    });
  });

  it('can create a simple schedule of resource type Project', () => {
    const scheduleName = 'E2E ' + randomString(4);
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Project Sync');
    cy.selectDropdownOptionByResourceName('project', `${project.name}`);
    cy.get('[data-cy="name"]').type(`${scheduleName}`);
    cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="interval"]').clear().type('100');
    cy.selectDropdownOptionByResourceName('freq', 'Hourly');
    cy.get('[data-cy="count-form-group"]').type('17');
    cy.get('[data-cy="add-rule-button"]').click();
    cy.get('tr[data-cy="row-id-1"]').within(() => {
      cy.get('td[data-cy="rrule-column-cell"]').should(
        'contains.text',
        'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU'
      );
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('dl[data-cy="rule-1"]').should('be.visible');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(`${scheduleName}`);
    cy.get('button[data-cy="actions-dropdown"]').click();
    cy.getBy('[data-cy="delete-schedule"]').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete schedule');
  });

  // We this test can we turned on after the routing issues, addressed by a different issue are fixed.
  it.skip('can create a simple schedule of resource type Management job template', () => {
    const scheduleName = 'E2E ' + randomString(4);
    cy.getBy('[data-cy="create-schedule"]').click();

    cy.selectDropdownOptionByResourceName('schedule_type', 'Management job template');
    cy.selectDropdownOptionByResourceName(
      'management-job-template-select',
      'Cleanup Activity Stream'
    );
    cy.get('[data-cy="name"]').type(`${scheduleName}`);
    cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="interval"]').clear().type('100');
    cy.selectDropdownOptionByResourceName('freq', 'Hourly');
    cy.get('[data-cy="count-form-group"]').type('17');
    cy.get('[data-cy="add-rule-button"]').click();
    cy.get('tr[data-cy="row-id-1"]').within(() => {
      cy.get('td[data-cy="rrule-column-cell"]').should(
        'contains.text',
        'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU'
      );
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('dl[data-cy="rule-1"]').should('be.visible');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(`${scheduleName}`);
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.get('button[data-cy="actions-dropdown"]').click();
    cy.getBy('[data-cy="delete-schedule"]').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete schedule');
  });

  it.skip('can create a complex schedule and navigate to details page', () => {
    //Survey, prompts, rules and exceptions should be included
  });
});

describe('Schedules - Delete', () => {
  let schedule: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
    cy.navigateTo('awx', 'schedules');
  });

  it('deletes a schedule from the schedules list row', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowKebabAction(schedule.name, 'delete-schedule', false);
    cy.get('#confirm').click();
    cy.clickButton(/^Delete schedule/);
    cy.contains(/^Success$/);
    cy.clickButton(/^Close$/);
    cy.contains('No results found');
  });

  it('deletes a schedule from the schedules list toolbar', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getTableRow('name', schedule.name, { disableFilter: true }).within(() => {
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

  it.skip('user can bulk delete schedules from the Schedules list page ', () => {
    //Make sure to assert the deletion by intercepting the Delete request
  });
});

describe('Schedules - Edit', () => {
  //Make sure to assert the deletion by intercepting the Patch request
  let schedule: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(() => {
    cy.createAWXSchedule().then((sched: Schedule) => (schedule = sched));
    cy.navigateTo('awx', 'schedules');
  });

  it('can edit a simple schedule from details page', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowLink('name', schedule.name, { disableFilter: true });
    cy.getBy('[data-cy="edit-schedule"]').click();
    cy.getByDataCy('wizard-nav').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.get('[data-cy="description"]').type('-edited');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="description"]').contains('-edited');
  });
  it('can edit a simple schedule from the schedules list row', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowAction('name', schedule.name, 'edit-schedule', { disableFilter: true });
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.getByDataCy('description').type('-edited');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="description"]').contains('-edited');
  });
  it('can edit a schedule to add rules', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowLink('name', schedule.name, { disableFilter: true });
    cy.getBy('[data-cy="edit-schedule"]').click();
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.selectSingleSelectOption('[data-cy="timezone"]', 'Africa/Abidjan');
    cy.getByDataCy('undefined-form-group').within(() => {
      cy.getBy('[aria-label="Time picker"]').click().type('{selectall} 5:00 AM');
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('start-date/time').contains('5:00 AM');
    cy.getByDataCy('rule-2').should('exist');
    cy.getByDataCy('rule-2').contains('FREQ=WEEKLY');
  });
  //Fix when exceptions step works correctly
  it.skip('can edit a schedule to add exceptions', () => {
    cy.getTableRow('name', schedule.name).within(() => {
      cy.get('[data-cy="edit-schedule"]').click();
    });
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Create exception$/);
    cy.get('[data-cy="freq-form-group"]').click();
    cy.get('[data-cy="freq"]').within(() => {
      cy.clickButton('Yearly');
    });
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('rule-2').contains('FREQ=YEARLY');
  });
  it('can edit a schedule to remove rules', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.clickTableRowLink('name', schedule.name, { disableFilter: true });
    cy.getBy('[data-cy="edit-schedule"]').click();
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.getBy('[data-cy="row-id-1"]').within(() => {
      cy.getBy('[data-cy="delete-rule"]').click();
    });
    cy.clickButton(/^Add$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('rule-1').should('not.contain', 'FREQ=DAILY');
  });
  //Fix when exceptions step works correctly
  it.skip('can edit a schedule remove exceptions', () => {});
  it('can enable a schedule', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getTableRow('name', schedule.name, { disableFilter: true }).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
      cy.get('[data-cy="toggle-switch"]').within(() => {
        cy.get('[aria-label="Click to enable schedule"]').should('exist');
      });
      cy.get('[data-cy="toggle-switch"]').click();
      cy.get('[data-cy="toggle-switch"]').within(() => {
        cy.get('[aria-label="Click to enable schedule"]').should('exist');
      });
    });
  });
  it('can disable a schedule', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getTableRow('name', schedule.name, { disableFilter: true }).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
      cy.get('[data-cy="toggle-switch"]').within(() => {
        cy.get('[aria-label="Click to enable schedule"]').should('exist');
      });
    });
  });
});
