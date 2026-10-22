/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { RemotePage } from './RemotePage';

vi.mock('../../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

const mockRemote = {
  pulp_href: '/pulp/remotes/1/',
  pulp_created: '2024-01-01T00:00:00Z',
  name: 'test-remote',
  url: 'https://galaxy.example.com',
  pulp_labels: {},
  client_key: null,
  client_cert: null,
  ca_cert: null,
  download_concurrency: null,
  proxy_url: null,
  proxy_username: null,
  proxy_password: null,
  rate_limit: null,
  signed_only: false,
  sync_dependencies: false,
  requirements_file: null,
  auth_url: null,
  token: null,
  username: null,
  password: null,
};

const server = setupServer(
  http.get('*/pulp/api/v3/remotes/ansible/collection/*', () =>
    HttpResponse.json({ count: 1, results: [mockRemote] })
  ),
  http.get('*/pulp/api/v3/remotes/ansible/collection/test-remote/', () =>
    HttpResponse.json(mockRemote)
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RemotePage', () => {
  it('renders remote page title', async () => {
    render(
      <MemoryRouter initialEntries={['/remotes/test-remote']}>
        <Routes>
          <Route path="/remotes/:id/*" element={<RemotePage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'test-remote' })).toBeInTheDocument();
    });
  });
});
