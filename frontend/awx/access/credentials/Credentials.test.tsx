import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../common/api/awx-utils';
import { Credentials } from './Credentials';

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>{children}</MemoryRouter>
    </SWRConfig>
  );
}

const mockCredentialTypes = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'credential_type',
      name: 'Machine',
      description: '',
      kind: 'ssh',
      namespace: 'ssh',
      managed: true,
      inputs: {},
      injectors: {},
      summary_fields: { user_capabilities: { edit: false, delete: false } },
    },
  ],
};

const mockCredentials = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      type: 'credential',
      url: '/api/v2/credentials/1/',
      name: 'Test Credential',
      description: 'Test description',
      organization: null,
      credential_type: 1,
      managed: false,
      kind: 'ssh',
      cloud: false,
      kubernetes: false,
      summary_fields: {
        credential_type: { id: 1, name: 'Machine', description: '' },
        user_capabilities: { edit: true, delete: true, copy: true, use: true },
      },
    },
    {
      id: 2,
      type: 'credential',
      url: '/api/v2/credentials/2/',
      name: 'Restricted Credential',
      description: '',
      organization: null,
      credential_type: 1,
      managed: false,
      kind: 'ssh',
      cloud: false,
      kubernetes: false,
      summary_fields: {
        credential_type: { id: 1, name: 'Machine', description: '' },
        user_capabilities: { edit: false, delete: false, copy: false, use: true },
      },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/credentials/`, () => HttpResponse.json({ actions: { POST: {}, GET: {} } })),
  http.get(awxAPI`/credentials/`, () => HttpResponse.json(mockCredentials)),
  http.get(awxAPI`/credential_types/`, () => HttpResponse.json(mockCredentialTypes))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Credentials', () => {
  it('should render credentials list page', async () => {
    render(
      <TestWrapper>
        <Credentials />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Credentials')).toBeInTheDocument();
    });
  });

  it('should display credentials in table', async () => {
    render(
      <TestWrapper>
        <Credentials />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Credential')).toBeInTheDocument();
    });
    expect(screen.getByText('Restricted Credential')).toBeInTheDocument();
  });

  it('should display error when credentials fail to load', async () => {
    server.use(http.get(awxAPI`/credentials/`, () => HttpResponse.json({}, { status: 500 })));

    render(
      <TestWrapper>
        <Credentials />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading credentials/i)).toBeInTheDocument();
    });
  });

  it('should display empty state when no credentials exist', async () => {
    server.use(
      http.get(awxAPI`/credentials/`, () =>
        HttpResponse.json({ count: 0, results: [], next: null, previous: null })
      )
    );

    render(
      <TestWrapper>
        <Credentials />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No credentials yet')).toBeInTheDocument();
    });
    expect(screen.getByText('To get started, create an credential.')).toBeInTheDocument();
  });
});
