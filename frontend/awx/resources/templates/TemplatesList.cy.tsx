import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import * as useOptions from '@ansible/common-ui/crud/useOptions';
import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { TemplatesList } from './TemplatesList';

describe('TemplatesList', () => {
  describe('ErrorList', () => {
    it('displays error if templates list is not successfully loaded', () => {
      cy.intercept({ method: 'GET', url: awxAPI`/unified_job_templates/*` }, { statusCode: 500 });
      cy.mount(<TemplatesList />);
      cy.contains('Error loading templates');
    });
  });

  describe('Populated list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/unified_job_templates/*`,
        },
        {
          fixture: 'templateList.json',
        }
      );
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

    it('Component renders', () => {
      cy.mount(<TemplatesList />);
      cy.get('tbody').find('tr').should('have.length', 2);
    });

    it('Launch action item should call API /launch endpoint', () => {
      cy.intercept(
        { method: 'GET', url: awxAPI`/job_templates/7/launch/` },
        { fixture: 'jobTemplateLaunch' }
      ).as('launchRequest');
      cy.mount(<TemplatesList />);
      cy.get('[data-cy="launch-template"]').first().click();
      cy.wait('@launchRequest');
    });

    it('Has filters for Name, Description, Created By, and Modified By', () => {
      cy.mount(<TemplatesList />);
      cy.openToolbarFilterTypeSelect().within(() => {
        cy.contains(/^Name$/).should('be.exist');
        cy.contains(/^Description$/).should('be.visible');
        cy.contains(/^Created by$/).should('be.visible');
        cy.contains(/^Modified by$/).should('be.visible');
      });
    });

    it('Filter templates by name', () => {
      cy.mount(<TemplatesList />);
      cy.intercept('api/v2/unified_job_templates/*&name=Test%20Job%20Template*');
      cy.filterTableBySearch('Test Job Template');
      cy.clearAllFilters();
    });

    it('Filter templates by description', () => {
      cy.mount(<TemplatesList />);
      cy.intercept('api/v2/unified_job_templates/*?description__icontains=bar*');
      cy.filterTableByTextFilter('description', 'bar');
      cy.clearAllFilters();
    });

    it('Filter templates by created by', () => {
      cy.mount(<TemplatesList />);
      cy.intercept('api/v2/unified_job_templates/*?created_by__username__icontains=baz*');
      cy.filterTableByTextFilter('created-by', 'baz');
      cy.clearAllFilters();
    });

    it('Filter templates by modified by', () => {
      cy.mount(<TemplatesList />);
      cy.intercept('api/v2/unified_job_templates/*?modified_by__username__icontains=qux*');
      cy.filterTableByTextFilter('modified-by', 'qux');
      cy.clearAllFilters();
    });

    it('Create Template button is disabled if the user does not have permission to create templates', () => {
      cy.mount(<TemplatesList />);
      cy.contains('button', /^Create template$/).should('have.attr', 'aria-disabled', 'true');
    });

    it('Should render template create form for users with proper permissions', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.SingleText,
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this template.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<TemplatesList />);
      cy.contains('button', /^Create template$/).should('not.be.disabled');
    });

    it('Delete Template button renders delete modal', () => {
      cy.mount(<TemplatesList />);
      cy.clickTableRowAction('name', 'Test Job Template', 'delete-template', {
        inKebab: true,
        disableFilter: true,
      });
      cy.clickModalButton('Cancel');
    });

    it('Clicking Sort button changes the order of listed templates', () => {
      cy.mount(<TemplatesList />);
      cy.intercept('api/v2/unified_job_templates/*order_by=-name*');
      cy.contains('th', 'Name').click();
      cy.intercept('api/v2/unified_job_templates/*order_by=name*');
      cy.contains('th', 'Name').click();
    });
  });
});
