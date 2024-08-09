import { CredentialType } from '../../interfaces/CredentialType';
import { CreateCredentialType, EditCredentialType } from './CredentialTypeForm';

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
        .then((createdCredentialType: CredentialType) => {
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
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: '/api/v2/credential_types/*' },
        { statusCode: 200, body: credentialType }
      );
    });

    it('should preload the form with current values', () => {
      cy.mount(<EditCredentialType />);
      cy.verifyPageTitle('Edit Mock Credential Type');
      cy.get('[data-cy="name"]').should('have.value', 'Mock Credential Type');
      cy.get('[data-cy="description"]').should('have.value', 'mock credential type description');
      cy.dataEditorShouldContain('[data-cy="inputs"]', credentialType.inputs);
      cy.dataEditorShouldContain('[data-cy="injectors"]', credentialType.injectors);
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
        .then((editedCredentialType: CredentialType) => {
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
          // expect(editedCredentialType.injectors).to.deep.equal({});
        });
    });
  });
});
