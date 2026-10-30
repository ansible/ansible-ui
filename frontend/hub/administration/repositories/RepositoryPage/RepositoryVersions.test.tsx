/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor, renderHook, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { Repository } from '../Repository';
import { RepositoryVersions, useRevertToVersion } from './RepositoryVersions';

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: Record<string, unknown>) => {
    capturedBulkConfig = config;
  },
}));

let capturedBulkConfig: Record<string, unknown> = {};

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
  latest_version_href: '/pulp/api/v3/repositories/ansible/ansible/12345/versions/1/',
  versions_href: '/pulp/api/v3/repositories/ansible/ansible/12345/versions/',
};

const server = setupServer(
  http.get(
    pulpAPI`/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/versions/`,
    () =>
      HttpResponse.json({
        count: 1,
        results: [
          {
            pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345/versions/1/',
            pulp_created: '2026-01-01T00:00:00Z',
            number: 1,
            repository: mockRepository.pulp_href,
            base_version: '',
          },
        ],
      })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  capturedBulkConfig = {};
});
afterAll(() => server.close());

describe('RepositoryVersions', () => {
  it('renders repository versions table', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/versions']}>
        <Routes>
          <Route
            path="/repositories/:id/versions"
            element={
              <Outlet
                context={{
                  repo_id: '12345678-1234-1234-1234-123456789abc',
                  repository: mockRepository,
                }}
              />
            }
          >
            <Route index element={<RepositoryVersions />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('columnheader', { name: 'Version number' })).toBeInTheDocument();
    });
    expect(screen.getByText('1 (latest)')).toBeInTheDocument();
  });

  it('opens revert bulk confirmation from hook', () => {
    const version = {
      pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345/versions/1/',
      pulp_created: '2026-01-01T00:00:00Z',
      number: 1,
      repository: mockRepository.pulp_href,
      base_version: '',
    };

    const { result } = renderHook(() => useRevertToVersion(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([version]);
    });

    expect(capturedBulkConfig.title).toBe('Revert to repository version.');
  });

  it('executes revert action against modify endpoint', async () => {
    const TASK_UUID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    server.use(
      http.post(
        pulpAPI`/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/modify/`,
        () => HttpResponse.json({ task: `/pulp/api/v3/tasks/${TASK_UUID}/` })
      ),
      http.get(pulpAPI`/tasks/${TASK_UUID}/`, () => HttpResponse.json({ state: 'completed' }))
    );

    const version = {
      pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345/versions/1/',
      pulp_created: '2026-01-01T00:00:00Z',
      number: 1,
      repository: mockRepository.pulp_href,
      base_version: '',
    };

    const { result } = renderHook(() => useRevertToVersion(vi.fn()), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([version]);
    });

    await act(async () => {
      await (capturedBulkConfig.actionFn as (item: typeof version) => Promise<unknown>)?.(version);
    });
  });
});
