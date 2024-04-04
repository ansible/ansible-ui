import { TemplateSurvey } from './TemplateSurvey';

describe('TemplateSurvey', () => {
  describe('Non-empty survey', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*' },
        { fixture: 'jobTemplate.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*/survey_spec/' },
        { fixture: 'survey.json' }
      );
    });

    it('Survey list renders', () => {
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.get('tbody').find('tr').should('have.length', 7);
    });

    it('Required survey list question should display a required asterisk ', () => {
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.getByDataCy('survey-question-required').should('have.length', 1);
    });

    it('Survey toggle should be disabled when survey_enabled is false', () => {
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.contains('label', 'Survey disabled');
    });

    it('Survey toggle should be enabled when survey_enabled is true', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*' },
        {
          statusCode: 200,
          body: {
            id: 1,
            type: 'job_template',
            survey_enabled: true,
            summary_fields: {
              user_capabilities: {
                edit: true,
                delete: true,
              },
            },
          },
        }
      );
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.contains('label', 'Survey enabled');
    });

    it('Survey list row actions are disabled due to lack of permissions', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*' },
        {
          statusCode: 200,
          body: {
            id: 1,
            type: 'job_template',
            survey_enabled: true,
            summary_fields: {
              user_capabilities: {
                edit: false,
                delete: false,
              },
            },
          },
        }
      );
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.contains('td', 'reqd')
        .parent()
        .within(() => {
          cy.get('[data-cy="actions-column-cell"]').within(() => {
            cy.get('[data-cy="edit-question"]').should('have.attr', 'aria-disabled', 'true');
          });
          cy.get('.pf-v5-c-dropdown__toggle').click();
          cy.get('.pf-v5-c-dropdown__menu-item')
            .contains('Delete question')
            .should('have.attr', 'aria-disabled', 'true');
        });
    });
  });

  describe('Empty survey', () => {
    const emptySpec = {
      name: 'mock_survey',
      description: '',
      spec: [],
    };

    it('Empty state is displayed correctly for user with permission to create survey', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*' },
        { fixture: 'jobTemplate.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*/survey_spec' },
        {
          statusCode: 200,
          body: emptySpec,
        }
      );
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.contains(/^There are currently no survey questions.$/);
      cy.contains(/^Create a survey question by clicking the button below.$/);
      cy.contains('button', /^Create survey question$/).should('be.visible');
    });

    it('Empty state is displayed correctly for user without permission to create survey', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*' },
        {
          statusCode: 200,
          body: {
            id: 1,
            type: 'job_template',
            summary_fields: {
              user_capabilities: {
                edit: false,
                delete: false,
              },
            },
          },
        }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*/survey_spec' },
        {
          statusCode: 200,
          body: emptySpec,
        }
      );
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.contains(/^You do not have permission to create a survey.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
    });
  });

  describe('Error survey', () => {
    it('Displays error if survey questions are not successfully loaded', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*' },
        { fixture: 'jobTemplate.json' }
      );
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/*/survey_spec' },
        { statusCode: 500 }
      );
      cy.mount(<TemplateSurvey resourceType="job_templates" />);
      cy.contains('Error loading survey');
    });
  });
});
