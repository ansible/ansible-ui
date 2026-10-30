/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { pulpAPI } from '../../../common/api/formatPath';
import { HubRemote } from '../Remotes';
import { RemoteDetails } from './RemoteDetails';

const mockRemote: HubRemote = {
  pulp_href: '/pulp/api/v3/remotes/ansible/collection/12345678-1234-1234-1234-123456789abc/',
  pulp_created: '2024-01-01T00:00:00Z',
  name: 'test-remote',
  url: 'https://galaxy.example.com',
  client_cert: null,
  download_concurrency: null,
  rate_limit: null,
  tls_validation: true,
  signed_only: false,
  sync_dependencies: false,
  sync_highest_versions: null,
  requirements_file: null,
  proxy_url: null,
};

const server = setupServer(
  http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
    HttpResponse.json({ count: 0, results: [] })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RemoteDetails', () => {
  it('renders remote details from outlet context', async () => {
    render(
      <MemoryRouter initialEntries={['/remotes/test-remote/details']}>
        <Routes>
          <Route path="/remotes/:id/details" element={<Outlet context={{ remote: mockRemote }} />}>
            <Route index element={<RemoteDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('test-remote')).toBeInTheDocument();
    });
    expect(screen.getByText('https://galaxy.example.com')).toBeInTheDocument();
  });

  it('shows error when linked repositories fail to load', async () => {
    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
      )
    );

    render(
      <MemoryRouter initialEntries={['/remotes/test-remote/details']}>
        <Routes>
          <Route path="/remotes/:id/details" element={<Outlet context={{ remote: mockRemote }} />}>
            <Route index element={<RemoteDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('button', { name: 'Refresh' })).toBeInTheDocument();
  });

  it('renders repository labels when remote is linked to repositories', async () => {
    server.use(
      http.get(pulpAPI`/repositories/ansible/ansible/`, () =>
        HttpResponse.json({
          count: 4,
          results: [
            { name: 'repo-a', pulp_href: '/pulp/a/' },
            { name: 'repo-b', pulp_href: '/pulp/b/' },
            { name: 'repo-c', pulp_href: '/pulp/c/' },
            { name: 'repo-d', pulp_href: '/pulp/d/' },
          ],
        })
      )
    );

    render(
      <MemoryRouter initialEntries={['/remotes/test-remote/details']}>
        <Routes>
          <Route path="/remotes/:id/details" element={<Outlet context={{ remote: mockRemote }} />}>
            <Route index element={<RemoteDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('repo-a')).toBeInTheDocument();
    });
    expect(screen.getByText('1 more')).toBeInTheDocument();
  });

  it('renders YAML requirements editor when requirements file is set', async () => {
    const remoteWithRequirements = {
      ...mockRemote,
      requirements_file: 'collections:\n  - name: demo.collection',
    };

    render(
      <MemoryRouter initialEntries={['/remotes/test-remote/details']}>
        <Routes>
          <Route
            path="/remotes/:id/details"
            element={<Outlet context={{ remote: remoteWithRequirements }} />}
          >
            <Route index element={<RemoteDetails />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('YAML requirements')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('code-block-value').textContent).toContain('demo.collection');
    });
  });
});
