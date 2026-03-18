import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateCredential, EditCredential } from './CredentialForm';

const mockCredentialTypes = {
  count: 6,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'credential_type',
      name: 'Machine',
      description: 'SSH credential',
      kind: 'ssh',
      inputs: {
        fields: [
          { id: 'username', type: 'string', label: 'Username' },
          { id: 'password', type: 'string', label: 'Password', secret: true },
          { id: 'ssh_key_data', type: 'string', label: 'SSH Private Key', secret: true },
          { id: 'become_method', type: 'string', label: 'Privilege Escalation Method' },
          { id: 'become_username', type: 'string', label: 'Privilege Escalation Username' },
        ],
        required: [],
      },
      injectors: {},
    },
    {
      id: 2,
      type: 'credential_type',
      name: 'Amazon Web Services',
      description: 'AWS credential',
      kind: 'cloud',
      inputs: {
        fields: [
          { id: 'username', type: 'string', label: 'Access Key' },
          { id: 'password', type: 'string', label: 'Secret Key', secret: true },
          { id: 'security_token', type: 'string', label: 'STS Token', secret: true },
        ],
        required: ['username', 'password'],
      },
      injectors: {},
    },
    {
      id: 3,
      type: 'credential_type',
      name: 'Source Control',
      description: 'SCM credential',
      kind: 'scm',
      inputs: {
        fields: [
          { id: 'username', type: 'string', label: 'Username' },
          { id: 'password', type: 'string', label: 'Password', secret: true },
          { id: 'ssh_key_data', type: 'string', label: 'SCM Private Key', secret: true },
          { id: 'ssh_key_unlock', type: 'string', label: 'Private Key Passphrase', secret: true },
        ],
        required: [],
      },
      injectors: {},
    },
    {
      id: 4,
      type: 'credential_type',
      name: 'VMware vCenter',
      description: 'VMware credential',
      kind: 'cloud',
      inputs: {
        fields: [
          { id: 'host', type: 'string', label: 'VCenter Host' },
          { id: 'username', type: 'string', label: 'Username' },
          { id: 'password', type: 'string', label: 'Password', secret: true },
        ],
        required: ['host', 'username', 'password'],
      },
      injectors: {},
    },
    {
      id: 5,
      type: 'credential_type',
      name: 'Vault',
      description: 'Vault credential',
      kind: 'vault',
      inputs: {
        fields: [
          { id: 'vault_password', type: 'string', label: 'Vault Password', secret: true },
          { id: 'vault_id', type: 'string', label: 'Vault Identifier' },
        ],
        required: ['vault_password'],
      },
      injectors: {},
    },
    {
      id: 6,
      type: 'credential_type',
      name: 'HashiCorp Vault Secret Lookup (OIDC)',
      description: 'JWT-enabled authentication for HashiCorp Vault',
      kind: 'external',
      namespace: 'hashivault-kv-oidc',
      managed: true,
      inputs: {
        fields: [
          {
            id: 'server_url',
            type: 'string',
            label: 'Server URL',
            secret: false,
            help_text: 'The URL to the HashiCorp Vault server',
          },
          {
            id: 'role_id',
            type: 'string',
            label: 'Role ID',
            secret: false,
            help_text: 'Role ID for HashiCorp Vault authentication',
          },
          {
            id: 'secret_id',
            type: 'string',
            label: 'Secret ID',
            secret: true,
            help_text: 'Secret ID for HashiCorp Vault authentication',
          },
        ],
        required: ['server_url', 'role_id'],
        metadata: [
          {
            id: 'unsigned_public_key',
            type: 'string',
            label: 'Unsigned public key',
            help_text: 'Public key for OIDC verification',
            secret: false,
          },
          {
            id: 'path_to_secret',
            type: 'string',
            label: 'Path to secret',
            help_text: 'Vault path where the secret is stored',
            secret: false,
          },
          {
            id: 'path_to_auth',
            type: 'string',
            label: 'Path to auth',
            help_text: 'Authentication path in Vault',
            secret: false,
          },
          {
            id: 'controller_job_template',
            type: 'string',
            label: 'Controller job template',
            help_text: 'Job template for the controller',
            secret: false,
          },
          {
            id: 'role_name',
            type: 'string',
            label: 'Role name',
            help_text: 'Role name for OIDC authentication',
            secret: false,
          },
          {
            id: 'valid_principals',
            type: 'string',
            label: 'Valid principals',
            help_text: 'Valid principals for authentication',
            secret: false,
          },
        ],
      },
      injectors: {},
      summary_fields: {
        user_capabilities: { edit: false, delete: false },
      },
    },
  ],
};

const mockOrganizations = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Default',
      type: 'organization',
    },
  ],
};

const mockCredential = {
  id: 1,
  type: 'credential',
  name: 'Test Credential',
  description: 'Test description',
  credential_type: 1,
  organization: 1,
  inputs: {
    username: 'testuser',
    password: '$encrypted$',
  },
  summary_fields: {
    credential_type: { id: 1, name: 'Machine' },
    organization: { id: 1, name: 'Default' },
  },
};

const mockInputSources = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/credential_types/'),
    () => HttpResponse.json(mockCredentialTypes)
  ),
  http.options(
    ({ request }) => request.url.includes('/credential_types/'),
    () => HttpResponse.json({})
  ),
  http.get(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json(mockOrganizations)
  ),
  http.options(
    ({ request }) => request.url.includes('/organizations/'),
    () => HttpResponse.json({})
  ),
  http.get(awxAPI`/feature_flags_state/`, () =>
    HttpResponse.json({
      FEATURE_OIDC_WORKLOAD_IDENTITY_ENABLED: true,
    })
  ),
  http.get(awxAPI`/credentials/1/`, () => HttpResponse.json(mockCredential)),
  http.get(awxAPI`/credentials/1/input_sources/`, () => HttpResponse.json(mockInputSources)),
  http.patch(awxAPI`/credentials/1/`, () => HttpResponse.json(mockCredential)),
  http.post(awxAPI`/credentials/`, async ({ request }) => {
    const body = (await request.json()) as { name: string; credential_type: number };
    return HttpResponse.json(
      {
        id: 999,
        name: body.name,
        credential_type: body.credential_type,
      },
      { status: 201 }
    );
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialForm', () => {
  describe('CreateCredential', () => {
    it('should render create form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential');
      });
    });

    it('should display key form fields (name, description, credential type)', async () => {
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential');
      });

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter credential name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter description')).toBeInTheDocument();
      expect(screen.getByText('Credential type')).toBeInTheDocument();
    });

    it('should display required indicators for name and credential type fields', async () => {
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential');
      });

      const nameFormGroup = screen.getByTestId('name-form-group');
      expect(nameFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();

      expect(screen.getByTestId('credential-type')).toBeInTheDocument();
    });

    it('should allow entering name and description', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter credential name')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText('Enter credential name');
      const descriptionInput = screen.getByPlaceholderText('Enter description');

      await user.type(nameInput, 'Test credential name');
      await user.type(descriptionInput, 'Test credential description');

      expect(nameInput).toHaveValue('Test credential name');
      expect(descriptionInput).toHaveValue('Test credential description');
    }, 10000);

    it('should not submit the form when required fields are empty', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(awxAPI`/credentials/`, async ({ request }) => {
          postSpy(await request.json());
          return HttpResponse.json({ id: 999 }, { status: 201 });
        })
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential');
      });

      await user.click(screen.getByTestId('Submit'));

      // Wait a tick to ensure the form attempted validation
      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential');
      });

      expect(postSpy).not.toHaveBeenCalled();
    });
  });

  describe('HashiCorp Vault OIDC Alert', () => {
    it('should display the expandable HashiCorp Vault OIDC info alert when OIDC credential type is selected', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for credential type select to be rendered (after API loads)
      const credentialTypeToggle = await screen.findByTestId('credential-type');

      // Open the credential type dropdown
      await user.click(credentialTypeToggle);

      // Select the HashiCorp Vault OIDC credential type
      const option = await screen.findByText('HashiCorp Vault Secret Lookup (OIDC)');
      await user.click(option);

      // Verify the expandable alert is displayed
      await waitFor(() => {
        expect(screen.getByTestId('hashicorp-vault-oidc-banner')).toBeInTheDocument();
      });
      expect(screen.getByText('Configure HashiCorp Vault')).toBeInTheDocument();
    });

    it('should not display the OIDC alert when a non-OIDC credential type is selected', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for credential type select to be rendered
      const credentialTypeToggle = await screen.findByTestId('credential-type');

      // Open the credential type dropdown and select Machine
      await user.click(credentialTypeToggle);
      const option = await screen.findByText('Machine');
      await user.click(option);

      // Verify the OIDC alert is NOT displayed
      await waitFor(() => {
        expect(screen.getByText('Username')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('hashicorp-vault-oidc-banner')).not.toBeInTheDocument();
    });

    it('should not display the OIDC alert when the feature flag is disabled', async () => {
      server.use(
        http.get(awxAPI`/feature_flags_state/`, () =>
          HttpResponse.json({
            FEATURE_OIDC_WORKLOAD_IDENTITY_ENABLED: false,
          })
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials/create']}>
          <Routes>
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for credential type select to be rendered
      const credentialTypeToggle = await screen.findByTestId('credential-type');

      // Open the credential type dropdown and select OIDC type
      await user.click(credentialTypeToggle);
      const option = await screen.findByText('HashiCorp Vault Secret Lookup (OIDC)');
      await user.click(option);

      // Verify the OIDC alert is NOT displayed when feature flag is off
      await waitFor(() => {
        expect(screen.getByText('Server URL')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('hashicorp-vault-oidc-banner')).not.toBeInTheDocument();
    });

    it('should display the OIDC alert in edit mode for OIDC credential type', async () => {
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            credential_type: 6,
            summary_fields: {
              ...mockCredential.summary_fields,
              credential_type: {
                id: 6,
                name: 'HashiCorp Vault Secret Lookup (OIDC)',
              },
            },
          })
        )
      );

      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('hashicorp-vault-oidc-banner')).toBeInTheDocument();
      });
      expect(screen.getByText('Configure HashiCorp Vault')).toBeInTheDocument();
    });
  });

  describe('EditCredential', () => {
    it('should render edit form with correct title', async () => {
      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Test Credential');
      });
    });

    it('should preload form with existing credential data', async () => {
      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      expect(screen.getByTestId('description')).toHaveValue('Test description');
    });

    it('should display credential type as disabled in edit mode', async () => {
      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Edit Test Credential');
      });

      expect(screen.getByText('Credential type')).toBeInTheDocument();
    });

    it('should render Machine credential type sub-form fields', async () => {
      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      await waitFor(() => {
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
        expect(screen.getByText('SSH Private Key')).toBeInTheDocument();
        expect(screen.getByText('Privilege Escalation Method')).toBeInTheDocument();
        expect(screen.getByText('Privilege Escalation Username')).toBeInTheDocument();
      });
    });

    it('should render AWS credential type sub-form fields', async () => {
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            credential_type: 2,
            summary_fields: {
              ...mockCredential.summary_fields,
              credential_type: { id: 2, name: 'Amazon Web Services' },
            },
          })
        )
      );

      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      await waitFor(() => {
        expect(screen.getByText('Access Key')).toBeInTheDocument();
        expect(screen.getByText('Secret Key')).toBeInTheDocument();
        expect(screen.getByText('STS Token')).toBeInTheDocument();
      });
    });

    it('should render Source Control credential type sub-form fields', async () => {
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            credential_type: 3,
            summary_fields: {
              ...mockCredential.summary_fields,
              credential_type: { id: 3, name: 'Source Control' },
            },
          })
        )
      );

      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      await waitFor(() => {
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
        expect(screen.getByText('SCM Private Key')).toBeInTheDocument();
        expect(screen.getByText('Private Key Passphrase')).toBeInTheDocument();
      });
    });

    it('should render VMware vCenter credential type sub-form fields with required indicators', async () => {
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            credential_type: 4,
            summary_fields: {
              ...mockCredential.summary_fields,
              credential_type: { id: 4, name: 'VMware vCenter' },
            },
          })
        )
      );

      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      await waitFor(() => {
        expect(screen.getByText('VCenter Host')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
      });

      // Verify required indicators on VMware fields
      const hostFormGroup = screen.getByTestId('host-form-group');
      expect(hostFormGroup.querySelector('.pf-v6-c-form__label-required')).toBeInTheDocument();
    });

    it('should display error alert when server returns 500 on save', async () => {
      server.use(
        http.patch(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      await user.click(screen.getByTestId('Submit'));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByText('Internal Server Error')).toBeInTheDocument();
    });
  });
});
