/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { edaAPI } from '../../common/eda-utils';
import { EditCredential } from './EditCredential';

const mockOpenCredentialsExternalTestModal = vi.fn();

vi.mock('./hooks/useCredentialsTestModal', () => ({
  useCredentialsTestModal: () => mockOpenCredentialsExternalTestModal,
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

  it('should render loading header when credential is not yet loaded', () => {
    server.use(
      http.get(edaAPI`/eda-credentials/7/`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(mockCredential);
      })
    );

    render(
      <MemoryRouter initialEntries={['/credentials/edit/7']}>
        <Routes>
          <Route path="/credentials/edit/:id" element={<EditCredential />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Edit Credential')).toBeInTheDocument();
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

  it('should expose external credential test action', async () => {
    const externalCredential = {
      ...mockCredential,
      credential_type: {
        ...mockCredential.credential_type,
        kind: 'external',
      },
    };
    const externalCredentialTypes = {
      count: 1,
      results: [
        {
          ...mockCredentialTypes.results[0],
          kind: 'external',
        },
      ],
    };

    server.use(
      http.get(edaAPI`/eda-credentials/7/`, () => HttpResponse.json(externalCredential)),
      http.get(edaAPI`/credential-types/*`, () => HttpResponse.json(externalCredentialTypes))
    );

    render(
      <MemoryRouter initialEntries={['/credentials/edit/7']}>
        <Routes>
          <Route path="/credentials/edit/:id" element={<EditCredential />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Test' })).toBeDisabled();
    });
  });

  it('should patch credential on save', async () => {
    let patchBody: unknown;
    server.use(
      http.patch(edaAPI`/eda-credentials/7/`, async ({ request }) => {
        patchBody = await request.json();
        return HttpResponse.json({ ...mockCredential, description: 'updated' });
      })
    );

    render(
      <MemoryRouter initialEntries={['/credentials/edit/7']}>
        <Routes>
          <Route path="/credentials/edit/:id" element={<EditCredential />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save credential/i })).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Save credential/i }));

    await waitFor(() => {
      expect(patchBody).toBeDefined();
    });
  });
});
