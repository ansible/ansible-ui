import * as useOptions from '../../../common/crud/useOptions';
import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { ExecutionEnvironment } from '../../interfaces/ExecutionEnvironment';
import { ExecutionEnvironments } from './ExecutionEnvironments';

describe('Execution Environments List', () => {
  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/execution_environments/*',
        },
        {
          fixture: 'execution_environments.json',
        }
      );
    });

    it('Execution Environments list renders', () => {
      cy.mount(<ExecutionEnvironments />);
      cy.verifyPageTitle('Execution Environments');
      cy.get('tbody').find('tr').should('have.length', 10);
    });

    it('Filter execution environments by name', () => {
      cy.mount(<ExecutionEnvironments />);
      cy.intercept(
        'api/v2/execution_environments/?name__icontains=Control%20Plane%20Execution%20Environment*'
      ).as('nameFilterRequest');
      cy.filterTableByTypeAndText(/^Name$/, 'Control Plane Execution Environment');
      cy.wait('@nameFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter execution environments by image', () => {
      cy.mount(<ExecutionEnvironments />);
      cy.intercept('api/v2/execution_environments/?image__icontains=quay*').as(
        'imageFilterRequest'
      );
      cy.filterTableByTypeAndText(/^Image$/, 'quay');
      cy.wait('@imageFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Create execution environment button is disabled if the user does not have permission to create execution environment', () => {
      cy.mount(<ExecutionEnvironments />);
      cy.contains('button', /^Create execution environment$/).should(
        'have.attr',
        'aria-disabled',
        'true'
      );
    });

    it('Delete execution environment row action is disabled if the user does not have permission to delete execution environment', () => {
      cy.fixture('execution_environments')
        .then((eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
          for (let i = 0; i < eeResponse.results.length; i++) {
            eeResponse.results[i].summary_fields.user_capabilities.delete = false;
          }
          return eeResponse;
        })
        .then((eeBodyNoDeletePerms) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/execution_environments/*',
            },
            { body: eeBodyNoDeletePerms }
          );
        })
        .then(() => {
          cy.mount(<ExecutionEnvironments />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('button.toggle-kebab').click();
            cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete execution environment$/).should(
              'have.attr',
              'aria-disabled',
              'true'
            );
          });
        });
    });

    it('Edit execution environment row action is disabled if the user does not have permission to edit execution environment', () => {
      cy.fixture('execution_environments')
        .then((eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
          for (let i = 0; i < eeResponse.results.length; i++) {
            eeResponse.results[i].summary_fields.user_capabilities.edit = false;
          }
          return eeResponse;
        })
        .then((eeBodyNoDeletePerms) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/execution_environments/*',
            },
            { body: eeBodyNoDeletePerms }
          );
        })
        .then(() => {
          cy.mount(<ExecutionEnvironments />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('[data-cy="actions-column-cell"]').within(() => {
              cy.get(`[data-cy="edit-execution-environment"]`).should(
                'have.attr',
                'aria-disabled',
                'true'
              );
            });
          });
        });
    });

    it('Create execution environment button is enabled if the user has permission to create execution environment', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 255,
                help_text: 'Name of this execution environment.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<ExecutionEnvironments />);
      cy.contains('button', /^Create execution environment$/).should(
        'have.attr',
        'aria-disabled',
        'false'
      );
    });

    it('Delete execution environment row action is enabled if the user has permission to delete execution environment', () => {
      cy.fixture('execution_environments')
        .then((eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
          for (let i = 0; i < eeResponse.results.length; i++) {
            eeResponse.results[i].summary_fields.user_capabilities.delete = true;
          }
          return eeResponse;
        })
        .then((eeBodyNoDeletePerms) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/execution_environments/*',
            },
            { body: eeBodyNoDeletePerms }
          );
        })
        .then(() => {
          cy.mount(<ExecutionEnvironments />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('button.toggle-kebab').click();
            cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete execution environment$/).should(
              'have.attr',
              'aria-disabled',
              'false'
            );
          });
        });
    });

    it('Edit execution environment row action is enabled if the user has permission to edit execution environment', () => {
      cy.fixture('execution_environments')
        .then((eeResponse: AwxItemsResponse<ExecutionEnvironment>) => {
          for (let i = 0; i < eeResponse.results.length; i++) {
            eeResponse.results[i].summary_fields.user_capabilities.edit = true;
          }
          return eeResponse;
        })
        .then((eeBodyNoDeletePerms) => {
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/execution_environments/*',
            },
            { body: eeBodyNoDeletePerms }
          );
        })
        .then(() => {
          cy.mount(<ExecutionEnvironments />);
        })
        .then(() => {
          cy.contains('tr', 'test').within(() => {
            cy.get('[data-cy="actions-column-cell"]').within(() => {
              cy.get(`[data-cy="edit-execution-environment"]`).should(
                'have.attr',
                'aria-disabled',
                'false'
              );
            });
          });
        });
    });

    it('Displays error if execution environments are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/execution_environments/*',
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<ExecutionEnvironments />);
      cy.get('.pf-v5-c-empty-state__title-text').should(
        'have.text',
        'Error loading execution environments'
      );
    });
  });

  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/execution_environments/*',
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });
    it('Empty state is displayed correctly for user with permission to create execution environments', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {
            POST: {
              name: {
                type: 'string',
                required: true,
                label: 'Name',
                max_length: 512,
                help_text: 'Name of this execution environment.',
                filterable: true,
              },
            },
          },
        },
      }));
      cy.mount(<ExecutionEnvironments />);
      cy.contains(/^No execution environments yet$/);
      cy.contains(/^To get started, create an execution environment.$/);
      cy.contains('button', /^Create execution environment$/).should('be.visible');
    });
    it('Empty state is displayed correctly for user without permission to create execution environments', () => {
      cy.stub(useOptions, 'useOptions').callsFake(() => ({
        data: {
          actions: {},
        },
      }));
      cy.mount(<ExecutionEnvironments />);
      cy.contains(/^You do not have permission to create an execution environment.$/);
      cy.contains(
        /^Please contact your organization administrator if there is an issue with your access.$/
      );
      cy.contains('button', /^Create execution environment$/).should('not.exist');
    });
  });
});
