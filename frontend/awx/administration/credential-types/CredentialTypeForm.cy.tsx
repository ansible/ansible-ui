import { CreateCredentialType, EditCredentialType } from './CredentialTypeForm';
import type { CredentialTypeForm } from './CredentialTypeForm';

describe('CredentialTypeForm.cy.ts', () => {
  const credentialType = {
    name: 'Mock Credential Type',
    description: 'mock credential type description',
    kind: 'cloud',
    id: 1,
    inputs: {
      fields: [
        {
          id: 'username',
          type: 'string',
          label: 'Username',
        },
      ],
      required: ['username'],
    },
    injectors: {},
  };

  describe('Create Credential Type', () => {
    it('should validate required fields on save', () => {
      cy.mount(<CreateCredentialType />);
      cy.clickButton(/^Create credential type$/);
      cy.contains('Name is required.').should('be.visible');
    });

    it('should create credential type', () => {
      cy.intercept('POST', '/api/v2/credential_types/', {
        statusCode: 201,
        body: credentialType,
      }).as('createCredentialType');
      cy.mount(<CreateCredentialType />);
      cy.get('[data-cy="name"]').type('Created Credential Type');
      cy.get('[data-cy="description"]').type('mock credential type description');
      cy.clickButton(/^Create credential type$/);
      cy.wait('@createCredentialType')
        .its('request.body')
        .then((createdCredentialType: CredentialTypeForm) => {
          expect(createdCredentialType).to.deep.equal({
            name: 'Created Credential Type',
            description: 'mock credential type description',
            kind: 'cloud',
            inputs: {},
            injectors: {},
          });
        });
    });
  });

  describe('Edit Credential Type', () => {
    let inputsContent = '';
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/credential_types/*' },
        {
          statusCode: 200,
          body: credentialType,
        }
      );
      cy.fixture('inputs.yaml').then((yaml: string) => {
        inputsContent = yaml;
      });
    });

    it('should preload the form with current values', () => {
      cy.mount(<EditCredentialType />);
      cy.verifyPageTitle('Edit Credential Type');
      cy.get('[data-cy="name"]').should('have.value', 'Mock Credential Type');
      cy.get('[data-cy="description"]').should('have.value', 'mock credential type description');
      cy.get('[data-cy="inputs"]').find('textarea').should('have.value', inputsContent);
      cy.get('[data-cy="injectors"]').find('textarea').should('have.value', '---\n');
    });

    it('should edit credential type', () => {
      cy.intercept('PATCH', '/api/v2/credential_types/*', {
        statusCode: 201,
        body: credentialType,
      }).as('editCredentialType');
      cy.mount(<EditCredentialType />);
      cy.get('[data-cy="name"]').should('have.value', 'Mock Credential Type');
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Edited Credential Type');
      cy.clickButton(/^Save credential type$/);
      cy.wait('@editCredentialType')
        .its('request.body')
        .then((editedCredentialType: CredentialTypeForm) => {
          expect(editedCredentialType.name).to.equal('Edited Credential Type');
          expect(editedCredentialType.description).to.equal('mock credential type description');
          expect(editedCredentialType.inputs).to.deep.equal({
            fields: [
              {
                id: 'username',
                type: 'string',
                label: 'Username',
              },
            ],
            required: ['username'],
          });
          expect(editedCredentialType.injectors).to.deep.equal({});
        });
    });
  });
});
