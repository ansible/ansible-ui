/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useCollectionColumns } from './useAddCollections';

// Mock useHubContext
vi.mock('../../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {
      display_signatures: false,
      can_upload_signatures: false,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

vi.mock('../../../main/HubRoutes', () => ({
  HubRoute: {
    CollectionPage: 'CollectionPage',
    RepositoryDetails: 'RepositoryDetails',
    NamespaceDetails: 'NamespaceDetails',
  },
}));

const mockCollection = {
  collection_version: {
    namespace: 'amazon',
    name: 'aws',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/test/',
    description: 'AWS collection',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    contents: [],
    dependencies: {},
  },
  repository: {
    name: 'published',
    pulp_href: '/test/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
  },
  namespace_metadata: {
    pulp_href: '/test/',
    name: 'amazon',
    company: 'Amazon Web Services',
    description: '',
    avatar_url: '',
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

function renderUseCollectionColumns() {
  return renderHook(() => useCollectionColumns(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('useCollectionColumns (useAddCollections)', () => {
  it('should return an array of table columns', () => {
    const { result } = renderUseCollectionColumns();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should have a Name column', () => {
    const { result } = renderUseCollectionColumns();
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    if (nameColumn && 'value' in nameColumn) {
      expect(nameColumn.value!(mockCollection)).toBe('aws');
    }
  });

  it('should have a "Provided by" column that uses namespaceTitle', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    expect(providedByColumn).toBeDefined();

    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(mockCollection);
      // In non-insights mode, namespaceTitle returns the namespace name
      expect(value).toContain('amazon');
    }
  });

  it('should display "Provided by" with namespace name when company is empty', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    const collectionNoCompany = {
      ...mockCollection,
      namespace_metadata: { ...mockCollection.namespace_metadata, company: '' },
    };
    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(collectionNoCompany);
      expect(value).toContain('amazon');
    }
  });

  it('should display "Provided by" with namespace name when namespace_metadata is missing', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    const collectionNoMetadata = {
      ...mockCollection,
      namespace_metadata: undefined,
    };
    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(collectionNoMetadata);
      expect(value).toContain('amazon');
    }
  });

  it('should have Repository column', () => {
    const { result } = renderUseCollectionColumns();
    const repoColumn = result.current.find((col) => col.header === 'Repository');
    expect(repoColumn).toBeDefined();
    if (repoColumn && 'value' in repoColumn) {
      expect(repoColumn.value!(mockCollection)).toBe('published');
    }
  });

  it('should have Namespace column', () => {
    const { result } = renderUseCollectionColumns();
    const nsColumn = result.current.find((col) => col.header === 'Namespace');
    expect(nsColumn).toBeDefined();
    if (nsColumn && 'value' in nsColumn) {
      expect(nsColumn.value!(mockCollection)).toBe('amazon');
    }
  });
});
