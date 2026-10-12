import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

  it('returns single and multi select builders', () => {
    const { result: single } = renderHook(() => useSelectCollectionVersionSingle(params));
    const { result: multi } = renderHook(() => useSelectCollectionVersionMulti(params));

    expect(single.current.openBrowse).toBeDefined();
    expect(multi.current.openBrowse).toBeDefined();
  });

  it('exposes version table columns and filters', () => {
    const { result: columns } = renderHook(() => useCollectionVersionColumns());
    const { result: filters } = renderHook(() => useCollectionVersionFilters());

    expect(columns.current[0].header).toBe('Version');
    expect(filters.current.length).toBeGreaterThan(0);
  });
});
