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
  describe('Prompted schedule', () => {
    const mockTemplate = {
      id: 100,
      name: 'Mock Job Template',
      description: 'Job Template Description',
      unified_job_type: 'job',
      survey_enabled: true,
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
    before(() => {
      cy.intercept({ method: 'GET', url: awxAPI`/schedules/zoneinfo` }, zones);
    });
    beforeEach(() => {
      cy.intercept({ method: 'GET', url: awxAPI`/job_templates/*` }, mockTemplates);
      cy.intercept('/api/v2/job_templates/100/', { id: 100, name: 'Mock Job Template' });
      cy.intercept('/api/v2/job_templates/100/launch/', {
        ask_credential_on_launch: true,
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
        cy.get('li').should('have.length', 5);
        ['Details', 'Prompts', 'Occurrences', 'Exceptions', 'Review'].forEach((text, index) => {
          cy.get('li')
            .eq(index)
            .should((el) => expect(el.text().trim()).to.equal(text));
        });
      });

      cy.selectDropdownOptionByResourceName('node_type', 'Job template');
      cy.selectDropdownOptionByResourceName('job-template-select', 'Mock Job Template');

      cy.get('[data-cy="wizard-nav"]').within(() => {
        cy.get('li').should('have.length', 6);
        ['Details', 'Prompts', 'Survey', 'Occurrences', 'Exceptions', 'Review'].forEach(
          (text, index) => {
            cy.get('li')
              .eq(index)
              .should((el) => expect(el.text().trim()).to.equal(text));
          }
        );
      });
    });

    it('Should not go to next step due to failed validation', () => {
      cy.mount(<ScheduleAddWizard />, {
        initialEntries: ['/schedules/add'],
        path: '/schedules/add',
      });
      cy.selectDropdownOptionByResourceName('node_type', 'Job template');
      cy.clickButton(/^Next$/);
      cy.get('[data-cy="name-form-group"]').within(() => {
        cy.get('span.pf-v5-c-helper-text__item-text').should(
          'have.text',
          'Schedule name is required.'
        );
      });
      cy.get('[data-cy="wizard-nav-item-promptsStep"]').within(() => {
        cy.get('button').should('be.disabled');
      });
    });
  });
});
