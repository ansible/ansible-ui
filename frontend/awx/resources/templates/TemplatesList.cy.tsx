import { TemplatesList } from './TemplatesList';
import * as useOptions from '../../../common/crud/useOptions';
import { ToolbarFilterType } from '../../../../framework';

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

    it('Has filters for Name, Description, Created By, and Modified By', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.openToolbarFilterTypeSelect().within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^Description$/).should('be.visible');
        cy.contains(/^Created by$/).should('be.visible');
        cy.contains(/^Modified by$/).should('be.visible');
      });
    });

    it('Filter templates by name', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.intercept('api/v2/projects/6/*?name__icontains=foo*').as('nameFilterRequest');
      cy.filterTableByTypeAndText(/^Name$/, 'foo');
      cy.wait('@nameFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter templates by description', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.intercept('api/v2/projects/6/*?description__icontains=bar*').as(
        'descriptionFilterRequest'
      );
      cy.filterTableByTypeAndText(/^Description$/, 'bar');
      cy.wait('@descriptionFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter templates by created by', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.intercept('api/v2/projects/6/*?created_by__username__icontains=baz*').as(
        'createdByFilterRequest'
      );
      cy.filterTableByTypeAndText(/^Created by$/, 'baz');
      cy.wait('@createdByFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter templates by modified by', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.intercept('api/v2/projects/6/*?modified_by__username__icontains=qux*').as(
        'modifiedByFilterRequest'
      );
      cy.filterTableByTypeAndText(/^Modified by$/, 'qux');
      cy.wait('@modifiedByFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Create Template button is disabled if the user does not have permission to create templates', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.contains('.pf-v5-c-dropdown__toggle', 'Create template').should('be.disabled');
    });

    it('Create Template button renders form if user has permission to create', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: ToolbarFilterType.Text,
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
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.contains('.pf-v5-c-dropdown__toggle', 'Create template').should('not.be.disabled');
    });

    it('Delete Template button renders delete modal', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.clickTableRowPinnedAction('Test Job Template', 'actions-dropdown');
      cy.get('[data-cy="delete-template"]').click();
      cy.clickModalButton('Cancel');
    });

    it('Clicking Sort button changes the order of listed templates', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.intercept('api/v2/projects/6/*?order_by=-name*').as('nameDescSortRequest');
      cy.clickTableHeader(/^Name$/);
      cy.wait('@nameDescSortRequest');
      cy.intercept('api/v2/projects/6/*?order_by=name*').as('nameAscSortRequest');
      cy.clickTableHeader(/^Name$/);
      cy.wait('@nameAscSortRequest');
    });

    it('Pagination button functions as expected', () => {
      cy.mount(<TemplatesList url={'/api/v2/projects/6/*'} />);
      cy.get('.pf-v5-c-pagination__nav-page-select').should('be.visible');
    });
  });
});
