/* eslint-disable i18next/no-literal-string */
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { hubAPI } from '../common/api/formatPath';
import { Collections } from './Collections';

// Mock isInsightsMode and filterInsightsBulkActions
vi.mock('../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../common/isInsights';

const mockCollectionsResponse = {
  meta: {
    count: 2,
  },
  data: [
    {
      collection_version: {
        name: 'test_collection',
        namespace: 'test_namespace',
        version: '1.0.0',
        pulp_created: '2024-01-01T00:00:00.000000Z',
        pulp_href: '/api/galaxy/pulp/api/v3/content/ansible/collection_versions/123/',
      },
      repository: {
        name: 'published',
        pulp_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/456/',
      },
      is_signed: false,
      is_highest: true,
      is_deprecated: false,
    },
    {
      collection_version: {
        name: 'another_collection',
        namespace: 'another_namespace',
        version: '2.0.0',
        pulp_created: '2024-01-02T00:00:00.000000Z',
        pulp_href: '/api/galaxy/pulp/api/v3/content/ansible/collection_versions/789/',
      },
      repository: {
        name: 'published',
        pulp_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/012/',
      },
      is_signed: false,
      is_highest: true,
      is_deprecated: false,
    },
  ],
};

const mockEmptyResponse = {
  meta: {
    count: 0,
  },
  data: [],
};

describe('Collections Component', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  afterAll(() => server.close());

  describe('Page Structure', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
      server.use(
        http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
          HttpResponse.json(mockCollectionsResponse)
        )
      );
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <Collections />
        </MemoryRouter>
      );

      expect(await screen.findByRole('heading', { name: 'Collections' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Collections are packaged units of Ansible content that include roles, modules, plugins, and other components, making it easier to share and reuse automation functionality.'
        )
      ).toBeInTheDocument();
    });
  });

  describe('Collections Rendering', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
      server.use(
        http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
          HttpResponse.json(mockCollectionsResponse)
        )
      );
    });

    it('should render collections from API response', async () => {
      render(
        <MemoryRouter>
          <Collections />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Collections' });

      expect(await screen.findByText('test_collection')).toBeInTheDocument();
      expect(screen.getByText('another_collection')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    describe('in Platform mode (non-Insights)', () => {
      beforeEach(() => {
        vi.mocked(isInsightsMode).mockReturnValue(false);
        server.use(
          http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
            HttpResponse.json(mockEmptyResponse)
          )
        );
      });

      it('should show empty state when no collections exist', async () => {
        render(
          <MemoryRouter>
            <Collections />
          </MemoryRouter>
        );

        await screen.findByRole('heading', { name: 'Collections' });

        await waitFor(() => {
          expect(screen.getByText('No collections yet')).toBeInTheDocument();
        });
        expect(screen.getByText('To get started, upload a collection.')).toBeInTheDocument();
      });

      it('should show upload button in empty state', async () => {
        render(
          <MemoryRouter>
            <Collections />
          </MemoryRouter>
        );

        await screen.findByRole('heading', { name: 'Collections' });

        await waitFor(() => {
          expect(screen.getByText('No collections yet')).toBeInTheDocument();
        });
        expect(screen.getByTestId('upload-collection')).toBeInTheDocument();
      });
    });

    describe('in Insights mode', () => {
      beforeEach(() => {
        vi.mocked(isInsightsMode).mockReturnValue(true);
        server.use(
          http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
            HttpResponse.json(mockEmptyResponse)
          )
        );
      });

      it('should show Insights-specific empty state description', async () => {
        render(
          <MemoryRouter>
            <Collections />
          </MemoryRouter>
        );

        await screen.findByRole('heading', { name: 'Collections' });

        await waitFor(() => {
          expect(screen.getByText('No collections yet')).toBeInTheDocument();
        });
        expect(
          screen.getByText('To upload a collection, navigate to a namespace you have access to.')
        ).toBeInTheDocument();
      });

      it('should not show upload button in empty state', async () => {
        render(
          <MemoryRouter>
            <Collections />
          </MemoryRouter>
        );

        await screen.findByRole('heading', { name: 'Collections' });

        await waitFor(() => {
          expect(screen.getByText('No collections yet')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('upload-collection')).not.toBeInTheDocument();
      });
    });
  });

  describe('Toolbar Actions', () => {
    describe('in Platform mode (non-Insights)', () => {
      beforeEach(() => {
        vi.mocked(isInsightsMode).mockReturnValue(false);
        server.use(
          http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
            HttpResponse.json(mockCollectionsResponse)
          )
        );
      });

      it('should show upload collection button in toolbar', async () => {
        render(
          <MemoryRouter>
            <Collections />
          </MemoryRouter>
        );

        await screen.findByRole('heading', { name: 'Collections' });
        await screen.findByText('test_collection');

        expect(screen.getByRole('button', { name: /upload collection/i })).toBeInTheDocument();
      });
    });

    describe('in Insights mode', () => {
      beforeEach(() => {
        vi.mocked(isInsightsMode).mockReturnValue(true);
        server.use(
          http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
            HttpResponse.json(mockCollectionsResponse)
          )
        );
      });

      it('should not show upload collection button in toolbar', async () => {
        render(
          <MemoryRouter>
            <Collections />
          </MemoryRouter>
        );

        await screen.findByRole('heading', { name: 'Collections' });
        await screen.findByText('test_collection');

        expect(
          screen.queryByRole('button', { name: /upload collection/i })
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should render unauthorized state for 403 error', async () => {
      server.use(
        http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
          HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
        )
      );

      render(
        <MemoryRouter>
          <Collections />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('You do not have access to Collections')).toBeInTheDocument();
      });
    });

    it('should render error state for non-403 errors', async () => {
      server.use(
        http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
          HttpResponse.json({ detail: 'Internal Server Error' }, { status: 500 })
        )
      );

      render(
        <MemoryRouter>
          <Collections />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Collections' });

      await waitFor(() => {
        expect(screen.getByText('Error loading collections')).toBeInTheDocument();
      });
    });
  });
});
