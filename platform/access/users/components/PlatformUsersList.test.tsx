/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformUsersList } from './PlatformUsersList';

const mockUsers = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      is_superuser: true,
      managed: false,
      created_at: '2023-10-01T12:00:00Z',
      modified_at: '2023-10-02T12:00:00Z',
    },
    {
      id: 2,
      username: 'user1',
      first_name: 'Test',
      last_name: 'User',
      email: 'user1@example.com',
      is_superuser: false,
      managed: false,
      created_at: '2023-10-01T12:00:00Z',
      modified_at: '2023-10-02T12:00:00Z',
    },
  ],
};

describe('PlatformUsersList', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the users list', async () => {
    server.use(
      http.get('*/users/*', () => {
        return HttpResponse.json(mockUsers);
      }),
      http.options('*/users/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <PlatformUsersList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  it('displays empty state', async () => {
    server.use(
      http.get('*/users/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.options('*/users/', () => {
        return HttpResponse.json({ actions: {} });
      })
    );

    render(
      <MemoryRouter>
        <PlatformUsersList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/do not have permission to create a user/i)).toBeInTheDocument();
    });
  });

  it('exports the PlatformUsersList component', () => {
    expect(PlatformUsersList).toBeDefined();
    expect(typeof PlatformUsersList).toBe('function');
  });
});
