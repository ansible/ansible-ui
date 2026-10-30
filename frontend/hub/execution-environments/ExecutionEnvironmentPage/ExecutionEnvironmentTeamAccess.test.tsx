/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mockExecutionEnvironment } from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentTeamAccess } from './ExecutionEnvironmentTeamAccess';

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
          name: 'galaxy.container_publisher',
          description: 'Upload and modify containers.',
          managed: false,
        },
        team: { id: 1, name: 'test team', description: '' },
        content_object: { id: 1, name: 'test-execution-environment', description: '' },
      },
      created: '2024-05-08T18:01:06.186968Z',
      created_by: 4,
      content_type: 'galaxy.containernamespace',
      object_id: 'namespace-uuid-1',
      object_ansible_id: null,
      role_definition: 4,
      team: 1,
      team_ansible_id: null,
    },
  ],
};

describe('ExecutionEnvironmentTeamAccess', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders team assignments', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get('*/role_team_assignments/*', () => HttpResponse.json(mockTeamAssignments))
    );

    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/team-access']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/team-access"
            element={<ExecutionEnvironmentTeamAccess />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test team')).toBeInTheDocument();
    });
  });
});
