/* eslint-disable i18next/no-literal-string */
import { edaAPI } from '../../common/eda-utils';
import { RuleAuditActions } from './RuleAuditActions';

describe('RuleAuditActions', () => {
  it('Rule Audit actions are displayed correctly', () => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/audit-rules/1/actions/*`,
      },
      {
        fixture: 'edaAuditRuleActions.json',
      }
    );
    cy.mount(<RuleAuditActions />);
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.get('[data-cy="name-column-header"]').should('contain', 'Name');
    cy.get('[data-cy="name-column-cell"]').should('have.text', 'debug');
    cy.get('[data-cy="status-column-header"]').should('contain', 'Status');
    cy.get('[data-cy="status-column-cell"]').should('have.text', 'Success');
    cy.get('[data-cy="last-fired-date-column-header"]').should('contain', 'Last fired date');
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/audit-rules/1/actions/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<RuleAuditActions />);
    cy.contains(/^No actions yet$/);
    cy.contains(/^No actions yet for this rule audit$/);
  });
});
