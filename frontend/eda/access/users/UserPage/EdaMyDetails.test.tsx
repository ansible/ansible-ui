/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { EdaMyDetails } from './EdaMyDetails';

const mockCurrentUser = {
  id: 1,
  username: 'admin',
  first_name: 'Admin',
  last_name: 'User',
  email: 'admin@example.com',
  is_superuser: true,
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-01T00:00:00Z',
  resource: { ansible_id: 'abc-123', resource_type: 'shared.user' },
};

const server = setupServer(http.get('*/users/me/', () => HttpResponse.json(mockCurrentUser)));

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('EdaMyDetails', () => {
  it('should render current user details', async () => {
    render(
      <MemoryRouter>
        <EdaMyDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('should render user first name and last name', async () => {
    render(
      <MemoryRouter>
        <EdaMyDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('should render loading page when user data is not loaded', () => {
    server.use(
      http.get('*/users/me/', async () => {
        await new Promise(() => {});
        return HttpResponse.json(mockCurrentUser);
      })
    );

    render(
      <MemoryRouter>
        <EdaMyDetails />
      </MemoryRouter>
    );

    expect(screen.queryByText('admin')).not.toBeInTheDocument();
  });

  it('should render user email', async () => {
    render(
      <MemoryRouter>
        <EdaMyDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    });
  });
});
