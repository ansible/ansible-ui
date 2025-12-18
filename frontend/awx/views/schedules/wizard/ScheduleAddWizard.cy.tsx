import { awxAPI } from '../../../common/api/awx-utils';
import { ScheduleAddWizard } from './ScheduleAddWizard';

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
    id: 266,
    name: 'Mock Job Template',
    description: 'Job Template Description',
    type: 'job_template',
    _enabled: false,
    ask_credential_on_launch: true,
    ask_inventory_on_launch: false,
    summary_fields: {
      project: { id: 1, name: 'mock project' },
      inventory: { id: 1, name: 'mock inventory' },
    },
    credentials: [],
    unified_job_type: 'job',
  };
  const mockTemplates = {
    count: 1,
    results: [mockTemplate],
  };
  const launchConfig = {
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
  };
  const mockTemplateCredential = {
    id: 200,
    name: 'Template Mock Credential',
    credential_type: 2,
  };

  describe('Prompted schedule', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/credentials/*` },
        { fixture: 'credentials.json' }
      );
      cy.intercept(
        { method: 'GET', url: awxAPI`/credential_types/*` },
        { fixture: 'credentialTypes.json' }
      );
    });

    it('job template should render the correct steps initially', () => {
      cy.intercept(awxAPI`/job_templates/266/`, mockTemplate);
      cy.intercept(awxAPI`/job_templates/*/launch/`, launchConfig);
      cy.intercept(awxAPI`/job_templates/*/credentials/`, {
        count: 1,
        results: [mockTemplateCredential],
      });
      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/job_templates/`} />, {
        initialEntries: ['/templates/job-templates/266/schedules/create'],
        path: '/templates/job-templates/:id/schedules/create',
      });
      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 4);
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
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

    it('should show error if typo is found in variables field', () => {
      cy.intercept(awxAPI`/job_templates/266/`, mockTemplate);
      cy.intercept(awxAPI`/job_templates/*/launch/`, {
        ...launchConfig,
        ask_variables_on_launch: true,
        survey_enabled: false,
      });
      cy.intercept(awxAPI`/job_templates/*/credentials/`, {
        count: 1,
        results: [mockTemplateCredential],
      });
      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/job_templates/`} />, {
        initialEntries: ['/templates/job-templates/266/schedules/create'],
        path: '/templates/job-templates/:id/schedules/create',
      });

      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);
      cy.getBy('[data-cy="prompt-extra-vars"]').type('foo:bar');
      cy.clickButton(/^Next$/);
      cy.get('.pf-v6-c-helper-text__item-text').contains('yaml is not in object format');
    });

    it('workflow job template should render the correct steps initially', () => {
      cy.intercept(awxAPI`/workflow_job_templates/*/credentials/`, {
        count: 1,
        results: [mockTemplateCredential],
      });
      cy.intercept(awxAPI`/workflow_job_templates/*`, {
        ...mockTemplate,
        type: 'workflow_job_template',
      });
      cy.intercept(awxAPI`/workflow_job_templates/*/launch/`, launchConfig);
      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/workflow_job_templates/`} />, {
        initialEntries: ['/templates/workflow-job-templates/266/schedules/create'],
        path: '/templates/workflow-job-templates/:id/schedules/create',
      });
      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 4);
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
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

    it('project does not render prompt and survey steps', () => {
      cy.intercept(
        { method: 'GET', url: awxAPI`/projects/*` },
        {
          id: 100,
          name: 'Mock Project',
          description: 'Project Description',
          type: 'project',
        }
      );
      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/projects/`} />, {
        initialEntries: ['/projects/6/schedules/create'],
        path: '/projects/:id/schedules/create',
      });
      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 4);
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
    });

    it('management job does not render prompt and survey steps', () => {
      cy.intercept(
        { method: 'GET', url: awxAPI`/system_job_templates/*/` },
        {
          id: 1,
          type: 'system_job_template',
          name: 'Cleanup Job Details',
          job_type: 'cleanup_jobs',
        }
      );
      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/system_job_templates/`} />, {
        initialEntries: ['/administration/management-jobs/2/schedules/create'],
        path: '/administration/management-jobs/:id/schedules/create',
      });
      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 4);
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.get('[data-cy="schedule-days-to-keep"]').type('77');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
    });

    it('inventory source does not render prompt and survey steps', () => {
      cy.intercept(
        { method: 'GET', url: awxAPI`/inventories/*/` },

        {
          id: 1,
          type: 'inventory',
          name: 'Mock Inventory',
        }
      );
      cy.intercept(
        { method: 'GET', url: awxAPI`/inventory_sources/*/` },
        {
          id: 2,
          type: 'inventory_source',
          name: 'Mock Inventory source',
        }
      );
      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/inventory_sources/`} />, {
        initialEntries: ['/infrastructure/inventories/inventory/1/sources/1/schedules/create'],
        path: '/infrastructure/inventories/inventory/:id/sources/:source_id/schedules/create',
      });
      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 4);
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="wizard-nav"]').within(() => {
        ['Details', 'Rules', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });
    });

    it('job template should not go to next step due to name failed validation', () => {
      cy.intercept(
        { method: 'GET', url: awxAPI`/job_templates/*/` },
        {
          id: 2,
          type: 'job_template',
          name: 'Mock Job Template',
        }
      ).as('jobTemplate');
      cy.intercept('GET', awxAPI`/schedules/zoneinfo`, zones); // 🔧 add this
      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/job_templates/`} />, {
        initialEntries: ['/templates/job-template/8/schedules/create'],
        path: '/templates/job-template/:id/schedules/create',
      });
      cy.wait('@jobTemplate');

      cy.get('input[data-cy="name"]').focus();
      cy.clickButton(/^Next$/);

      cy.get('[data-cy="name-form-group"]').within(() => {
        cy.get('span.pf-v6-c-helper-text__item-text').should(
          'contain.text',
          'Schedule name is required'
        );
      });

      cy.get('[data-cy="wizard-nav-item-details"]').within(() => {
        cy.get('button').should('have.class', 'pf-m-current');
      });
    });

    it('management job template should not go to next step due to name and days field failed validation', () => {
      cy.intercept('GET', awxAPI`/schedules/zoneinfo`, zones);
      cy.intercept(
        { method: 'GET', url: awxAPI`/system_job_templates/*/` },
        {
          id: 1,
          type: 'system_job_template',
          name: 'Cleanup Job Details',
          job_type: 'cleanup_jobs',
        }
      );

      cy.mount(<ScheduleAddWizard resourceEndPoint={awxAPI`/system_job_templates/`} />, {
        initialEntries: ['/administration/management-jobs/5/schedules/create'],
        path: '/administration/management-jobs/:id/schedules/create',
      });

      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.get('[data-cy="name"]').clear();
      cy.clickButton(/^Next$/);

      cy.get('[data-cy="name-form-group"]').within(() => {
        cy.get('span.pf-v6-c-helper-text__item-text').should(
          'contain.text',
          'Schedule name is required.'
        );
      });

      cy.get('[data-cy="schedule-days-to-keep-form-group"]').within(() => {
        cy.get('span.pf-v6-c-helper-text__item-text').should(
          'contain.text',
          'Days of data to keep is required.'
        );
      });

      cy.get('[data-cy="wizard-nav-item-details"]').within(() => {
        cy.get('button').should('have.attr', 'class').and('contain', 'pf-m-current');
      });
    });
  });

  describe('Rules step', () => {
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: awxAPI`/schedules/zoneinfo` }, zones);
      cy.intercept(awxAPI`/job_templates/*/launch/`, {
        ...launchConfig,
        ask_credential_on_launch: false,
        survey_enabled: false,
      });
      cy.intercept(awxAPI`/job_templates/*/credentials/`, {
        count: 1,
        results: [mockTemplateCredential],
      });
      cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockTemplates);
      cy.intercept(awxAPI`/job_templates/*/`, {
        ...mockTemplates.results[0],
        ask_credential_on_launch: false,
        survey_enabled: false,
      });
      cy.mount(<ScheduleAddWizard isTopLevelSchedule />, {
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
      cy.getBy('button[id="job-template-select"]').click();
      cy.get('button#browse').scrollIntoView().click({
        force: true,
      });
      cy.getModal().within(() => {
        cy.get('[data-cy="checkbox-column-cell"]').first().click();
        cy.clickButton('Confirm');
      });
      cy.get('[data-cy="name"]').type('Test Schedule');
      cy.selectSingleSelectOption('[data-cy="timezone"]', 'Zulu');
      cy.clickButton(/^Next$/);
    });

    it('Should create a very basic rule.', () => {
      cy.get('[data-cy="interval-form-group"]').type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="add-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').should('be.visible');
      cy.get('[data-cy="page-title"]').should('contain.text', 'Rules');
    });

    it('Should be able to edit an existing rule without creating an additional rule', () => {
      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="add-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=HOURLY;INTERVAL=100'
        );
      });
      cy.get('[data-cy="page-title"]').should('contain.text', 'Rules');
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
      cy.get('[data-cy="add-rule-button"]').click();
      cy.get('tr[data-cy="row-id-1"]').within(() => {
        cy.get('td[data-cy="rrule-column-cell"]').should(
          'contains.text',
          'RRULE:FREQ=HOURLY;INTERVAL=100'
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
        cy.get('tr').should('have.length', 1);
      });
    });

    it('Should be able to remove an existing rule from the list', () => {
      cy.intercept('POST', awxAPI`/schedules/preview/`, {
        statusCode: 200,
        body: { rrule: 'RRULE:FREQ=HOURLY;INTERVAL=100' },
      }).as('previewRule');

      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="add-rule-button"]').click();
      cy.get('[data-cy="row-id-1"]').should('exist');

      cy.get('[data-cy="add-rule-toolbar-button"]').click();

      cy.get('[data-cy="interval"]').clear().type('100');
      cy.selectDropdownOptionByResourceName('freq', 'Hourly');
      cy.get('[data-cy="add-rule-button"]').click();

      cy.get('[data-cy="row-id-2"]').should('exist');

      cy.get('[data-cy="row-id-2"]').within(() => {
        cy.get('[data-cy="delete-rule"]').click();
      });

      cy.get('[data-cy="row-id-2"]').should('not.exist');
    });
  });
});
