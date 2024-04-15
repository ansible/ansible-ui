/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as useOptions from '../../../common/crud/useOptions';
import { Application } from '../../interfaces/Application';
import { Applications } from './Applications';

describe('Applications List', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/applications/*',
        },
        {
          fixture: 'applications.json',
        }
      );
      cy.intercept('OPTIONS', '/api/v2/applications/', { fixture: 'mock_options.json' }).as(
        'getOptions'
      );
    });

    it('Applications list renders', () => {
      cy.mount(<Applications />);
      cy.verifyPageTitle('OAuth Applications');
      cy.get('tbody').find('tr').should('have.length', 10);
    });

    it('Filter applications by name', () => {
      cy.mount(<Applications />);
      cy.intercept('api/v2/applications/?name=test*').as('nameFilterRequest');
      cy.filterTableByMultiSelect('name', ['test']);
      cy.wait('@nameFilterRequest');
      cy.clearAllFilters();
    });

    it('Filter applications by description', () => {
      cy.mount(<Applications />);
      cy.intercept('api/v2/applications/?description__icontains=hello*').as('descFilterRequest');
      cy.filterTableByTypeAndText(/^Description$/, 'hello');
      cy.wait('@descFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Create application button is disabled if the user does not have permission to create application', () => {
      cy.mount(<Applications />);
      cy.contains('button', /^Create application$/).should('have.attr', 'aria-disabled', 'true');
    });

    it('Delete application row action is disabled if the user does not have permission to delete application', () => {
      cy.fixture('applications')
        .then((applications) => {
          for (let i = 0; i < (applications.results as Application[]).length; i++) {
            applications.results[i].summary_fields.user_capabilities.delete = false;
          }
          return applications;
        })
        .then((applications) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/applications/*',
            },
            { body: applications }
          );
        })
        .then(() => {
          cy.mount(<Applications />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('button.toggle-kebab').click();
            cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete application$/).should(
              'have.attr',
              'aria-disabled',
              'true'
            );
          });
        });
    });

    it('Edit application row action is disabled if the user does not have permission to edit application', () => {
      cy.fixture('applications')
        .then((applications) => {
          for (let i = 0; i < (applications.results as Application[]).length; i++) {
            applications.results[i].summary_fields.user_capabilities.edit = false;
          }
          return applications;
        })
        .then((applications) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/applications/*',
            },
            { body: applications }
          );
        })
        .then(() => {
          cy.mount(<Applications />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('[data-cy="actions-column-cell"]').within(() => {
              cy.get(`[data-cy="edit-application"]`).should('have.attr', 'aria-disabled', 'true');
            });
          });
        });
    });

    it('Create application button is enabled if the user has permission to create applications', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 255,
                help_text: 'Name of this application.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<Applications />);
      cy.contains('button', /^Create application$/).should('have.attr', 'aria-disabled', 'false');
    });

    it('Delete application row action is enabled if the user has permission to delete application', () => {
      cy.mount(<Applications />);
      cy.contains('tr', 'test').within(() => {
        // user_capabilities.delete: false
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete application$/).should(
          'have.attr',
          'aria-disabled',
          'false'
        );
      });
    });

    it('Edit application row action is enabled if the user has permission to edit application', () => {
      cy.mount(<Applications />);
      cy.contains('tr', 'test').within(() => {
        // user_capabilities.edit: false
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="edit-application"]`).should('have.attr', 'aria-disabled', 'false');
        });
      });
    });

    it('Displays error if applications are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/applications/*',
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<Applications />);
      cy.contains('Error loading applications');
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/applications/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create applications', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this application.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<Applications />);
      cy.contains(/^There are currently no applications added$/);
      cy.contains(/^Please create an application by using the button below.$/);
      cy.contains('button', /^Create application$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create applications', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<Applications />);
      cy.contains(/^You do not have permission to create an application.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create application$/).should('not.exist');
    });
  });
});
