/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { RepositoryVersionPage } from './RepositoryVersionPage';

const mockRepository = {
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
  http.get(pulpAPI`/repositories/ansible/ansible/`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('name') === 'test-repo') {
      return HttpResponse.json({ count: 1, results: [mockRepository] });
    }
    return HttpResponse.json({ count: 0, results: [] });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RepositoryVersionPage', () => {
  it('renders version page header and tabs', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/versions/1']}>
        <Routes>
          <Route path="/repositories/:id/versions/:version/*" element={<RepositoryVersionPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Version: 1' })).toBeInTheDocument();
    });
    expect(screen.getByRole('tab', { name: 'Details' })).toBeInTheDocument();
  });
});
