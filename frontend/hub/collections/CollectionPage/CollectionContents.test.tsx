/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../Collection';
import { CollectionContents } from './CollectionContents';
import { setHubApiPath } from '../../common/api/formatPath';

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
    pulp_href: '/repo/',
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

const mockContentsResponse = {
  results: [
    {
      contents: [
        { name: 'hello_module', content_type: 'module', description: 'Hello module' },
        { name: 'my_role', content_type: 'role', description: 'Example role' },
      ],
    },
  ],
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    useGetPageUrl: () => () => '/documentation/link',
  };
});

function renderContents(initialPath = '/?keywords=&showing=all') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Outlet context={{ collection: mockCollection }} />}>
          <Route index element={<CollectionContents />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('CollectionContents', () => {
  const server = setupServer(
    http.get('*/content/ansible/collection_versions/', () =>
      HttpResponse.json(mockContentsResponse)
    )
  );

  beforeAll(() => {
    setHubApiPath('/api/galaxy');
    server.listen({ onUnhandledRequest: 'error' });
  });
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('renders collection contents and supports keyword filtering', async () => {
    const user = userEvent.setup();
    renderContents();

    await waitFor(() => {
      expect(screen.getByText('hello_module')).toBeInTheDocument();
      expect(screen.getByText('my_role')).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText('Find content');
    await user.clear(search);
    await user.type(search, 'hello');

    await waitFor(() => {
      expect(screen.getByText('hello_module')).toBeInTheDocument();
      expect(screen.queryByText('my_role')).not.toBeInTheDocument();
    });
  });

  it('filters by content type when showing toolbar item is clicked', async () => {
    const user = userEvent.setup();
    renderContents();

    await waitFor(() => {
      expect(screen.getByText('role (1)')).toBeInTheDocument();
    });

    await user.click(screen.getByText('role (1)'));

    await waitFor(() => {
      expect(screen.getByText('my_role')).toBeInTheDocument();
      expect(screen.queryByText('hello_module')).not.toBeInTheDocument();
    });
  });

  it('shows community warning when no content matches in community repo', async () => {
    const communityCollection: CollectionVersionSearch = {
      ...mockCollection,
      repository: { ...mockCollection.repository!, name: 'community' },
    };

    server.use(
      http.get('*/content/ansible/collection_versions/', () =>
        HttpResponse.json({ results: [{ contents: [] }] })
      )
    );

    render(
      <MemoryRouter initialEntries={['/?keywords=nomatch&showing=all']}>
        <Routes>
          <Route path="/" element={<Outlet context={{ collection: communityCollection }} />}>
            <Route index element={<CollectionContents />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          'Community collections do not have docs nor content counts, but all content gets synchronized'
        )
      ).toBeInTheDocument();
    });
  });
});
