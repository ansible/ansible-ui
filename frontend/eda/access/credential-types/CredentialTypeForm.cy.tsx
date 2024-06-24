import { CreateCredentialType, EditCredentialType } from './CredentialTypeForm';
import { EdaCredentialType } from '../../interfaces/EdaCredentialType';
import { edaAPI } from '../../common/eda-utils';
describe('CredentialTypeForm.cy.ts', () => {
  const credentialType = {
    name: 'Sample Credential Type',
    description: 'This is a sample credential',
    id: 1,
    organization_id: 1,
    inputs: {
      fields: [
        {
          id: 'name',
          type: 'string',
          label: 'Name',
        },
      ],
      required: ['name'],
    },
    injectors: {},
  };

  describe('Create Credential Type', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: edaAPI`/organizations/*` },
        {
          fixture: 'edaOrganizations.json',
        }
      );
    });

    it('should validate required fields on save', () => {
      cy.mount(<CreateCredentialType />);
      cy.clickButton(/^Create credential type$/);
      cy.contains('Name is required.').should('be.visible');
    });

    it('should create credential type', () => {
      cy.intercept('POST', edaAPI`/credential-types`, {
        statusCode: 201,
        body: credentialType,
      }).as('createCredentialType');
      cy.mount(<CreateCredentialType />);
      cy.get('[data-cy="name"]').type('New Credential Type');
      cy.get('[data-cy="description"]').type('New credential description');
      cy.clickButton(/^Create credential type$/);
      cy.wait('@createCredentialType')
        .its('request.body')
        .then((createdCredentialType: EdaCredentialType) => {
          expect(createdCredentialType).to.deep.equal({
            name: 'New Credential Type',
            description: 'New credential description',
            inputs: {},
            injectors: {},
          });
        });
    });
  });

  describe('Edit Credential Type', () => {
    beforeEach(() => {
      cy.intercept(
        { method: 'GET', url: edaAPI`/credential-types/*` },
        { statusCode: 200, body: credentialType }
      );
      cy.intercept(
        { method: 'GET', url: edaAPI`/organizations/*` },
        {
          fixture: 'edaOrganizations.json',
        }
      );
    });

    it('should preload the form with current values', () => {
      cy.mount(<EditCredentialType />);
      cy.verifyPageTitle('Edit Sample Credential Type');
      cy.get('[data-cy="name"]').should('have.value', 'Sample Credential Type');
      cy.get('[data-cy="description"]').should('have.value', 'This is a sample credential');
      cy.dataEditorShouldContain('[data-cy="inputs"]', credentialType.inputs);
      cy.dataEditorShouldContain('[data-cy="injectors"]', credentialType.injectors);
    });

    it('should edit credential type', () => {
      cy.intercept('PATCH', edaAPI`/credential-types/*`, {
        statusCode: 201,
        body: credentialType,
      }).as('editCredentialType');
      cy.intercept(
        { method: 'GET', url: edaAPI`/organizations/1*` },
        {
          fixture: 'edaOrganization.json',
        }
      );
      cy.mount(<EditCredentialType />);
      cy.get('[data-cy="name"]').should('have.value', 'Sample Credential Type');
      cy.get('[data-cy="name"]').clear();
      cy.get('[data-cy="name"]').type('Modified Credential Type');
      cy.clickButton(/^Save credential type$/);
      cy.wait('@editCredentialType')
        .its('request.body')
        .then((editedCredentialType: EdaCredentialType) => {
          expect(editedCredentialType.name).to.equal('Modified Credential Type');
          expect(editedCredentialType.description).to.equal('This is a sample credential');
          expect(editedCredentialType.inputs).to.deep.equal({
            fields: [
              {
                id: 'name',
                type: 'string',
                label: 'Name',
              },
            ],
            required: ['name'],
          });
        });
    });

    it('should generate extra vars', () => {
      cy.mount(<EditCredentialType />);
      cy.get('[data-cy="name"]').type('Sample Credential Type');
      cy.get('[data-cy="description"]').type('This is a sample credential');
      cy.clickButton(/^Generate extra vars$/);
      cy.dataEditorShouldContain(
        '[data-cy="injectors-g"]',
        '{"extra_vars": { "name" : "{{name}}"}}'
      );
    });
  });
});
