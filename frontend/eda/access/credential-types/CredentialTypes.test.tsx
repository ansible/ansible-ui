/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { CredentialTypes } from './CredentialTypes';

const mockCredentialTypes = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Source Control',
      namespace: 'scm',
      kind: 'scm',
      description: '',
      managed: true,
      created_at: '2024-04-10T17:43:26.032037Z',
      modified_at: '2024-04-10T17:43:26.032048Z',
    },
    {
      id: 2,
      name: 'Container Registry',
      namespace: 'registry',
      kind: 'registry',
      description: '',
      managed: true,
      created_at: '2024-04-10T17:43:26.033502Z',
      modified_at: '2024-04-10T17:43:26.033509Z',
    },
  ],
};

describe('CredentialTypes', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the credential types list', async () => {
    server.use(
      http.get('*/credential-types/*', () => {
        return HttpResponse.json(mockCredentialTypes);
      }),
      http.options('*/credential-types/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Credential Types')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Source Control')).toBeInTheDocument();
    });
  });

  it('displays empty state without permission', async () => {
    server.use(
      http.get('*/credential-types/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/credential-types/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/You do not have permission to create a credential type/)
      ).toBeInTheDocument();
    });
  });

  it('displays empty state with permission to create', async () => {
    server.use(
      http.get('*/credential-types/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/credential-types/', () => {
        return HttpResponse.json({ actions: { POST: {} } });
      })
    );

    render(
      <MemoryRouter>
        <CredentialTypes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no credential types added/i)).toBeInTheDocument();
    });
  });
});
