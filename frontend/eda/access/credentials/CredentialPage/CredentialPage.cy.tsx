/* eslint-disable i18next/no-literal-string */

import { CredentialPage } from './CredentialPage';
import { edaAPI } from '../../../common/eda-utils';

describe('CredentialPage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/eda/v1/eda-credentials/1/' },
      { fixture: 'edaCredential.json' }
    );
  });

  it('Component renders and displays the credential', () => {
    cy.intercept(
      { method: 'OPTIONS', url: edaAPI`/eda-credentials/1/` },
      {
        fixture: 'edaCredentialOptions.json',
      }
    );
    cy.mount(<CredentialPage />);
    cy.get('h1').should('have.text', 'EDA Credential 1');
  });

  it('Can copy the credential', () => {
    cy.intercept(
      { method: 'OPTIONS', url: edaAPI`/eda-credentials/1/` },
      {
        fixture: 'edaCredentialOptions.json',
      }
    );
    cy.intercept('POST', edaAPI`/eda-credentials/1/copy/`, (req) => {
      return req.reply({ statusCode: 204 });
    }).as('copyCredential');

    cy.mount(<CredentialPage />);
    cy.contains('#copy-credential', /^Copy credential$/).should(
      'have.attr',
      'aria-disabled',
      'false'
    );
    cy.get('[data-cy="copy-credential"]').click();
    cy.wait('@copyCredential');
    cy.get('.pf-v5-c-alert__title').should('contain', 'EDA Credential 1 copied');
  });

  it('The Copy button is disabled if the user does not have PATCH permission', () => {
    cy.mount(<CredentialPage />);
    cy.contains('#copy-credential', /^Copy credential$/).should(
      'have.attr',
      'aria-disabled',
      'true'
    );
  });

  it('Should render all the tabs', () => {
    const tabNames: string[] = ['Back to Credentials', 'Details', 'Team Access', 'User Access'];
    cy.mount(<CredentialPage />);

    cy.get('.pf-v5-c-tabs__list').within(() => {
      cy.get('.pf-v5-c-tabs__item').should('have.length', 4);
      cy.get('.pf-v5-c-tabs__item').each((tab, index) => {
        cy.wrap(tab).should('contain', tabNames[index]);
      });
    });
  });
});
