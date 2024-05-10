import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';
import { WorkflowJobTemplate } from '../../../../frontend/awx/interfaces/WorkflowJobTemplate';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Schedules - Create and Delete', function () {
  let organization: Organization;
  let jobTemplate: JobTemplate;
  let project: Project;
  let inventory: Inventory;
  let inventorySource: InventorySource;
  let schedule: Schedule;
  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateScheduleName(): string {
    return `test-${testSignature}-schedule-${randomString(5, undefined, { isLowercase: true })}`;
  }

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
    const schedName = 'E2E Schedule' + randomString(4);
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
    cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
  });

  it('can create a simple schedule, navigate to schedule details, then delete the schedule from the details page', () => {
    cy.createAwxJobTemplate({
      name: 'E2E Credentials ' + randomString(4),
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
    }).then((jt) => {
      const scheduleName = 'E2E Simple Schedule' + randomString(4);
      jobTemplate = jt;
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
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
      const scheduleName = 'E2E Simple Schedule WFJT' + randomString(4);
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
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
      cy.filterTableBySingleSelect('name', scheduleName);
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
          cy.getByDataCy('search-input').type(scheduleName);
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
        const scheduleName = 'E2E Simple Schedule Inventory ' + randomString(4);
        cy.navigateTo('awx', 'schedules');
        cy.verifyPageTitle('Schedules');
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
        cy.deleteAwxInventory(specificInventory, { failOnStatusCode: false });
        cy.deleteAwxInventorySource(specificInventorySource, { failOnStatusCode: false });
        cy.get('button[data-cy="actions-dropdown"]').click();
        cy.getBy('[data-cy="delete-schedule"]').click();
        cy.clickModalConfirmCheckbox();
        cy.clickModalButton('Delete schedule');
      });
    });
  });

  it('can create a simple schedule of resource type Project, then delete the schedule', () => {
    const scheduleName = 'E2E Simple Schedule Project' + randomString(4);
    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
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

  it('can create a simple schedule of resource type Management job template, then delete the schedule', () => {
    const scheduleName = 'E2E Simple Schedule MJT' + randomString(4);
    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
    cy.getByDataCy('create-schedule').click();
    cy.selectDropdownOptionByResourceName('schedule_type', 'Management job template');
    cy.selectDropdownOptionByResourceName(
      'management-job-template-select',
      'Cleanup Activity Stream'
    );
    cy.getByDataCy('name').type(`${scheduleName}`);
    cy.getByDataCy('description').type(`description ${scheduleName}`);
    cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
    cy.getByDataCy('schedule-days-to-keep').type('33');
    cy.clickButton(/^Next$/);
    cy.getByDataCy('interval').clear().type('100');
    cy.selectDropdownOptionByResourceName('freq', 'Hourly');
    cy.getByDataCy('count-form-group').type('17');
    cy.getByDataCy('add-rule-button').click();
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

    //Check details page
    cy.verifyPageTitle(`${scheduleName}`);
    cy.url().then((currentUrl) => {
      expect(currentUrl.includes('details')).to.be.true;
      expect(currentUrl.includes('administration/management-jobs')).to.be.true;
    });
    cy.getByDataCy('name').should('have.text', scheduleName);
    cy.getByDataCy('description').should('have.text', `description ${scheduleName}`);
    cy.getByDataCy('time-zone').should('have.text', 'Etc/Zulu');
    cy.getByDataCy('days-of-data-to-keep').should('have.text', '33');

    cy.get('button[data-cy="actions-dropdown"]').click();
    cy.getByDataCy('delete-schedule').click();
    cy.clickModalConfirmCheckbox();
    cy.clickModalButton('Delete schedule');
  });

  it('can create a complex schedule and navigate to details page', () => {
    cy.createAwxJobTemplate({
      name: 'E2E Complex Job template ' + randomString(4),
      organization: organization.id,
      project: project.id,
      inventory: inventory.id,
      survey_enabled: true,
      ask_skip_tags_on_launch: true,
      ask_forks_on_launch: true,
    }).then((jt) => {
      const surveySpec = {
        name: '',
        description: '',
        spec: [
          {
            max: 1024,
            min: 0,
            new_question: true,
            type: 'text',
            default: '',
            required: true,
            variable: 'test',
            question_name: 'var1',
            question_description: '',
            choices: [],
          },
        ],
      };

      const scheduleName = 'E2E Complex Schedule' + randomString(4);
      const surveyAnswer = 'E2E survey answer' + randomString(4);

      jobTemplate = jt;
      cy.createAwxSurvey(surveySpec, jobTemplate);
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      cy.getByDataCy('create-schedule').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', `${jobTemplate.name}`);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.selectSingleSelectOption('[data-cy="timezone"]', 'America/Mexico_City');
      cy.clickButton(/^Next$/);

      //Prompts step
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
      cy.get('[data-cy="forks"]').type('{selectAll}13', { force: true, delay: 1000 });
      cy.get('input[placeholder="Select or create skip tags"]').type('test_skip_tag');
      cy.get('[id="prompt.skip_tags"]').find('button').click();
      cy.clickButton(/^Next$/);

      //Survey step
      cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Survey');
      cy.getByDataCy('survey-test').type(surveyAnswer);
      cy.clickButton(/^Next$/);

      //Rules step
      cy.get('[data-cy="wizard-nav"] li').eq(3).should('contain.text', 'Rules');
      cy.getByDataCy('interval').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.getByDataCy('count-form-group').type('17');
      cy.getByDataCy('add-rule-button').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU'
        );
      });
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.getByDataCy('rules-column-header').should('be.visible').and('contain', 'Rules');
        cy.getByDataCy('rules-column-cell').should('have.descendants', 'ul');
        cy.get('tbody tr').should('have.length', 1);
      });
      cy.clickButton(/^Next$/);

      //Exception step
      cy.get('[data-cy="wizard-nav"] li').eq(4).should('contain.text', 'Exceptions');
      cy.getByDataCy('page-title').contains('Schedule Exceptions');
      cy.getByDataCy('empty-state-title').contains('No exceptions yet');
      cy.get('[data-cy="To get started, create an exception."]').should('be.visible');
      cy.getByDataCy('create-exception').click();
      cy.getByDataCy('interval').clear().type('200');
      cy.selectDropdownOptionByResourceName('freq', 'Yearly');
      cy.getByDataCy('count-form-group').type('27');
      cy.getByDataCy('add-rule-button').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=YEARLY;INTERVAL=200;WKST=SU'
        );
      });
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.getByDataCy('exceptions-column-header')
          .should('be.visible')
          .and('contain', 'Exceptions');
        cy.getByDataCy('exceptions-column-cell').should('have.descendants', 'ul');
        cy.get('tbody tr').should('have.length', 1);
      });
      cy.clickButton(/^Next$/);

      //Review step
      cy.get('[data-cy="wizard-nav"] li').eq(5).should('contain.text', 'Review');
      cy.get('[data-cy="resource-type"]').contains('Job Template');
      cy.get('[data-cy="name"]').contains(scheduleName);
      cy.getByDataCy('forks').should('have.text', '13');
      cy.get('[data-cy="local-time-zone"]').contains('America/Mexico_City');
      cy.get('[data-cy="organization"]').contains('Global Organization');
      cy.get('[data-cy="inventory"]').contains(inventory.name);
      cy.get('[data-cy="project"]').contains('Global Project');
      cy.get('[data-cy="code-block-value"]').contains(`test: ${surveyAnswer}`);
      cy.intercept('POST', awxAPI`/job_templates/*/schedules/`).as('scheduleCreated');

      cy.clickButton(/^Finish$/);
      cy.wait('@scheduleCreated')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((response: Schedule) => {
          expect(response.rrule).contains('DTSTART;TZID=America/Mexico_City');
          expect(response.rrule).contains('RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU;COUNT=17');
          expect(response.rrule).contains('EXRULE:FREQ=YEARLY;INTERVAL=200;WKST=SU;COUNT=27');
          expect(response.skip_tags).contains('test_skip_tag');
          expect(response.enabled).to.be.true;
        });

      //Check details page
      cy.verifyPageTitle(`${scheduleName}`);
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes('/templates/job_template/')).to.be.true;
      });
      cy.getByDataCy('name').should('have.text', scheduleName);
      cy.getByDataCy('time-zone').should('have.text', 'America/Mexico_City');
      cy.getByDataCy('forks').should('have.text', '13');
      cy.getByDataCy('skip-tags').should('have.text', 'test_skip_tag');
      cy.getByDataCy('rruleset').contains('DTSTART;TZID=America/Mexico_City');
      cy.getByDataCy('rruleset').contains('RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU;COUNT=17');
      cy.getByDataCy('rruleset').contains('EXRULE:FREQ=YEARLY;INTERVAL=200;WKST=SU;COUNT=27');
      cy.getByDataCy('code-block-value').should('have.text', `{"test":"${surveyAnswer}"}`);
      cy.get('[data-ouia-component-id="simple-table"]')
        .first()
        .scrollIntoView()
        .within(() => {
          cy.getByDataCy('rules-column-header').should('be.visible').and('contain', 'Rules');
          cy.getByDataCy('rules-column-cell').should('have.descendants', 'ul');
          cy.get('tbody tr').should('have.length', 1);
        });

      cy.get('[data-ouia-component-id="simple-table"]')
        .last()
        .scrollIntoView()
        .within(() => {
          cy.getByDataCy('exceptions-column-header')
            .should('be.visible')
            .and('contain', 'Exceptions');
          cy.getByDataCy('exceptions-column-cell').should('have.descendants', 'ul');
          cy.get('tbody tr').should('have.length', 1);
        });
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
    });
  });

  it('user can bulk delete schedules from the Schedules list page ', () => {
    cy.intercept('DELETE', awxAPI`/schedules/*`).as('deletedSchedule');

    const arrayOfElementText = [];
    for (let i = 0; i < 5; i++) {
      const scheduleName = generateScheduleName();
      cy.createAWXSchedule({
        name: scheduleName,
        unified_job_template: project.id,
        rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
      });
      arrayOfElementText.push(scheduleName);
    }
    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
    cy.filterTableByMultiSelect('name', arrayOfElementText);
    cy.get('tbody tr').should('have.length', 5);
    cy.getByDataCy('select-all').click();
    cy.clickToolbarKebabAction('delete-selected-schedules');
    cy.get('[data-ouia-component-type="PF5/ModalContent"]').within(() => {
      cy.get('header').contains('Permanently delete schedule');
      cy.get('button').contains('Delete schedule').should('have.attr', 'aria-disabled', 'true');
      cy.get('input[id="confirm"]').click();
      cy.get('button').contains('Delete schedule').click();
    });
    cy.wait('@deletedSchedule')
      .its('response')
      .then((response) => {
        expect(response?.statusCode).to.eql(204);
      });
  });
});

describe('Schedules - Edit', () => {
  let schedule: Schedule;
  let project: Project;

  before(() => {
    cy.awxLogin();
  });

  beforeEach(function () {
    project = this.globalProject as Project;
    const name = 'E2E Edit Schedule ' + randomString(4);

    cy.createAWXSchedule({
      name,
      unified_job_template: (this.globalProject as Project).id,
      rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    }).then((sched: Schedule) => {
      schedule = sched;
    });
    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
  });

  it('can edit a simple schedule from details page', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.get('[data-cy="name-column-cell"]').click();
    cy.getByDataCy('edit-schedule').click();
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
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getBy('[data-cy="edit-schedule"]').click();
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
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getBy('[data-cy="edit-schedule"]').click();
    cy.get('[data-cy="wizard-nav"]').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.selectSingleSelectOption('[data-cy="timezone"]', 'America/Mexico_City');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.clickButton(/^Save rule$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('row-id-1').should('exist');
    cy.getByDataCy('row-id-1').contains('FREQ=WEEKLY');
    cy.get('[data-ouia-component-id="simple-table"]').within(() => {
      cy.getByDataCy('rules-column-header').should('be.visible').and('contain', 'Rules');
      cy.getByDataCy('rules-column-cell').should('have.descendants', 'ul');
      cy.get('tbody tr').should('have.length', 2);
    });
    cy.intercept('PATCH', awxAPI`/schedules/*`).as('editedSchedule');
    cy.clickButton(/^Finish$/);

    cy.wait('@editedSchedule')
      .its('response.statusCode')
      .then((statusCode) => {
        expect(statusCode).to.eql(200);
      });
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to add exceptions', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.filterTableBySingleSelect('name', schedule.name);
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
    cy.clickButton(/^Save rule$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('row-id-1').should('not.contain', 'FREQ=DAILY');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule remove exceptions from row action', () => {
    cy.intercept('PATCH', awxAPI`/schedules/*`).as('editedSchedule');

    let schedToEdit: Schedule;
    cy.createAWXSchedule({
      name: 'E2E Edit Remove Exception' + randomString(4),
      unified_job_template: project.id,
      rrule:
        'DTSTART;TZID=America/New_York:20250430T171500 RRULE:FREQ=YEARLY;INTERVAL=1;WKST=SU;BYMONTH=4;BYMONTHDAY=30;BYHOUR=11;BYMINUTE=15;BYSECOND=0 EXRULE:FREQ=WEEKLY;INTERVAL=50;WKST=TU;BYDAY=WE;BYHOUR=11;BYMINUTE=15;BYSECOND=0',
    }).then((sched: Schedule) => {
      schedToEdit = sched;
      cy.filterTableBySingleSelect('name', schedToEdit.name);
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
      cy.getBy('[data-cy="row-id-1"]').within(() => {
        cy.getBy('[data-cy="delete-exception"]').click();
      });
      cy.getByDataCy('empty-state-title').contains('No exceptions yet');
      cy.get('[data-cy="To get started, create an exception."]').should('be.visible');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="exclusions-column-header"]').should('not.exist');
      cy.get('[data-cy="exclusions-column-cell"]').should('not.exist');
      cy.clickButton(/^Finish$/);

      cy.wait('@editedSchedule')
        .its('response.statusCode')
        .then((statusCode) => {
          expect(statusCode).to.eql(200);
        });

      cy.intercept('GET', awxAPI`/schedules/${schedToEdit.id.toString()}/`).as('getEditedSchedule');
      cy.wait('@getEditedSchedule')
        .its('response.body.rrule')
        .then((rrule: string) => {
          expect(rrule).not.contains('EXRULE');
        });
      cy.deleteAWXSchedule(schedToEdit, { failOnStatusCode: false });
    });
  });

  it('can edit a simple schedule to remove a rule and an exception', () => {
    let schedToEdit: Schedule;
    cy.createAWXSchedule({
      name: 'E2E Edit Remove Exception' + randomString(4),
      unified_job_template: project.id,
      rrule:
        'DTSTART;TZID=Etc/Zulu:20240507T230000 RRULE:FREQ=WEEKLY;INTERVAL=1;WKST=SU;BYDAY=TU;BYHOUR=17;BYMINUTE=0;BYSECOND=0 EXRULE:FREQ=YEARLY;INTERVAL=1;WKST=SU;BYMONTH=5;BYMONTHDAY=7;BYHOUR=17;BYMINUTE=0;BYSECOND=0',
    }).then((sched: Schedule) => {
      schedToEdit = sched;
      cy.filterTableBySingleSelect('name', schedToEdit.name);
      cy.getBy('[data-cy="edit-schedule"]').click();
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.clickButton(/^Next$/);
      cy.getBy('[data-cy="row-id-1"]').within(() => {
        cy.getBy('[data-cy="delete-rule"]').click();
      });
      cy.get('[data-cy="freq-form-group"]').click();
      cy.get('[data-cy="freq"]').within(() => {
        cy.clickButton('Monthly');
      });
      cy.clickButton(/^Save rule$/);

      cy.clickButton(/^Next$/);
      cy.getBy('[data-cy="row-id-1"]').within(() => {
        cy.getBy('[data-cy="delete-exception"]').click();
      });
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="row-id-1"] > [data-cy="rrule-column-cell"]').should(
        'not.contain',
        'RRULE:FREQ=WEEKLY'
      );
      cy.get('[data-cy="row-id-1"] > [data-cy="rrule-column-cell"]').should(
        'contain',
        'RRULE:FREQ=MONTHLY'
      );
      cy.get('[data-ouia-component-id="simple-table"]').within(() => {
        cy.get('[data-cy="exceptions-column-header"]').should('not.exist');
        cy.get('tbody tr').should('have.length', 1);
      });
      cy.intercept('PATCH', awxAPI`/schedules/*`).as('editedSchedule');
      cy.clickButton(/^Finish$/);

      cy.wait('@editedSchedule')
        .its('response.statusCode')
        .then((statusCode) => {
          expect(statusCode).to.eql(200);
        });

      cy.intercept('GET', awxAPI`/schedules/*/`).as('getEditedSchedule');
      cy.wait('@getEditedSchedule')
        .its('response.body.rrule')
        .then((rrule: string) => {
          expect(rrule).not.contains('EXRULE');
          expect(rrule).not.contains('RRULE:FREQ=WEEKLY');
          expect(rrule).contains('RRULE:FREQ=MONTHLY');
        });
      cy.deleteAWXSchedule(schedToEdit, { failOnStatusCode: false });
    });
  });

  it('can toggle a schedule from the details page and confirm the change on the list view', () => {
    cy.intercept('PATCH', awxAPI`/schedules/*`).as('toggleSchedule');
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.get('[data-cy="name-column-cell"]').click();

    cy.get('input[aria-label="Click to disable schedule"]').should('exist');
    cy.getByDataCy('toggle-switch').should('be.visible').click();
    cy.wait('@toggleSchedule')
      .its('response.body.enabled')
      .then((enabled: string) => {
        expect(enabled).to.be.false;
      });
    cy.get('input[aria-label="Click to enable schedule"]').should('exist');

    cy.getByDataCy('toggle-switch').should('be.visible').click();
    cy.wait('@toggleSchedule')
      .its('response.body.enabled')
      .then((enabled: string) => {
        expect(enabled).to.be.true;
      });
    cy.get('input[aria-label="Click to disable schedule"]').should('exist');
  });

  it('can toggle a schedule from the list view', () => {
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
