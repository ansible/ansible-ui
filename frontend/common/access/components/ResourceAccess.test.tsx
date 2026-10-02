/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ResourceAccess } from './ResourceAccess';

const mockRoleAssignments = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      summary_fields: {
        object_role: { id: 1 },
        role_definition: {
          id: 10,
          name: 'Credential Admin',
          description: 'Full credential access',
          managed: true,
        },
        content_object: { name: 'SSH Key', id: 3 },
      },
      object_id: '3',
      content_type: 'awx.credential',
      role_definition: 10,
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

const mockOptionsResponse = {
  actions: {
    POST: {
      content_type: {
        choices: [
          { value: 'awx.credential', display_name: 'Credential' },
          { value: 'awx.project', display_name: 'Project' },
        ],
      },
    },
  },
};

describe('ResourceAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should render user role assignments with resource name', async () => {
    server.use(
      http.options('*/role_definitions/*', () => HttpResponse.json(mockOptionsResponse)),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments))
    );

    render(
      <MemoryRouter>
        <ResourceAccess service="awx" id="42" type="user-roles" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SSH Key')).toBeInTheDocument();
    });
  });

  it('should render team role assignments', async () => {
    server.use(
      http.options('*/role_definitions/*', () => HttpResponse.json(mockOptionsResponse)),
      http.get('*/role_team_assignments/*', () => HttpResponse.json(mockRoleAssignments))
    );

    render(
      <MemoryRouter>
        <ResourceAccess service="awx" id="42" type="team-roles" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SSH Key')).toBeInTheDocument();
    });
  });

  it('should display empty state for user-roles', async () => {
    server.use(
      http.options('*/role_definitions/*', () => HttpResponse.json(mockOptionsResponse)),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockEmptyResults))
    );

    render(
      <MemoryRouter>
        <ResourceAccess service="awx" id="42" type="user-roles" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no.*roles assigned to this user/i)).toBeInTheDocument();
    });
  });

  it('should render for EDA service', async () => {
    server.use(
      http.options('*/role_definitions/*', () => HttpResponse.json(mockOptionsResponse)),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments))
    );

    render(
      <MemoryRouter>
        <ResourceAccess service="eda" id="10" type="user-roles" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SSH Key')).toBeInTheDocument();
    });
  });

  it('should render for Hub service', async () => {
    server.use(
      http.options('*/_ui/v2/role_definitions/*', () => HttpResponse.json(mockOptionsResponse)),
      http.get('*/_ui/v2/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments))
    );

    render(
      <MemoryRouter>
        <ResourceAccess service="hub" id="10" type="user-roles" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SSH Key')).toBeInTheDocument();
    });
  });

  it('should show loading state while OPTIONS are fetched', () => {
    server.use(
      http.options('*/role_definitions/*', async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return HttpResponse.json(mockOptionsResponse);
      })
    );

    render(
      <MemoryRouter>
        <ResourceAccess service="awx" id="42" type="user-roles" />
      </MemoryRouter>
    );

    expect(screen.queryByText('SSH Key')).not.toBeInTheDocument();
  });

  it('should handle tuple-format content type choices from AWX', async () => {
    server.use(
      http.options('*/role_definitions/*', () =>
        HttpResponse.json({
          actions: {
            POST: {
              content_type: {
                choices: [
                  ['awx.credential', 'Credential'],
                  ['awx.project', 'Project'],
                ],
              },
            },
          },
        })
      ),
      http.get('*/role_user_assignments/*', () => HttpResponse.json(mockRoleAssignments))
    );

    render(
      <MemoryRouter>
        <ResourceAccess service="awx" id="42" type="user-roles" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('SSH Key')).toBeInTheDocument();
    });
  });
});
