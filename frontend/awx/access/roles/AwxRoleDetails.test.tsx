import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AwxRoleDetails } from './AwxRoleDetails';

const mockBuiltInRole = {
  id: 1,
  url: '/api/v2/role_definitions/1/',
  related: {
    team_assignments: '/api/v2/role_definitions/1/team_assignments/',
    user_assignments: '/api/v2/role_definitions/1/user_assignments/',
  },
  summary_fields: {},
  permissions: [
    'awx.change_credential',
    'awx.delete_credential',
    'awx.use_credential',
    'awx.view_credential',
  ],
  content_type: 'awx.credential',
  modified: '2024-05-26T07:19:20.200581Z',
  created: '2024-05-26T07:19:20.200562Z',
  name: 'Credential Admin',
  description: 'Has all permissions to a single credential',
  managed: true,
  modified_by: null,
  created_by: null,
};

const mockCustomRole = {
  id: 33,
  url: '/api/v2/role_definitions/33/',
  related: {
    team_assignments: '/api/v2/role_definitions/33/team_assignments/',
    user_assignments: '/api/v2/role_definitions/33/user_assignments/',
  },
  summary_fields: {},
  permissions: ['awx.view_inventory'],
  content_type: 'awx.inventory',
  modified: '2024-05-27T14:58:40.652901Z',
  created: '2024-05-27T14:58:40.652942Z',
  name: 'Inventory Read Compat',
  description: 'Has Read permission to Inventory for backwards API compatibility',
  managed: false,
  modified_by: null,
  created_by: null,
};

const server = setupServer(
  http.get(
    ({ request }) => request.url.includes('/role_definitions/') && request.url.includes('/1/'),
    () => HttpResponse.json(mockBuiltInRole)
  ),
  http.get(
    ({ request }) => request.url.includes('/role_definitions/') && request.url.includes('/33/'),
    () => HttpResponse.json(mockCustomRole)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('AwxRoleDetails', () => {
  it('should display role details for built-in roles', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/1']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockBuiltInRole.name)).toBeInTheDocument();
    });
    expect(screen.getByText(mockBuiltInRole.description)).toBeInTheDocument();
    expect(screen.getByTestId('awx.credential')).toBeInTheDocument();
    expect(screen.getByTestId('permissions-description-list')).toBeInTheDocument();
    expect(screen.getByTestId('awx.change_credential')).toBeInTheDocument();
    expect(screen.getByTestId('awx.delete_credential')).toBeInTheDocument();
    expect(screen.getByTestId('awx.use_credential')).toBeInTheDocument();
  });

  it('should display role details for custom roles', async () => {
    render(
      <MemoryRouter initialEntries={['/roles/33']}>
        <Routes>
          <Route path="/roles/:id" element={<AwxRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(mockCustomRole.name)).toBeInTheDocument();
    });
    expect(screen.getByText(mockCustomRole.description)).toBeInTheDocument();
    expect(screen.getByTestId('awx.inventory')).toBeInTheDocument();
    expect(screen.getByTestId('awx.view_inventory')).toBeInTheDocument();
  });
});
