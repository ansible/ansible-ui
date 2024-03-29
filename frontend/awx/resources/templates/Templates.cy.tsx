import { Templates } from './Templates';

describe('Templates', () => {
  describe('Error list', () => {
    it('Displays error if templates are not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/unified_job_templates/*' }, { statusCode: 500 });
      cy.mount(<Templates />);
      cy.contains('Error loading templates');
    });
  });

  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/unified_job_templates/*',
        },
        {
          fixture: 'unifiedJobTemplates.json',
        }
      ).as('templatesList');
      cy.intercept(
        {
          method: 'OPTIONS',
          url: '/api/v2/unified_job_templates/',
        },
        {
          fixture: 'mock_options.json',
        }
      );
    });

    it('Component renders', () => {
      cy.mount(<Templates />);
      cy.verifyPageTitle('Templates');
      cy.get('tbody').find('tr').should('have.length', 2);
    });

    it('Launch action item should call API /launch endpoint', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/7/launch/' },
        { fixture: 'jobTemplateLaunch' }
      ).as('launchRequest');
      cy.mount(<Templates />);
      cy.clickTableRowAction('name', 'Demo Job Template', 'launch-template', {
        disableFilter: true,
      });
      cy.wait('@launchRequest');
    });
  });
});
