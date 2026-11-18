/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../Collection';
import { useSignCollection } from './useSignCollection';

let capturedBulkActionConfig: {
  title?: string;
  confirmText?: string;
  items?: CollectionVersionSearch[];
} = {};

vi.mock('../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedBulkActionConfig) => {
    capturedBulkActionConfig = config;
  },
}));

vi.mock('./useCollectionColumns', () => ({
  useCollectionColumns: () => [{ header: 'Name', cell: () => null }],
}));

vi.mock('../../common/useHubContext', () => ({
  useHubContext: () => ({
    settings: { GALAXY_COLLECTION_SIGNING_SERVICE: 'ansible-default' },
  }),
}));

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'demo',
    name: 'collection',
    version: '1.0.0',
    pulp_href: '/cv/1/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    pulp_created: '',
    description: '',
  },
  repository: {
    name: 'published',
    pulp_href: '/repo/1/',
    latest_version_href: '/repo/1/versions/1/',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    description: '',
  },
  repository_version: '1',
  is_signed: false,
  is_deprecated: false,
} as CollectionVersionSearch;

describe('useSignCollection', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('opens bulk confirmation with collection-level copy when version is false', () => {
    const { result } = renderHook(() => useSignCollection(false), { wrapper });

    result.current([mockCollection]);

    expect(capturedBulkActionConfig.title).toBe('Sign collection');
    expect(capturedBulkActionConfig.confirmText).toContain('1 collections');
    expect(capturedBulkActionConfig.items).toHaveLength(1);
  });

  it('uses version-specific copy when version is true', () => {
    const { result } = renderHook(() => useSignCollection(true), { wrapper });

    result.current([mockCollection]);

    expect(capturedBulkActionConfig.title).toBe('Sign collection version');
    expect(capturedBulkActionConfig.confirmText).toContain('collections versions');
  });
});
