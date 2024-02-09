/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable i18next/no-literal-string */
import mockApplication from '../../../../../cypress/fixtures/application.json';
import { formatDateString } from '../../../../../framework/utils/formatDateString';
import { Application } from '../../../interfaces/Application';
import { ApplicationDetailInner as ApplicationDetails } from './ApplicationPageDetails';

describe('ApplicationDetails', () => {
  it('Component renders and displays Application', () => {
    cy.mount(<ApplicationDetails application={mockApplication as Application} />);
  });
  it('Render application detail fields', () => {
    cy.mount(<ApplicationDetails application={mockApplication as Application} />);
    cy.get('[data-cy="name"]').should('have.text', 'test');
    cy.get('[data-cy="client-id"]').should('have.text', 'WLIG801bgwcrnAlFdg4YStryRjprRVXFHXsLL7od');
    cy.get('[data-cy="redirect-uris"]').should('have.text', 'https://www.google.com');
    cy.get('[data-cy="organization"]').should('have.text', 'Default');
    cy.get('[data-cy="authorization-grant-type"]').should('have.text', 'authorization-code');
    cy.get('[data-cy="client-type"]').should('have.text', 'confidential');
    cy.get('[data-cy="created"]').should('have.text', formatDateString(mockApplication.created));
    cy.get('[data-cy="last-modified"]').should(
      'have.text',
      formatDateString(mockApplication.modified)
    );
  });
});
