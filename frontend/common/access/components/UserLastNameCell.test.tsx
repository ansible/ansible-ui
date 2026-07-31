/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserLastNameCell } from './UserLastNameCell';
import type { UserRoleAccess } from '../interfaces/UserRoleAccess';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserLastNameCell', () => {
  it('should render the last name from the API response', async () => {
    server.use(
      http.get('*/users/*', () => {
        return HttpResponse.json({
          count: 1,
          results: [{ id: 1, first_name: 'Jane', last_name: 'Doe', username: 'jdoe' }],
        });
      })
    );

    const mockUserAccess: UserRoleAccess = {
      id: '1',
      url: '/api/v2/users/1/',
      related: { details: '/api/v2/role_user_access/shared.team/5/abc-123/' },
      username: 'jdoe',
      is_superuser: false,
      object_role_assignments: [],
      first_name: '',
      last_name: '',
    };

    render(
      <MemoryRouter>
        <UserLastNameCell userAccess={mockUserAccess} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Doe')).toBeInTheDocument();
    });
  });

  it('should render empty when no userAccess is provided', () => {
    render(
      <MemoryRouter>
        <UserLastNameCell />
      </MemoryRouter>
    );

    expect(screen.queryByText(/\w+/)).not.toBeInTheDocument();
  });

  it('should render empty when API returns no results', async () => {
    server.use(
      http.get('*/users/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const mockUserAccess: UserRoleAccess = {
      id: '1',
      url: '/api/v2/users/1/',
      related: { details: '/api/v2/role_user_access/shared.team/5/abc-123/' },
      username: 'jdoe',
      is_superuser: false,
      object_role_assignments: [],
      first_name: '',
      last_name: '',
    };

    render(
      <MemoryRouter>
        <UserLastNameCell userAccess={mockUserAccess} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Doe')).not.toBeInTheDocument();
    });
  });
});
