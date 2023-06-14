/* eslint-disable i18next/no-literal-string */
import * as mockSchedulesList from '../../../../cypress/fixtures/schedules.json';
import * as useOptions from '../../../common/crud/useOptions';
import { Schedules } from './Schedules';

describe('schedules .cy.ts', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/schedules/*' },
        {
          fixture: 'schedules.json',
        }
      ).as('schedulesList');
      cy.intercept('OPTIONS', '/api/v2/schedules/*', {
        actions: {
          GET: {
            created: {
              filterable: true,
              help_text: 'Timestamp when this schedule was created.',
              label: 'Created',
              type: 'datetime',
            },
          },
          POST: {
            rrule: {
              filterable: true,
              help_text: 'A value representing the schedules iCal recurrence rule.',
              label: 'Rrule',
              required: true,
              type: 'string',
            },
          },
        },
      });
    });

    it('Schedules list renders', () => {
      cy.mount(<Schedules />);
      cy.hasTitle(/^Schedules$/);
      cy.get('table').find('tr').should('have.length', 4);
    });
    it('Schedules list has filters for Name, and Description,', () => {
      cy.mount(<Schedules />);
      cy.hasTitle(/^Schedules$/);
      cy.contains('button.pf-c-select__toggle', /^Name$/).click();
      cy.get('ul.pf-c-select__menu').within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^Description$/).should('be.visible');
      });
    });
    it('Filter schedules by name', () => {
      cy.mount(<Schedules />);
      cy.intercept('api/v2/schedules/?name__icontains=Template*').as('nameFilterRequest');
      cy.hasTitle(/^Schedules$/);
      cy.contains('button.pf-c-select__toggle', /^Name$/).click();
      cy.filterTableByText('Template');
      // A network request is made based on the filter selected on the UI
      cy.wait('@nameFilterRequest');
      // Clear filter
      cy.get('tbody').click();
      cy.clickButton(/^Clear all filters$/);
    });
    it('Filter schedules by description', () => {
      cy.mount(<Schedules />);
      cy.intercept('api/v2/schedules/?description__icontains=bar*').as('descriptionFilterRequest');
      cy.hasTitle(/^Schedules$/);
      cy.contains('button.pf-c-select__toggle', /^Name$/).click();
      cy.get('ul.pf-c-select__menu').within(() => {
        cy.contains('button', /^Description$/).click();
      });
      cy.filterTableByText('bar');
      // A network request is made based on the filter selected on the UI
      cy.wait('@descriptionFilterRequest');
      // Clear filter
      cy.get('tbody').click();
      cy.clickButton(/^Clear all filters$/);
    });
    it('Disabled schedule renders switch properly, with proper aria-label', () => {
      mockSchedulesList.results[2].enabled = false;
      cy.intercept('GET', '/api/v2/schedules/*', {
        statusCode: 200,
        body: mockSchedulesList,
      }).as('scheduleList');
      cy.mount(<Schedules />);
      cy.contains('td', 'Job Template Schedule 1')
        .parent()
        .within(() => {
          cy.get('input.pf-c-switch__input').should(
            'have.attr',
            'aria-label',
            'Click to enable schedule'
          );
        });
    });
    it('Create Schedule button is disabled if the user does not have permission to create schedules ', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            GET: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this schedule.',
                filterable: true,
              },
            },
          },
        },
      }));

      cy.mount(<Schedules />);
      cy.contains('a', /^Create schedule$/).should('have.attr', 'aria-disabled', 'true');
    });
    it('Edit, Delete Schedule button is disabled if the user does not have permission(s)', () => {
      mockSchedulesList.results[1].summary_fields.user_capabilities.edit = false;
      mockSchedulesList.results[1].summary_fields.user_capabilities.delete = false;
      mockSchedulesList.results[2].enabled = true;

      cy.intercept('GET', '/api/v2/schedules/*', {
        statusCode: 200,
        body: mockSchedulesList,
      }).as('scheduleList');
      cy.intercept('OPTIONS', '/api/v2/schedules/*', {
        actions: {
          GET: {},
          POST: {},
        },
      });
      cy.mount(<Schedules />);
      cy.contains('td', 'Cleanup Expired OAuth 2 Tokens')
        .parent()
        .within(() => {
          cy.contains(/^Edit schedule$/).should('have.attr', 'aria-disabled', 'true');

          cy.get('input.pf-c-switch__input').should('have.attr', 'disabled');
          cy.get('.pf-c-dropdown__toggle').click();
          cy.get('.pf-c-dropdown__menu-item')
            .contains(/^Delete schedule$/)
            .should('have.attr', 'aria-disabled', 'true');
        });
    });

    it('Create Schedule button is enabled if the user has permission to create schedules ', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this schedule.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<Schedules />);
      cy.contains('a', /^Create schedule$/).should('have.attr', 'aria-disabled', 'false');
    });
    it('Displays error if schedules are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/schedules/*',
        },
        {
          statusCode: 500,
        }
      ).as('schedulesError');
      cy.mount(<Schedules />);
      cy.contains('Error loading schedules');
    });
  });
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/schedules/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create schedules ', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this schedule.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<Schedules />);
      cy.contains(/^No schedules yet$/);
      cy.contains(/^Please create a schedule by using the button below.$/);
      cy.contains('button', /^Create schedule$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create schedules ', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<Schedules />);
      cy.contains(/^You do not have permission to create a schedule$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create schedule$/).should('not.exist');
    });
  });
});
