/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { Repository } from '../Repository';
import { RepositoryVersionCollections } from './RepositoryVersionCollections';

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
  versions_href: '/pulp/api/v3/repositories/ansible/ansible/12345/versions/',
};

const server = setupServer(
  http.get('*/content/ansible/collection_versions/*', () =>
    HttpResponse.json({
      count: 1,
      results: [
        {
          id: 1,
          name: 'aws',
          namespace: 'amazon',
          version: '1.0.0',
          description: 'AWS modules',
        },
      ],
    })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RepositoryVersionCollections', () => {
  it('renders collections in repository version', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/versions/1/collections']}>
        <Routes>
          <Route
            path="/repositories/:id/versions/:version/collections"
            element={<Outlet context={{ repository: mockRepository }} />}
          >
            <Route index element={<RepositoryVersionCollections />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('amazon.aws v1.0.0')).toBeInTheDocument();
    });
  });
});
