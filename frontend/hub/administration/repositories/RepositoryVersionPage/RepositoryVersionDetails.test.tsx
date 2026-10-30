/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { RepositoryVersionDetails } from './RepositoryVersionDetails';

const server = setupServer(
  http.get(
    pulpAPI`/repositories/ansible/ansible/12345678-1234-1234-1234-123456789abc/versions/`,
    ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('number') === '1') {
        return HttpResponse.json({
          count: 1,
          results: [
            {
              pulp_href: '/pulp/api/v3/repositories/ansible/ansible/12345/versions/1/',
              pulp_created: '2026-01-01T00:00:00Z',
              number: 1,
              repository: '/pulp/api/v3/repositories/ansible/ansible/12345/',
              base_version: '',
              content_summary: {
                added: { 'ansible.collection_version': { count: 2 } },
                removed: { 'ansible.collection_version': { count: 0 } },
                present: { 'ansible.collection_version': { count: 5 } },
              },
            },
          ],
        });
      }
      return HttpResponse.json({ count: 0, results: [] });
    }
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RepositoryVersionDetails', () => {
  it('renders version summary details', async () => {
    render(
      <MemoryRouter initialEntries={['/repositories/test-repo/versions/1/details']}>
        <Routes>
          <Route
            path="/repositories/:id/versions/:version/details"
            element={<Outlet context={{ repo_id: '12345678-1234-1234-1234-123456789abc' }} />}
          >
            <Route index element={<RepositoryVersionDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    expect(screen.getByText('ansible.collection_version: 2')).toBeInTheDocument();
  });
});
