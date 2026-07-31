/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ResourceUserIndirectRolesPanel } from './ResourceUserIndirectRolesPanel';

const mockRoleDefinitions = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 5,
      name: 'Team Member',
      description: 'Member of team',
      url: '/api/gateway/v1/role_definitions/5/',
    },
  ],
};

const mockIndirectRoles = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      content_type: 'shared.team',
      id: 1,
      intermediary_roles: [
        { role_definition: { name: 'Team Member', url: '/api/gateway/v1/role_definitions/5/' } },
      ],
      object_ansible_id: 'abc-123',
      object_id: '10',
      role_definition: 5,
      user: '42',
      user_ansible_id: 'def-456',
      summary_fields: {
        content_object: { name: 'Ops Team', id: 10 },
        role_definition: {
          name: 'Team Member',
          managed: true,
          description: 'Member of team',
          id: 5,
        },
        user: { id: 42, username: 'alice', first_name: 'Alice', last_name: 'Smith' },
      },
    },
  ],
};

const mockEmptyResults = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

describe('ResourceUserIndirectRolesPanel', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const defaultContext = {
    resourceType: 'awx.project',
    resourceId: '5',
    ansibleUserId: 'abc-123',
    username: 'alice',
    resourceName: 'Demo Project',
  };

  const defaultContent = {
    alertTitle: 'Indirect roles alert title',
    alertDescription: 'Indirect roles alert description',
    modalDescription: 'Modal description text',
  };

  it('should render the alert when indirect roles exist', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockIndirectRoles)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    render(
      <MemoryRouter>
        <ResourceUserIndirectRolesPanel context={defaultContext} content={defaultContent} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Indirect roles alert title')).toBeInTheDocument();
    });
    expect(screen.getByText('Indirect roles alert description')).toBeInTheDocument();
  });

  it('should not render the alert when no indirect roles exist', async () => {
    server.use(
      http.get('*/role_user_access/*', () => HttpResponse.json(mockEmptyResults)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoleDefinitions))
    );

    render(
      <MemoryRouter>
        <ResourceUserIndirectRolesPanel context={defaultContext} content={defaultContent} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Indirect roles alert title')).not.toBeInTheDocument();
    });
  });
});
