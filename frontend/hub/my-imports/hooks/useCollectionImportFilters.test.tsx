import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCollectionImportFilters } from './useCollectionImportFilters';

describe('useCollectionImportFilters', () => {
  it('returns name, status, and version filters', () => {
    const { result } = renderHook(() => useCollectionImportFilters());

    expect(result.current.map((filter) => filter.key)).toEqual(['name', 'status', 'version']);
    const statusFilter = result.current[1];
    expect(statusFilter && 'options' in statusFilter && statusFilter.options).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ value: 'completed' }),
        expect.objectContaining({ value: 'failed' }),
        expect.objectContaining({ value: 'running' }),
        expect.objectContaining({ value: 'waiting' }),
      ])
    );
  });
});
