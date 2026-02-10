/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubRoleDetails } from './HubRoleDetails';

const mockBuiltInRole = {
  id: 1,
  url: '',
  related: {},
  summary_fields: {},
  permissions: ['galaxy.view_namespace', 'galaxy.change_namespace', 'galaxy.delete_namespace'],
  content_type: 'galaxy.namespace',
  modified: '2024-08-05T20:19:43.878761Z',
  created: '2024-08-05T20:19:43.878727Z',
  name: 'Namespace Admin',
  description: 'Namespace Administrator',
  managed: true,
  modified_by: null,
  created_by: null,
};

const mockCustomRole = {
  id: 21,
  url: '',
  related: {},
  summary_fields: {},
  permissions: ['galaxy.view_ansiblerepository'],
  content_type: 'galaxy.ansiblerepository',
  modified: '2024-08-06T17:22:26.294509Z',
  created: '2024-08-06T17:22:06.956461Z',
  name: 'galaxy.test_custom_role',
  description: 'View repository',
  managed: false,
  modified_by: 4,
  created_by: 4,
};

describe('HubRoleDetails', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders and displays details for built-in roles', async () => {
    server.use(
      http.get('*/_ui/v2/role_definitions/1/', () => {
        return HttpResponse.json(mockBuiltInRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/roles/1/details']}>
        <Routes>
          <Route path="/roles/:id/details" element={<HubRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('Namespace Admin');
    });

    expect(screen.getByTestId('description')).toHaveTextContent('Namespace Administrator');
  });

  it('renders and displays details for custom roles', async () => {
    server.use(
      http.get('*/_ui/v2/role_definitions/21/', () => {
        return HttpResponse.json(mockCustomRole);
      })
    );

    render(
      <MemoryRouter initialEntries={['/roles/21/details']}>
        <Routes>
          <Route path="/roles/:id/details" element={<HubRoleDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('name')).toHaveTextContent('galaxy.test_custom_role');
    });

    expect(screen.getByTestId('description')).toHaveTextContent('View repository');
  });
});
