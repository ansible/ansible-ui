import { renderHook } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setHubApiPath } from '../../common/api/formatPath';
import {
  useAsyncMultiSelectFilterBuilder,
  useAsyncSingleSelectFilterBuilder,
} from '../../common/ToolbarAsyncSelectFilterBuilder';
import {
  useCollectionVersionColumns,
  useCollectionVersionFilters,
  useSelectCollectionVersionMulti,
  useSelectCollectionVersionSingle,
} from './useCollectionVersionSelector';

vi.mock('../../common/ToolbarAsyncSelectFilterBuilder', () => ({
  useAsyncMultiSelectFilterBuilder: vi.fn(() => ({ openBrowse: vi.fn() })),
  useAsyncSingleSelectFilterBuilder: vi.fn(() => ({ openBrowse: vi.fn() })),
}));

describe('useCollectionVersionSelector', () => {
  const params = { namespace: 'demo', repository: 'published', collection: 'mycol' };
  const expectedQueryParams = {
    name: 'mycol',
    namespace: 'demo',
    repository_name: 'published',
  };

  beforeAll(() => {
    setHubApiPath('/api/galaxy');
  });

  beforeEach(() => {
    vi.mocked(useAsyncSingleSelectFilterBuilder).mockClear();
    vi.mocked(useAsyncMultiSelectFilterBuilder).mockClear();
  });

  it('returns single and multi select builders', () => {
    const { result: single } = renderHook(() => useSelectCollectionVersionSingle(params));
    const { result: multi } = renderHook(() => useSelectCollectionVersionMulti(params));

    expect(single.current.openBrowse).toBeDefined();
    expect(multi.current.openBrowse).toBeDefined();
  });

  it('wires collection-versions search API params into async select builders', () => {
    renderHook(() => useSelectCollectionVersionSingle(params));
    renderHook(() => useSelectCollectionVersionMulti(params));

    const singleConfig = vi.mocked(useAsyncSingleSelectFilterBuilder).mock.calls[0]?.[0];
    const multiConfig = vi.mocked(useAsyncMultiSelectFilterBuilder).mock.calls[0]?.[0];

    expect(singleConfig?.viewParams.url).toBe(
      '/api/galaxy/v3/plugin/ansible/search/collection-versions/'
    );
    expect(singleConfig?.viewParams.queryParams).toEqual(expectedQueryParams);
    expect(multiConfig?.viewParams.queryParams).toEqual(expectedQueryParams);
  });

  it('exposes version table columns and filters', () => {
    const { result: columns } = renderHook(() => useCollectionVersionColumns());
    const { result: filters } = renderHook(() => useCollectionVersionFilters());

    expect(columns.current[0].header).toBe('Version');
    expect(filters.current.length).toBeGreaterThan(0);
  });
});
