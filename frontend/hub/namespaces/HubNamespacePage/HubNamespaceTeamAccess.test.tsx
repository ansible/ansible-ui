/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubNamespaceTeamAccess } from './HubNamespaceTeamAccess';

const mockTeamAssignments = {
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
        team: { id: 1, name: 'test team', description: '' },
        content_object: { id: 1, name: 'demo', description: '' },
      },
      created: '2024-05-08T18:01:06.186968Z',
      created_by: 4,
      content_type: 'galaxy.namespace',
      object_id: '108',
      object_ansible_id: null,
      role_definition: 4,
      team: 1,
      team_ansible_id: null,
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

describe('HubNamespaceTeamAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders team assignments', async () => {
    server.use(
      http.get('*/role_team_assignments/*', () => {
        return HttpResponse.json(mockTeamAssignments);
      }),
      http.get('*/_ui/v1/namespaces/*', () => {
        return HttpResponse.json(mockNamespace);
      })
    );

    render(
      <MemoryRouter initialEntries={['/namespaces/demo/team-access']}>
        <Routes>
          <Route path="/namespaces/:id/team-access" element={<HubNamespaceTeamAccess />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test team')).toBeInTheDocument();
    });
  });
});
