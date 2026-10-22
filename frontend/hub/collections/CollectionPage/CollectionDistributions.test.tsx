/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { setHubApiPath } from '../../common/api/formatPath';
import { CollectionVersionSearch } from '../Collection';
import { CollectionDistributions } from './CollectionDistributions';

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testns',
    name: 'testcol',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/cv/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: '',
  },
  repository: {
    name: 'published',
    pulp_href: '/repositories/1/',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
    description: '',
  },
  repository_version: '1',
  is_signed: false,
  is_deprecated: false,
} as CollectionVersionSearch;

describe('CollectionDistributions', () => {
  const server = setupServer(
    http.get('*/pulp/api/v3/distributions/ansible/ansible/', () =>
      HttpResponse.json({
        count: 1,
        results: [
          {
            name: 'published',
            pulp_href: '/dist/1/',
            base_path: 'published',
            pulp_created: '2024-01-01T00:00:00Z',
          },
        ],
      })
    )
  );

  beforeAll(() => {
    setHubApiPath('/api/galaxy');
    server.listen({ onUnhandledRequest: 'error' });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders distributions for the collection repository', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Outlet context={{ collection: mockCollection }} />}>
            <Route index element={<CollectionDistributions />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('published').length).toBeGreaterThan(0);
      expect(screen.getByText('Distributions')).toBeInTheDocument();
    });
  });
});
