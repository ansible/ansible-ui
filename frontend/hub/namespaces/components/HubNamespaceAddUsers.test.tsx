/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubNamespaceAddUsers } from './HubNamespaceAddUsers';

const mockNamespace = {
  meta: { count: 1 },
  links: {},
  data: [
    {
      pulp_href: '/pulp/api/v3/pulp_ansible/namespaces/1/',
      id: 1,
      name: 'demo',
      company: '',
      email: '',
      avatar_url: '',
      description: '',
      links: [],
      groups: [],
      related_fields: {},
      metadata_sha256: null,
    },
  ],
};

const mockUsers = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 1, username: 'demo-user', first_name: '', last_name: '' },
    { id: 2, username: 'test-user', first_name: '', last_name: '' },
  ],
};

const mockRoles = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 4,
      name: 'galaxy.collection_publisher',
      description: 'Upload and modify collections.',
    },
  ],
};

const mockRoleTypes = {
  results: [
    { api_slug: 'galaxy.namespace', name: 'Namespace' },
    { api_slug: 'galaxy.ansiblerepository', name: 'Repository' },
  ],
};

describe('HubNamespaceAddUsers', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the wizard with correct steps', async () => {
    server.use(
      http.get('*/_ui/v1/namespaces/*', () => {
        return HttpResponse.json(mockNamespace);
      }),
      http.get('*/users/*', () => {
        return HttpResponse.json(mockUsers);
      }),
      http.get('*/role_definitions/*', () => {
        return HttpResponse.json(mockRoles);
      }),
      http.get('*/service-index/role-types/', () => {
        return HttpResponse.json(mockRoleTypes);
      })
    );

    render(
      <MemoryRouter initialEntries={['/namespaces/demo/user-access/add']}>
        <Routes>
          <Route path="/namespaces/:id/user-access/add" element={<HubNamespaceAddUsers />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify the wizard component renders
    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
  });
});
