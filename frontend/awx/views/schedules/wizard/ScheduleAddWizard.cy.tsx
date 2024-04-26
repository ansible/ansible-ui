import { ScheduleAddWizard } from './ScheduleAddWizard';
import { awxAPI } from '../../../common/api/awx-utils';

describe('ScheduleAddWizard', () => {
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
  };
  const mockTemplates = {
    count: 1,
    results: [mockTemplate],
  };
  before(() => {
    cy.intercept({ method: 'GET', url: awxAPI`/schedules/zoneinfo` }, zones);
  });
  describe('Prompted schedule', () => {
    const mockTemplate = {
      id: 100,
      name: 'Mock Job Template',
      description: 'Job Template Description',
      type: 'job_template',
      _enabled: true,
    };
    const mockTemplates = {
      count: 1,
      results: [mockTemplate],
    };
    const mockTemplateCredential = {
      id: 200,
      name: 'Template Mock Credential',
      credential_type: 2,
    };

    beforeEach(() => {
      cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockTemplates);
      cy.intercept('/api/v2/job_templates/100/', { id: 100, name: 'Mock Job Template' });
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
      cy.mount(<ScheduleAddWizard />, {
        initialEntries: ['/schedules/add'],
        path: '/schedules/add',
      });

      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 4);
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });

      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', 'Mock Job Template');
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);

      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Prompts', 'Survey', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
    });

    it('Should not go to next step due to failed validation', () => {
      cy.mount(<ScheduleAddWizard />, {
        initialEntries: ['/schedules/add'],
        path: '/schedules/add',
      });
      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="name-form-group"]').within(() => {
        cy.get('span.pf-v5-c-helper-text__item-text').should(
          'have.text',
          'Schedule name is required.'
        );
      });
      cy.get('[data-cy="wizard-nav-item-details"]').within(() => {
        cy.get('button').should('have.attr', 'class').and('contain', 'pf-m-current');
      });
    });
  });
  describe('Rules step', () => {
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockTemplates);
      cy.intercept('/api/v2/job_templates/100/', { id: 100, name: 'Mock Job Template' });
      cy.intercept('/api/v2/job_templates/100/launch/', {});
      cy.mount(<ScheduleAddWizard />, {
        initialEntries: ['/schedules/add'],
        path: '/schedules/add',
      });

      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });

      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', 'Mock Job Template');
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
      cy.clickButton(/^Next$/);
    });
    it('Should create a very basic rule.', () => {
      cy.get('[data-cy="interval-form-group"]').type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="count-form-group"]').type('17');
      cy.get('[data-cy="add-rule-button"]').click();

      cy.get('tr[data-cy="row-id-1"]').should('be.visible');
      cy.get('[data-cy="page-title"]').should('contain.text', 'Schedule Rules');
    });
    it('Should be able to edit an existing rule without creating an additional rule', () => {
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

      cy.get('[data-cy="page-title"]').should('contain.text', 'Schedule Rules');
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('button[data-cy="edit-rule"]').click();
      });
      cy.get('[data-cy="interval"]').should('have.value', '100');
      cy.get('[data-cy="interval"]').clear().type('44400');
      cy.get('[data-cy="update-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').should('contain.text', 'INTERVAL=44400');
    });
    it('Should be able to discard editing a rule without adding 1 to the list', () => {
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

      cy.get('[data-cy="page-title"]').should('contain.text', 'Schedule Rules');
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('button[data-cy="edit-rule"]').click();
      });
      cy.get('[data-cy="interval"]').should('have.value', '100');
      cy.get('[data-cy="interval"]').clear().type('44400');
      cy.get('[data-cy="discard-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').should('not.contain.text', 'INTERVAL=44400');
      cy.get('tr[data-cy="row-id-1"]').should('contain.text', 'INTERVAL=100');
      cy.get('tbody').within(() => {
        cy.get('tr').should('have.length', 1);
      });
    });

    it('Should be able to remove an existing rule from the list', () => {
      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="count-form-group"]').type('17');
      cy.get('[data-cy="add-rule-button"]').click();
      cy.getByDataCy('add-rule-toolbar-button').click();
      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="count-form-group"]').type('27');
      cy.get('[data-cy="add-rule-button"]').click();

      cy.getByDataCy('row-id-2').within(() => {
        cy.get('button[data-cy="delete-rule"]').click();
        cy.get('tr[data-cy="row-id-2"]').should('not.exist');
      });
    });
  });

  describe('Saving a schedule', () => {
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockTemplates);
      cy.intercept('/api/v2/job_templates/100/', { id: 100, name: 'Mock Job Template' });
      cy.intercept('/api/v2/job_templates/100/launch/', {});
      cy.mount(<ScheduleAddWizard />, {
        initialEntries: ['/schedules/add'],
        path: '/schedules/add',
      });

      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });

      cy.selectDropdownOptionByResourceName('schedule_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', 'Mock Job Template');
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
      cy.clickButton(/^Next$/);
    });
  });
});
