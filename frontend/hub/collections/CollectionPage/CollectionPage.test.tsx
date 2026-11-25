import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { CollectionVersionSearch } from '../Collection';
import { CollectionPage } from './CollectionPage';

const { mockPageNavigate, mockAddAlert, mockRemoveAlerts, mockOpenBrowse, mockUseHubContext } =
  vi.hoisted(() => ({
    mockPageNavigate: vi.fn(),
    mockAddAlert: vi.fn(),
    mockRemoveAlerts: vi.fn(),
    mockOpenBrowse: vi.fn(),
    mockUseHubContext: vi.fn(() => ({
      featureFlags: {
        display_signatures: true,
      },
      settings: {},
      user: null,
      hasPermission: () => false,
    })),
  }));

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'testnamespace',
    name: 'testcollection',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/api/galaxy/v3/collections/testnamespace/testcollection/versions/1.0.0/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: 'Test collection description',
  },
  repository: {
    name: 'published',
    description: 'Published repository',
    pulp_id: 'test-pulp-id',
    pulp_last_updated: '2024-01-01T00:00:00Z',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '/api/galaxy/v3/repositories/published/versions/1/',
    pulp_href: '/api/galaxy/v3/repositories/published/',
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

const mockCollectionResponse = {
  meta: {
    count: 1,
  },
  data: [mockCollection],
};

vi.mock('@ansible/ansible-ui-framework', async () => {
  const actual = await vi.importActual('@ansible/ansible-ui-framework');
  return {
    ...actual,
    usePageNavigate: () => mockPageNavigate,
    useGetPageUrl: () => (route: string) => `/mock-url/${route}`,
    usePageAlertToaster: () => ({
      addAlert: mockAddAlert,
      removeAlerts: mockRemoveAlerts,
    }),
  };
});

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => mockUseHubContext(),
}));

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../common/isInsights';

vi.mock('../hooks/useCollectionActions', () => ({
  useCollectionActions: () => [],
}));

vi.mock('../hooks/useCollectionVersionSelector', () => ({
  useSelectCollectionVersionSingle: () => ({
    openBrowse: (...args: unknown[]) => {
      mockOpenBrowse(...args);
    },
  }),
}));

describe('CollectionPage', () => {
  const server = setupServer(
    http.get(
      ({ request }) => {
        return request.url.includes('/v3/plugin/ansible/search/collection-versions/');
      },
      () => {
        return HttpResponse.json(mockCollectionResponse);
      }
    )
  );

  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    mockPageNavigate.mockReset();
    mockAddAlert.mockReset();
    mockRemoveAlerts.mockReset();
    mockOpenBrowse.mockReset();
    mockUseHubContext.mockReturnValue({
      featureFlags: { display_signatures: true },
      settings: {},
      user: null,
      hasPermission: () => false,
    });
  });

  test('should render loading state initially', () => {
    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should render collection page with collection data', async () => {
    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'testnamespace.testcollection' })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Repository: published')).toBeInTheDocument();
    expect(screen.getByTestId('version-selector')).toBeInTheDocument();
  });

  test('should display signed state when collection is signed', async () => {
    const signedCollection = {
      ...mockCollection,
      is_signed: true,
    };
    const signedResponse = {
      meta: { count: 1 },
      data: [signedCollection],
    };

    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/v3/plugin/ansible/search/collection-versions/');
        },
        () => {
          return HttpResponse.json(signedResponse);
        }
      )
    );

    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Signed')).toBeInTheDocument();
    });
  });

  test('should display unsigned state when collection is not signed', async () => {
    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Unsigned')).toBeInTheDocument();
    });
  });

  test('should handle error state when collection is not found', async () => {
    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/v3/plugin/ansible/search/collection-versions/');
        },
        () => {
          return HttpResponse.json({ meta: { count: 0 }, data: [] }, { status: 200 });
        }
      )
    );

    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    // HubError renders AwxError which renders EmptyState with error message and Refresh button
    await waitFor(() => {
      // Check for NotFound message (translated from HubError) or Refresh button
      const notFoundText = screen.queryByText(/notfound/i);
      const refreshButton = screen.queryByRole('button', { name: /refresh/i });
      expect(notFoundText || refreshButton).toBeTruthy();
    });
  });

  test('should handle version parameter from URL', async () => {
    render(
      <MemoryRouter
        initialEntries={['/collections/published/testnamespace/testcollection?version=1.0.0']}
      >
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'testnamespace.testcollection' })
      ).toBeInTheDocument();
    });
  });

  test('should request versions sorted by descending version order', async () => {
    const capturedUrls: string[] = [];
    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/v3/plugin/ansible/search/collection-versions/');
        },
        ({ request }) => {
          capturedUrls.push(request.url);
          return HttpResponse.json(mockCollectionResponse);
        }
      )
    );

    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'testnamespace.testcollection' })
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      const versionListUrl = capturedUrls.find((url) => url.includes('order_by=-version'));
      expect(versionListUrl).toBeDefined();
    });
  });

  test('should render version selector with disableSortOptions', async () => {
    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'testnamespace.testcollection' })
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId('version-selector')).toBeInTheDocument();
    expect(screen.getByTestId('browse-collection-version')).toBeInTheDocument();
  });

  test('should handle API error in getCollectionData and set collection to null', async () => {
    server.use(
      http.get(
        ({ request }) => {
          return request.url.includes('/v3/plugin/ansible/search/collection-versions/');
        },
        () => {
          return HttpResponse.error();
        }
      )
    );

    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const refreshButton = screen.queryByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeTruthy();
    });
  });

  describe('Insights mode - external links', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    afterEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    test('should display external links when content metadata is available in insights mode', async () => {
      // Mock content API to return metadata with URLs
      server.use(
        http.get(
          ({ request }) => request.url.includes('/content/ansible/collection_versions/'),
          () =>
            HttpResponse.json({
              count: 1,
              results: [
                {
                  documentation: 'https://docs.example.com',
                  homepage: 'https://example.com',
                  issues: 'https://github.com/example/issues',
                  origin_repository: 'https://github.com/example/repo',
                  docs_blob: {
                    contents: [],
                    collection_readme: { html: '', name: '' },
                    documentation_files: [],
                  },
                  license: ['MIT'],
                },
              ],
            })
        )
      );

      render(
        <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
          <CollectionPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'testnamespace.testcollection' })
        ).toBeInTheDocument();
      });

      // Check for external links in insights mode
      await waitFor(() => {
        expect(screen.getByText('Docs site')).toBeInTheDocument();
        expect(screen.getByText('Website')).toBeInTheDocument();
        expect(screen.getByText('Issue tracker')).toBeInTheDocument();
        expect(screen.getByText('Repo')).toBeInTheDocument();
        expect(screen.getByText('Create issue')).toBeInTheDocument();
      });
    });

    test('should show Create issue link even without metadata URLs', async () => {
      server.use(
        http.get(
          ({ request }) => request.url.includes('/content/ansible/collection_versions/'),
          () =>
            HttpResponse.json({
              count: 1,
              results: [
                {
                  docs_blob: {
                    contents: [],
                    collection_readme: { html: '', name: '' },
                    documentation_files: [],
                  },
                  license: ['MIT'],
                },
              ],
            })
        )
      );

      render(
        <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
          <CollectionPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'testnamespace.testcollection' })
        ).toBeInTheDocument();
      });

      // Create issue link should always appear in insights mode
      await waitFor(() => {
        expect(screen.getByText('Create issue')).toBeInTheDocument();
      });

      // Other links should not appear without content data
      expect(screen.queryByText('Docs site')).not.toBeInTheDocument();
      expect(screen.queryByText('Website')).not.toBeInTheDocument();
    });

    test('should not display external links when not in insights mode', async () => {
      vi.mocked(isInsightsMode).mockReturnValue(false);

      render(
        <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
          <CollectionPage />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'testnamespace.testcollection' })
        ).toBeInTheDocument();
      });

      // External links should not appear in platform mode
      expect(screen.queryByText('Docs site')).not.toBeInTheDocument();
      expect(screen.queryByText('Create issue')).not.toBeInTheDocument();
    });
  });

  test('hides signature status when the feature flag is off', async () => {
    mockUseHubContext.mockReturnValue({
      featureFlags: { display_signatures: false },
      settings: {},
      user: null,
      hasPermission: () => false,
    });

    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'testnamespace.testcollection' })
      ).toBeInTheDocument();
    });
    expect(screen.queryByText('Signed')).not.toBeInTheDocument();
    expect(screen.queryByText('Unsigned')).not.toBeInTheDocument();
  });

  test('loads version options and applies a browsed version', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        ({ request }) => request.url.includes('/v3/plugin/ansible/search/collection-versions/'),
        ({ request }) => {
          if (request.url.includes('version=2.0.0')) {
            return HttpResponse.json({
              meta: { count: 1 },
              data: [
                {
                  ...mockCollection,
                  collection_version: {
                    ...mockCollection.collection_version,
                    version: '2.0.0',
                  },
                },
              ],
            });
          }
          if (request.url.includes('offset=')) {
            return HttpResponse.json({
              meta: { count: 2 },
              data: [
                { ...mockCollection, is_highest: true, is_signed: true },
                {
                  ...mockCollection,
                  is_highest: false,
                  is_signed: false,
                  collection_version: {
                    ...mockCollection.collection_version,
                    version: '0.9.0',
                    pulp_created: '2023-01-01T00:00:00Z',
                  },
                },
              ],
            });
          }
          return HttpResponse.json(mockCollectionResponse);
        }
      )
    );
    mockOpenBrowse.mockImplementation((onSelect: (item: CollectionVersionSearch) => void) => {
      onSelect({
        ...mockCollection,
        collection_version: {
          ...mockCollection.collection_version,
          version: '2.0.0',
        },
      } as CollectionVersionSearch);
    });

    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'testnamespace.testcollection' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /1\.0\.0/ }));
    await waitFor(() => expect(screen.getAllByText(/latest/).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/unsigned/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/0\.9\.0/)).toBeInTheDocument();

    await user.click(screen.getByTestId('browse-collection-version-button'));
    await waitFor(() => expect(screen.getByText('2.0.0')).toBeInTheDocument());
  });

  test('alerts when a newer collection version is uploaded', async () => {
    const user = userEvent.setup();
    let allowUpgrade = false;
    server.use(
      http.get(
        ({ request }) => request.url.includes('/v3/plugin/ansible/search/collection-versions/'),
        ({ request }) => {
          if (request.url.includes('order_by=-version') && !request.url.includes('offset=')) {
            const count = allowUpgrade ? 2 : 1;
            return HttpResponse.json({
              meta: { count },
              data:
                count === 1
                  ? [mockCollection]
                  : [
                      {
                        ...mockCollection,
                        collection_version: {
                          ...mockCollection.collection_version,
                          version: '2.0.0',
                          pulp_created: '2024-06-01T00:00:00Z',
                        },
                      },
                      mockCollection,
                    ],
            });
          }
          return HttpResponse.json(mockCollectionResponse);
        }
      )
    );

    render(
      <MemoryRouter initialEntries={['/collections/published/testnamespace/testcollection']}>
        <CollectionPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'testnamespace.testcollection' })
      ).toBeInTheDocument();
    });
    allowUpgrade = true;

    await waitFor(() => expect(mockAddAlert).toHaveBeenCalled(), { timeout: 5000 });
    const alert = mockAddAlert.mock.calls[0][0] as { title: React.ReactElement };
    render(alert.title);
    await user.click(screen.getByRole('button', { name: 'here' }));
    expect(mockPageNavigate).toHaveBeenCalled();
    expect(mockRemoveAlerts).toHaveBeenCalled();
  });
});
