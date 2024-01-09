import { TemplatesList } from './TemplatesList';

describe('TemplatesList', () => {
  describe('ErrorList', () => {
    it('displays error if templates list is not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: '/api/v2/projects/6/*' }, { statusCode: 500 });
      cy.mount(<TemplatesList url={'/api/v2/projects/6/'} />);
      cy.contains('Error loading templates');
    });
  });

  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/projects/6/*',
        },
        {
          fixture: 'templateList.json',
        }
      ).as('templatesList');
    });

    it('Component renders', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.get('tbody').find('tr').should('have.length', 2);
    });

    it('Launch action item should call API /launch endpoint', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/job_templates/7/launch/' },
        { fixture: 'jobTemplateLaunch' }
      ).as('launchRequest');
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.clickTableRowPinnedAction('Demo Job Template', 'launch-template');
      cy.wait('@launchRequest');
    });
  });
});
