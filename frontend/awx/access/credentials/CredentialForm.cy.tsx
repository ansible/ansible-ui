import { CreateCredential } from './CredentialForm';
function assertOnSubFormField(formGroupName: string, labelText: string, required: boolean = false) {
  cy.getByDataCy(`${formGroupName}-form-group`).scrollIntoView();
  cy.getByDataCy(`${formGroupName}-form-group`)
    .should('be.visible')
    .within(() => {
      cy.get('label').should('include.text', labelText);
      if (required) {
        cy.get('label').should('have.descendants', 'span.pf-v5-c-form__label-required');
      }
    });
}

describe('Credential form', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/credential_types/*',
      },
      {
        fixture: 'credentialTypes.json',
      }
    );
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/credential_types/*',
      },
      {
        fixture: 'mock_options.json',
      }
    );
    cy.intercept(
      {
        method: 'OPTIONS',
        url: '/api/v2/organizations/*',
      },
      {
        fixture: 'mock_options.json',
      }
    );
    cy.intercept(
      {
        method: 'GET',
        url: '/api/v2/organizations/*',
      },
      {
        fixture: 'organizations.json',
      }
    );
    cy.mount(<CreateCredential />);
  });
  it('Validate required fields on create ', () => {
    cy.clickButton(/^Create credential$/);
    cy.contains('Name is required.').should('be.visible');
    cy.contains('Credential type is required.').should('be.visible');
  });
  it('Should render and update the static fields', () => {
    cy.get('input[placeholder="Enter name"]').type('Test credential name');
    cy.get('input[placeholder="Enter description"]').type('Test credential description');
    cy.selectSingleSelectOption('[data-cy="organization"]', 'Default');
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Amazon Web Services');
  });
  it('Create credential using Amazon Web Services', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Amazon Web Services');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('username', 'Access Key', true);
      assertOnSubFormField('password', 'Secret Key', true);
      assertOnSubFormField('security-token', 'STS Token');
    });
  });
  it('Create credential using Ansible Galaxy/Automation Hub API Token', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Ansible Galaxy/Automation Hub API Token'
    );
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('url', 'Galaxy Server URL', true);
      assertOnSubFormField('auth-url', 'Auth Server URL');
      assertOnSubFormField('token', 'API Token');
    });
  });
  it('Create credential using AWS Secrets Manager lookup', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'AWS Secrets Manager lookup');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('aws-access-key', 'AWS Access Key', true);
      assertOnSubFormField('aws-secret-key', 'AWS Secret Key', true);
    });
  });
  it('Create credential using Bitbucket Data Center HTTP Access Token', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Bitbucket Data Center HTTP Access Token'
    );
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('token', 'Token', true);
    });
  });
  it('Create credential using Centrify Vault Credential Provider Lookup', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Centrify Vault Credential Provider Lookup'
    );
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('url', 'Centrify Tenant URL', true);
      assertOnSubFormField('client-id', 'Centrify API User', true);
      assertOnSubFormField('client-password', 'Centrify API Password', true);
      assertOnSubFormField('oauth-application-id', 'OAuth2 Application ID');
      assertOnSubFormField('oauth-scope', 'OAuth2 Scope');
    });
  });
  it('Create credential using Container Registry', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Container Registry');

    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('host', 'Authentication URL', true);
      assertOnSubFormField('username', 'Username');
      assertOnSubFormField('password', 'Password or Token');
    });
  });
  it('Create credential using CyberArk Central Credential Provider Lookup', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'CyberArk Central Credential Provider Lookup'
    );
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('url', 'CyberArk CCP URL', true);
      assertOnSubFormField('webservice-id', 'Web Service ID');
      assertOnSubFormField('app-id', 'Application ID', true);
      assertOnSubFormField('client-key', 'Client Key');
      assertOnSubFormField('client-cert', 'Client Certificate');
      cy.getByDataCy('verify').should('be.visible');
    });
  });
  it('Create credential using CyberArk Conjur Secrets Manager Lookup', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'CyberArk Conjur Secrets Manager Lookup'
    );
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('url', 'Conjur URL', true);
      assertOnSubFormField('api-key', 'API Key', true);
      assertOnSubFormField('account', 'Account', true);
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('cacert', 'Public Key Certificate');
    });
  });
  it('Create credential using GitHub Personal Access Token', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'GitHub Personal Access Token');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('token', 'Token', true);
    });
  });
  it('Create credential using GitLab Personal Access Token', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'GitLab Personal Access Token');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('token', 'Token', true);
    });
  });
  it('Create credential using Google Compute Engine', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Google Compute Engine');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('username', 'Service Account Email Address', true);
      assertOnSubFormField('project', 'Project');
      assertOnSubFormField('ssh-key-data', 'RSA Private Key ', true);
      // Missing json file field for this credential type
    });
  });
  it('Create credential using GPG Public Key', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'GPG Public Key');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('gpg-public-key', 'GPG Public Key', true);
    });
  });
  it('Create credential using HashiCorp Vault Secret Lookup', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'HashiCorp Vault Secret Lookup');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('url', 'Server URL', true);
      assertOnSubFormField('token', 'Token');
      assertOnSubFormField('cacert', 'CA Certificate');
      assertOnSubFormField('role-id', 'AppRole role_id');
      assertOnSubFormField('secret-id', 'AppRole secret_id');
      assertOnSubFormField('client-cert-public', 'Client Certificate');
      assertOnSubFormField('client-cert-private', 'Client Certificate Key');
      assertOnSubFormField('client-cert-role', 'TLS Authentication Role');
      assertOnSubFormField('namespace', 'Namespace name (Vault Enterprise only)');
      assertOnSubFormField('kubernetes-role', 'Kubernetes role');
      assertOnSubFormField('username', 'Username');
      assertOnSubFormField('password', 'Password');
      assertOnSubFormField('default-auth-path', 'Path to Auth');
      assertOnSubFormField('api-version', 'API Version', true);
    });
  });
  it('Create credential using HashiCorp Vault Signed SSH', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'HashiCorp Vault Signed SSH');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('url', 'Server URL', true);
      assertOnSubFormField('token', 'Token');
      assertOnSubFormField('cacert', 'CA Certificate');
      assertOnSubFormField('role-id', 'AppRole role_id');
      assertOnSubFormField('secret-id', 'AppRole secret_id');
      assertOnSubFormField('client-cert-public', 'Client Certificate');
      assertOnSubFormField('client-cert-private', 'Client Certificate Key');
      assertOnSubFormField('client-cert-role', 'TLS Authentication Role');
      assertOnSubFormField('namespace', 'Namespace name (Vault Enterprise only)');
      assertOnSubFormField('kubernetes-role', 'Kubernetes role');
      assertOnSubFormField('username', 'Username');
      assertOnSubFormField('password', 'Password');
      assertOnSubFormField('default-auth-path', 'Path to Auth');
    });
  });
  it('Create credential using Insights', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Insights');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('password', 'Password', true);
    });
  });
  it('Create credential using Machine', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Machine');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('username', 'Username');
      assertOnSubFormField('password', 'Password');
      assertOnSubFormField('ssh-key-data', 'SSH Private Key');
      assertOnSubFormField('ssh-public-key-data', 'Signed SSH Certificate');
      assertOnSubFormField('ssh-key-unlock', 'Private Key Passphrase');
      assertOnSubFormField('become_method', 'Privilege Escalation Method');
      assertOnSubFormField('become-username', 'Privilege Escalation Username');
      assertOnSubFormField('become-password', 'Privilege Escalation Password');
    });
  });
  it('Create credential using Microsoft Azure Key Vault', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Microsoft Azure Key Vault');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('url', 'Vault URL (DNS Name)', true);
      assertOnSubFormField('client', 'Client ID', true);
      assertOnSubFormField('secret', 'Client Secret', true);
      assertOnSubFormField('tenant', 'Tenant ID', true);
      assertOnSubFormField('cloud-name', 'Cloud Environment');
    });
  });
  it('Create credential using Microsoft Azure Resource Manager', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Microsoft Azure Resource Manager');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('subscription', 'Subscription ID', true);
      assertOnSubFormField('username', 'Username');
      assertOnSubFormField('password', 'Password');
      assertOnSubFormField('client', 'Client ID');
      assertOnSubFormField('secret', 'Client Secret');
      assertOnSubFormField('tenant', 'Tenant ID');
      assertOnSubFormField('cloud-environment', 'Azure Cloud Environment');
    });
  });
  it('Create credential using Network', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Network');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('password', 'Password');
      assertOnSubFormField('ssh-key-data', 'SSH Private Key');
      assertOnSubFormField('ssh-key-unlock', 'Private Key Passphrase');
      assertOnSubFormField('authorize-password', 'Authorize Password');
      cy.getByDataCy('authorize').should('be.visible');
    });
  });
  it('Create credential using OpenShift or Kubernetes API Bearer Token', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'OpenShift or Kubernetes API Bearer Token'
    );
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('host', 'OpenShift or Kubernetes API Endpoint', true);
      assertOnSubFormField('bearer-token', 'API authentication bearer token', true);
      assertOnSubFormField('ssl-ca-cert', 'Certificate Authority data');
      cy.getByDataCy('verify_ssl').should('be.visible');
    });
  });
  it('Create credential using Openstack', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'OpenStack');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('password', 'Password (API Key)', true);
      assertOnSubFormField('host', 'Host (Authentication URL)', true);
      assertOnSubFormField('project', 'Project (Tenant Name)', true);
      assertOnSubFormField('project-domain-name', 'Project (Domain Name)');
      assertOnSubFormField('domain', 'Domain Name');
      assertOnSubFormField('region', 'Region Name');
      cy.getByDataCy('verify_ssl').should('be.visible');
    });
  });
  it('Create credential using Red Hat Ansible Automation Platform', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Red Hat Ansible Automation Platform'
    );
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('host', 'Red Hat Ansible Automation Platform', true);
      assertOnSubFormField('username', 'Username');
      assertOnSubFormField('password', 'Password');
      assertOnSubFormField('oauth-token', 'OAuth Token');
      cy.getByDataCy('verify_ssl').should('be.visible');
    });
  });
  it('Create credential using Red Hat Satellite 6', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Red Hat Satellite 6');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('host', 'Satellite 6 URL', true);
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('password', 'Password', true);
    });
  });
  it('Create credential using Red Hat Virtualization', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Red Hat Virtualization');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('host', 'Host (Authentication URL)', true);
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('password', 'Password', true);
      assertOnSubFormField('ca-file', 'CA File');
    });
  });
  it('Create credential using Source Control', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Source Control');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('username', 'Username');
      assertOnSubFormField('password', 'Password');
      assertOnSubFormField('ssh-key-data', 'SCM Private Key');
      assertOnSubFormField('ssh-key-unlock', 'Private Key Passphrase');
    });
  });
  it('Create credential using Terraform Backend Configuration', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Terraform backend configuration');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('configuration', 'Backend configuration', true);
      assertOnSubFormField('gce-credentials', 'Google Cloud Platform account credentials');
    });
  });
  it('Create credential using Thycotic DevOps Secrets Vault', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Thycotic DevOps Secrets Vault');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('tenant', 'Tenant', true);
      assertOnSubFormField('client-id', 'Client ID', true);
      assertOnSubFormField('client-secret', 'Client Secret', true);
      assertOnSubFormField('tld', 'Top-level Domain (TLD)');
    });
  });
  it('Create credential using Thycotic Secret Server', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Thycotic Secret Server');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('server-url', 'Secret Server URL', true);
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('domain', 'Domain');
      assertOnSubFormField('password', 'Password', true);
    });
  });

  it('Create credential using Vault', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', /^Vault$/);
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('vault-password', 'Vault Password', true);
      assertOnSubFormField('vault-id', 'Vault Identifier');
    });
  });
  it('Create credential using VMware vCenter', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'VMware vCenter');
    cy.get('section[role="group"]').within(() => {
      assertOnSubFormField('host', 'Center Host', true);
      assertOnSubFormField('username', 'Username', true);
      assertOnSubFormField('password', 'Password', true);
    });
  });
});
