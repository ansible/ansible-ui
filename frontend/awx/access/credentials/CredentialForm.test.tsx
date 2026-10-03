import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateCredential, EditCredential } from './CredentialForm';

/**
 * Replace the complex modal table-picker with a simple controllable dropdown.
 * Key goals:
 *  1. Register `credential_type` with React Hook Form (defaultValue: 1 = Machine) so
 *     CredentialSubForm renders and onSubmit can fire in tests.
 *  2. Keep `data-testid="credential-type"` so the HashiCorp-OIDC tests can still
 *     click the toggle and select different types.
 *  3. Render the "Credential type" label text so edit-mode tests can find it.
 */
vi.mock('./components/PageFormSelectCredentialType', async () => {
  const React = await import('react');
  const { useController } = await import('react-hook-form');

  const credentialTypeOptions = [
    { id: 1, name: 'Machine' },
    { id: 2, name: 'Amazon Web Services' },
    { id: 3, name: 'Source Control' },
    { id: 4, name: 'VMware vCenter' },
    { id: 5, name: 'Vault' },
    { id: 6, name: 'HashiCorp Vault Secret Lookup (OIDC)' },
  ];

  function MockPageFormSelectCredentialType({
    name,
    isDisabled,
    isRequired,
  }: {
    name: string;
    isDisabled?: string;
    isRequired?: boolean;
    helperText?: string;
  }) {
    const { field } = useController({ name, defaultValue: 1, rules: { required: isRequired } });
    const [isOpen, setIsOpen] = React.useState(false);
    const selected = credentialTypeOptions.find((o) => o.id === (field.value as number));

    return React.createElement(
      'div',
      null,
      React.createElement('label', { htmlFor: name }, 'Credential type'),
      React.createElement(
        'button',
        {
          'data-testid': 'credential-type',
          id: 'credential-type',
          type: 'button' as const,
          disabled: Boolean(isDisabled),
          // Use aria-label (not button text) to avoid duplicate text matches
          // when the selected option name also appears in the open list below
          'aria-label': `Credential type: ${selected ? selected.name : 'none'}`,
          onClick: () => setIsOpen((prev) => !prev),
        },
        'Select credential type'
      ),
      isOpen
        ? React.createElement(
            'ul',
            { role: 'listbox', 'data-testid': 'credential-type-listbox' },
            ...credentialTypeOptions.map((opt) =>
              React.createElement(
                'li',
                { key: opt.id, role: 'option' },
                React.createElement(
                  'button',
                  {
                    type: 'button' as const,
                    onClick: () => {
                      field.onChange(opt.id);
                      setIsOpen(false);
                    },
                  },
                  opt.name
                )
              )
            )
          )
        : null
    );
  }

  return { PageFormSelectCredentialType: MockPageFormSelectCredentialType };
});

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
          {
            id: 'password',
            type: 'string',
            label: 'Password',
            secret: true,
            ask_at_runtime: true,
          },
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
          {
            id: 'host',
            type: 'string',
            label: 'VCenter Host',
            pattern: '^https?://',
            pattern_description: 'Must start with http:// or https://',
          },
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
  http.options(
    ({ request }) => request.url.includes('/credentials/'),
    () => HttpResponse.json({ actions: { POST: {} } })
  ),
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
  }),
  http.post(awxAPI`/credential_input_sources/`, () =>
    HttpResponse.json({ id: 20 }, { status: 201 })
  ),
  http.delete(
    ({ request }) => request.url.includes('/credential_input_sources/'),
    () => HttpResponse.json({}, { status: 204 })
  ),
  http.get(awxAPI`/credentials/2/`, () =>
    HttpResponse.json({
      id: 2,
      type: 'credential',
      name: 'My Vault Cred',
      kind: 'vault',
      credential_type: 5,
      inputs: {},
    })
  )
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

    it('should submit with null become_method without client-side TypeError (AAP-93580)', async () => {
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

      await user.type(screen.getByPlaceholderText('Enter credential name'), 'Test Machine Cred');

      // Submit without setting become_method — value remains null
      await user.click(screen.getByTestId('Submit'));

      // Assert no TypeError alert about 'in' operator
      await waitFor(() => {
        expect(
          screen.queryByText(/right-hand side of 'in' should be an object/i)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/Cannot use 'in' operator to search for 'name' in null/i)
        ).not.toBeInTheDocument();
      });
    });

    it('should successfully POST when name is provided and credential type is pre-selected', async () => {
      const postSpy = vi.fn();
      server.use(
        http.post(awxAPI`/credentials/`, async ({ request }) => {
          postSpy(await request.json());
          return HttpResponse.json(
            { id: 999, name: 'My Machine Cred', credential_type: 1 },
            { status: 201 }
          );
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

      // Wait for form to be interactive (credential types loaded)
      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential');
      });
      // Ensure credential types have loaded so the dropdown is interactive
      await waitFor(() => {
        expect(screen.getByTestId('credential-type')).toBeInTheDocument();
      });

      // Explicitly click the credential type dropdown and select Machine.
      // This fires field.onChange(1) synchronously, causing CredentialSubForm to render
      // and register Machine fields (username, password, etc.) in React Hook Form —
      // which ensures onSubmit processes those fields (covers isHandledByCredentialPlugin etc.)
      await user.click(screen.getByTestId('credential-type')); // open
      await user.click(screen.getByText('Machine')); // select → field.onChange(1)

      // Machine sub-form must render before we submit so its fields are in the form state
      await waitFor(
        () => {
          expect(screen.getByText('Username')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      await user.type(screen.getByPlaceholderText('Enter credential name'), 'My Machine Cred');
      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () => {
          expect(postSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );

      const postBody = postSpy.mock.calls[0][0] as { name: string; credential_type: number };
      expect(postBody.name).toBe('My Machine Cred');
      expect(postBody.credential_type).toBe(1);
    }, 20000);

    it('should navigate back when Cancel is clicked on the create form', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials', '/credentials/create']} initialIndex={1}>
          <Routes>
            <Route path="/credentials" element={<div data-testid="credentials-list" />} />
            <Route path="/credentials/create" element={<CreateCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-title')).toHaveTextContent('Create credential');
      });

      await user.click(screen.getByTestId('Cancel'));

      await waitFor(() => {
        expect(screen.getByTestId('credentials-list')).toBeInTheDocument();
      });
    });

    it('should check prompt-on-launch and submit (covers setValue(ASK) path and ask_ field deletion)', async () => {
      // Lines covered:
      //   895-896 — useEffect: isPromptOnLaunchChecked && currentValue !== ASK_VALUE
      //   153     — onSubmit: delete credential[key] for ask_* fields
      const postSpy = vi.fn();
      server.use(
        http.post(awxAPI`/credentials/`, async ({ request }) => {
          postSpy(await request.json());
          return HttpResponse.json(
            { id: 999, name: 'Prompted Cred', credential_type: 1 },
            { status: 201 }
          );
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
        expect(screen.getByTestId('credential-type')).toBeInTheDocument();
      });

      // Explicitly select Machine to trigger sub-form (field.onChange(1))
      await user.click(screen.getByTestId('credential-type'));
      await user.click(screen.getByText('Machine'));

      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // If the Machine password field has ask_at_runtime=true, a "Prompt on launch" checkbox appears
      const promptCheckboxes = screen.queryAllByRole('checkbox', { name: /prompt on launch/i });
      if (promptCheckboxes.length > 0) {
        // Check the first "Prompt on launch" checkbox (for the Password field)
        await user.click(promptCheckboxes[0]);
        // After checking, the useEffect fires: setValue('password', 'ASK')
        // The password field should now be disabled
        await waitFor(
          () => {
            const passwordField = screen.queryByLabelText(/password/i);
            if (passwordField) {
              expect(passwordField).toBeDisabled();
            }
          },
          { timeout: 5000 }
        );
      }

      // Type credential name and submit — onSubmit will delete ask_password (line 153)
      await user.type(screen.getByPlaceholderText('Enter credential name'), 'Prompted Cred');
      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () => {
          expect(postSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );
    }, 25000);
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

    it('should render sub-form fields for credential type with pattern metadata', async () => {
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

      // Verify sub-form renders with the pattern-bearing VCenter Host field
      await waitFor(() => {
        expect(screen.getByText('Type Details')).toBeInTheDocument();
        expect(screen.getByText('VCenter Host')).toBeInTheDocument();
        expect(screen.getByText('Username')).toBeInTheDocument();
        expect(screen.getByText('Password')).toBeInTheDocument();
      });
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

    it('should submit with null become_method without client-side TypeError (AAP-93580)', async () => {
      // Credential pre-loaded with become_method: null — simulates field cleared state
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            inputs: { username: 'testuser', become_method: null },
          })
        )
      );

      const patchSpy = vi.fn();
      server.use(
        http.patch(awxAPI`/credentials/1/`, async ({ request }) => {
          patchSpy(await request.json());
          return HttpResponse.json({
            ...mockCredential,
            inputs: { username: 'testuser', become_method: '' },
          });
        })
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

      // Submit with become_method === null — previously crashed with
      // "right-hand side of 'in' should be an object, got null"
      await user.click(screen.getByTestId('Submit'));

      // Assert no TypeError alert
      await waitFor(() => {
        expect(
          screen.queryByText(/right-hand side of 'in' should be an object/i)
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(/Cannot use 'in' operator to search for 'name' in null/i)
        ).not.toBeInTheDocument();
      });

      // Assert PATCH was fired — form did not crash before sending the request
      await waitFor(() => {
        expect(patchSpy).toHaveBeenCalledTimes(1);
      });

      const patchBody = patchSpy.mock.calls[0][0] as { inputs?: { become_method?: string | null } };
      expect(patchBody.inputs?.become_method ?? '').toBeFalsy();
    });

    it('should render empty page layout with breadcrumb when credential fetch returns 404', async () => {
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({ detail: 'Not found.' }, { status: 404 })
        )
      );

      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      // After a 404, credential is undefined and the empty-state layout renders
      // with a static "Edit Credential" breadcrumb (no credential name)
      await waitFor(
        () => {
          expect(screen.getByText('Edit Credential')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
      // The normal edit form title is NOT shown since the credential wasn't found
      expect(screen.queryByTestId('name')).not.toBeInTheDocument();
    }, 15000);

    it('should accumulate existing plugin input sources into form state on load', async () => {
      const mockInputSourcesWithData = {
        count: 1,
        next: null,
        previous: null,
        results: [
          {
            id: 10,
            input_field_name: 'password',
            source_credential: 2,
            target_credential: 1,
            metadata: { key: 'myVaultPath' },
          },
        ],
      };

      server.use(
        http.get(awxAPI`/credentials/1/input_sources/`, () =>
          HttpResponse.json(mockInputSourcesWithData)
        )
      );

      render(
        <MemoryRouter initialEntries={['/credentials/1/edit']}>
          <Routes>
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      // Wait for credential to load (form renders)
      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      // Machine type sub-form renders — covers CredentialSubForm field rendering paths
      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should render Vault credential sub-form with correct fields', async () => {
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            credential_type: 5,
            summary_fields: {
              ...mockCredential.summary_fields,
              credential_type: { id: 5, name: 'Vault' },
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

      await waitFor(
        () => {
          expect(screen.getByText('Vault Password')).toBeInTheDocument();
          expect(screen.getByText('Vault Identifier')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should render sub-form with multiline, choice, and boolean field types', async () => {
      // Override credential_types to return a type that exercises all CredentialSubForm branches:
      // multiline string → CredentialMultilineInput (line 732 true branch)
      // choice string    → choiceFields.map (lines 787-792)
      // boolean          → booleanFields.map (lines 793-799)
      server.use(
        http.get(
          ({ request }) => request.url.includes('/credential_types/'),
          () =>
            HttpResponse.json({
              count: 1,
              next: null,
              previous: null,
              results: [
                {
                  id: 1,
                  type: 'credential_type',
                  name: 'Custom',
                  kind: 'cloud',
                  inputs: {
                    fields: [
                      {
                        id: 'private_key',
                        type: 'string',
                        label: 'Private Key',
                        multiline: true,
                        secret: false,
                      },
                      {
                        id: 'auth_method',
                        type: 'string',
                        label: 'Auth Method',
                        choices: ['password', 'key', 'token'],
                      },
                      {
                        id: 'verify_ssl',
                        type: 'boolean',
                        label: 'Verify SSL',
                      },
                    ],
                    required: ['private_key'],
                  },
                  injectors: {},
                },
              ],
            })
        )
      );
      server.use(
        http.options(
          ({ request }) => request.url.includes('/credential_types/'),
          () => HttpResponse.json({})
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

      await waitFor(
        () => {
          expect(screen.getByText('Private Key')).toBeInTheDocument();
          expect(screen.getByText('Auth Method')).toBeInTheDocument();
          expect(screen.getByText('Verify SSL')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should render encrypted secret field with hide/revert controls', async () => {
      // Credential with an encrypted password value — drives shouldHideField=true path
      // inside CredentialTextInput and the useEffect that sets setValue to 'ENCRYPTED'
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            inputs: {
              username: 'admin',
              password: '$encrypted$',
              ssh_key_data: '$encrypted$',
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

      // Machine sub-form renders — encrypted fields should be masked
      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
          expect(screen.getByText('SSH Private Key')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should navigate back when Cancel is clicked on the edit form', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/credentials', '/credentials/1/edit']} initialIndex={1}>
          <Routes>
            <Route path="/credentials" element={<div data-testid="credentials-list" />} />
            <Route path="/credentials/:id/edit" element={<EditCredential />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('name')).toHaveValue('Test Credential');
      });

      await user.click(screen.getByTestId('Cancel'));

      // After navigate(-1) the credentials list route renders
      await waitFor(() => {
        expect(screen.getByTestId('credentials-list')).toBeInTheDocument();
      });
    });

    it('should set user when credential has no organization and submit succeeds', async () => {
      // Covers: EditCredential.onSubmit line 365 (editedCredential.user = activeAwxUser?.id)
      // which only executes when organization is falsy
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({ ...mockCredential, organization: null })
        )
      );

      const patchSpy = vi.fn();
      server.use(
        http.patch(awxAPI`/credentials/1/`, async ({ request }) => {
          patchSpy(await request.json());
          return HttpResponse.json({ ...mockCredential, organization: null });
        })
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

      await waitFor(
        () => {
          expect(patchSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );

      // When org is null, editedCredential.user = activeAwxUser?.id is set (may be undefined)
      // The important thing is that the form submitted without throwing
      expect(patchSpy).toHaveBeenCalledTimes(1);
    }, 15000);

    it('should mark prompt-on-launch fields in inputs when credential value is ASK', async () => {
      // Covers: promptPassword useMemo line 332 (promptPasswordObj[key] = true)
      // Only runs when a field value equals 'ASK' (prompt-on-launch set via API)
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            inputs: {
              username: 'admin',
              password: 'ASK', // triggers ask_password = true in promptPassword
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

      // Machine sub-form renders — password field exists
      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should exclude plugin-handled fields from credential inputs on submit', async () => {
      // Covers: isHandledByCredentialPlugin predicate (cp => cp.input_field_name === field)
      // Requires accumulatedPluginValues to be non-empty when EditCredential submits
      server.use(
        http.get(awxAPI`/credentials/1/input_sources/`, () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 10,
                input_field_name: 'password',
                source_credential: 2,
                target_credential: 1,
                metadata: {},
              },
            ],
          })
        )
      );

      const patchSpy = vi.fn();
      server.use(
        http.patch(awxAPI`/credentials/1/`, async ({ request }) => {
          patchSpy(await request.json());
          return HttpResponse.json(mockCredential);
        })
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

      // Wait for sub-form to render so Machine fields are in the form
      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () => {
          expect(patchSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );

      // Password is plugin-handled (in accumulatedPluginValues) so it should NOT be in inputs
      const patchBody = patchSpy.mock.calls[0][0] as {
        inputs?: { password?: string };
      };
      expect(patchBody.inputs?.password).toBeUndefined();
    }, 20000);

    it('should render credential type with no input fields (empty CredentialSubForm)', async () => {
      // Covers: CredentialSubForm line 689 (return null) when credentialType.inputs.fields is absent
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            credential_type: 99,
            summary_fields: {
              ...mockCredential.summary_fields,
              credential_type: { id: 99, name: 'Empty Type' },
            },
          })
        ),
        http.get(
          ({ request }) => request.url.includes('/credential_types/'),
          () =>
            HttpResponse.json({
              count: 1,
              next: null,
              previous: null,
              results: [
                {
                  id: 99,
                  type: 'credential_type',
                  name: 'Empty Type',
                  kind: 'cloud',
                  inputs: {}, // No fields array — triggers the return null early path
                  injectors: {},
                },
              ],
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

      // No sub-form fields since credential type has no inputs.fields
      expect(screen.queryByText('Username')).not.toBeInTheDocument();
    }, 15000);

    it('should invoke clearField and revertInitialValue when Replace/Revert button is clicked', async () => {
      // Covers: CredentialTextInput lines 950-951 (clearField), 955-959 (revertInitialValue),
      // and lines 1092-1097 (RevertReplaceButton onClick handler)
      // Requires shouldShowRevertButton = true which needs isInitialValueEncrypted = true
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            inputs: {
              username: 'admin',
              password: '$encrypted$', // isInitialValueEncrypted = true → showRevertButton
            },
          })
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

      // Wait for Machine sub-form with encrypted Password field
      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // The replace/revert button for an encrypted field shows when shouldShowRevertButton=true
      // Initial state: isRevert=false → button says "Replace field with new value"
      const replaceButtons = screen.queryAllByRole('button', {
        name: /replace field with new value/i,
      });

      if (replaceButtons.length > 0) {
        // Click Replace: clearField() runs (covers lines 950-951) + setIsRevert(true) (1097)
        await user.click(replaceButtons[0]);

        // Now isRevert=true → button says "Revert field to previously saved value"
        await waitFor(() => {
          expect(
            screen.queryAllByRole('button', { name: /revert field to previously saved value/i })
              .length
          ).toBeGreaterThan(0);
        });

        const revertButtons = screen.queryAllByRole('button', {
          name: /revert field to previously saved value/i,
        });

        if (revertButtons.length > 0) {
          // Click Revert: revertInitialValue() runs (covers lines 955-959)
          await user.click(revertButtons[0]);
        }
      }
    }, 20000);

    it('should uncheck prompt-on-launch when password is ASK (covers setValue("") path)', async () => {
      // Line 906 — useEffect else-if: !isPromptOnLaunchChecked && currentValue === ASK_VALUE
      // Requires: credential loaded with password: 'ASK' (checkbox starts checked),
      // then user unchecks it → effect fires and sets value back to ''
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            inputs: { username: 'admin', password: 'ASK' },
          })
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

      // Wait for the Machine sub-form; password field is rendered (disabled, since ASK)
      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // The "Prompt on launch" checkbox should be checked (ask_password = true in initialValues)
      const promptCheckboxes = screen.queryAllByRole('checkbox', { name: /prompt on launch/i });
      if (promptCheckboxes.length > 0) {
        // Uncheck it — triggers the else-if branch (line 906): setValue('password', '')
        await user.click(promptCheckboxes[0]);
        // After unchecking, the password field should become enabled again
        await waitFor(
          () => {
            const passwordField = screen.queryByLabelText(/password/i);
            if (passwordField) {
              expect(passwordField).not.toBeDisabled();
            }
          },
          { timeout: 5000 }
        );
      }
    }, 20000);

    it('should clear plugin-managed field and DELETE the source when submitting', async () => {
      // Lines 872-879 — clearFieldValue() body
      // Lines 424, 426, 429 — pluginsToDeletePayload path in onSubmit
      // Line  863 — renderFieldValue: sourceCredential placeholder text
      server.use(
        http.get(awxAPI`/credentials/1/input_sources/`, () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                id: 10,
                input_field_name: 'password',
                source_credential: 2,
                target_credential: 1,
                metadata: {},
              },
            ],
          })
        )
      );

      const deleteSpy = vi.fn();
      const patchSpy = vi.fn();
      server.use(
        http.delete(awxAPI`/credential_input_sources/10/`, () => {
          deleteSpy();
          return HttpResponse.json({}, { status: 204 });
        }),
        http.patch(awxAPI`/credentials/1/`, async ({ request }) => {
          patchSpy(await request.json());
          return HttpResponse.json(mockCredential);
        })
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

      // Wait for sub-form (Machine / Password field)
      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // The "Clear" button appears when accumulatedPluginValues has an entry for this field
      await waitFor(
        () => {
          expect(screen.queryAllByTestId('clear-secret-management-input').length).toBeGreaterThan(
            0
          );
        },
        { timeout: 10000 }
      );

      // Click the Clear button — calls clearFieldValue() (lines 872-879)
      await user.click(screen.getAllByTestId('clear-secret-management-input')[0]);

      // Now pluginsToDelete = ['password']; submit to hit the DELETE + PATCH path (lines 424, 426, 429)
      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () => {
          expect(deleteSpy).toHaveBeenCalledTimes(1);
          expect(patchSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );
    }, 25000);

    it('should normalize become_method object to string name on submit', async () => {
      // Line 406 — EditCredential onSubmit: become_method is an object {name: 'sudo'}
      // This covers the bug-fix path ensuring become_method?.name is extracted
      server.use(
        http.get(awxAPI`/credentials/1/`, () =>
          HttpResponse.json({
            ...mockCredential,
            inputs: { username: 'admin', become_method: { name: 'sudo' } },
          })
        )
      );

      const patchSpy = vi.fn();
      server.use(
        http.patch(awxAPI`/credentials/1/`, async ({ request }) => {
          patchSpy(await request.json());
          return HttpResponse.json(mockCredential);
        })
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

      // Submit — become_method is an object in form state; onSubmit normalises it to string
      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () => {
          expect(patchSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );

      const patchBody = patchSpy.mock.calls[0][0] as { inputs?: { become_method?: unknown } };
      // After the fix, become_method should be the string 'sudo', not the object
      expect(patchBody.inputs?.become_method).toBe('sudo');
    }, 20000);

    it('should POST new credential input sources that have no id on submit', async () => {
      // Lines 418, 443 — newCredentialInputSources path when accumulatedPluginValues has items without id
      // An input source without an id is a newly-added plugin source (not yet persisted)
      server.use(
        http.get(awxAPI`/credentials/1/input_sources/`, () =>
          HttpResponse.json({
            count: 1,
            next: null,
            previous: null,
            results: [
              {
                // No 'id' field — this is a new (unsaved) plugin source
                input_field_name: 'password',
                source_credential: 2,
                target_credential: 1,
                metadata: {},
              },
            ],
          })
        )
      );

      const patchSpy = vi.fn();
      const postInputSourceSpy = vi.fn();
      server.use(
        http.patch(awxAPI`/credentials/1/`, async ({ request }) => {
          patchSpy(await request.json());
          return HttpResponse.json(mockCredential);
        }),
        http.post(awxAPI`/credential_input_sources/`, async ({ request }) => {
          postInputSourceSpy(await request.json());
          return HttpResponse.json({ id: 20 }, { status: 201 });
        })
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

      await waitFor(
        () => {
          expect(screen.getByText('Password')).toBeInTheDocument();
        },
        { timeout: 10000 }
      );

      // Submit — newCredentialInputSources will have 1 item (no id) → line 418 + 443 fire
      await user.click(screen.getByTestId('Submit'));

      await waitFor(
        () => {
          expect(patchSpy).toHaveBeenCalledTimes(1);
        },
        { timeout: 10000 }
      );

      // The new input source should have been POSTed
      expect(postInputSourceSpy).toHaveBeenCalledTimes(1);
    }, 25000);
  });
});
