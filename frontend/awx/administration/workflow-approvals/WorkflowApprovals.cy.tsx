import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { WorkflowApprovals } from './WorkflowApprovals';

describe('Workflow Approvals List', () => {
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/workflow_approvals/*`,
        },
        {
          fixture: 'emptyList.json',
        }
      ).as('emptyList');
    });

    it('Empty state is displayed correctly', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains(/^There are currently no workflow approvals$/);
      cy.contains(/^Past and pending workflow approvals will appear here when available$/);
    });
  });

  describe('Non-empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/workflow_approvals/*`,
        },
        {
          fixture: 'workflowApprovals.json',
        }
      );
    });

    it('Workflow approvals list renders', () => {
      cy.mount(<WorkflowApprovals />);
      cy.verifyPageTitle('Workflow Approvals');
      cy.get('tbody').find('tr').should('have.length', 6);
    });

    it('Workflow approvals list has filters for Name and ID', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/workflow_approvals/` },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<WorkflowApprovals />);
      cy.openToolbarFilterTypeSelect().within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^ID$/).should('be.visible');
      });
    });

    it('Filter workflow approvals by name', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/workflow_approvals/` },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<WorkflowApprovals />);
      cy.filterTableBySearch('read only approval');
      cy.get('tr').should('have.length.greaterThan', 0);
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter workflow approvals by id', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/workflow_approvals/` },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<WorkflowApprovals />);
      cy.filterTableById('130', false);
      cy.getByDataCy('filter-input').click();
      cy.get('tr').should('have.length.greaterThan', 0);
      cy.clickButton(/^Clear all filters$/);
    });

    it('Clicking name table header sorts workflow approvals by name', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?order_by=-name*').as('nameDescSortRequest');
      cy.contains('th', 'Name').click();
      cy.wait('@nameDescSortRequest');
      cy.intercept('api/v2/workflow_approvals/?order_by=name*').as('nameAscSortRequest');
      cy.contains('th', 'Name').click();
      cy.wait('@nameAscSortRequest');
    });

    it('Clicking started table header sorts workflow approvals by start time', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?order_by=-started*').as('startedDescSortRequest');
      cy.contains('th', 'Started').click();
      cy.wait('@startedDescSortRequest');
      cy.intercept('api/v2/workflow_approvals/?order_by=started*').as('startedAscSortRequest');
      cy.contains('th', 'Started').click();
      cy.wait('@startedAscSortRequest');
    });

    it('Clicking status table header sorts workflow approvals by status', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?order_by=-status*').as('statusDescSortRequest');
      cy.contains('th', 'Status').click();
      cy.wait('@statusDescSortRequest');
      cy.intercept('api/v2/workflow_approvals/?order_by=status*').as('statusAscSortRequest');
      cy.contains('th', 'Status').click();
      cy.wait('@statusAscSortRequest');
    });

    it('Delete workflow approval row action is disabled if the user does not have permission to delete workflow approvals', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'read only approval').within(() => {
        // user_capabilities.delete: false
        cy.get('button.toggle-kebab').click();
      });
      cy.contains('#delete-workflow-approval', /^Delete workflow approval$/).should(
        'have.attr',
        'aria-disabled',
        'true'
      );
    });

    it('Delete workflow approval row action is enabled if the user has permission to delete workflow approvals', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'can delete approval').within(() => {
        // user_capabilities.delete: true
        cy.get('button.toggle-kebab').click();
      });
      cy.contains('#delete-workflow-approval', /^Delete workflow approval$/).should(
        'not.have.attr',
        'aria-disabled',
        'true'
      );
    });

    it('Approve row action is enabled if the user has permission to approve', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'can approve or deny').within(() => {
        // can_approve_or_deny: true
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="approve"]`).should('have.attr', 'aria-disabled', 'false');
        });
      });
    });

    it('Deny row action is enabled if the user has permission to deny', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'can approve or deny').within(() => {
        // can_approve_or_deny: true
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="deny"]`).should('have.attr', 'aria-disabled', 'false');
        });
      });
    });

    it('Approve row action is disabled if the user does not have permission to approve', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'cannot approve or deny').within(() => {
        // can_approve_or_deny: false
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="approve"]`).should('have.attr', 'aria-disabled', 'true');
        });
      });
    });

    it('Deny row action is disabled if the user does not have permission to deny', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'cannot approve or deny').within(() => {
        // can_approve_or_deny: false
        cy.get('[data-cy="actions-column-cell"]').within(() => {
          cy.get(`[data-cy="deny"]`).should('have.attr', 'aria-disabled', 'true');
        });
      });
    });

    it('Approve row action calls correct API endpoint', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/workflow_approvals/` },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/141/approve/', {
        statusCode: 200,
      }).as('approveRequest');
      cy.getTableRow('name', 'can approve or deny', { disableFilter: true }).within(() => {
        cy.getByDataCy('actions-column-cell').within(() => {
          cy.getByDataCy('approve').click();
        });
      });
      cy.get('#confirm').click();
      cy.clickButton(/^Approve workflow approvals/);
      cy.wait('@approveRequest');
    });

    it('Deny row action calls correct API endpoint', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/workflow_approvals/` },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/141/deny/', {
        statusCode: 200,
      }).as('denyRequest');
      cy.getTableRow('name', 'can approve or deny', { disableFilter: true }).within(() => {
        cy.getByDataCy('actions-column-cell').within(() => {
          cy.getByDataCy('deny').click();
        });
      });
      cy.get('#confirm').click();
      cy.clickButton(/^Deny workflow approvals/);
      cy.wait('@denyRequest');
    });

    it('Delete row action calls correct API endpoint', () => {
      cy.intercept(
        { method: 'OPTIONS', url: awxAPI`/workflow_approvals/` },
        { fixture: 'mock_options.json' }
      );
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/131/', {
        statusCode: 204,
      }).as('deleteRequest');
      cy.intercept('GET', awxAPI`/workflow_approvals/?search=can*`, {
        statusCode: 200,
        body: {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 131,
              name: 'can delete approval',
              status: 'successful',
              summary_fields: {
                user_capabilities: {
                  delete: true,
                  start: true,
                },
              },
            },
          ],
        },
      });
      cy.filterTableBySearch('can delete approval');
      cy.clickTableRowAction('name', 'can delete approval', 'delete-workflow-approval', {
        disableFilter: true,
        inKebab: true,
      });
      cy.get('#confirm').click();
      cy.clickButton(/^Delete workflow approvals/);
      cy.wait('@deleteRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Displays error if workflow approvals are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: awxAPI`/workflow_approvals/*`,
        },
        {
          statusCode: 500,
        }
      );
      cy.mount(<WorkflowApprovals />);
      cy.contains('Error loading workflow approvals');
    });
  });
});
