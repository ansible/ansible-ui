import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { ExecutionEnvironment } from '../ExecutionEnvironment';
import { ExecutionEnvironmentPage } from './ExecutionEnvironmentPage';

const mockExecutionEnvironment: ExecutionEnvironment = {
  id: 'test-ee-id',
  pulp_href: '/api/galaxy/v3/repositories/container/container/test-ee-id/',
  name: 'test-execution-environment',
  description: 'Test EE description',
  registry: 'test-registry-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  pulp: {
    repository: {
      id: 'test-ee-id',
      pulp_type: 'container.container',
      version: 1,
      name: 'test-execution-environment',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      pulp_labels: {},
      sign_state: 'unsigned',
      remote: {
        id: 'test-remote-id',
        pulp_href: '/api/galaxy/pulp/api/v3/remotes/container/container/test-remote-id/',
        name: 'test-remote',
        upstream_name: 'docker.io/testimage',
        registry: 'test-registry-id',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        include_tags: [],
        exclude_tags: [],
        include_foreign_layers: false,
        last_sync_task: {
          state: 'completed',
          started_at: '2024-01-01T00:00:00Z',
          finished_at: '2024-01-01T00:01:00Z',
          error: {
            traceback: '',
            description: '',
          },
        },
      },
    },
    distribution: {
      id: 'test-dist-id',
      name: 'test-execution-environment',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      base_path: 'test-execution-environment',
      pulp_labels: {},
    },
  },
};

describe('ExecutionEnvironmentPage', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return request.url.includes('/v3/plugin/execution-environments/repositories/');
      },
      () => {
        return HttpResponse.json(mockExecutionEnvironment);
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  test('should render all tabs correctly', async () => {
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter
          initialEntries={['/execution-environments/test-execution-environment/details']}
        >
          <Routes>
            <Route path="/execution-environments/:id/*" element={<ExecutionEnvironmentPage />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: 'test-execution-environment' })
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByTestId('execution-environment-details-tab')).toHaveTextContent('Details');
    expect(screen.getByTestId('execution-environment-activity-tab')).toHaveTextContent('Activity');
    expect(screen.getByTestId('execution-environment-images-tab')).toHaveTextContent('Images');
    expect(screen.getByTestId('execution-environment-access-tab')).toHaveTextContent('Team Access');
    expect(screen.getByTestId('execution-environment-user-access-tab')).toHaveTextContent(
      'User Access'
    );
  });
});
