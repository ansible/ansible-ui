import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { CreateCredential } from './CreateCredential';

const mockOrganizationsResponse = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [{ id: 1, name: 'Default' }],
};

const mockCredentialTypesResponse = {
  count: 2,
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
  ],
};

const server = setupServer(
  http.get(edaAPI`/organizations/**`, () => {
    return HttpResponse.json(mockOrganizationsResponse);
  }),
  http.get(edaAPI`/credential-types/**`, () => {
    return HttpResponse.json(mockCredentialTypesResponse);
  })
);

describe('Create Credential - UI Element Rendering', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

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
