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
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('job template renders prompt step', () => {
    //currently this test mimics a component test- it needs more of an integration/E2E scenario
    //Create a test that follows all steps necessary to create a schedule for a job template
    //Intercept the POST request when the schedule is created in order to be able to delete
    //the API object at the end of the test
    cy.createAwxJobTemplate({
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
      ask_variables_on_launch: true,
    }).then((jobTemplate) => {
      cy.navigateTo('awx', 'schedules');
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', jobTemplate.name);
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
      //cleanup schedule
      //cleanup job template
    });
  });

  it('workflow job template renders prompt step', () => {
    //currently this test mimics a component test- it needs more of an integration/E2E scenario
    //Create a test that follows all steps necessary to create a schedule for a WFJT
    //Intercept the POST request when the schedule is created in order to be able to delete
    //the API object at the end of the test
    cy.createAwxWorkflowJobTemplate({
      organization: organization.id,
      inventory: inventory.id,
      ask_variables_on_launch: true,
    }).then((workflowJobTemplate) => {
      cy.navigateTo('awx', 'schedules');
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Workflow job template');
      cy.selectDropdownOptionByResourceName('job-template-select', workflowJobTemplate.name);
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
      //cleanup schedule
      //cleanup workflow job template
    });
  });

  it('project does not render prompt step', () => {
    //currently this test mimics a component test- it needs more of an integration/E2E scenario
    //Create a test that follows all steps necessary to create a schedule for a project
    //Intercept the POST request when the schedule is created in order to be able to delete
    //the API object at the end of the test
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.getBy('[data-cy="schedule_type-form-group"]').click();
    cy.getBy('[data-cy="project-sync"]').click();
    cy.selectDropdownOptionByResourceName('project', project.name);
    cy.get('[data-cy="name"]').type('Test Schedule');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
    //cleanup schedule
  });

  it('management jobs does not render prompt step', () => {
    //currently this test mimics a component test- it needs more of an integration/E2E scenario
    //Create a test that follows all steps necessary to create a schedule for a management job
    //Intercept the POST request when the schedule is created in order to be able to delete
    //the API object at the end of the test
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Management job template');
    cy.selectDropdownOptionByResourceName(
      'management-job-template-select',
      'Cleanup Activity Stream'
    );
    cy.get('[data-cy="name"]').type('Test Schedule');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
    //cleanup schedule
  });

  it('inventory source does not render prompt step', () => {
    //Currently this test mimics a component test- it needs more of an integration/E2E scenario
    //Create a test that follows all steps necessary to create a schedule for an inventory source
    //Intercept the POST request when the schedule is created in order to be able to delete
    //the API object at the end of the test
    cy.navigateTo('awx', 'schedules');
    cy.getBy('[data-cy="create-schedule"]').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Inventory source');
    cy.selectDropdownOptionByResourceName('inventory', inventory.name);
    cy.selectDropdownOptionByResourceName('inventory-source-select', inventorySource.name);
    cy.get('[data-cy="name"]').type('Test Schedule');
    cy.clickButton(/^Next$/);
    cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Rules');
    //cleanup schedule
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
    const schedName = 'E2E ' + randomString(4);
    cy.createAWXSchedule({
      name: schedName,
      unified_job_template: (this.globalProject as Project).id,
      rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    }).then((sched: Schedule) => {
      schedule = sched;
    });
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
    cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('can create a simple schedule, navigate to schedule details, then delete the schedule from the details page', () => {
    cy.createAwxJobTemplate({
      name: 'E2E Credentials ' + randomString(4),
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jt) => {
      const scheduleName = 'E2E ' + randomString(4);
      jobTemplate = jt;
      cy.navigateTo('awx', 'schedules');
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
      cy.get('tr[data-cy="row-id-1"]').should('be.visible');
      cy.clickButton(/^Finish$/);
      cy.verifyPageTitle(`${scheduleName}`);
      cy.get('button[data-cy="actions-dropdown"]').click();
      cy.getBy('[data-cy="delete-schedule"]').click();
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete schedule');
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    });
  });

  it('can create a simple schedule of resource type Workflow job template, then delete the schedule', () => {
    let wfjt: WorkflowJobTemplate;
    cy.createAwxWorkflowJobTemplate({
      name: 'E2E Workflow Job Template ' + randomString(4),
      organization: organization.id,
      inventory: inventory.id,
    }).then((jt) => {
      wfjt = jt;
      const scheduleName = 'E2E ' + randomString(4);
      cy.navigateTo('awx', 'schedules');
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
      cy.get('tr[data-cy="row-id-1"]').should('be.visible');
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
            expect(response?.statusCode).to.eql(204);
          });
        cy.clickButton('Close');
      });
      cy.clickButton('Clear all filters');
      //the following several lines of code were taken from the lines of code contained in
      //the cy.filterTableBySingleSelect() custom command. The reason is that these commands
      //do not account for no results being returned by the API. The line below is marked
      //with a comment above it, to notate where the difference lies from the custom commands
      //to the lines of code in this test. In order to save time, a better solution was not
      //explored (yet).
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
          cy.getByDataCy('search-input').type(schedule.name);
          //The following line of code is the difference from the custom commands (see comments above)
          cy.contains('.pf-v5-c-menu__item-text', 'No results found').should('be.visible');
        });
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
        cy.navigateTo('awx', 'schedules');
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
        cy.get('tr[data-cy="row-id-1"]').should('be.visible');
        cy.clickButton(/^Finish$/);
        cy.verifyPageTitle(`${scheduleName}`);
        cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
        cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
        cy.get('button[data-cy="actions-dropdown"]').click();
        cy.getBy('[data-cy="delete-schedule"]').click();
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete schedule');
      });
      cy.deleteAwxInventory(specificInventory, { failOnStatusCode: false });
    });
  });

  it('can create a simple schedule of resource type Project, then delete the schedule', () => {
    const scheduleName = 'E2E ' + randomString(4);
    cy.navigateTo('awx', 'schedules');
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
    cy.get('tr[data-cy="row-id-1"]').should('be.visible');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(`${scheduleName}`);
    cy.get('button[data-cy="actions-dropdown"]').click();
    cy.getBy('[data-cy="delete-schedule"]').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete schedule');
  });

  //Turn this test on after the routing problems (addressed by a different issue) are fixed.
  it.skip('can create a simple schedule of resource type Management job template, then delete the schedule', () => {
    const scheduleName = 'E2E ' + randomString(4);
    cy.navigateTo('awx', 'schedules');
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
    cy.get('tr[data-cy="row-id-1"]').should('be.visible');
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
    //Assert steps and expected behavior in wizard
    //Assert info on details screen of schedule after creation
    cy.navigateTo('awx', 'schedules');
  });

  it.skip('user can bulk delete schedules from the Schedules list page ', () => {
    //Multiple schedules need to be created for this test
    //Assert the presence of the schedules before deletion
    //Make sure to assert the deletion by intercepting the Delete request
    cy.navigateTo('awx', 'schedules');
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
    });
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule);
  });

  it('can edit a simple schedule from details page', () => {
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.clickButton(/^Save rule$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('start-date/time').contains('5:00 AM');
    cy.getByDataCy('row-id-1').should('exist');
    cy.getByDataCy('row-id-1').contains('FREQ=WEEKLY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to add exceptions', () => {
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.clickButton(/^Save exception$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('row-id-1').contains('FREQ=YEARLY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to remove rules', () => {
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.clickButton(/^Save rule$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('row-id-1').should('not.contain', 'FREQ=DAILY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it.skip('can edit a schedule remove exceptions', () => {
    //come back to fix this test and unskip it
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.getByDataCy('exrule-1').should('not.contain', 'FREQ=DAILY');
  });

  it.skip('can edit a simple schedule to remove a rule and an exception', () => {
    //This test should utilize many aspects of the schedule editing wizard
    //Assertions should be made at each step of the editing wizard
    //Successful edit should be asserted by intercepting the PATCH request
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
  });

  it.skip('can toggle a schedule from the details page and confirm the change on the list view', () => {
    //Assert the state of the toggle button on the details page at first
    //Take the toggle action
    //Assert the UI behavior after the toggle is clicked
    //Assert that the schedule toggle is showing the expected state on the list view as well for that schedule
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
  });

  it('can toggle a schedule from the list view', () => {
    cy.navigateTo('awx', 'schedules');
    cy.filterTableBySingleSelect('name', schedule.name);
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
