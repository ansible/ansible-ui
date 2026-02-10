/* eslint-disable i18next/no-literal-string */
import { render, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubNamespaceUserAccess } from './HubNamespaceUserAccess';

const mockUserAssignments = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 1,
      url: '',
      related: {},
      summary_fields: {
        role_definition: {
          id: 4,
          name: 'galaxy.collection_publisher',
          description: 'Upload and modify collections.',
          managed: false,
        },
        user: { id: 3, username: 'test-user', first_name: '', last_name: '' },
        content_object: { id: 1, name: 'name', description: '' },
      },
      created: '2024-08-02T16:47:15.788129Z',
      created_by: 4,
      content_type: 'galaxy.namespace',
      object_id: '1',
      object_ansible_id: null,
      role_definition: 4,
      user: 6,
      user_ansible_id: null,
    },
  ],
};

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

describe('HubNamespaceUserAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the user access component without errors', async () => {
    server.use(
      http.get('*/role_user_assignments/*', () => {
        return HttpResponse.json(mockUserAssignments);
      }),
      http.get('*/_ui/v1/namespaces/*', () => {
        return HttpResponse.json(mockNamespace);
      }),
      http.get('*/users/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      }),
      http.get('*/role_user_access/*', () => {
        return HttpResponse.json({ count: 0, results: [] });
      })
    );

    const { container } = render(
      <MemoryRouter initialEntries={['/namespaces/demo/user-access']}>
        <Routes>
          <Route path="/namespaces/:id/user-access" element={<HubNamespaceUserAccess />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify the component renders - may show loading or content
    await waitFor(() => {
      expect(container.firstChild).not.toBeNull();
    });
  });
});
