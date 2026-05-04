/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialPlugins } from './CredentialPlugins';

const mockCredentialOptions = {
  actions: {
    GET: {
      credential_type__kind: { choices: [['external', 'External']] },
    },
  },
};

const mockCredentialsResponse = {
  count: 2,
  results: [
    {
      id: 1,
      name: 'Test OIDC Credential',
      credential_type: 1,
      summary_fields: {
        credential_type: { id: 1, name: 'HashiCorp Vault OIDC', namespace: 'hashivault-kv-oidc' },
      },
    },
    {
      id: 2,
      name: 'Test Regular Credential',
      credential_type: 2,
      summary_fields: {
        credential_type: { id: 2, name: 'Custom', namespace: 'custom' },
      },
    },
  ],
  next: null,
  previous: null,
};

const mockOidcCredentialType = {
  id: 1,
  name: 'HashiCorp Vault OIDC',
  namespace: 'hashivault-kv-oidc',
  inputs: {
    fields: [],
    metadata: [{ id: 'account-name', type: 'string', label: 'Account Name', secret: false }],
    required: ['account-name'],
  },
};

const mockRegularCredentialType = {
  id: 2,
  name: 'Custom',
  namespace: 'custom',
  inputs: {
    fields: [],
    metadata: [{ id: 'api-key', type: 'string', label: 'API Key', secret: false }],
    required: ['api-key'],
  },
};

const server = setupServer(
  http.options(awxAPI`/credentials/`, () => HttpResponse.json(mockCredentialOptions)),
  http.get(
    ({ request }) =>
      request.url.includes('/credentials/') && !request.url.includes('/credential_types/'),
    () => HttpResponse.json(mockCredentialsResponse)
  ),
  http.get(awxAPI`/credentials/1/`, () => HttpResponse.json(mockCredentialsResponse.results[0])),
  http.get(awxAPI`/credentials/2/`, () => HttpResponse.json(mockCredentialsResponse.results[1])),
  http.get(awxAPI`/credential_types/1/`, () => HttpResponse.json(mockOidcCredentialType)),
  http.get(awxAPI`/credential_types/2/`, () => HttpResponse.json(mockRegularCredentialType)),
  http.options(awxAPI`/credential_types/`, () => HttpResponse.json({ actions: { GET: {} } })),
  http.get(
    ({ request }) => request.url.includes('credential_types'),
    () =>
      HttpResponse.json({
        count: 2,
        results: [mockOidcCredentialType, mockRegularCredentialType],
        next: null,
        previous: null,
      })
  ),
  // Mock job templates API for PageFormJobTemplateSelect
  http.options('*/job_templates/', () => HttpResponse.json({}, { status: 200 })),
  http.get('*/job_templates/', () =>
    HttpResponse.json({
      count: 1,
      results: [
        { id: 1, name: 'Demo Job Template', type: 'job_template', url: '/api/v2/job_templates/1/' },
      ],
    })
  ),
  http.options('*/unified_job_templates/', () => HttpResponse.json({}, { status: 200 })),
  http.get('*/unified_job_templates/', () =>
    HttpResponse.json({
      count: 1,
      results: [
        { id: 1, name: 'Demo Job Template', type: 'job_template', url: '/api/v2/job_templates/1/' },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialPlugins', () => {
  it('should render Secret Management System page with form', async () => {
    const handleSubmit = vi.fn();
    const handleTest = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <CredentialPlugins
          onCancel={onCancel}
          handleSubmit={handleSubmit}
          handleTest={handleTest}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Management System')).toBeInTheDocument();
    });

    expect(screen.getByText('Select external credential')).toBeInTheDocument();
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('should render with defaultValues when provided', async () => {
    const handleSubmit = vi.fn();
    const handleTest = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <CredentialPlugins
          onCancel={onCancel}
          handleSubmit={handleSubmit}
          handleTest={handleTest}
          defaultValues={{ source_credential: 1 }}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Secret Management System')).toBeInTheDocument();
    });
  });

  it('should show job template selector for OIDC credential types', async () => {
    const handleSubmit = vi.fn();
    const handleTest = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <CredentialPlugins
          onCancel={onCancel}
          handleSubmit={handleSubmit}
          handleTest={handleTest}
          defaultValues={{ source_credential: 1 }} // OIDC credential
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Account Name')).toBeInTheDocument();
    });

    // Job template selector should appear for OIDC credentials
    await waitFor(() => {
      expect(screen.getByText('Controller Job Template')).toBeInTheDocument();
    });
  });

  it('should not show job template selector for non-OIDC credential types', async () => {
    const handleSubmit = vi.fn();
    const handleTest = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <CredentialPlugins
          onCancel={onCancel}
          handleSubmit={handleSubmit}
          handleTest={handleTest}
          defaultValues={{ source_credential: 2 }} // Regular credential
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('API Key')).toBeInTheDocument();
    });

    // Job template selector should NOT appear for non-OIDC credentials
    expect(screen.queryByText('Controller Job Template')).not.toBeInTheDocument();
  });

  it('should show metadata fields based on credential type', async () => {
    const handleSubmit = vi.fn();
    const handleTest = vi.fn();
    const onCancel = vi.fn();

    render(
      <MemoryRouter>
        <CredentialPlugins
          onCancel={onCancel}
          handleSubmit={handleSubmit}
          handleTest={handleTest}
          defaultValues={{ source_credential: 1 }}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Metadata')).toBeInTheDocument();
      expect(screen.getByText('Account Name')).toBeInTheDocument();
    });
  });
});
