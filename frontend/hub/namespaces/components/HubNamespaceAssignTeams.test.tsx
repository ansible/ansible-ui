/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { HubNamespaceAssignTeams } from './HubNamespaceAssignTeams';

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

const mockTeams = {
  count: 2,
  next: null,
  previous: null,
  results: [
    { id: 1, name: 'demoteam1', description: '' },
    { id: 2, name: 'demoteam2', description: '' },
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

describe('HubNamespaceAssignTeams', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the wizard with correct steps', async () => {
    server.use(
      http.get('*/_ui/v1/namespaces/*', () => {
        return HttpResponse.json(mockNamespace);
      }),
      http.get('*/teams/*', () => {
        return HttpResponse.json(mockTeams);
      }),
      http.get('*/role_definitions/*', () => {
        return HttpResponse.json(mockRoles);
      })
    );

    render(
      <MemoryRouter initialEntries={['/namespaces/demo/team-access/assign']}>
        <Routes>
          <Route path="/namespaces/:id/team-access/assign" element={<HubNamespaceAssignTeams />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify the wizard component renders
    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
  });
});
