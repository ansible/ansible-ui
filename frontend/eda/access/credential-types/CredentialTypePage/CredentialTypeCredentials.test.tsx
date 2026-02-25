/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { edaAPI } from '../../../common/eda-utils';
import { CredentialTypeCredentials } from './CredentialTypeCredentials';

const mockCredentialType = {
  id: 1,
  name: 'Basic Event Stream',
  description: 'Basic Event Stream credential type',
  managed: true,
};

const mockCredentials = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Test Event Stream Credential',
      description: 'A test credential',
      credential_type_id: 1,
      organization_id: 1,
      inputs: {
        username: 'testuser',
      },
    },
    {
      id: 2,
      name: 'Production Event Stream Credential',
      description: 'Production event stream access',
      credential_type_id: 1,
      organization_id: 1,
      inputs: {
        username: 'produser',
      },
    },
  ],
};

const server = setupServer(
  http.options(edaAPI`/credential-types/*`, () => HttpResponse.json({})),
  http.get(edaAPI`/credential-types/1/`, () => HttpResponse.json(mockCredentialType)),
  http.get(edaAPI`/eda-credentials/`, ({ request }) => {
    const url = new URL(request.url);
    const credentialTypeId = url.searchParams.get('credential_type_id');
    if (credentialTypeId === '1') {
      return HttpResponse.json(mockCredentials);
    }
    return HttpResponse.json({ count: 0, results: [] });
  }),
  http.options(edaAPI`/eda-credentials/`, () => HttpResponse.json({ actions: { POST: true } }))
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
      expect(screen.getByText('Test Event Stream Credential')).toBeInTheDocument();
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
      expect(screen.getByText('Test Event Stream Credential')).toBeInTheDocument();
      expect(screen.getByText('Production Event Stream Credential')).toBeInTheDocument();
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
