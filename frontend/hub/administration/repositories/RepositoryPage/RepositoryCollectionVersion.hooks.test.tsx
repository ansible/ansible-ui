/* eslint-disable i18next/no-literal-string */
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CollectionVersionSearch } from '../../../collections/Collection';
import {
  collectionId,
  useBulkCollectionColumns,
  useModifyCollections,
} from './RepositoryCollectionVersion';

let capturedConfig: {
  title?: string;
  confirmText?: string;
  actionButtonText?: string;
  isDanger?: boolean;
  actionFn?: () => Promise<unknown>;
} = {};

vi.mock('../../../common/useHubBulkConfirmation', () => ({
  useHubBulkConfirmation: () => (config: typeof capturedConfig) => {
    capturedConfig = config;
  },
}));

const mockCollection: CollectionVersionSearch = {
  collection_version: {
    namespace: 'demo',
    name: 'collection',
    version: '1.0.0',
    pulp_created: '2026-01-01T00:00:00Z',
    pulp_href: '/pulp/cv/1/',
    requires_ansible: '>=2.9',
    require_ansible: '>=2.9',
    description: '',
  },
  repository: {
    name: 'staging',
    pulp_href: '/pulp/repo/1/',
    description: '',
    pulp_id: '1',
    pulp_last_updated: '',
    content_count: 0,
    gpgkey: '',
    latest_version_href: '',
    pulp_labels: {},
  },
  repository_version: '1',
  is_highest: true,
  is_signed: false,
  is_deprecated: false,
};

describe('collectionId', () => {
  it('builds stable collection identifier', () => {
    expect(collectionId(mockCollection)).toBe('demo_collection_1.0.0_staging');
  });
});

describe('useBulkCollectionColumns', () => {
  it('returns remove operation description', () => {
    const { result } = renderHook(() => useBulkCollectionColumns('remove'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const column = result.current[0];
    expect(column.header).toBe('Description');
    if (column && 'value' in column) {
      expect(column.value!([mockCollection])).toContain('removed');
    }
  });

  it('returns add operation description', () => {
    const { result } = renderHook(() => useBulkCollectionColumns('add'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const column = result.current[0];
    if (column && 'value' in column) {
      expect(column.value!([mockCollection])).toContain('added');
    }
  });
});

describe('useModifyCollections', () => {
  beforeEach(() => {
    capturedConfig = {};
  });

  it('opens remove collections bulk confirmation', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useModifyCollections(onComplete, 'remove'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([[mockCollection]], vi.fn().mockResolvedValue(undefined));
    });

    expect(capturedConfig.title).toBe('Remove collections versions');
    expect(capturedConfig.isDanger).toBe(true);
  });

  it('opens add collections bulk confirmation', () => {
    const { result } = renderHook(() => useModifyCollections(vi.fn(), 'add'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([[mockCollection]], vi.fn().mockResolvedValue(undefined));
    });

    expect(capturedConfig.title).toBe('Add collections versions');
  });

  it('runs provided actionFn', async () => {
    const actionFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useModifyCollections(vi.fn(), 'remove'), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    act(() => {
      result.current([[mockCollection]], actionFn);
    });

    await act(async () => {
      await capturedConfig.actionFn?.();
    });

    expect(actionFn).toHaveBeenCalled();
  });
});
