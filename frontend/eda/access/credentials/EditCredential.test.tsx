/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EditCredential } from './EditCredential';

vi.mock('./hooks/useCredentialsTestModal', () => ({
  useCredentialsTestModal: () => vi.fn(),
}));

const mockCredential = {
  id: 7,
  name: 'Registry Credential',
  description: '',
  inputs: { host: 'quay.io' },
  managed: false,
  credential_type: {
    id: 1,
    name: 'Container Registry',
    namespace: 'registry',
    kind: 'registry',
  },
  organization: { id: 1, name: 'Default' },
  organization_id: 1,
  created_at: '2025-01-01T00:00:00.000000Z',
  modified_at: '2025-01-01T00:00:00.000000Z',
};

const mockCredentialTypes = {
  count: 1,
  results: [
    {
      id: 1,
      name: 'Container Registry',
      namespace: 'registry',
      kind: 'registry',
      inputs: { fields: [] },
    },
  ],
};

const server = setupServer(
  http.get(edaAPI`/eda-credentials/7/`, () => HttpResponse.json(mockCredential)),
  http.options(edaAPI`/eda-credentials/7/`, () =>
    HttpResponse.json({ actions: { PATCH: { name: { type: 'string' } } } })
  ),
  http.get(edaAPI`/credential-types/*`, () => HttpResponse.json(mockCredentialTypes)),
  http.get(edaAPI`/credential-input-sources/*`, () => HttpResponse.json({ results: [] }))
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EditCredential', () => {
  it('should render edit form when PATCH is allowed', async () => {
    render(
      <MemoryRouter initialEntries={['/credentials/edit/7']}>
        <Routes>
          <Route path="/credentials/edit/:id" element={<EditCredential />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Edit Registry Credential/i, level: 1 })
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Save credential/i })).toBeInTheDocument();
  });

  it('should show read-only warning when OPTIONS has no PATCH action', async () => {
    server.use(
      http.options(edaAPI`/eda-credentials/7/`, () => HttpResponse.json({ actions: { GET: {} } }))
    );

    render(
      <MemoryRouter initialEntries={['/credentials/edit/7']}>
        <Routes>
          <Route path="/credentials/edit/:id" element={<EditCredential />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/you do not have permissions to edit this credential/i)
      ).toBeInTheDocument();
    });
  });
});
