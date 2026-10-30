/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { Repository } from '../Repository';
import { RepositoryDetails } from './RepositoryDetails';

const mockRepository: Repository = {
  name: 'test-repo',
  description: 'Test description',
  pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/',
  pulp_created: '2026-01-01T00:00:00Z',
  pulp_labels: { pipeline: 'approved' },
  private: false,
  retain_repo_versions: 3,
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
  http.get(pulpAPI`/distributions/ansible/ansible/`, () =>
    HttpResponse.json({
      count: 1,
      results: [{ name: 'test-repo', base_path: 'test-repo' }],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RepositoryDetails', () => {
  it('renders repository details from outlet context', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/details']}>
        <Routes>
          <Route
            path="/repositories/:id/details"
            element={<Outlet context={{ repository: mockRepository }} />}
          >
            <Route index element={<RepositoryDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getAllByText('test-repo').length).toBeGreaterThan(0);
  });
});
