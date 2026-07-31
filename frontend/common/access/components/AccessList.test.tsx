/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AccessList } from './AccessList';
import type { UserRoleAccess } from '../interfaces/UserRoleAccess';

const mockResults: UserRoleAccess[] = [
  {
    id: '1',
    url: '/api/v2/users/1/',
    related: { details: '/api/gateway/v1/role_user_access/awx.project/5/abc/' },
    username: 'alice',
    is_superuser: false,
    object_role_assignments: [
      { type: 'direct', role_definition: { name: 'Project Admin', url: '/rd/10/' } },
    ],
    first_name: 'Alice',
    last_name: 'Smith',
  },
  {
    id: '2',
    url: '/api/v2/users/2/',
    related: { details: '/api/gateway/v1/role_user_access/awx.inventory/8/def/' },
    username: 'bob',
    is_superuser: false,
    object_role_assignments: [
      { type: 'direct', role_definition: { name: 'Inventory User', url: '/rd/11/' } },
    ],
    first_name: 'Bob',
    last_name: 'Jones',
  },
];

const mockUserRoleAssignments = {
  count: 2,
  next: null,
  previous: null,
  results: mockResults,
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('AccessList', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const defaultProps = {
    service: 'awx' as const,
    tableColumnFunctions: {
      name: {
        function: (item: UserRoleAccess) => item.username,
        label: 'Username',
      },
    },
    url: '/api/gateway/v1/role_user_assignments/',
    id: '1',
    accessListType: 'user-roles' as const,
  };

  it('should render role assignments in a table', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockUserRoleAssignments))
    );

    render(
      <MemoryRouter>
        <AccessList {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('should display empty state for user-roles when no assignments', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <AccessList {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('There are currently no roles assigned to this user.')
      ).toBeInTheDocument();
    });
  });

  it('should display empty state for team-roles', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <AccessList {...defaultProps} accessListType="team-roles" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText('There are currently no roles assigned to this team.')
      ).toBeInTheDocument();
    });
  });

  it('should display empty state for user access with content_type_model', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <AccessList {...defaultProps} accessListType="user" content_type_model="project" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No users assigned to this/)).toBeInTheDocument();
    });
  });

  it('should display empty state for team access with content_type_model', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <AccessList {...defaultProps} accessListType="team" content_type_model="project" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No teams are assigned/)).toBeInTheDocument();
    });
  });

  it('should render assign roles button', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <AccessList {...defaultProps} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Assign roles')).toBeInTheDocument();
    });
  });

  it('should render custom add role button text', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <AccessList {...defaultProps} addRoleButtonText="Custom Button" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Button')).toBeInTheDocument();
    });
  });
});
