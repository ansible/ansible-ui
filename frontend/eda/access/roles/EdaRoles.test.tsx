/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { EdaRoles } from './EdaRoles';

vi.mock('../../common/useEdaActiveUser', () => ({
  useEdaActiveUser: () => ({
    activeEdaUser: {
      id: 1,
      username: 'admin',
      is_superuser: true,
    },
  }),
}));

const mockRoles = {
  count: 2,
  next: null,
  previous: null,
  page: 1,
  results: [
    {
      id: 1,
      name: 'Activation Admin',
      description: 'Can manage activations',
      managed: true,
      created_at: '2024-04-10T17:43:26.032037Z',
      modified_at: '2024-04-10T17:43:26.032048Z',
    },
    {
      id: 2,
      name: 'View projects',
      description: 'Can view projects',
      managed: false,
      created_at: '2024-04-10T17:43:26.033502Z',
      modified_at: '2024-04-10T17:43:26.033509Z',
    },
  ],
};

describe('EdaRoles', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the roles list', async () => {
    server.use(
      http.get('*/role_definitions/*', () => {
        return HttpResponse.json(mockRoles);
      }),
      http.get('*/users/me/', () => {
        return HttpResponse.json({ id: 1, is_superuser: true });
      })
    );

    render(
      <MemoryRouter>
        <EdaRoles />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Roles')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Activation Admin')).toBeInTheDocument();
    });
  });

  it('displays error state', async () => {
    server.use(
      http.get('*/role_definitions/*', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(
      <MemoryRouter>
        <EdaRoles />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading roles/i)).toBeInTheDocument();
    });
  });
});
