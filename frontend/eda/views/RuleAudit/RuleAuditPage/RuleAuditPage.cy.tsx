/* eslint-disable i18next/no-literal-string */

import { RuleAuditPage } from './RuleAuditPage';
import { RouteObj } from '../../../../common/Routes';
import { edaAPI } from '../../../api/eda-utils';

describe('RuleAuditPage', () => {
  beforeEach(() => {
    cy.intercept({ method: 'GET', url: edaAPI`/audit-rules/1/` }, { fixture: 'edaAuditRule.json' });
  });

  it('Component renders and displays the rule audit', () => {
    cy.mount(<RuleAuditPage />, {
      path: RouteObj.EdaRuleAuditPage,
      initialEntries: [RouteObj.EdaRuleAuditDetails.replace(':id', '1')],
    });
    cy.get('h1').should('have.text', 'Say Hello long running');
  });

  it('Should render all the tabs', () => {
    const tabNames: string[] = ['Back to Rule Audit', 'Details', 'Events', 'Actions'];
    cy.mount(<RuleAuditPage />);

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 4);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });
});
