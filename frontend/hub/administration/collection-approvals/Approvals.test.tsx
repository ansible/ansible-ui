import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { hubAPI } from '../../common/api/formatPath';
import { Approvals } from './Approvals';

const mockApprovalsResponse = {
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
        name: 'staging',
        pulp_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/456/',
        pulp_labels: {
          pipeline: 'staging',
        },
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
        name: 'staging',
        pulp_href: '/api/galaxy/pulp/api/v3/repositories/ansible/ansible/012/',
        pulp_labels: {
          pipeline: 'staging',
        },
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

describe('Approvals Component', () => {
  let server: ReturnType<typeof setupServer>;

  beforeAll(() => {
    server = setupServer();
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('Page Structure', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
          HttpResponse.json(mockApprovalsResponse)
        )
      );
    });

    it('should render page title and description', async () => {
      render(
        <MemoryRouter>
          <Approvals />
        </MemoryRouter>
      );

      expect(
        await screen.findByRole('heading', { name: 'Collection Approvals' })
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Collection approvals enables administrators to manage and authorize Ansible content collections for organizational use.'
        )
      ).toBeInTheDocument();
    });

    it('should render correct column headers', async () => {
      render(
        <MemoryRouter>
          <Approvals />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Collection Approvals' });

      expect(screen.getByRole('columnheader', { name: 'Namespace' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Collection' })).toBeInTheDocument();
      expect(screen.getByRole('columnheader', { name: 'Version' })).toBeInTheDocument();
    });
  });

  describe('Collections Rendering', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
          HttpResponse.json(mockApprovalsResponse)
        )
      );
    });

    it('should render collections from API response', async () => {
      render(
        <MemoryRouter>
          <Approvals />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Collection Approvals' });

      // Verify fixture collections are rendered
      expect(await screen.findByText('test_collection')).toBeInTheDocument();
      expect(screen.getByText('test_namespace')).toBeInTheDocument();
      expect(screen.getByText('another_collection')).toBeInTheDocument();
      expect(screen.getByText('another_namespace')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      server.use(
        http.get(hubAPI`/v3/plugin/ansible/search/collection-versions/`, () =>
          HttpResponse.json(mockEmptyResponse)
        )
      );
    });

    it('should show empty state when no approvals exist', async () => {
      render(
        <MemoryRouter>
          <Approvals />
        </MemoryRouter>
      );

      await screen.findByRole('heading', { name: 'Collection Approvals' });

      // The component applies default filters (pipeline=staging),
      // so it shows the filtered empty state instead of the true empty state
      await waitFor(() => {
        expect(screen.getByText('No results found')).toBeInTheDocument();
      });
      expect(
        screen.getByText('No results match this filter criteria. Clear all filters and try again.')
      ).toBeInTheDocument();
    });
  });
});
