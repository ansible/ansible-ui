/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { UserAccess } from './UserAccess';

const mockUserAssignments = {
  count: 1,
  next: null,
  previous: null,
  page_size: 10,
  page: 1,
  results: [
    {
      id: 1,
      summary_fields: {
        object_role: { id: 1 },
        role_definition: {
          id: 10,
          name: 'Project Admin',
          description: 'Has all permissions to projects',
          managed: true,
        },
        user: {
          id: 2,
          username: 'alice',
          email: 'alice@example.com',
          first_name: 'Alice',
          last_name: 'Smith',
        },
        content_object: { name: 'My Project', id: 5 },
      },
      object_id: '5',
      content_type: 'awx.project',
      role_definition: 10,
      user: 2,
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('UserAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render user assignments for AWX service', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockUserAssignments)));

    render(
      <MemoryRouter>
        <UserAccess service="awx" id="5" type="project" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
    expect(screen.getByText('Project Admin')).toBeInTheDocument();
  });

  it('should render user assignments for EDA service', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockUserAssignments)));

    render(
      <MemoryRouter>
        <UserAccess service="eda" id="1" type="activation" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
  });

  it('should render user assignments for Hub service', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockUserAssignments)));

    render(
      <MemoryRouter>
        <UserAccess service="hub" id="1" type="namespace" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
  });

  it('should display empty state when no users assigned', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <UserAccess service="awx" id="5" type="project" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No users assigned to/)).toBeInTheDocument();
    });
  });

  it('should render the Username column header', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockUserAssignments)));

    render(
      <MemoryRouter>
        <UserAccess service="awx" id="5" type="project" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Username').length).toBeGreaterThan(0);
    });
  });

  it('should render assign users button text', async () => {
    server.use(http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults)));

    render(
      <MemoryRouter>
        <UserAccess service="eda" id="1" type="activation" addRolesRoute="xyz" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Assign users')).toBeInTheDocument();
    });
  });
});
