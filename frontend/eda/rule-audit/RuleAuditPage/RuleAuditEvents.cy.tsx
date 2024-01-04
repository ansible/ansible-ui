/* eslint-disable i18next/no-literal-string */
import { edaAPI } from '../../common/eda-utils';
import { RuleAuditEvents } from './RuleAuditEvents';

describe('RuleAuditEvents', () => {
  it('Rule Audit events are displayed correctly', () => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/audit-rules/1/events/*`,
      },
      {
        fixture: 'edaAuditRuleEvents.json',
      }
    );
    cy.mount(<RuleAuditEvents />);
    cy.get('tbody').find('tr').should('have.length', 10);
    cy.get('[data-cy="name-column-header"]').should('contain', 'Name');
    cy.get('a').should('have.text', 'ansible.eda.range');
    cy.get('[data-cy="source-type-column-header"]').should('contain', 'Source type');
    cy.get('[data-cy="source-type-column-cell"]').should('have.text', 'ansible.eda.range');
    cy.get('[data-cy="timestamp-column-header"]').should('contain', 'Timestamp');
  });
});

describe('Empty list', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/audit-rules/1/events/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<RuleAuditEvents />);
    cy.contains(/^No events$/);
    cy.contains(/^No events for this rule audit$/);
  });
});
