import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleEditWizard } from './ScheduleEditWizard';

const zones = {
  zones: [
    'America/Argentina/Buenos_Aires',
    'America/Argentina/Catamarca',
    'Etc/GMT+0',
    'Etc/GMT+2',
    'WET',
    'Zulu',
  ],
  links: {
    'America/Buenos_Aires': 'America/Argentina/Buenos_Aires',
    'America/Argentina/ComodRivadavia': 'America/Argentina/Catamarca',
    'America/Catamarca': 'America/Argentina/Catamarca',
    'Etc/GMT+0': 'GMT-0',
  },
};
const mockTemplate = {
  id: 100,
  name: 'Mock Job Template',
  description: 'Job Template Description',
  unified_job_type: 'job',
  _enabled: true,
};
const mockTemplates = {
  count: 1,
  results: [mockTemplate],
};
describe('ScheduleEditWizard', () => {
  before(() => {
    cy.intercept({ method: 'GET', url: awxAPI`/schedules/zoneinfo` }, zones);
  });
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockTemplates);
    cy.intercept('/api/v2/schedules/1/', {
      rrule:
        'DTSTART;TZID=America/Los_Angeles:20240411T104500 RRULE:INTERVAL=1;FREQ=HOURLY RRULE:INTERVAL=1;FREQ=DAILY;COUNT=225',
      id: 1,
      type: 'schedule',
      summary_fields: {
        unified_job_template: {
          id: 100,
          name: 'Mock Job Template',
        },
        user_capabilities: {
          edit: true,
          delete: true,
        },
      },
      name: 'Test Schedule',
      description: 'Automatically Generated Schedule',
      extra_data: {
        days: '120',
      },
      unified_job_template: 100,
      enabled: true,
      dtstart: '2024-04-14T15:50:01Z',
      next_run: '2024-04-14T15:50:01Z',
      timezone: 'UTC',
      related: {
        unified_job_template: '/api/v2/job_templates/100/',
      },
    });
  });
  describe('Prompted schedule', () => {
    const mockTemplateCredential = {
      id: 200,
      name: 'Template Mock Credential',
      credential_type: 2,
    };

    beforeEach(() => {
      cy.intercept('/api/v2/job_templates/100/', {
        id: 100,
        name: 'Mock Job Template',
        launch: {
          ask_credential_on_launch: true,
          survey_enabled: true,
        },
        type: 'job_template',
      });
      cy.intercept('/api/v2/job_templates/100/launch/', {
        ask_credential_on_launch: true,
        survey_enabled: true,
        defaults: {
          credentials: [
            {
              id: 200,
              name: 'Mock Credential',
              credential_type: 2,
            },
          ],
          job_tags: '',
          skip_tags: '',
        },
      });
      cy.intercept('/api/v2/job_templates/100/credentials/', {
        count: 1,
        results: [mockTemplateCredential],
      });
    });

    it('Should render the correct steps on initial ', () => {
      cy.mount(<ScheduleEditWizard resourceEndPoint={awxAPI`/job_templates/`} />, {
        initialEntries: ['/templates/job-template/7/schedules/1/edit'],
        path: '/templates/job-template/:id/schedules/:schedule_id/edit',
      });

      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 4);
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
    });

    it('Should not go to next step due to failed validation', () => {
      cy.mount(<ScheduleEditWizard resourceEndPoint={awxAPI`/job_templates/`} />, {
        initialEntries: ['/templates/job-template/7/schedules/1/edit'],
        path: '/templates/job-template/:id/schedules/:schedule_id/edit',
      });

      cy.get('[data-cy="name"]').clear();
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="name-form-group"]').within(() => {
        cy.get('span.pf-v5-c-helper-text__item-text').should(
          'have.text',
          'Schedule name is required.'
        );
      });
    });
  });
  describe('Rules step', () => {
    beforeEach(() => {
      cy.intercept('/api/v2/job_templates/100/', { id: 100, name: 'Mock Job Template' });
      cy.intercept('/api/v2/job_templates/100/launch/', {});
      cy.mount(<ScheduleEditWizard resourceEndPoint={awxAPI`/job_templates/`} />, {
        initialEntries: ['/templates/job-template/7/schedules/1/edit'],
        path: '/templates/job-template/:id/schedules/:schedule_id/edit',
      });

      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });

      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
      cy.clickButton(/^Next$/);
    });
    it('Should update a basic rule.', () => {
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('button[data-cy="edit-rule"]').click();
      });
      cy.get('[data-cy="interval-form-group"]').type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="update-rule-button"]').click();

      cy.get('tr[data-cy="row-id-1"]').should('be.visible');
      cy.get('[data-cy="page-title"]').should('contain.text', 'Rules');
    });
    it('Should be able to edit an existing rule without creating an additional rule', () => {
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('button[data-cy="edit-rule"]').click();
      });
      cy.get('[data-cy="interval"]').clear().type('1');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="update-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=HOURLY;INTERVAL=1;WKST=MO'
        );
      });

      cy.get('[data-cy="page-title"]').should('contain.text', 'Rules');
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('button[data-cy="edit-rule"]').click();
      });
      cy.get('[data-cy="interval"]').should('have.value', '1');
      cy.get('[data-cy="interval"]').clear().type('44400');
      cy.get('[data-cy="update-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').should('contain.text', 'INTERVAL=44400');
    });
    it('Should be able to discard editing a rule without adding 1 to the list', () => {
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('button[data-cy="edit-rule"]').click();
      });
      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="update-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=HOURLY;INTERVAL=100;WKST=MO'
        );
      });

      cy.get('[data-cy="page-title"]').should('contain.text', 'Rules');
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('button[data-cy="edit-rule"]').click();
      });
      cy.get('[data-cy="interval"]').should('have.value', '100');
      cy.get('[data-cy="interval"]').clear().type('44400');
      cy.get('[data-cy="discard-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').should('not.contain.text', 'INTERVAL=44400');
      cy.get('tr[data-cy="row-id-1"]').should('contain.text', 'INTERVAL=100');
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 2);
      });
    });
    it('Should be able to remove an existing rule from the list', () => {
      cy.getByDataCy('row-id-2').within(() => {
        cy.get('button[data-cy="delete-rule"]').click();
        cy.get('tr[data-cy="row-id-2"]').should('not.exist');
      });
    });
    it('Should be able to add rules while editing a schedule.', () => {
      cy.mount(<ScheduleEditWizard resourceEndPoint={awxAPI`/job_templates/`} />, {
        initialEntries: ['/templates/job-template/7/schedules/1/edit'],
        path: '/templates/job-template/:id/schedules/:schedule_id/edit',
      });

      cy.clickButton(/^Next$/);
      cy.clickButton(/^Add rule$/);
      cy.clickButton(/^Save rule$/);
      cy.getByDataCy('row-id-2').within(() => {
        cy.get('button[data-cy="delete-rule"]').click();
        cy.get('tr[data-cy="row-id-2"]').should('not.exist');
      });
      cy.clickButton(/^Add rule$/);
      cy.clickButton(/^Save rule$/);
      cy.get('tbody[role="rowgroup"]').within(() => {
        cy.get('tr').should('have.length', 3);
      });
    });
  });
});
