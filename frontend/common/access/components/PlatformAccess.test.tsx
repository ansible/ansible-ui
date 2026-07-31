/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformAccess } from './PlatformAccess';
import type { Assignment } from '../interfaces/Assignment';

const mockAssignments = {
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
          name: 'Organization Admin',
          description: 'Full org admin',
          managed: true,
        },
        content_object: { name: 'Default', id: 1 },
      },
      object_id: '1',
      content_type: 'shared.organization',
      role_definition: 10,
    },
    {
      id: 2,
      summary_fields: {
        object_role: { id: 2 },
        role_definition: {
          id: 11,
          name: 'Organization Auditor',
          description: 'Read-only org access',
          managed: true,
        },
        content_object: { name: 'Default', id: 1 },
      },
      object_id: '1',
      content_type: 'shared.organization',
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

const defaultProps = {
  tableColumnFunctions: {
    name: {
      function: (item: Assignment) => item.summary_fields?.content_object?.name,
      label: 'Resource name',
      sort: 'content_object__name',
    },
  },
  url: '/api/gateway/v1/role_user_assignments/',
  id: '1',
  content_type_model: 'organization',
  accessListType: 'user' as const,
};

describe('PlatformAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const renderWithRoute = (props: typeof defaultProps & Record<string, unknown>) =>
    render(
      <MemoryRouter initialEntries={['/orgs/1/access']}>
        <Routes>
          <Route path="/orgs/:id/access" element={<PlatformAccess {...props} />} />
        </Routes>
      </MemoryRouter>
    );

  it('should render assignments in a table', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockAssignments)));

    renderWithRoute(defaultProps);

    await waitFor(() => {
      expect(screen.getByText('Organization Admin')).toBeInTheDocument();
    });
    expect(screen.getByText('Organization Auditor')).toBeInTheDocument();
  });

  it('should display empty state for user access', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute(defaultProps);

    await waitFor(() => {
      expect(screen.getByText(/No users assigned/)).toBeInTheDocument();
    });
  });

  it('should display empty state for team access', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute({ ...defaultProps, accessListType: 'team' as const });

    await waitFor(() => {
      expect(screen.getByText(/No teams are assigned/)).toBeInTheDocument();
    });
  });

  it('should display empty state for user-roles', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute({ ...defaultProps, accessListType: 'user-roles' as const });

    await waitFor(() => {
      expect(
        screen.getByText('There are currently no roles assigned to this user.')
      ).toBeInTheDocument();
    });
  });

  it('should display empty state for team-roles', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute({ ...defaultProps, accessListType: 'team-roles' as const });

    await waitFor(() => {
      expect(
        screen.getByText('There are currently no roles assigned to this team.')
      ).toBeInTheDocument();
    });
  });

  it('should render assign roles button', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute(defaultProps);

    await waitFor(() => {
      expect(screen.getByText('Assign roles')).toBeInTheDocument();
    });
  });

  it('should render custom add role button text', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute({
      ...defaultProps,
      addRoleButtonText: 'Custom Assign',
    });

    await waitFor(() => {
      expect(screen.getByText('Custom Assign')).toBeInTheDocument();
    });
  });

  it('should render team description for team empty state', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute({ ...defaultProps, accessListType: 'team' as const });

    await waitFor(() => {
      expect(screen.getByText(/assign a team/)).toBeInTheDocument();
    });
  });

  it('should render user description for user empty state without content_type_model', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    renderWithRoute({
      ...defaultProps,
      content_type_model: undefined,
      accessListType: 'user' as const,
    });

    await waitFor(() => {
      expect(screen.getByText('No users assigned to this resource')).toBeInTheDocument();
    });
  });

  it('should render with additional table columns', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockAssignments)));

    renderWithRoute({
      ...defaultProps,
      additionalTableColumns: [
        {
          header: 'Content type',
          type: 'text' as const,
          value: (item: Assignment) => item.content_type,
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Organization Admin')).toBeInTheDocument();
    });
  });

  it('should render with name column filter when user accessListType', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockAssignments)));

    renderWithRoute({
      ...defaultProps,
      toolbarNameColumnFiltersValues: {
        label: 'Username',
        query: 'user__username__icontains',
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Organization Admin')).toBeInTheDocument();
    });
  });
});
