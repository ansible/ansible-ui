import { CreateCredential, EditCredential } from '../CredentialForm';

describe('CredentialsExternalTestModal.tsx', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credential_types/*',
      },
      {
        fixture: 'externalCredentialTypes.json',
      }
    );
  });

  it('External test modal opens when test button is selected in create credential form', () => {
    cy.mount(<CreateCredential />);
    cy.getByDataCy('name').type('foo');
    cy.getByDataCy('credential_type').click();
    cy.getByDataCy('centrify-vault-credential-provider-lookup').click();
    cy.getByDataCy('url').type('http://foo.com');
    cy.getByDataCy('client-id').type('foo');
    cy.getByDataCy('client-password').type('foo');
    cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
    cy.contains('Test external credential').should('be.visible');
  });

  it('External test modal opens when test button is selected in edit credential form', () => {
    cy.intercept('GET', '/api/v2/credentials/35/', { fixture: 'externalCredential.json' }).as(
      'getCredential'
    );
    cy.mount(<EditCredential />, {
      path: '/:id/',
      initialEntries: ['/35'],
    });
    cy.wait('@getCredential');
    cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
    cy.contains('Test external credential').should('be.visible');
  });

  it('Test button is disabled when required fields are not completed when creating a new credential', () => {
    cy.mount(<CreateCredential />);
    cy.getByDataCy('name').type('foo');
    cy.getByDataCy('credential_type').click();
    cy.getByDataCy('centrify-vault-credential-provider-lookup').click();
    cy.getByDataCy('url').type('http://foo.com');
    cy.getByDataCy('client-id').type('foo');
    cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'true');
  });

  it('Test button is disabled when required fields are not completed when editing an existing credential', () => {
    cy.intercept('GET', '/api/v2/credentials/35/', { fixture: 'externalCredential.json' }).as(
      'getCredential'
    );
    cy.mount(<EditCredential />, {
      path: '/:id/',
      initialEntries: ['/35'],
    });
    cy.wait('@getCredential');
    cy.getByDataCy('name').clear();
    cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'true');
  });

  it('Renders test button for all external credential types', () => {
    const credentialTypes = [
      'aws-secrets-manager-lookup',
      'centrify-vault-credential-provider-lookup',
      'cyberark-central-credential-provider-lookup',
      'cyberark-conjur-secrets-manager-lookup',
      'hashicorp-vault-secret-lookup',
      'hashicorp-vault-signed-ssh',
      'microsoft-azure-key-vault',
      'thycotic-devops-secrets-vault',
      'thycotic-secret-server',
    ];
    cy.mount(<CreateCredential />);
    cy.getByDataCy('name').type('foo');
    credentialTypes.forEach((type) => {
      cy.getByDataCy('credential_type').click();
      cy.getByDataCy(type).click();
      cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'true');
    });
  });

  it('Renders correct fields in modal for each credential type', () => {
    const credentialTypes = [
      {
        name: 'aws-secrets-manager-lookup',
        inputs: {
          fields: [
            {
              id: 'aws-access-key',
              input: 'foo',
            },
            {
              id: 'aws-secret-key',
              input: 'foo',
            },
          ],
          modal_fields: ['region-name', 'secret-name'],
        },
      },
      {
        name: 'centrify-vault-credential-provider-lookup',
        inputs: {
          fields: [
            {
              id: 'url',
              input: 'http://foo.com',
            },
            {
              id: 'client-id',
              input: 'foo',
            },
            {
              id: 'client-password',
              input: 'foo',
            },
          ],
          modal_fields: ['account-name', 'system-name'],
        },
      },
      {
        name: 'cyberark-central-credential-provider-lookup',
        inputs: {
          fields: [
            {
              id: 'url',
              input: 'http://foo.com',
            },
            {
              id: 'app-id',
              input: 'foo',
            },
          ],
          modal_fields: ['object-query', 'object-query-format', 'object-property', 'reason'],
        },
      },
      {
        name: 'cyberark-conjur-secrets-manager-lookup',
        inputs: {
          fields: [
            {
              id: 'url',
              input: 'http://foo.com',
            },
            {
              id: 'api-key',
              input: 'foo',
            },
            {
              id: 'account',
              input: 'foo',
            },
            {
              id: 'username',
              input: 'foo',
            },
          ],
          modal_fields: ['secret-path', 'secret-version'],
        },
      },
      {
        name: 'hashicorp-vault-secret-lookup',
        inputs: {
          fields: [
            {
              id: 'url',
              input: 'http://foo.com',
            },
            {
              id: 'api-version',
              choice: 'v1',
            },
          ],
          modal_fields: [
            'secret-backend',
            'secret-path',
            'auth-path',
            'secret-key',
            'secret-version',
          ],
        },
      },
      {
        name: 'hashicorp-vault-signed-ssh',
        inputs: {
          fields: [
            {
              id: 'url',
              input: 'http://foo.com',
            },
          ],
          modal_fields: ['public-key', 'secret-path', 'auth-path', 'role', 'valid-principals'],
        },
      },
      {
        name: 'microsoft-azure-key-vault',
        inputs: {
          fields: [
            {
              id: 'url',
              input: 'http://foo.com',
            },
            {
              id: 'client',
              input: 'foo',
            },
            {
              id: 'secret',
              input: 'foo',
            },
            {
              id: 'tenant',
              input: 'foo',
            },
          ],
          modal_fields: ['secret-field', 'secret-version'],
        },
      },
      {
        name: 'thycotic-devops-secrets-vault',
        inputs: {
          fields: [
            {
              id: 'tenant',
              input: 'foo',
            },
            {
              id: 'client-id',
              input: 'foo',
            },
            {
              id: 'client-secret',
              input: 'foo',
            },
          ],
          modal_fields: ['path', 'secret-field', 'secret-decoding'],
        },
      },
      {
        name: 'thycotic-secret-server',
        inputs: {
          fields: [
            {
              id: 'server-url',
              input: 'http://foo.com',
            },
            {
              id: 'username',
              input: 'foo',
            },
            {
              id: 'password',
              input: 'foo',
            },
          ],
          modal_fields: ['secret-id', 'secret-field'],
        },
      },
    ];
    cy.mount(<CreateCredential />);
    cy.getByDataCy('name').type('foo');
    credentialTypes.forEach((type) => {
      cy.getByDataCy('credential_type').click();
      cy.getByDataCy(type.name).click();
      type.inputs.fields.map((field) => {
        field.input && cy.getByDataCy(field.id).type(field.input);
        field.choice &&
          cy.getByDataCy(`${field.id}-form-group`).within(() => {
            cy.get('.pf-v5-c-select__toggle-arrow').click({ force: true });
            cy.getByDataCy(field.choice).click();
          });
      });
      cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
      type.inputs.modal_fields.map((field) => {
        cy.getByDataCy(`${field}-form-group`).should('be.visible');
      });
      cy.clickModalButton('Cancel');
    });
  });

  it('Handles error when required fields are not filled in modal', () => {
    cy.mount(<CreateCredential />);
    cy.getByDataCy('name').type('foo');
    cy.getByDataCy('credential_type').click();
    cy.getByDataCy('centrify-vault-credential-provider-lookup').click();
    cy.getByDataCy('url').type('http://foo.com');
    cy.getByDataCy('client-id').type('foo');
    cy.getByDataCy('client-password').type('foo');
    cy.get('button').contains('Test').should('have.attr', 'aria-disabled', 'false').click();
    cy.contains('Test external credential').should('be.visible');
    cy.getByDataCy('account-name').type('foo');
    cy.get('button').contains('Run').should('have.attr', 'aria-disabled', 'false').click();
    cy.contains('System name is required.').should('be.visible');
  });
});
