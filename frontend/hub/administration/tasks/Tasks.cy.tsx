import { pulpAPI } from '../../common/api/formatPath';
import * as useHubContext from '../../common/useHubContext';
import { Tasks } from './Tasks';

describe('Tasks List', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: pulpAPI`/tasks/` + '*',
      },
      {
        fixture: 'tasks.json',
      }
    );
    cy.stub(useHubContext, 'useHubContext').callsFake(() => ({
      hasPermission: () => true,
    }));
  });
  it('Tasks list renders', () => {
    cy.mount(<Tasks />);
    cy.verifyPageTitle('Task Management');
    cy.get('table').find('tr').should('have.length', 10);
  });
  it('Filter tasks by status = running', () => {
    cy.mount(<Tasks />);
    cy.get('[data-cy="filter"]').click();
    cy.get('#status').click();
    cy.get('[data-cy="filter-input"]').click();
    cy.get('#running').click();
    cy.clickButton(/^Clear all filters$/);
  });
  it('Displays error if tasks are not successfully loaded', () => {
    cy.intercept(
      {
        method: 'GET',
        url: pulpAPI`/tasks/` + '*',
      },
      {
        statusCode: 500,
      }
    );
    cy.mount(<Tasks />);
    cy.contains('Error loading tasks');
  });
  it('Row action for stopping a task is disabled if the task is not running/waiting', () => {
    cy.mount(<Tasks />);
    cy.contains('tr', 'pulp_ansible.app.tasks.copy.move_collection').within(() => {
      cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'true');
    });
  });
  it('Row action for stopping a task is enabled if the task is running', () => {
    cy.mount(<Tasks />);
    cy.contains('tr', 'galaxy_ng.app.tasks.namespaces._create_pulp_namespace').within(() => {
      cy.get('[data-cy="stop-task"]').should('have.attr', 'aria-disabled', 'false');
    });
  });
  it('Stop a running task', () => {
    cy.mount(<Tasks />);
    cy.contains('tr', 'galaxy_ng.app.tasks.namespaces._create_pulp_namespace').within(() => {
      cy.get('[data-cy="stop-task"]').click();
    });
    cy.clickModalConfirmCheckbox();
    cy.get('[data-ouia-component-id="submit"]').click();
    cy.clickButton(/^Close$/);
  });
});
