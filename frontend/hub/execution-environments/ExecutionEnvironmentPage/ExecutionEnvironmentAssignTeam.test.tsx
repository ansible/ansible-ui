/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mockExecutionEnvironment } from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentAssignTeams } from './ExecutionEnvironmentAssignTeam';

const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

const mockTeams = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, name: 'test-team', description: '' }],
};

const mockRoles = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 4,
      name: 'galaxy.container_publisher',
      description: 'Upload and modify containers.',
    },
  ],
};

const mockRoleTypes = {
  results: [{ api_slug: 'galaxy.containernamespace', name: 'Container namespace' }],
};

describe('ExecutionEnvironmentAssignTeams', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
  });
  afterAll(() => server.close());

  it('renders the assign teams wizard', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get('*/teams/*', () => HttpResponse.json(mockTeams)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoles)),
      http.get('*/service-index/role-types/', () => HttpResponse.json(mockRoleTypes))
    );

    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/team-access/assign']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/team-access/assign"
            element={<ExecutionEnvironmentAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Assign teams' })).toBeInTheDocument();
  });

  it('shows error when execution environment fails to load', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/team-access/assign']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/team-access/assign"
            element={<ExecutionEnvironmentAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: /Refresh/i })).toBeInTheDocument();
  });

  it('navigates back on cancel', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get('*/teams/*', () => HttpResponse.json(mockTeams)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoles)),
      http.get('*/service-index/role-types/', () => HttpResponse.json(mockRoleTypes))
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/team-access/assign']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/team-access/assign"
            element={<ExecutionEnvironmentAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('requires at least one team before continuing the wizard', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get('*/teams/*', () => HttpResponse.json(mockTeams)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoles)),
      http.get('*/service-index/role-types/', () => HttpResponse.json(mockRoleTypes))
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/team-access/assign']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/team-access/assign"
            element={<ExecutionEnvironmentAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Select at least one team.')).toBeInTheDocument();
  });

  it('shows loading while execution environment is fetched', () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          return HttpResponse.json(mockExecutionEnvironment);
        }
      )
    );

    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/team-access/assign']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/team-access/assign"
            element={<ExecutionEnvironmentAssignTeams />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
