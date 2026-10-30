/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { hubAPI, pulpAPI } from '../../../common/api/formatPath';
import { Repository } from '../Repository';
import { RepositoryCollectionVersion } from './RepositoryCollectionVersion';

const mockRunAddModal = vi.fn();

vi.mock('../hooks/useAddCollections', () => ({
  useAddCollections: () => mockRunAddModal,
}));

let mockHasPermission = () => true;
let mockUser: { is_superuser?: boolean } | null = null;

vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {},
    settings: {},
    hasPermission: mockHasPermission,
    user: mockUser,
  }),
}));

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => () => undefined,
}));

vi.mock('../../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../../common/isInsights';

const mockRepository: Repository = {
  name: 'test-repo',
  description: '',
  pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/',
  pulp_created: '2026-01-01T00:00:00Z',
  pulp_labels: {},
  private: false,
  retain_repo_versions: 1,
  remote: null,
  gpgkey: null,
  last_sync_task: {
    state: 'completed',
    task_id: '1',
    started_at: '2026-01-01T00:00:00Z',
    finished_at: '2026-01-01T00:00:00Z',
  },
  last_synced_metadata_time: null,
  latest_version_href: '',
  versions_href: '',
};

const server = setupServer(
  http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  mockHasPermission = () => true;
  mockUser = null;
  vi.mocked(isInsightsMode).mockReturnValue(false);
});
afterAll(() => server.close());

describe('RepositoryCollectionVersion', () => {
  it('renders empty collection versions state', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/collections']}>
        <Routes>
          <Route
            path="/repositories/:id/collections"
            element={
              <Outlet
                context={{
                  id: 'test-repo',
                  repo_id: '12345678-1234-1234-1234-123456789abc',
                  repository: mockRepository,
                }}
              />
            }
          >
            <Route index element={<RepositoryCollectionVersion />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No collection versions yet')).toBeInTheDocument();
    });
  });

  it('renders collection rows and add collections button', async () => {
    const mockCollection = {
      collection_version: {
        namespace: 'demo',
        name: 'collection',
        version: '1.0.0',
        pulp_created: '2026-01-01T00:00:00Z',
        pulp_href: '/pulp/cv/1/',
        description: '',
        requires_ansible: '>=2.9',
        require_ansible: '>=2.9',
      },
      repository: mockRepository,
      repository_version: '1',
      is_highest: true,
      is_signed: false,
      is_deprecated: false,
    };

    server.use(
      http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
        HttpResponse.json({ count: 1, results: [mockCollection] })
      )
    );

    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/collections']}>
        <Routes>
          <Route
            path="/repositories/:id/collections"
            element={
              <Outlet
                context={{
                  id: 'test-repo',
                  repo_id: '12345678-1234-1234-1234-123456789abc',
                  repository: mockRepository,
                }}
              />
            }
          >
            <Route index element={<RepositoryCollectionVersion />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('collection')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Add collections' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove collections' })).toBeDisabled();
  });

  it('calls add collections modal from empty state button', async () => {
    mockRunAddModal.mockClear();
    server.use(
      http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/collections']}>
        <Routes>
          <Route
            path="/repositories/:id/collections"
            element={
              <Outlet
                context={{
                  id: 'test-repo',
                  repo_id: '12345678-1234-1234-1234-123456789abc',
                  repository: mockRepository,
                }}
              />
            }
          >
            <Route index element={<RepositoryCollectionVersion />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(await screen.findByTestId('add-collections'));
    expect(mockRunAddModal).toHaveBeenCalled();
  });

  it('hides modify actions in Insights mode without permission', async () => {
    vi.mocked(isInsightsMode).mockReturnValue(true);
    mockHasPermission = () => false;
    mockUser = null;

    server.use(
      http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
        HttpResponse.json({ count: 0, results: [] })
      )
    );

    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/collections']}>
        <Routes>
          <Route
            path="/repositories/:id/collections"
            element={
              <Outlet
                context={{
                  id: 'test-repo',
                  repo_id: '12345678-1234-1234-1234-123456789abc',
                  repository: mockRepository,
                }}
              />
            }
          >
            <Route index element={<RepositoryCollectionVersion />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No collection versions yet')).toBeInTheDocument();
    });
    expect(screen.queryByTestId('add-collections')).not.toBeInTheDocument();
  });

  it('selects collections and opens remove confirmation', async () => {
    const REPO_UUID = '12345678-1234-1234-1234-123456789abc';
    const TASK_UUID = 'remove-task-1';
    const mockCollection = {
      collection_version: {
        namespace: 'demo',
        name: 'collection',
        version: '1.0.0',
        pulp_created: '2026-01-01T00:00:00Z',
        pulp_href: '/pulp/cv/1/',
        description: '',
        requires_ansible: '>=2.9',
        require_ansible: '>=2.9',
      },
      repository: mockRepository,
      repository_version: '1',
      is_highest: true,
      is_signed: false,
      is_deprecated: false,
    };

    server.use(
      http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
        HttpResponse.json({ count: 1, results: [mockCollection] })
      ),
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({
          count: 1,
          results: [{ ...mockRepository, latest_version_href: '/v/1/' }],
        })
      ),
      http.post(pulpAPI`/repositories/ansible/ansible/${REPO_UUID}/modify/`, () =>
        HttpResponse.json({ task: `/pulp/api/v3/tasks/${TASK_UUID}/` })
      ),
      http.get(pulpAPI`/tasks/${TASK_UUID}/`, () => HttpResponse.json({ state: 'completed' }))
    );

    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/collections']}>
        <Routes>
          <Route
            path="/repositories/:id/collections"
            element={
              <Outlet
                context={{
                  id: 'test-repo',
                  repo_id: REPO_UUID,
                  repository: mockRepository,
                }}
              />
            }
          >
            <Route index element={<RepositoryCollectionVersion />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await screen.findByText('collection');
    const checkboxes = await screen.findAllByRole('checkbox');
    const rowCheckbox =
      checkboxes.find((box) => box.getAttribute('name') !== 'select-all') ?? checkboxes[1];
    await user.click(rowCheckbox!);

    const removeButton = screen.getByRole('button', { name: 'Remove collections' });
    expect(removeButton).toBeEnabled();
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('collection')).toBeInTheDocument();
    });
  }, 30000);

  it('runs add collections callback after toolbar add click', async () => {
    mockRunAddModal.mockClear();
    server.use(
      http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
        HttpResponse.json({
          count: 1,
          results: [
            {
              collection_version: {
                namespace: 'demo',
                name: 'collection',
                version: '1.0.0',
                pulp_created: '2026-01-01T00:00:00Z',
                pulp_href: '/pulp/cv/1/',
                description: '',
                requires_ansible: '>=2.9',
                require_ansible: '>=2.9',
              },
              repository: mockRepository,
              repository_version: '1',
              is_highest: true,
              is_signed: false,
              is_deprecated: false,
            },
          ],
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/collections']}>
        <Routes>
          <Route
            path="/repositories/:id/collections"
            element={
              <Outlet
                context={{
                  id: 'test-repo',
                  repo_id: '12345678-1234-1234-1234-123456789abc',
                  repository: mockRepository,
                }}
              />
            }
          >
            <Route index element={<RepositoryCollectionVersion />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await screen.findByText('collection');
    await user.click(screen.getByRole('button', { name: 'Add collections' }));
    expect(mockRunAddModal).toHaveBeenCalled();
  });
});
