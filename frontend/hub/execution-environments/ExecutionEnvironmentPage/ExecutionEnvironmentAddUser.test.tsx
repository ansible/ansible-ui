/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { mockExecutionEnvironment } from '../test/mockExecutionEnvironment';
import { ExecutionEnvironmentAddUsers } from './ExecutionEnvironmentAddUser';

const mockNavigate = vi.fn();

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockNavigate,
  };
});

const mockUsers = {
  count: 1,
  next: null,
  previous: null,
  results: [{ id: 1, username: 'demo-user', first_name: '', last_name: '' }],
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

describe('ExecutionEnvironmentAddUsers', () => {
  const server = setupServer();

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders the assign users wizard', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get('*/users/*', () => HttpResponse.json(mockUsers)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoles)),
      http.get('*/service-index/role-types/', () => HttpResponse.json(mockRoleTypes))
    );

    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/user-access/add']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/user-access/add"
            element={<ExecutionEnvironmentAddUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('wizard')).toBeInTheDocument();
    });
    expect(screen.getByRole('heading', { name: 'Assign users' })).toBeInTheDocument();
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
        initialEntries={['/execution-environments/test-execution-environment/user-access/add']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/user-access/add"
            element={<ExecutionEnvironmentAddUsers />}
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
      http.get('*/users/*', () => HttpResponse.json(mockUsers)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoles)),
      http.get('*/service-index/role-types/', () => HttpResponse.json(mockRoleTypes))
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/user-access/add']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/user-access/add"
            element={<ExecutionEnvironmentAddUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('requires at least one user before continuing the wizard', async () => {
    server.use(
      http.get(
        ({ request }) =>
          request.url.includes('/v3/plugin/execution-environments/repositories/') &&
          !request.url.includes('/_content/'),
        () => HttpResponse.json(mockExecutionEnvironment)
      ),
      http.get('*/users/*', () => HttpResponse.json(mockUsers)),
      http.get('*/role_definitions/*', () => HttpResponse.json(mockRoles)),
      http.get('*/service-index/role-types/', () => HttpResponse.json(mockRoleTypes))
    );

    const user = userEvent.setup();
    render(
      <MemoryRouter
        initialEntries={['/execution-environments/test-execution-environment/user-access/add']}
      >
        <Routes>
          <Route
            path="/execution-environments/:id/user-access/add"
            element={<ExecutionEnvironmentAddUsers />}
          />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByTestId('wizard');
    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Select at least one user.')).toBeInTheDocument();
  });
});
