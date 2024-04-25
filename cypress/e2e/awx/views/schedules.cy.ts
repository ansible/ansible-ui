import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';

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
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);

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
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);

      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
    });
  });

  it('project does not render prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.getBy('[data-cy="schedule_type-form-group"]').click();
    cy.getBy('[data-cy="project-sync"]').click();
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.get('[data-cy="name"]').type('Test Schedule');
    cy.clickButton(/^Next$/);

    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('management jobs does not render prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Management job template');
    cy.selectDropdownOptionByResourceName(
      'management-job-template-select',
      'Cleanup Activity Stream'
    );
    cy.get('[data-cy="name"]').type('Test Schedule');
    cy.clickButton(/^Next$/);

    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });

  it('inventory source does not render prompt step', () => {
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Inventory source');
    cy.selectDropdownOptionByResourceName('inventory', inventory.name);
    cy.selectDropdownOptionByResourceName('inventory-source-select', inventorySource.name);
    cy.get('[data-cy="name"]').type('Test Schedule');
    cy.clickButton(/^Next$/);

    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
  });
});

describe('Schedules - Create and Delete', function () {
  let organization: Organization;
  let jobTemplate: JobTemplate;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let schedule: Schedule;

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

    const name = 'E2E' + randomString(4);
    cy.createAWXSchedule({
      name,
      unified_job_template: (this.globalProject as Project).id,
      rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    }).then((sched: Schedule) => {
      schedule = sched;
    });

    cy.navigateTo('awx', 'schedules');
  });

  it('can create a simple schedule, navigate to schedule details, then delete the schedule from the details page', () => {
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

  it.only('can create a simple schedule of resource type Workflow job template, then delete the schedule', () => {
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
      cy.navigateTo('awx', 'schedules');
      cy.filterTableBySingleSelect('name', schedule.name);
      cy.getBy('tbody').within(() => {
        cy.clickKebabAction('actions-dropdown', 'delete-schedule');
      });
      cy.intercept('DELETE', awxAPI`/schedules/*`).as('deleted');
      cy.getModal().within(() => {
        cy.getBy('input[id="confirm"]').click();
        cy.getBy('[data-ouia-component-id="submit"]').click();
        cy.wait('@deleted')
          .its('response')
          .then((response) => {
            expect(response.statusCode).to.eql(204);
          });
        cy.clickButton('Close');
      });
      cy.clickButton('Clear all filters');
      //figure out a way to search for something that doesn't exist and assert empty state
      // cy.filterTableBySingleSelect('name', schedule.name);
      cy.deleteAwxWorkflowJobTemplate(wfjt, { failOnStatusCode: false });
    });
  });

  it('can create a simple schedule of resource type Inventory source, then delete the schedule', () => {
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

  it('can create a simple schedule of resource type Project, then delete the schedule', () => {
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
  it.skip('can create a simple schedule of resource type Management job template, then delete the schedule', () => {
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

  it.skip('user can bulk delete schedules from the Schedules list page ', () => {
    //Make sure to assert the deletion by intercepting the Delete request
  });
});

describe('Schedules - Edit', () => {
  let schedule: Schedule;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(function () {
    const name = 'E2E' + randomString(4);
    cy.createAWXSchedule({
      name,
      unified_job_template: (this.globalProject as Project).id,
      rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    }).then((sched: Schedule) => {
      schedule = sched;

      cy.navigateTo('awx', 'schedules');
      cy.filterTableBySingleSelect('name', schedule.name);
    });
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule);
  });

  it('can edit a simple schedule from details page', () => {
    cy.get('[data-cy="name-column-cell"]').click();
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
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
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a simple schedule from the schedules list row', () => {
    cy.get('[data-cy="name-column-cell"]').click();
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
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
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to add rules', () => {
    cy.get('[data-cy="name-column-cell"]').click();
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
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
    cy.getByDataCy('rule-2').contains('FREQ=YEARLY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to add exceptions', () => {
    cy.get('[data-cy="name-column-cell"]').click();
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);

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
    cy.getByDataCy('exception-1').contains('FREQ=YEARLY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to remove rules', () => {
    cy.get('[data-cy="name-column-cell"]').click();
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
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
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it.skip('can edit a schedule remove exceptions', () => {
    //come back to fix this test and unskip it
    cy.get('[data-cy="name-column-cell"]').click();
    cy.clickTableRowPinnedAction(schedule.name, 'edit-schedule', false);
    cy.getBy('[data-cy="edit-schedule"]').click();
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add exception$/);
    cy.clickButton(/^Add$/);
    cy.getBy('[data-cy="row-id-1"]').within(() => {
      cy.getBy('[data-cy="delete-exception"]').click();
    });
    cy.clickButton(/^Next$/);
    cy.getByDataCy('exception-1').should('not.contain', 'FREQ=DAILY');
  });

  it.skip('can edit a simple schedule to remove a rule and an exception', () => {
    //This test should utilize many aspects of the schedule editing wizard
    //Assertions should be made at each step of the editing wizard
    //Successful edit should be asserted by intercepting the PATCH request
  });

  it.skip('can toggle a schedule from the details page and confirm the change on the list view', () => {
    //Assert the state of the toggle button on the details page at first
    //Take the toggle action
    //Assert the UI behavior after the toggle is clicked
    //Assert that the schedule toggle is showing the expected state on the list view as well for that schedule
  });

  it('can toggle a schedule from the list view', () => {
    cy.get(`tr[data-cy="row-id-${schedule.id}"]`).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
    });
    cy.get('input[aria-label="Click to enable schedule"]').should('exist');
    cy.get(`tr[data-cy="row-id-${schedule.id}"]`).within(() => {
      cy.get('[data-cy="toggle-switch"]').click();
    });
    cy.get('input[aria-label="Click to disable schedule"]').should('exist');
  });
});
