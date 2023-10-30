/* eslint-disable i18next/no-literal-string */

import { RulebookActivationPage } from './RulebookActivationPage';
import { RouteObj } from '../../../common/Routes';

describe('RulebookActivationPage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/1/' },
      { fixture: 'edaDisabledRulebookActivation.json' }
    );
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/5/' },
      { fixture: 'edaEnabledRulebookActivation.json' }
    );
  });

  it('Component renders and displays the rulebook activation', () => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/activations/1/' },
      { fixture: 'edaDisabledRulebookActivation.json' }
    );
    cy.mount(<RulebookActivationPage />, {
      path: RouteObj.EdaRulebookActivationPage,
      initialEntries: [RouteObj.EdaRulebookActivationDetails.replace(':id', '1')],
    });
    cy.get('h1').should('have.text', 'Activation 1');
  });

  it('Should render all the tabs', () => {
    const tabNames: string[] = ['Back to Rulebook Activations', 'Details', 'History'];
    cy.mount(<RulebookActivationPage />);

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 3);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });
});
