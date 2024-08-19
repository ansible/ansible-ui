import { edaAPI } from '../../common/eda-utils';
import { CredentialTypes } from './CredentialTypes';

describe('CredentialTypes.cy.ts', () => {
  beforeEach(() => {
    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/*` },
      {
        fixture: 'edaCredentialTypes.json',
      }
    );

    cy.intercept(
      { method: 'GET', url: edaAPI`/credential-types/*` },
      {
        count: 6,
        next: null,
        previous: null,
        page_size: 10,
        page: 1,
        results: [
          {
            name: 'Source Control',
            namespace: 'scm',
            kind: 'scm',
            description: '',
            inputs: {
              fields: [
                {
                  id: 'username',
                  type: 'string',
                  label: 'Username',
                },
                {
                  id: 'password',
                  type: 'string',
                  label: 'Password',
                  secret: true,
                },
                {
                  id: 'ssh_key_data',
                  type: 'string',
                  label: 'SCM Private Key',
                  format: 'ssh_private_key',
                  secret: true,
                  multiline: true,
                },
                {
                  id: 'ssh_key_unlock',
                  type: 'string',
                  label: 'Private Key Passphrase',
                  secret: true,
                },
              ],
            },
            injectors: {},
            id: 1,
            created_at: '2024-04-10T17:43:26.032037Z',
            modified_at: '2024-04-10T17:43:26.032048Z',
            managed: true,
          },
          {
            name: 'Container Registry',
            namespace: 'registry',
            kind: 'registry',
            description: '',
            inputs: {
              fields: [
                {
                  id: 'host',
                  type: 'string',
                  label: 'Authentication URL',
                  default: 'quay.io',
                  help_text: 'Authentication endpoint for the container registry.',
                },
                {
                  id: 'username',
                  type: 'string',
                  label: 'Username',
                },
                {
                  id: 'password',
                  type: 'string',
                  label: 'Password or Token',
                  secret: true,
                  help_text: 'A password or token used to authenticate with.',
                },
                {
                  id: 'verify_ssl',
                  type: 'boolean',
                  label: 'Verify SSL',
                  default: true,
                },
              ],
              required: ['host'],
            },
            injectors: {},
            id: 2,
            created_at: '2024-04-10T17:43:26.033502Z',
            modified_at: '2024-04-10T17:43:26.033509Z',
            managed: true,
          },
          {
            name: 'GPG Public Key',
            namespace: 'gpg_public_key',
            kind: 'cryptography',
            description: '',
            inputs: {
              fields: [
                {
                  id: 'gpg_public_key',
                  type: 'string',
                  label: 'GPG Public Key',
                  secret: true,
                  help_text: 'GPG Public Key used to validate content signatures.',
                  multiline: true,
                },
              ],
              required: ['gpg_public_key'],
            },
            injectors: {},
            id: 3,
            created_at: '2024-04-10T17:43:26.034463Z',
            modified_at: '2024-04-10T17:43:26.034469Z',
            managed: true,
          },
          {
            name: 'Red Hat Ansible Automation Platform',
            namespace: 'controller',
            kind: 'cloud',
            description: '',
            inputs: {
              fields: [
                {
                  id: 'host',
                  type: 'string',
                  label: 'Red Hat Ansible Automation Platform',
                  help_text: 'Red Hat Ansible Automation Platform base URL to authenticate with.',
                },
                {
                  id: 'username',
                  type: 'string',
                  label: 'Username',
                  help_text:
                    'Red Hat Ansible Automation Platform username id to authenticate as.This should not be set if an OAuth token is being used.',
                },
                {
                  id: 'password',
                  type: 'string',
                  label: 'Password',
                  secret: true,
                },
                {
                  id: 'oauth_token',
                  type: 'string',
                  label: 'OAuth Token',
                  secret: true,
                  help_text:
                    'An OAuth token to use to authenticate with.This should not be set if username/password are being used.',
                },
                {
                  id: 'verify_ssl',
                  type: 'boolean',
                  label: 'Verify SSL',
                  secret: false,
                },
              ],
              required: ['host'],
            },
            injectors: {
              env: {
                TOWER_HOST: '{{host}}',
                TOWER_PASSWORD: '{{password}}',
                TOWER_USERNAME: '{{username}}',
                CONTROLLER_HOST: '{{host}}',
                TOWER_VERIFY_SSL: '{{verify_ssl}}',
                TOWER_OAUTH_TOKEN: '{{oauth_token}}',
                CONTROLLER_PASSWORD: '{{password}}',
                CONTROLLER_USERNAME: '{{username}}',
                CONTROLLER_VERIFY_SSL: '{{verify_ssl}}',
                CONTROLLER_OAUTH_TOKEN: '{{oauth_token}}',
              },
            },
            id: 4,
            created_at: '2024-04-10T17:43:26.035443Z',
            modified_at: '2024-04-10T17:43:26.035451Z',
            managed: true,
          },
          {
            name: 'Vault',
            namespace: 'vault',
            kind: 'vault',
            description: '',
            inputs: {
              fields: [
                {
                  id: 'vault_password',
                  type: 'string',
                  label: 'Vault Password',
                  secret: true,
                  ask_at_runtime: true,
                },
                {
                  id: 'vault_id',
                  type: 'string',
                  label: 'Vault Identifier',
                  format: 'vault_id',
                  help_text:
                    'Specify an (optional) Vault ID. This is equivalent to specifying the --vault-id Ansible parameter for providing multiple Vault passwords.  Note: this  feature only works in Ansible 2.4+.',
                },
              ],
              required: ['vault_password'],
            },
            injectors: {},
            id: 5,
            created_at: '2024-04-10T17:43:26.036378Z',
            modified_at: '2024-04-10T17:43:26.036384Z',
            managed: true,
          },
          {
            name: 'Sample Type',
            namespace: null,
            kind: 'cloud',
            description: '',
            inputs: {
              fields: [
                {
                  id: 'username',
                  type: 'string',
                  label: 'Username',
                },
                {
                  id: 'password',
                  type: 'string',
                  label: 'Password',
                  secret: true,
                },
              ],
            },
            injectors: {
              extra_vars: {
                password: '{{password}}',
                username: '{{username}}',
              },
            },
            id: 6,
            created_at: '2024-04-10T18:35:41.321559Z',
            modified_at: '2024-04-10T18:35:41.321569Z',
            managed: false,
          },
        ],
      }
    );
  });

  it('Renders the correct credentials columns', () => {
    cy.mount(<CredentialTypes />);
    cy.get('h1').should('contain', 'Credential Types');
    cy.get('tbody').find('tr').should('have.length', 6);
    cy.contains(
      /^Define custom credential types to support authentication with other systems during automation.$/
    ).should('be.visible');
    cy.contains('th', 'Name');
  });
  it('Renders all rows', () => {
    cy.mount(<CredentialTypes />);
    cy.get(
      '[data-cy="row-id-1"] > [data-cy="name-column-cell"] > .pf-v5-l-split > .pf-v5-l-flex > [style="max-width: 100%;"] > div'
    ).should('contain', 'Source Control');
    cy.get(
      '[data-cy="row-id-2"] > [data-cy="name-column-cell"] > .pf-v5-l-split > .pf-v5-l-flex > [style="max-width: 100%;"] > div'
    ).should('contain', 'Container Registry');
    cy.get(
      '[data-cy="row-id-3"] > [data-cy="name-column-cell"] > .pf-v5-l-split > .pf-v5-l-flex > [style="max-width: 100%;"] > div'
    ).should('contain', 'GPG Public Key');
    cy.get(
      '[data-cy="row-id-4"] > [data-cy="name-column-cell"] > .pf-v5-l-split > .pf-v5-l-flex > [style="max-width: 100%;"] > div'
    ).should('contain', 'Red Hat Ansible Automation Platform');
    cy.get(
      '[data-cy="row-id-5"] > [data-cy="name-column-cell"] > .pf-v5-l-split > .pf-v5-l-flex > [style="max-width: 100%;"] > div'
    ).should('contain', 'Vault');
    cy.get(
      '[data-cy="row-id-6"] > [data-cy="name-column-cell"] > .pf-v5-l-split > .pf-v5-l-flex > [style="max-width: 100%;"] > div'
    ).should('contain', 'Sample Type');
    cy.get('tbody').find('tr').should('have.length', 6);
    cy.contains(
      /^Define custom credential types to support authentication with other systems during automation.$/
    ).should('be.visible');
    cy.contains('th', 'Name');
  });
});

describe('Empty list without POST permission', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/credential-types/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<CredentialTypes />);
    cy.contains(/^You do not have permission to create a credential type.$/);
    cy.contains(
      /^Please contact your organization administrator if there is an issue with your access.$/
    );
  });
});

describe('Empty list with POST permission', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'OPTIONS',
        url: edaAPI`/credential-types/`,
      },
      {
        fixture: 'edaCredentialTypesOptions.json',
      }
    ).as('getOptions');
    cy.intercept(
      {
        method: 'GET',
        url: edaAPI`/credential-types/*`,
      },
      {
        fixture: 'emptyList.json',
      }
    ).as('emptyList');
  });
  it('Empty state is displayed correctly', () => {
    cy.mount(<CredentialTypes />);
    cy.contains(/^There are currently no credential types created for your organization.$/);
    cy.contains(/^Please create a credential type by using the button below.$/);
    cy.contains('button', /^Create credential type$/).should('be.visible');
  });
});
