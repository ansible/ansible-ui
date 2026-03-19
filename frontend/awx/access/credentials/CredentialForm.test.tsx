import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { CreateCredential, EditCredential } from './CredentialForm';

const mockCredentialTypes = {
  count: 5,
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

      expect(screen.getByTestId('credential_type')).toBeInTheDocument();
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
    });

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
