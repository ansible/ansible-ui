import { randomString } from '../../../../framework/utils/random-string';
import { Inventory } from '../../../../frontend/awx/interfaces/Inventory';
import { InventorySource } from '../../../../frontend/awx/interfaces/InventorySource';
import { JobTemplate } from '../../../../frontend/awx/interfaces/JobTemplate';
import { Organization } from '../../../../frontend/awx/interfaces/Organization';
import { Project } from '../../../../frontend/awx/interfaces/Project';
import { Schedule } from '../../../../frontend/awx/interfaces/Schedule';
import { awxAPI } from '../../../support/formatApiPathForAwx';

describe('Schedules - Create and Delete', () => {
  describe('Schedules - Create schedule of resource type Job template', () => {
    let organization: Organization;
    let jobTemplate: JobTemplate;
    let project: Project;
    let inventory: Inventory;

    before(() => {
      cy.createAwxOrganization().then((o) => {
        organization = o;
        cy.createAwxProject(organization).then((proj) => {
          project = proj;
          cy.createAwxInventory(organization).then((i) => {
            inventory = i;
            cy.createAwxJobTemplate({
              name: 'E2E JT Schedules Create ' + randomString(4),
              organization: organization.id,
              project: project.id,
              inventory: inventory.id,
            }).then((jt) => {
              jobTemplate = jt;
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxProject(project, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can create a simple schedule of resource type Job template, navigate to schedule details, then delete the schedule from the details page', () => {
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      const scheduleName = 'E2E Simple Schedule' + randomString(4);
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', `${jobTemplate.name}`);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.singleSelectByDataCy('timezone', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.getByDataCy('interval').clear().type('100');
      cy.getByDataCy('add-rule-button').click();
      cy.getByDataCy('rrule-column-cell').then(($text) => {
        cy.wrap($text).should('contains.text', 'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU');
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

    it('can create a simple schedule of ending type COUNT', () => {
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      const scheduleName = 'E2E Schedule COUNT ' + randomString(4);
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', `${jobTemplate.name}`);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.singleSelectByDataCy('timezone', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.getByDataCy('interval').clear().type('100');
      cy.singleSelectByDataCy('endtype', 'Count');
      cy.getByDataCy('count-form-group').type('17');
      cy.getByDataCy('add-rule-button').click();
      cy.getByDataCy('rrule-column-cell').then(($text) => {
        cy.wrap($text).should('contains.text', 'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU;COUNT=17');
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

    it('can create a simple schedule of ending type UNTIL', () => {
      const d = new Date();
      const date = new Date(d.setDate(d.getDate() + 1)).toISOString().split('T')[0];
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      const scheduleName = 'E2E Schedule UNTIL ' + randomString(4);
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', `${jobTemplate.name}`);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.singleSelectByDataCy('timezone', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.selectDropdownOptionByResourceName('freq', 'Minutely');
      cy.getByDataCy('interval').clear().type('100');
      cy.singleSelectByDataCy('endtype', 'Until');
      cy.get(`[data-cy="until-form-group"] [aria-label="Date picker"]`).type(date);
      cy.getByDataCy('add-rule-button').click();
      cy.getByDataCy('rrule-column-cell').then(($text) => {
        cy.wrap($text).should(
          'contains.text',
          `RRULE:FREQ=MINUTELY;INTERVAL=100;WKST=SU;UNTIL=${date.replaceAll('-', '')}T000000`
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

    it("can't create a schedule with missing resources", () => {
      const scheduleName = 'E2E Schedule With Missing Resources' + randomString(4);
      cy.deleteAwxInventory(inventory);
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      cy.getByDataCy('create-schedule').click();
      cy.verifyPageTitle('Create schedule');
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', jobTemplate.name);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.clickButton('Next');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.getByDataCy('interval').clear().type('100');
      cy.clickButton('Save rule');
      cy.clickButton('Next');
      cy.clickButton('Next');
      cy.clickButton('Finish');
      cy.contains('Job Template inventory is missing or undefined.');
    });
  });

  describe('Schedules - Create schedule of resource type Project', () => {
    let organization: Organization;
    let project: Project;

    beforeEach(() => {
      cy.createAwxOrganization().then((org) => {
        organization = org;
        cy.createAwxProject(organization).then((proj) => {
          project = proj;
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxProject(project, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can create a simple schedule of resource type Project and then delete the schedule', () => {
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      const scheduleName = 'E2E Simple Schedule Project' + randomString(4);
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Project Sync');
      cy.selectDropdownOptionByResourceName('project', `${project.name}`);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.singleSelectByDataCy('timezone', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.getByDataCy('interval').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
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
      cy.get(`[data-cy="page-title"]`, { timeout: 60000 }).should('contain', `${scheduleName}`);
      cy.get('button[data-cy="actions-dropdown"]').click();
      cy.getBy('[data-cy="delete-schedule"]').click();
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete schedule');
    });
  });

  describe('Schedules - Create schedule of resource type Management job template', () => {
    it('can create a simple schedule of resource type Management job template, then delete the schedule', () => {
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
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
      cy.singleSelectByDataCy('timezone', 'Zulu');
      cy.getByDataCy('schedule-days-to-keep').type('33');
      cy.clickButton(/^Next$/);
      cy.getByDataCy('interval').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
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
  });

  describe('Schedules - Create schedule of resource type Inventory source', () => {
    let organization: Organization;
    let inventory: Inventory;
    let project: Project;
    let inventorySource: InventorySource;

    before(() => {
      cy.createAwxOrganization().then((o) => {
        organization = o;
        cy.createAwxProject(organization).then((proj) => {
          project = proj;
          cy.createAwxInventory(organization).then((i) => {
            inventory = i;
            cy.createAwxInventorySource(i, project).then((invSrc) => {
              inventorySource = invSrc;
            });
          });
        });
      });
    });

    after(() => {
      cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxProject(project, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can create a simple schedule of resource type Inventory source, then delete the schedule', () => {
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      const scheduleName = 'E2E Simple Schedule Inventory ' + randomString(4);
      cy.getBy('[data-cy="create-schedule"]').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Inventory source');
      cy.selectDropdownOptionByResourceName('inventory', `${inventory.name}`);
      cy.selectDropdownOptionByResourceName('inventory-source-select', `${inventorySource.name}`);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.singleSelectByDataCy('timezone', 'Zulu');
      cy.clickButton(/^Next$/);
      cy.getByDataCy('interval').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
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
      cy.verifyPageTitle(`${scheduleName}`);
      cy.get('button[data-cy="actions-dropdown"]').click();
      cy.getBy('[data-cy="delete-schedule"]').click();
      cy.clickModalConfirmCheckbox();
      cy.clickModalButton('Delete schedule');
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxInventorySource(inventorySource, { failOnStatusCode: false });
    });
  });

  describe('Schedules - Create Schedule with Prompts, Surveys and Exceptions', () => {
    const scheduleName = 'E2E Complex Schedule' + randomString(4);
    const surveyAnswer = 'E2E survey answer' + randomString(4);
    let organization: Organization;
    let jobTemplate: JobTemplate;
    let project: Project;
    let inventory: Inventory;

    beforeEach(() => {
      cy.createAwxOrganization().then((o) => {
        organization = o;
        cy.createAwxProject(organization).then((proj) => {
          project = proj;
          cy.createAwxInventory(organization).then((i) => {
            inventory = i;
            cy.createAwxJobTemplate({
              name: 'E2E Complex Job template ' + randomString(4),
              organization: organization.id,
              project: project.id,
              inventory: inventory.id,
              survey_enabled: true,
              ask_skip_tags_on_launch: true,
              ask_tags_on_launch: true,
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

              jobTemplate = jt;
              cy.createAwxSurvey(surveySpec, jobTemplate);
            });
          });
        });
      });
    });

    afterEach(() => {
      cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
      cy.deleteAwxInventory(inventory, { failOnStatusCode: false });
      cy.deleteAwxProject(project, { failOnStatusCode: false });
      cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    });

    it('can create a complex schedule and navigate to details page', () => {
      cy.navigateTo('awx', 'schedules');
      cy.verifyPageTitle('Schedules');
      cy.getByDataCy('create-schedule').click();
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', `${jobTemplate.name}`);
      cy.getByDataCy('name').type(`${scheduleName}`);
      cy.singleSelectByDataCy('timezone', 'America/Mexico_City');
      cy.clickButton(/^Next$/);

      cy.getByDataCy('wizard-nav').within(() => {
        ['Details', 'Prompts', 'Survey', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });

      //Prompts step
      cy.get('[data-cy="wizard-nav"] li').eq(1).should('contain.text', 'Prompts');
      cy.get('input[placeholder="Select or create job tags"]').type('test_job_tag');
      cy.get('[id="prompt.job_tags"]').find('button').click();
      cy.get('input[placeholder="Select or create skip tags"]').type('test_skip_tag');
      cy.get('[id="prompt.skip_tags"]').find('button').click();
      cy.clickButton(/^Next$/);

      //Survey step
      cy.get('[data-cy="wizard-nav"] li').eq(2).should('contain.text', 'Survey');
      cy.getByDataCy('survey-test').type(surveyAnswer);
      cy.clickButton(/^Next$/);

      //Rules step
      cy.get('[data-cy="wizard-nav"] li').eq(3).should('contain.text', 'Rules');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.getByDataCy('interval').clear().type('100');
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
      cy.getByDataCy('To get started, create an exception.').should('be.visible');
      cy.getByDataCy('create-exception').click();
      cy.getByDataCy('interval').clear().type('200');
      cy.selectDropdownOptionByResourceName('freq', 'Yearly');
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
      cy.getByDataCy('resource-type').contains('Job Template');
      cy.getByDataCy('name').contains(scheduleName);
      cy.getByDataCy('local-time-zone').contains('America/Mexico_City');
      cy.getByDataCy('inventory').contains(inventory.name);
      cy.getByDataCy('project').contains(project.name);
      cy.getByDataCy('code-block-value').contains(`test: ${surveyAnswer}`);
      cy.intercept('POST', awxAPI`/job_templates/*/schedules/`).as('scheduleCreated');

      cy.clickButton(/^Finish$/);
      cy.wait('@scheduleCreated')
        .then((response) => {
          expect(response?.response?.statusCode).to.eql(201);
        })
        .its('response.body')
        .then((response: Schedule) => {
          expect(response.rrule).contains('DTSTART;TZID=America/Mexico_City');
          expect(response.rrule).contains('RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU');
          expect(response.rrule).contains('EXRULE:FREQ=YEARLY;INTERVAL=200;WKST=SU');
          expect(response.skip_tags).contains('test_skip_tag');
          expect(response.enabled).to.be.true;
        });

      //Check details page
      cy.verifyPageTitle(`${scheduleName}`);
      cy.url().then((currentUrl) => {
        expect(currentUrl.includes('details')).to.be.true;
        expect(currentUrl.includes('/templates/job-template/')).to.be.true;
      });
      cy.getByDataCy('name').should('have.text', scheduleName);
      cy.getByDataCy('time-zone').should('have.text', 'America/Mexico_City');
      cy.getByDataCy('job-tags').should('have.text', 'test_job_tag');
      cy.getByDataCy('skip-tags').should('have.text', 'test_skip_tag');
      cy.getByDataCy('rruleset').contains('DTSTART;TZID=America/Mexico_City');
      cy.getByDataCy('rruleset').contains('RRULE:FREQ=HOURLY;INTERVAL=100;WKST=SU');
      cy.getByDataCy('rruleset').contains('EXRULE:FREQ=YEARLY;INTERVAL=200;WKST=SU');
      cy.getByDataCy('code-block-value').should('have.text', `test: ${surveyAnswer}`);
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
    });
  });
});

describe('Schedules - Bulk deletion', () => {
  let project: Project;
  let organization: Organization;
  const arrayOfElementText: string[] = [];

  const testSignature: string = randomString(5, undefined, { isLowercase: true });
  function generateScheduleName(): string {
    return `test-${testSignature}-schedule-${randomString(5, undefined, { isLowercase: true })}`;
  }

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject(organization).then((proj) => {
        project = proj;
        for (let i = 0; i < 5; i++) {
          const scheduleName = generateScheduleName();
          cy.createAWXSchedule({
            name: scheduleName,
            unified_job_template: project.id,
            rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
          });
          arrayOfElementText.push(scheduleName);
        }
      });
    });
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
  });

  it('user can bulk delete schedules from the Schedules list page ', () => {
    cy.intercept('DELETE', awxAPI`/schedules/*`).as('deletedSchedule');

    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
    cy.filterTableByMultiSelect('name', arrayOfElementText);
    cy.get('tbody tr').should('have.length', 5);
    cy.getByDataCy('select-all').click();
    cy.clickToolbarKebabAction('delete-schedules');
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
  let organization: Organization;
  let jobTemplate: JobTemplate;

  before(() => {
    cy.createAwxOrganization().then((org) => {
      organization = org;
      cy.createAwxProject(organization).then((proj) => {
        project = proj;
      });
    });
  });

  beforeEach(() => {
    const name = 'E2E Edit Schedule ' + randomString(4);
    cy.createAWXSchedule({
      name,
      unified_job_template: project.id,
      rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    }).then((sched: Schedule) => {
      schedule = sched;
    });
    cy.navigateTo('awx', 'schedules');
    cy.verifyPageTitle('Schedules');
  });

  after(() => {
    cy.deleteAwxProject(project, { failOnStatusCode: false });
    cy.deleteAwxOrganization(organization, { failOnStatusCode: false });
    jobTemplate?.id && cy.deleteAwxJobTemplate(jobTemplate, { failOnStatusCode: false });
  });

  afterEach(() => {
    cy.deleteAWXSchedule(schedule, { failOnStatusCode: false });
  });

  it('can edit a simple schedule from details page', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getByDataCy('name-column-cell').click();
    cy.getByDataCy('edit-schedule').click();
    cy.getByDataCy('wizard-nav').within(() => {
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
    cy.getByDataCy('description').contains('-edited');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a simple schedule from the schedules list row', () => {
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getByDataCy('edit-schedule').click();
    cy.getByDataCy('wizard-nav').within(() => {
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
    cy.getByDataCy('description').contains('-edited');
    cy.clickButton(/^Finish$/);
    cy.verifyPageTitle(schedule.name);
  });

  it('can edit a schedule to add rules with COUNT and UNTIL', () => {
    const d = new Date();
    const date = new Date(d.setDate(d.getDate() + 1)).toISOString().split('T')[0];
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getByDataCy('edit-schedule').click();
    cy.getByDataCy('wizard-nav').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.singleSelectByDataCy('timezone', 'America/Mexico_City');
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Add rule$/);
    cy.singleSelectByDataCy('endtype', 'Count');
    cy.getByDataCy('count-form-group').type('77');
    cy.clickButton(/^Save rule$/);
    cy.clickButton(/^Add rule$/);
    cy.selectDropdownOptionByResourceName('freq', 'Minutely');
    cy.singleSelectByDataCy('endtype', 'Until');
    cy.get(`[data-cy="until-form-group"] [aria-label="Date picker"]`).type(date);
    cy.clickButton(/^Save rule$/);

    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.getByDataCy('row-id-1').should('exist');
    cy.getByDataCy('row-id-2').should('exist');
    cy.getByDataCy('row-id-3').should('exist');
    cy.getByDataCy('row-id-1').contains('FREQ=WEEKLY;INTERVAL=1;WKST=MO;');
    cy.getByDataCy('row-id-2').contains('FREQ=YEARLY;INTERVAL=1;WKST=SU;COUNT=77;');
    cy.get('[data-cy="row-id-3"] > [data-cy="rrule-column-cell"]').should(
      'contains.text',
      `RRULE:FREQ=MINUTELY;INTERVAL=1;WKST=SU;UNTIL=${date.replaceAll('-', '')}T`
    );
    cy.get('[data-ouia-component-id="simple-table"]').within(() => {
      cy.getByDataCy('rules-column-header').should('be.visible').and('contain', 'Rules');
      cy.getByDataCy('rules-column-cell').should('have.descendants', 'ul');
      cy.get('tbody tr').should('have.length', 3);
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
    cy.getByDataCy('edit-schedule').click();
    cy.getByDataCy('wizard-nav').within(() => {
      ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
        cy.get('li')
          .eq(index)
          .should((el) => expect(el.text().trim()).to.equal(text));
      });
    });
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Next$/);
    cy.clickButton(/^Create exception$/);
    cy.getByDataCy('freq-form-group').click();
    cy.getByDataCy('freq').within(() => {
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
    cy.getByDataCy('edit-schedule').click();
    cy.getByDataCy('wizard-nav').within(() => {
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
      cy.getByDataCy('edit-schedule').click();
      cy.getByDataCy('wizard-nav').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.clickButton(/^Next$/);
      cy.clickButton(/^Next$/);
      cy.getBy('[data-cy="row-id-1"]').within(() => {
        cy.getByDataCy('delete-exception').click();
      });
      cy.getByDataCy('empty-state-title').contains('No exceptions yet');
      cy.getByDataCy('To get started, create an exception.').should('be.visible');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="exclusions-column-header"]').should('not.exist');
      cy.get('[data-cy="exclusions-column-cell"]').should('not.exist');
      cy.clickButton(/^Finish$/);

      cy.wait('@editedSchedule')
        .its('response.statusCode')
        .then((statusCode) => {
          expect(statusCode).to.eql(200);
        });
      cy.getByDataCy('rruleset').should('not.include.text', 'EXRULE');
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
      cy.getByDataCy('edit-schedule').click();
      cy.getByDataCy('wizard-nav').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.clickButton(/^Next$/);
      cy.getByDataCy('row-id-1').within(() => {
        cy.getByDataCy('delete-rule').click();
      });
      cy.getByDataCy('freq-form-group').click();
      cy.getByDataCy('freq').within(() => {
        cy.clickButton('Monthly');
      });
      cy.clickButton(/^Save rule$/);

      cy.clickButton(/^Next$/);
      cy.getByDataCy('row-id-1').within(() => {
        cy.getByDataCy('delete-exception').click();
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
      cy.getByDataCy('rruleset').should('not.contain', 'EXRULE');
      cy.getByDataCy('rruleset').should('not.contain', 'RRULE:FREQ=WEEKLY');
      cy.getByDataCy('rruleset').should('contain', 'RRULE:FREQ=MONTHLY;');
      cy.deleteAWXSchedule(schedToEdit, { failOnStatusCode: false });
    });
  });

  it('can toggle a schedule from the details page and confirm the change on the list view', () => {
    cy.intercept('PATCH', awxAPI`/schedules/*`).as('toggleSchedule');
    cy.filterTableBySingleSelect('name', schedule.name);
    cy.getByDataCy('name-column-cell').click();

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
      cy.getByDataCy('toggle-switch').click();
    });
    cy.get('input[aria-label="Click to enable schedule"]').should('exist');
    cy.get(`tr[data-cy="row-id-${schedule.id}"]`).within(() => {
      cy.getByDataCy('toggle-switch').click();
    });
    cy.get('input[aria-label="Click to disable schedule"]').should('exist');
  });

  it("can't edit a schedule with missing resources", () => {
    const name = 'E2E Edit Schedule With Missing Resources' + randomString(4);

    cy.createAwxInventory(organization).then((inv) => {
      cy.createAwxJobTemplate({
        name: 'E2E Job Template ' + randomString(4),
        organization: organization.id,
        project: project.id,
        inventory: inv.id,
      }).then((jt) => {
        jobTemplate = jt;
        cy.createAWXSchedule({
          name,
          unified_job_template: jt.id,
          rrule: 'DTSTART:20240415T124133Z RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
        }).then((sched: Schedule) => {
          schedule = sched;
          cy.deleteAwxInventory(inv);

          cy.navigateTo('awx', 'templates');
          cy.verifyPageTitle('Templates');
          cy.filterTableByMultiSelect('name', [jt.name]);
          cy.get('[data-cy="name-column-cell"]').within(() => {
            cy.get('a').click();
          });
          cy.verifyPageTitle(jt.name);
          cy.clickTab('Schedules', true);
          cy.get('[data-cy="create-schedule"]').should('have.attr', 'aria-disabled', 'true');
          cy.get('[data-cy="name-column-cell"]').within(() => {
            cy.get('a').click();
          });
          cy.clickLink('Edit schedule');
          cy.verifyPageTitle('Edit Schedule');
          cy.clickButton('Next');
          cy.clickButton('Next');
          cy.clickButton('Next');
          cy.clickButton('Finish');
          cy.contains('Job Template inventory is missing or undefined.');
        });
      });
    });
  });
});
