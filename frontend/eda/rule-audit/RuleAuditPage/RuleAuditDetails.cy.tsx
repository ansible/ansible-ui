/* eslint-disable i18next/no-literal-string */
import { edaAPI } from '../../common/eda-utils';
import { RuleAuditDetails } from './RuleAuditDetails';

describe('RuleAuditDetails', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/audit-rules/1/`,
      },
      {
        fixture: 'edaAuditRule.json',
      }
    );
  });

  it('Rule Audit details are displayed correctly', () => {
    cy.mount(<RuleAuditDetails />);
    cy.get('[data-cy="name"] > .pf-v5-c-description-list__text').should(
      'have.text',
      'Say Hello long running'
    );
    cy.get('[style="max-width: 100%;"] > div').should('have.text', 'Success');
    cy.get('a').should('have.text', 'Activation 1');
    cy.get('[data-cy="rule-set"] > .pf-v5-c-description-list__text').should(
      'have.text',
      'Long Running Range'
    );
    cy.get('[data-cy="created"] > .pf-v5-c-description-list__text').should('exist');
    cy.get('[data-cy="last-fired-date"] > .pf-v5-c-description-list__text').should('exist');
  });
});
