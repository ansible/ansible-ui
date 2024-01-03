/* eslint-disable i18next/no-literal-string */
import { Application } from '../../../interfaces/Application';
import { ApplicationPage } from './ApplicationPage';

describe('ApplicationPage', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: '/api/v2/applications/*/' },
      { fixture: 'application.json' }
    );
  });
  it('Displays breadcrumbs back to Applications list page', () => {
    cy.mount(<ApplicationPage />);
    cy.get('.pf-v5-c-tabs__item').eq(0).should('have.text', 'Back to Applications');
  });
  it('Should show enabled edit button', () => {
    cy.mount(<ApplicationPage />);
    cy.get('[data-cy="edit-application"]').should('have.attr', 'aria-disabled', 'false');
  });
  it('Should show enabled delete button', () => {
    cy.mount(<ApplicationPage />);
    cy.get('[data-cy="delete-application"]').should('have.attr', 'aria-disabled', 'false');
  });
  it('Should hide edit button', () => {
    cy.fixture('application')
      .then((application: Application) => {
        application.summary_fields.user_capabilities.edit = false;
        return application;
      })
      .then((application: Application) => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/applications/*',
          },
          { body: application }
        );
      })
      .then(() => {
        cy.mount(<ApplicationPage />);
      })
      .then(() => {
        cy.get('[data-cy="edit-application"]').should('not.exist');
      });
  });

  it('Should hide delete button', () => {
    cy.fixture('application')
      .then((application: Application) => {
        application.summary_fields.user_capabilities.delete = false;
        return application;
      })
      .then((application: Application) => {
        cy.intercept(
          {
            method: 'GET',
            url: '/api/v2/applications/*',
          },
          { body: application }
        );
      })
      .then(() => {
        cy.mount(<ApplicationPage />);
      })
      .then(() => {
        cy.get('[data-cy="delete-application"]').should('not.exist');
      });
  });
});
