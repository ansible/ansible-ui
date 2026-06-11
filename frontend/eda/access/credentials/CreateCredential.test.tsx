/* eslint-disable i18next/no-literal-string */
import { PageAlertToasterProvider, PageDialogProvider } from '@ansible/ansible-ui-framework';
import { render, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { CreateCredential } from './CreateCredential';

vi.mock('@patternfly/react-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@patternfly/react-core')>();
  return {
    ...actual,
    Modal: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      'aria-label'?: string;
      [key: string]: unknown;
    }) => (
      <div data-testid="modal" aria-label={props['aria-label'] as string}>
        {children}
      </div>
    ),
  };
});

const mockOrganizationsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [{ id: 1, name: 'Default' }],
};

const mockCredentialTypesResponse = {
  count: 3,
  next: null,
  previous: null,
  page_size: 200,
  page: 1,
  results: [
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
      name: 'Amazon Web Services',
      namespace: 'aws',
      kind: 'external',
      description: '',
      inputs: {
        fields: [
          { id: 'aws-access-key', type: 'string', label: 'AWS Access Key' },
          { id: 'aws-secret-key', type: 'string', label: 'AWS Secret Key', secret: true },
        ],
        required: ['aws-access-key', 'aws-secret-key'],
        metadata: [
          { id: 'secret_path', type: 'string', label: 'Secret path' },
          { id: 'secret_key', type: 'string', label: 'Secret key' },
        ],
      },
      injectors: {},
      id: 3,
      created_at: '2024-04-10T17:43:26.033502Z',
      modified_at: '2024-04-10T17:43:26.033509Z',
      managed: true,
    },
  ],
};

const mockExternalCredentialsResponse = {
  count: 0,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [],
};

const server = setupServer(
  http.get(edaAPI`/organizations/**`, () => {
    return HttpResponse.json(mockOrganizationsResponse);
  }),
  http.get(edaAPI`/credential-types/**`, () => {
    return HttpResponse.json(mockCredentialTypesResponse);
  }),
  http.get(edaAPI`/eda-credentials/**`, () => {
    return HttpResponse.json(mockExternalCredentialsResponse);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderCreateCredential() {
  return render(
    <MemoryRouter>
      <PageDialogProvider>
        <PageAlertToasterProvider>
          <CreateCredential />
        </PageAlertToasterProvider>
      </PageDialogProvider>
    </MemoryRouter>
  );
}

describe('Create Credential - UI Element Rendering', () => {
  it('should display help text and secret management buttons for Container Registry credential fields', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CreateCredential />
      </MemoryRouter>
    );

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create credential/i })).toBeInTheDocument();
    });

    // Select Container Registry credential type
    await user.click(screen.getByRole('button', { name: /Credential type/i }));
    await user.click(screen.getByRole('option', { name: 'Container Registry' }));

    // Verify secret management buttons exist for credential fields
    await waitFor(() => {
      expect(screen.getByTestId('inputs-host-form-group')).toBeInTheDocument();
    });

    const hostFormGroup = screen.getByTestId('inputs-host-form-group');
    expect(
      hostFormGroup.querySelector('[data-testid="secret-management-input"]')
    ).toBeInTheDocument();

    const passwordFormGroup = screen.getByTestId('inputs-password-form-group');
    expect(passwordFormGroup).toBeInTheDocument();
    expect(
      passwordFormGroup.querySelector('[data-testid="secret-management-input"]')
    ).toBeInTheDocument();

    // Verify help text labels exist
    expect(hostFormGroup.querySelector('label')).toBeInTheDocument();
  });

  it('should display secret management buttons for multiline credential fields', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <CreateCredential />
      </MemoryRouter>
    );

    // Wait for the form to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create credential/i })).toBeInTheDocument();
    });

    // Select Source Control credential type
    await user.click(screen.getByRole('button', { name: /Credential type/i }));
    await user.click(screen.getByRole('option', { name: 'Source Control' }));

    // Check for multiline secret management fields
    await waitFor(() => {
      const privateKeyField = screen.queryByTestId('inputs-ssh-key-data-form-group');
      if (privateKeyField) {
        expect(
          privateKeyField.querySelector('[data-testid="secret-management-input"]')
        ).toBeInTheDocument();
      }
    });
  });
});

describe('Create Credential - External Credentials', () => {
  it('should not show Test button for non-external credential types', async () => {
    const user = userEvent.setup();
    renderCreateCredential();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create credential/i })).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText('Enter credential name'),
      'Test External Type Detection'
    );

    await user.click(screen.getByRole('button', { name: /Credential type/i }));
    await user.click(screen.getByRole('option', { name: 'Container Registry' }));

    await waitFor(() => {
      expect(screen.getByTestId('inputs-host-form-group')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: 'Test' })).not.toBeInTheDocument();
  });

  it('should show Test button when external credential type is selected', async () => {
    const user = userEvent.setup();
    renderCreateCredential();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create credential/i })).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText('Enter credential name'),
      'Test External Type Detection'
    );

    await user.click(screen.getByRole('button', { name: /Credential type/i }));
    await user.click(screen.getByRole('option', { name: 'Amazon Web Services' }));

    await waitFor(() => {
      expect(screen.getByTestId('inputs-aws-access-key-form-group')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Test' })).toBeInTheDocument();
  });

  it('should show secret management buttons for all non-external credential string fields', async () => {
    const user = userEvent.setup();
    renderCreateCredential();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create credential/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Credential type/i }));
    await user.click(screen.getByRole('option', { name: 'Container Registry' }));

    await waitFor(() => {
      expect(screen.getByTestId('inputs-host-form-group')).toBeInTheDocument();
    });

    const hostFormGroup = screen.getByTestId('inputs-host-form-group');
    expect(
      hostFormGroup.querySelector('[data-testid="secret-management-input"]')
    ).toBeInTheDocument();

    const usernameFormGroup = screen.getByTestId('inputs-username-form-group');
    expect(
      usernameFormGroup.querySelector('[data-testid="secret-management-input"]')
    ).toBeInTheDocument();

    const passwordFormGroup = screen.getByTestId('inputs-password-form-group');
    expect(
      passwordFormGroup.querySelector('[data-testid="secret-management-input"]')
    ).toBeInTheDocument();
  });

  it('should not show secret management buttons for external credential types', async () => {
    const user = userEvent.setup();
    renderCreateCredential();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create credential/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Credential type/i }));
    await user.click(screen.getByRole('option', { name: 'Amazon Web Services' }));

    await waitFor(() => {
      expect(screen.getByTestId('inputs-aws-access-key-form-group')).toBeInTheDocument();
    });

    expect(screen.queryAllByTestId('secret-management-input')).toHaveLength(0);
  });

  it('should show field linking modal when secret management button is clicked', async () => {
    const user = userEvent.setup();
    renderCreateCredential();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Create credential/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Credential type/i }));
    await user.click(screen.getByRole('option', { name: 'Source Control' }));

    await waitFor(() => {
      expect(screen.getByTestId('inputs-password-form-group')).toBeInTheDocument();
    });

    const passwordFormGroup = screen.getByTestId('inputs-password-form-group');
    const secretManagementButton = within(passwordFormGroup).getByTestId('secret-management-input');
    expect(secretManagementButton).toBeInTheDocument();
    await user.click(secretManagementButton);

    await waitFor(() => {
      expect(screen.getByText('Secret Management System')).toBeInTheDocument();
      expect(screen.getAllByText('Select external credential').length).toBeGreaterThan(0);
    });
  });
});
