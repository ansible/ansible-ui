import { awxAPI } from '../../common/api/awx-utils';
import { Templates } from './Templates';

describe('Templates', () => {
  describe('Error list', () => {
    it('Displays error if templates are not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: awxAPI`/unified_job_templates/*` }, { statusCode: 500 });
      cy.mount(<Templates />);
      cy.contains('Error loading templates');
    });
  });

  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/unified_job_templates/*`,
        },
        {
          fixture: 'unifiedJobTemplates.json',
        }
      ).as('templatesList');
      cy.intercept(
        {
          method: 'OPTIONS',
          url: awxAPI`/unified_job_templates/`,
        },
        {
          fixture: 'mock_options.json',
        }
      );
    });

    it('Launch action item should call API /launch endpoint', () => {
      cy.intercept(
        { method: 'GET', url: awxAPI`/job_templates/7/launch/` },
        { fixture: 'jobTemplateLaunch.json' }
      ).as('launchRequest');
      cy.mount(<Templates />);
      cy.get('[data-cy="launch-template"]').first().click();
      cy.wait('@launchRequest');
    });

    it('sets card view as the default view', () => {
      cy.mount(<Templates />);
      cy.get('[data-cy="card-view"]').within(() => {
        cy.get('button').should('have.attr', 'aria-pressed', 'true');
      });
    });
  });
});
