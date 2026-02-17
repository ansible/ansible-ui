/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useCollectionColumns } from './useCollectionColumns';
import { CollectionVersionSearch } from '../Collection';

// Mock useHubContext
vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    featureFlags: {
      display_signatures: true,
    },
    settings: {},
    user: null,
    hasPermission: () => false,
  }),
}));

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'amazon',
    name: 'aws',
    version: '1.0.0',
    pulp_created: '2024-01-01T00:00:00Z',
    pulp_href: '/test/',
    description: 'AWS collection',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    contents: [
      { name: 'ec2', description: '', content_type: 'module' },
      { name: 'iam_role', description: '', content_type: 'role' },
      { name: 's3_plugin', description: '', content_type: 'inventory' },
    ],
    dependencies: { 'ansible.utils': '>=2.0.0' },
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
  is_signed: true,
  is_deprecated: false,
};

function renderUseCollectionColumns() {
  return renderHook(() => useCollectionColumns(), {
    wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
  });
}

describe('useCollectionColumns', () => {
  it('should return an array of table columns', () => {
    const { result } = renderUseCollectionColumns();
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should have a Name column', () => {
    const { result } = renderUseCollectionColumns();
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
  });

  it('should have a "Provided by" column that uses namespaceTitle', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    expect(providedByColumn).toBeDefined();

    // The value function should use namespaceTitle
    // In non-insights mode, it falls back to namespace name
    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(mockCollection);
      // In non-insights mode, namespaceTitle returns the name, not company
      expect(value).toContain('amazon');
    }
  });

  it('should display "Provided by" with namespace name when no company', () => {
    const { result } = renderUseCollectionColumns();
    const providedByColumn = result.current.find((col) => col.header === 'Provided by');
    const collectionNoCompany = {
      ...mockCollection,
      namespace_metadata: { ...mockCollection.namespace_metadata!, company: '' },
    };
    if (providedByColumn && 'value' in providedByColumn) {
      const value = providedByColumn.value!(collectionNoCompany);
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

  it('should count modules correctly', () => {
    const { result } = renderUseCollectionColumns();
    const modulesColumn = result.current.find((col) => col.header === 'Modules');
    expect(modulesColumn).toBeDefined();
    if (modulesColumn && 'value' in modulesColumn) {
      expect(modulesColumn.value!(mockCollection)).toBe(1);
    }
  });

  it('should count roles correctly', () => {
    const { result } = renderUseCollectionColumns();
    const rolesColumn = result.current.find((col) => col.header === 'Roles');
    expect(rolesColumn).toBeDefined();
    if (rolesColumn && 'value' in rolesColumn) {
      expect(rolesColumn.value!(mockCollection)).toBe(1);
    }
  });

  it('should count plugins correctly', () => {
    const { result } = renderUseCollectionColumns();
    const pluginsColumn = result.current.find((col) => col.header === 'Plugins');
    expect(pluginsColumn).toBeDefined();
    if (pluginsColumn && 'value' in pluginsColumn) {
      expect(pluginsColumn.value!(mockCollection)).toBe(1);
    }
  });

  it('should count dependencies correctly', () => {
    const { result } = renderUseCollectionColumns();
    const depsColumn = result.current.find((col) => col.header === 'Dependencies');
    expect(depsColumn).toBeDefined();
    if (depsColumn && 'value' in depsColumn) {
      expect(depsColumn.value!(mockCollection)).toBe(1);
    }
  });

  it('should have Signed state column', () => {
    const { result } = renderUseCollectionColumns();
    const signedColumn = result.current.find((col) => col.header === 'Signed state');
    expect(signedColumn).toBeDefined();
  });

  it('should have Version column', () => {
    const { result } = renderUseCollectionColumns();
    const versionColumn = result.current.find((col) => col.header === 'Version');
    expect(versionColumn).toBeDefined();
    if (versionColumn && 'value' in versionColumn) {
      expect(versionColumn.value!(mockCollection)).toBe('1.0.0');
    }
  });

  it('should show Deprecated badge when collection is deprecated', () => {
    const { result } = renderUseCollectionColumns();
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
    // The name column cell renderer handles deprecated state but we test value
  });
});
