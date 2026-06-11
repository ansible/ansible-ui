import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { awxAPI } from '../../../common/api/awx-utils';
import { CredentialTypeCredentials } from './CredentialTypeCredentials';

const mockCredentialType = {
  id: 1,
  type: 'credential_type',
  name: 'Machine',
  description: 'Machine credential type',
  kind: 'ssh',
  namespace: 'ssh',
  managed: true,
  summary_fields: {
    user_capabilities: { edit: true, delete: true },
  },
};

const mockCredentials = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      name: 'Test Machine Credential',
      description: 'A test credential',
      credential_type: 1,
      summary_fields: {
        credential_type: { id: 1, name: 'Machine' },
        user_capabilities: { edit: true, delete: true },
      },
    },
    {
      id: 2,
      name: 'Production Credential',
      description: 'Production machine access',
      credential_type: 1,
      summary_fields: {
        credential_type: { id: 1, name: 'Machine' },
        user_capabilities: { edit: true, delete: true },
      },
    },
  ],
};

const server = setupServer(
  http.options(awxAPI`/credential_types/*`, () => HttpResponse.json({})),
  http.get(awxAPI`/credential_types/1/`, () => HttpResponse.json(mockCredentialType)),
  http.get(awxAPI`/credential_types/1/credentials/`, () => HttpResponse.json(mockCredentials))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CredentialTypeCredentials', () => {
  it('should render credentials list for credential type', async () => {
    render(
      <MemoryRouter initialEntries={['/credential-types/1/credentials']}>
        <Routes>
          <Route path="/credential-types/:id/credentials" element={<CredentialTypeCredentials />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Machine Credential')).toBeInTheDocument();
    });
  });

  it('should display multiple credentials in table', async () => {
    render(
      <MemoryRouter initialEntries={['/credential-types/1/credentials']}>
        <Routes>
          <Route path="/credential-types/:id/credentials" element={<CredentialTypeCredentials />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Machine Credential')).toBeInTheDocument();
      expect(screen.getByText('Production Credential')).toBeInTheDocument();
    });
  });

  it('should render table structure for credentials', async () => {
    render(
      <MemoryRouter initialEntries={['/credential-types/1/credentials']}>
        <Routes>
          <Route path="/credential-types/:id/credentials" element={<CredentialTypeCredentials />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
    });
  });
});
