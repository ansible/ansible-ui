// import * as useOptions from '../../../common/crud/useOptions';

import { WorkflowApprovals } from './WorkflowApprovals';

describe('Workflow Approvals List', () => {
  describe('Empty list', () => {
    beforeEach(() => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/workflow_approvals/*',
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
          url: '/api/v2/workflow_approvals/*',
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
      cy.mount(<WorkflowApprovals />);
      cy.openToolbarFilterTypeSelect().within(() => {
        cy.contains(/^Name$/).should('be.visible');
        cy.contains(/^ID$/).should('be.visible');
      });
    });

    it('Filter workflow approvals by name', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?name__icontains=foo*').as('nameFilterRequest');
      cy.filterTableByTypeAndText(/^Name$/, 'foo');
      cy.wait('@nameFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Filter workflow approvals by id', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?id=1*').as('idFilterRequest');
      cy.filterTableByTypeAndText(/^ID$/, '1');
      cy.wait('@idFilterRequest');
      cy.clickButton(/^Clear all filters$/);
    });

    it('Clicking name table header sorts workflow approvals by name', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?order_by=-name*').as('nameDescSortRequest');
      cy.clickTableHeader(/^Name$/);
      cy.wait('@nameDescSortRequest');
      cy.intercept('api/v2/workflow_approvals/?order_by=name*').as('nameAscSortRequest');
      cy.clickTableHeader(/^Name$/);
      cy.wait('@nameAscSortRequest');
    });

    it('Clicking started table header sorts workflow approvals by start time', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?order_by=-started*').as('startedDescSortRequest');
      cy.clickTableHeader(/^Started$/);
      cy.wait('@startedDescSortRequest');
      cy.intercept('api/v2/workflow_approvals/?order_by=started*').as('startedAscSortRequest');
      cy.clickTableHeader(/^Started$/);
      cy.wait('@startedAscSortRequest');
    });

    it('Clicking status table header sorts workflow approvals by status', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/?order_by=-status*').as('statusDescSortRequest');
      cy.clickTableHeader(/^Status$/);
      cy.wait('@statusDescSortRequest');
      cy.intercept('api/v2/workflow_approvals/?order_by=status*').as('statusAscSortRequest');
      cy.clickTableHeader(/^Status$/);
      cy.wait('@statusAscSortRequest');
    });

    it('Delete workflow approval row action is disabled if the user does not have permission to delete workflow approvals', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'read only approval').within(() => {
        // user_capabilities.delete: false
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete workflow approval$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
    });

    it('Delete workflow approval row action is enabled if the user has permission to delete workflow approvals', () => {
      cy.mount(<WorkflowApprovals />);
      cy.contains('tr', 'can delete approval').within(() => {
        // user_capabilities.delete: true
        cy.get('button.toggle-kebab').click();
        cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete workflow approval$/).should(
          'have.attr',
          'aria-disabled',
          'false'
        );
      });
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
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/141/approve/', {
        statusCode: 200,
      }).as('approveRequest');
      cy.clickTableRowPinnedAction('can approve or deny', 'approve');
      cy.get('#confirm').click();
      cy.clickButton(/^Approve workflow approvals/);
      cy.wait('@approveRequest');
      cy.clickButton(/^Close/);
      cy.clickButton(/^Clear all filters$/);
    });

    it('Deny row action calls correct API endpoint', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/141/deny/', {
        statusCode: 200,
      }).as('denyRequest');
      cy.clickTableRowPinnedAction('can approve or deny', 'deny');
      cy.get('#confirm').click();
      cy.clickButton(/^Deny workflow approvals/);
      cy.wait('@denyRequest');
      cy.clickButton(/^Close/);
      cy.clickButton(/^Clear all filters$/);
    });

    it('Delete row action calls correct API endpoint', () => {
      cy.mount(<WorkflowApprovals />);
      cy.intercept('api/v2/workflow_approvals/131/', {
        statusCode: 204,
      }).as('deleteRequest');
      cy.clickTableRowKebabAction('can delete approval', 'delete-workflow-approval');
      cy.get('#confirm').click();
      cy.clickButton(/^Delete workflow approvals/);
      cy.wait('@deleteRequest');
      cy.clickButton(/^Close/);
      cy.clickButton(/^Clear all filters$/);
    });

    it('Displays error if workflow approvals are not successfully loaded', () => {
      cy.intercept(
        {
          method: 'GET',
          url: '/api/v2/workflow_approvals/*',
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
