/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Users } from './Users';

const mockUsers = {
  count: 2,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      is_superuser: true,
      created_at: '2023-07-11T22:00:00.179292Z',
      modified_at: '2023-07-11T22:00:02.244685Z',
    },
    {
      id: 2,
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_superuser: false,
      created_at: '2023-07-11T22:00:10.299948Z',
      modified_at: '2023-07-11T22:00:11.814164Z',
    },
  ],
};

describe('Users', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the users list page with title', async () => {
    server.use(
      http.get('*/users', () => {
        return HttpResponse.json(mockUsers);
      })
    );

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Users')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('displays empty state when no users exist', async () => {
    server.use(
      http.get('*/users', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/There are currently no users created for your organization/)
      ).toBeInTheDocument();
    });
  });
});
