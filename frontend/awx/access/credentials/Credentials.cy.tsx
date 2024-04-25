import { Credential } from '../../interfaces/Credential';
import { Credentials } from './Credentials';

describe('Credentials.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credentials/*',
        hostname: 'localhost',
      },
      {
        fixture: 'credentials.json',
      }
    ).as('getCredentials');
  });
  it('renders credentials list', () => {
    cy.mount(<Credentials />);
    cy.verifyPageTitle('Credentials');
    cy.get('table').find('tr').should('have.length', 17);
  });
  it('deletes credential from toolbar menu', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[0];
        cy.selectTableRow(credential.name, false);
        cy.clickToolbarKebabAction('delete-selected-credentials');
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
        cy.contains('tr', credential.name).within(() => {
          cy.get('button.toggle-kebab').click();
          cy.contains('.pf-v5-c-dropdown__menu-item', /^Delete credential$/).should(
            'have.attr',
            'aria-disabled',
            'true'
          );
        });
      });
  });

  it('row action to edit credential is enabled if the user does have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[0]; // credential with summary_fields.user_capabilities.start: true
        cy.contains('tr', credential.name).within(() => {
          cy.get('[data-cy="edit-credential"]').should('have.attr', 'aria-disabled', 'false');
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
        cy.contains('tr', credential.name).within(() => {
          cy.get('[data-cy="edit-credential"]').should('have.attr', 'aria-disabled', 'true');
        });
      });
  });

  it('row action to copy credential is enabled if the user does have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[0]; // credential with summary_fields.user_capabilities.copy: true
        cy.contains('tr', credential.name).within(() => {
          cy.get('[data-cy="copy-credential"]').should('have.attr', 'aria-disabled', 'false');
        });
      });
  });

  it('row action to copy credential is disabled if the user does not have permissions', () => {
    cy.mount(<Credentials />);
    cy.fixture('credentials.json')
      .its('results')
      .should('be.an', 'array')
      .then((results: Credential[]) => {
        const credential = results[1]; // credential with summary_fields.user_capabilities.copy: false
        cy.contains('tr', credential.name).within(() => {
          cy.get('[data-cy="copy-credential"]').should('have.attr', 'aria-disabled', 'true');
        });
      });
  });
});
