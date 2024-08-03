import { AwxItemsResponse } from '../../common/AwxItemsResponse';
import { Application } from '../../interfaces/Application';
import { Organization } from '../../interfaces/Organization';
import { CreateApplication, EditApplication } from './ApplicationForm';

describe('Create Edit Application Form', () => {
  describe('Create Application', () => {
    it('should validate required fields on save', () => {
      cy.mount(<CreateApplication onSuccessfulCreate={(app: Application) => app} />);
      cy.clickButton(/^Create application$/);
      cy.contains('Name is required.').should('be.visible');
      cy.contains('Organization is required.').should('be.visible');
      cy.contains('Authorization grant type is required.').should('be.visible');
      cy.contains('Client type is required.').should('be.visible');
    });

    it('should create application without redirect URI', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
      cy.intercept('POST', '/api/v2/applications/', {
        statusCode: 201,
        fixture: 'application.json',
      }).as('createApplication');
      cy.mount(<CreateApplication onSuccessfulCreate={(app: Application) => app} />);
      cy.get('[data-cy="name"]').type('Create Application');
      cy.get('[data-cy="description"]').type('mock application description');
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Password');
      cy.selectDropdownOptionByResourceName('client-type', 'Confidential');
      cy.clickButton(/^Create application$/);
      cy.wait('@createApplication')
        .its('request.body')
        .then((createdApplication: Application) => {
          expect(createdApplication).to.deep.equal({
            name: 'Create Application',
            description: 'mock application description',
            organization: 1,
            authorization_grant_type: 'password',
            client_type: 'confidential',
          });
        });
    });

    it('should create application with redirect URI', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
      cy.intercept('POST', '/api/v2/applications/', {
        statusCode: 201,
        fixture: 'application.json',
      }).as('createApplication');
      cy.mount(<CreateApplication onSuccessfulCreate={(app: Application) => app} />);
      cy.get('[data-cy="name"]').type('Create Application');
      cy.get('[data-cy="description"]').type('mock application description');
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Authorization code');
      cy.selectDropdownOptionByResourceName('client-type', 'Confidential');
      cy.get('[data-cy="redirect-uris"]').type('https://www.google.com');
      cy.clickButton(/^Create application$/);
      cy.wait('@createApplication')
        .its('request.body')
        .then((createdApplication: Application) => {
          expect(createdApplication).to.deep.equal({
            name: 'Create Application',
            description: 'mock application description',
            organization: 1,
            authorization_grant_type: 'authorization-code',
            client_type: 'confidential',
            redirect_uris: 'https://www.google.com',
          });
        });
    });

    it('create application should show field error if URIs is empty and grant type is auth code', () => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/organizations/*' },
        { fixture: 'organizations.json' }
      );
      cy.intercept('POST', '/api/v2/applications/', {
        statusCode: 201,
        fixture: 'application.json',
      }).as('createApplication');
      cy.mount(<CreateApplication onSuccessfulCreate={(app: Application) => app} />);
      cy.get('[data-cy="name"]').type('Create Application');
      cy.get('[data-cy="description"]').type('mock application description');
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.selectDropdownOptionByResourceName('authorization-grant-type', 'Authorization code');
      cy.selectDropdownOptionByResourceName('client-type', 'Confidential');
      cy.get('[data-cy="redirect-uris"]').clear();
      cy.clickButton(/^Create application$/);
      cy.get('.pf-v5-c-helper-text__item-text').contains('Redirect uris is required.');
    });
  });

  describe('Edit Application', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/applications/*/' },
        { fixture: 'application.json' }
      );

      cy.fixture('organizations').then((organizations: AwxItemsResponse<Organization>) => {
        cy.intercept({ method: 'GET', url: '/api/v2/organizations/*' }, { body: organizations });
        for (const organization of organizations.results) {
          cy.intercept(
            { method: 'GET', url: `/api/v2/organizations/${organization.id}` },
            { body: organization }
          );
        }
      });
    });

    it('should preload the form with current values', () => {
      cy.mount(<EditApplication />);
      cy.verifyPageTitle('Edit test');
      cy.get('[data-cy="name"]').should('have.value', 'test');
      cy.get('[data-cy="description"]').should('have.value', 'hello');
      cy.get('[data-cy="organization"]').should('contain', 'Default');
      cy.get('[data-cy="authorization-grant-type-form-group"]').contains('Authorization code');
      cy.get('button[disabled]').should('exist');
      cy.get('[data-cy="client-type-form-group"]').contains('Confidential');
    });

    it('should edit application with redirect URI', () => {
      cy.intercept('PATCH', '/api/v2/applications/*', {
        statusCode: 201,
        fixture: 'application.json',
      }).as('editApplication');
      cy.mount(<EditApplication />);
      cy.get('[data-cy="name"]').should('have.value', 'test');
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Edited Application');
      cy.get('[data-cy="description"]').should('have.value', 'hello');
      cy.get('[data-cy="description"]').clear();
      cy.get('[data-cy="description"]').type('Edited Description');
      cy.get('[data-cy="organization"]').should('contain', 'Default');
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.get('[data-cy="client-type-form-group"]').contains('Confidential');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.get('[data-cy="redirect-uris"]').should('have.value', 'https://www.google.com');
      cy.get('[data-cy="redirect-uris"]').clear();
      cy.get('[data-cy="redirect-uris"]').type('https://www.google-edited.com');
      cy.clickButton(/^Save application$/);
      cy.wait('@editApplication')
        .its('request.body')
        .then((editedApplication: Application) => {
          expect(editedApplication.name).to.equal('Edited Application');
          expect(editedApplication.description).to.equal('Edited Description');
          expect(editedApplication.authorization_grant_type).to.equal('authorization-code');
          expect(editedApplication.client_type).to.equal('public');
          expect(editedApplication.redirect_uris).to.equal('https://www.google-edited.com');
        });
    });

    it('should edit application without redirect URI', () => {
      cy.fixture('application')
        .then((application: Application) => {
          application.authorization_grant_type = 'password';
          return application;
        })
        .then((application) => {
          cy.intercept('PATCH', '/api/v2/applications/*', {
            statusCode: 201,
            body: application,
          }).as('editApplication');
          cy.intercept(
            {
              method: 'GET',
              url: '/api/v2/applications/*',
            },
            { body: application }
          );
          cy.mount(<EditApplication />, {
            path: '/administration/applications/:id/*',
            initialEntries: ['/administration/applications/2/edit'],
          });
          cy.get('[data-cy="name"]').should('have.value', 'test');
          cy.get('[data-cy="name"]').clear();
          cy.get('[data-cy="name"]').type('Edited Application');
          cy.get('[data-cy="description"]').should('have.value', 'hello');
          cy.get('[data-cy="description"]').clear();
          cy.get('[data-cy="description"]').type('Edited Description');
          cy.get('[data-cy="organization"]').should('contain', 'Default');
          cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
          cy.get('[data-cy="client-type-form-group"]').contains('Confidential');
          cy.selectDropdownOptionByResourceName('client-type', 'Public');
          cy.get('[data-cy="redirect-uris"]').should('have.value', 'https://www.google.com');
          cy.get('[data-cy="redirect-uris"]').clear();
          cy.clickButton(/^Save application$/);
          cy.wait('@editApplication')
            .its('request.body')
            .then((editedApplication: Application) => {
              expect(editedApplication.name).to.equal('Edited Application');
              expect(editedApplication.description).to.equal('Edited Description');
              expect(editedApplication.authorization_grant_type).to.equal('password');
              expect(editedApplication.client_type).to.equal('public');
            });
        });
    });

    it('edit application should show field error if URIs is empty and grant type is auth code', () => {
      cy.intercept('PATCH', '/api/v2/applications/*', {
        statusCode: 201,
        fixture: 'application.json',
      }).as('editApplication');
      cy.mount(<EditApplication />);
      cy.get('[data-cy="name"]').should('have.value', 'test');
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Edited Application');
      cy.get('[data-cy="description"]').should('have.value', 'hello');
      cy.get('[data-cy="description"]').clear();
      cy.get('[data-cy="description"]').type('Edited Description');
      cy.get('[data-cy="organization"]').should('contain', 'Default');
      cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
      cy.get('[data-cy="client-type-form-group"]').contains('Confidential');
      cy.selectDropdownOptionByResourceName('client-type', 'Public');
      cy.get('[data-cy="redirect-uris"]').should('have.value', 'https://www.google.com');
      cy.get('[data-cy="redirect-uris"]').clear();
      cy.clickButton(/^Save application$/);
      cy.get('.pf-v5-c-helper-text__item-text').contains('Redirect uris is required');
    });
  });
});
