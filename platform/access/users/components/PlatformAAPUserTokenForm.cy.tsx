import { CreateAAPUserToken } from './PlatformAAPUserTokenForm';
import * as activeUserProvider from '../../../main/PlatformActiveUserProvider';

describe('CreateAAPUserToken', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/gateway/v1/applications/*',
        hostname: 'localhost',
      },
      {
        fixture: 'applications.json',
      }
    );

    cy.stub(activeUserProvider, 'usePlatformActiveUser').callsFake(() => {
      return { activePlatformUser: { id: '20' } };
    });
  });

  it('renders a token form with breadcrumbs, title and form inputs', () => {
    const onCreateFn = cy.stub();
    cy.mount(<CreateAAPUserToken onSuccessfulCreate={onCreateFn} />, {
      path: '/users/:id/tokens/create',
      initialEntries: ['/users/20/tokens/create'],
    });

    cy.get('nav[aria-label="Breadcrumb"]').within(() => {
      cy.contains('Users');
      cy.contains('Tokens');
    });
    cy.get('[data-cy="page-title"]').contains('Create token');
    cy.get('[data-cy="application-form-group"] button').within(() => {
      cy.contains('OAuth application');
      cy.contains('Select OAuth application');
    });
    cy.contains('Description');
    // for some reason cypress can't find the placeholder text directly so checking the attribute
    cy.get('[data-cy="description"]')
      .should('have.attr', 'placeholder')
      .and('equal', 'Enter token description');
    cy.contains('Scope');
    cy.get('[data-cy="scope-form-group"] button').click();
    cy.contains('Select scope');
    cy.contains('Read');
    cy.contains('Write');
    // find the application dropdown button, click on it and check the expected app name shows up
    cy.get('button[data-cy="application"]').click();
    cy.get('div#application-select').contains('test');
  });

  it('attempting to create a token without scope shows an error message', () => {
    const onCreateFn = cy.stub();
    cy.mount(<CreateAAPUserToken onSuccessfulCreate={onCreateFn} />, {
      path: '/users/:id/tokens/create',
      initialEntries: ['/users/20/tokens/create'],
    });
    cy.get('button[data-cy="Submit"]').click();
    cy.contains('Scope is required.');
    cy.get('[data-cy="scope-form-group"] button').click();
    cy.contains('Write').click();
    cy.contains('Scope is required.').should('not.exist');
  });
});
