import { awxAPI } from '@ansible/cypress/support/formatApiPathForAwx';
import { Credential } from '../../interfaces/Credential';
import { Credentials } from './Credentials';

describe('Credentials.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'OPTIONS',
        url: awxAPI`/credentials/`,
      },
      {
        fixture: 'mock_options.json',
      }
    ).as('getOptions');

    cy.intercept(
      {
        method: 'GET',
        url: awxAPI`/credentials/*`,
        hostname: 'localhost',
      },
      {
        fixture: 'credentials.json',
      }
    ).as('getCredentials');

    cy.intercept('GET', awxAPI`/credential_types/?page=1&page_size=200`, {
      statusCode: 200,
      body: { count: 0, results: [] },
    }).as('getCredentialTypes');
  });

  it('renders credentials list', () => {
    cy.mount(<Credentials />);
    cy.verifyPageTitle('Credentials');
    cy.get('table').find('tr').should('have.length.greaterThan', 0);
  });

  it('deletes credential from toolbar menu', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[0];
        cy.intercept('GET', awxAPI`/credentials/?search=${credential.name}*`, {
          statusCode: 200,
          body: {
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 1,
                name: credential.name,
              },
            ],
          },
        });
        cy.selectTableRow(credential.name);
        cy.clickToolbarKebabAction('delete-credentials');
        cy.contains('Permanently delete credentials').should('be.visible');
      });
  });

  it('row action to delete credential is disabled if the user does not have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[1]; // credential with summary_fields.user_capabilities.delete: false
        cy.get('[data-cy="name-column-cell"]')
          .contains(credential.name)
          .closest('tr')
          .within(() => {
            cy.get('button.toggle-kebab').click();
          });

        cy.contains('#delete-credential', /^Delete credential$/).should(
          'have.attr',
          'aria-disabled',
          'true'
        );
      });
  });

  it('row action to edit credential is enabled if the user does have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[0]; // credential with edit = true
        cy.get('[data-cy="name-column-cell"]')
          .contains(credential.name)
          .closest('tr')
          .should('exist')
          .and('be.visible')
          .within(() => {
            cy.get('[data-cy="edit-credential"]')
              .should('exist')
              .and('be.visible')
              .and('be.enabled');
          });
      });
  });

  it('row action to edit credential is disabled if the user does not have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[1]; // credential with summary_fields.user_capabilities.start: false
        cy.get('[data-cy="name-column-cell"]')
          .contains(credential.name)
          .closest('tr')
          .within(() => {
            cy.get('[data-cy="edit-credential"]').should('have.attr', 'aria-disabled', 'true');
          });
      });
  });

  it('row action to duplicate credential is enabled if the user does have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[0]; // credential with summary_fields.user_capabilities.copy: true
        cy.get('[data-cy="name-column-cell"]')
          .contains(credential.name)
          .closest('tr')
          .within(() => {
            cy.get('[data-cy="duplicate-credential"]')
              .should('exist')
              .and('be.visible')
              .and('be.enabled');
          });
      });
  });

  it('row action to duplicate credential is disabled if the user does not have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[1]; // credential with summary_fields.user_capabilities.copy: false
        cy.get('[data-cy="name-column-cell"]')
          .contains(credential.name)
          .closest('tr')
          .within(() => {
            cy.get('[data-cy="duplicate-credential"]')
              .should('exist')
              .and('have.attr', 'aria-disabled', 'true');
          });
      });
  });
});
