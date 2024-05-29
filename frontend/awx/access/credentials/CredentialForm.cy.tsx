import { CreateCredential } from './CredentialForm';
import credentialTypes from '../../../../cypress/fixtures/credentialTypes.json';
function assertOnSubFormFields(credentialType: string | RegExp) {
  const selectedType = credentialTypes.results.find((CT) => CT.name === credentialType);
  cy.get('section[role="group"]').within(() => {
    selectedType?.inputs.fields?.forEach(({ id, label, type }) => {
      if (type === 'boolean') {
        cy.getByDataCy(id).should('be.visible');
        return;
      }
      let newID = id.includes('_') ? id.split('_').join('-') : id;
      if (id === 'become_method') {
        newID = 'become_method';
      }
      const isRequired = selectedType?.inputs.required?.includes(id);

      cy.getByDataCy(`${newID}-form-group`).scrollIntoView();
      cy.getByDataCy(`${newID}-form-group`)
        .should('be.visible')
        .within(() => {
          cy.get('label').should('include.text', label);
          if (isRequired) {
            cy.get('label').should('have.descendants', 'span.pf-v5-c-form__label-required');
          }
        });
    });
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
    assertOnSubFormFields('Amazon Web Services');
  });
  it('Create credential using Ansible Galaxy/Automation Hub API Token', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Ansible Galaxy/Automation Hub API Token'
    );
    assertOnSubFormFields('Ansible Galaxy/Automation Hub API Token');
  });

  it('Create credential using AWS Secrets Manager lookup', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'AWS Secrets Manager lookup');
    assertOnSubFormFields('AWS Secrets Manager lookup');
  });
  it('Create credential using Bitbucket Data Center HTTP Access Token', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Bitbucket Data Center HTTP Access Token'
    );
    assertOnSubFormFields('Bitbucket Data Center HTTP Access Token');
  });
  it('Create credential using Centrify Vault Credential Provider Lookup', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Centrify Vault Credential Provider Lookup'
    );

    assertOnSubFormFields('Centrify Vault Credential Provider Lookup');
  });
  it('Create credential using Container Registry', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Container Registry');
    assertOnSubFormFields('Container Registry');
  });
  it('Create credential using CyberArk Central Credential Provider Lookup', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'CyberArk Central Credential Provider Lookup'
    );
    assertOnSubFormFields('CyberArk Central Credential Provider Lookup');
  });
  it('Create credential using CyberArk Conjur Secrets Manager Lookup', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'CyberArk Conjur Secrets Manager Lookup'
    );

    assertOnSubFormFields('CyberArk Conjur Secrets Manager Lookup');
  });
  it('Create credential using GitHub Personal Access Token', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'GitHub Personal Access Token');
    assertOnSubFormFields('GitHub Personal Access Token');
  });
  it('Create credential using GitLab Personal Access Token', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'GitLab Personal Access Token');
    assertOnSubFormFields('GitLab Personal Access Token');
  });
  it('Create credential using Google Compute Engine', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Google Compute Engine');
    assertOnSubFormFields('Google Compute Engine');
  });
  it('Create credential using GPG Public Key', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'GPG Public Key');
    assertOnSubFormFields('GPG Public Key');
  });
  it('Create credential using HashiCorp Vault Secret Lookup', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'HashiCorp Vault Secret Lookup');
    assertOnSubFormFields('HashiCorp Vault Secret Lookup');
  });
  it('Create credential using HashiCorp Vault Signed SSH', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'HashiCorp Vault Signed SSH');
    assertOnSubFormFields('HashiCorp Vault Signed SSH');
  });
  it('Create credential using Insights', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Insights');
    assertOnSubFormFields('Insights');
  });
  it('Create credential using Machine', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Machine');
    assertOnSubFormFields('Machine');
  });
  it('Create credential using Microsoft Azure Key Vault', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Microsoft Azure Key Vault');
    assertOnSubFormFields('Microsoft Azure Key Vault');
  });
  it('Create credential using Microsoft Azure Resource Manager', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Microsoft Azure Resource Manager');
    assertOnSubFormFields('Microsoft Azure Resource Manager');
  });
  it('Create credential using Network', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Network');
    assertOnSubFormFields('Network');
  });
  it('Create credential using OpenShift or Kubernetes API Bearer Token', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'OpenShift or Kubernetes API Bearer Token'
    );
    assertOnSubFormFields('OpenShift or Kubernetes API Bearer Token');
  });
  it('Create credential using Openstack', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'OpenStack');
    assertOnSubFormFields('OpenStack');
  });
  it('Create credential using Red Hat Ansible Automation Platform', () => {
    cy.selectSingleSelectOption(
      '[data-cy="credential_type"]',
      'Red Hat Ansible Automation Platform'
    );
    assertOnSubFormFields('Red Hat Ansible Automation Platform');
  });
  it('Create credential using Red Hat Satellite 6', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Red Hat Satellite 6');
    assertOnSubFormFields('Red Hat Satellite 6');
  });
  it('Create credential using Red Hat Virtualization', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Red Hat Virtualization');
    assertOnSubFormFields('Red Hat Virtualization');
  });
  it('Create credential using Source Control', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Source Control');
    assertOnSubFormFields('Source Control');
  });
  it('Create credential using Terraform Backend Configuration', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Terraform backend configuration');
    assertOnSubFormFields('Terraform backend configuration');
  });
  it('Create credential using Thycotic DevOps Secrets Vault', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Thycotic DevOps Secrets Vault');
    assertOnSubFormFields('Thycotic DevOps Secrets Vault');
  });
  it('Create credential using Thycotic Secret Server', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'Thycotic Secret Server');
    assertOnSubFormFields('Thycotic Secret Server');
  });

  it('Create credential using Vault', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', /^Vault$/);
    assertOnSubFormFields(/^Vault$/);
  });
  it('Create credential using VMware vCenter', () => {
    cy.selectSingleSelectOption('[data-cy="credential_type"]', 'VMware vCenter');
    assertOnSubFormFields('VMware vCenter');
  });
});
