/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AccessList } from './AccessList';

const mockUserRoleAssignments = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      summary_fields: {
        object_role: { id: 1 },
        role_definition: {
          id: 10,
          name: 'Project Admin',
          description: 'Has all project permissions',
          managed: true,
        },
        content_object: { name: 'Demo Project', id: 5 },
      },
      object_id: '5',
      content_type: 'awx.project',
      role_definition: 10,
    },
    {
      id: 2,
      summary_fields: {
        object_role: { id: 2 },
        role_definition: {
          id: 11,
          name: 'Inventory User',
          description: 'Can use inventory',
          managed: true,
        },
        content_object: { name: 'Production Inventory', id: 8 },
      },
      object_id: '8',
      content_type: 'awx.inventory',
      role_definition: 11,
    },
  ],
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
        function: (item: (typeof mockUserRoleAssignments.results)[0]) =>
          item.summary_fields?.content_object?.name,
        label: 'Resource name',
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
      expect(screen.getByText('Demo Project')).toBeInTheDocument();
    });
    expect(screen.getByText('Production Inventory')).toBeInTheDocument();
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

  it('should render with additional table columns', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockUserRoleAssignments))
    );

    render(
      <MemoryRouter>
        <AccessList
          {...defaultProps}
          additionalTableColumns={[
            {
              header: 'Type',
              type: 'description',
              value: (item: (typeof mockUserRoleAssignments.results)[0]) => item.content_type,
            },
          ]}
        />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Demo Project')).toBeInTheDocument();
    });
  });
});
