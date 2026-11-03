import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEventStreamActivationsFilters } from './useEventStreamActivationsFilters';

describe('useEventStreamActivationsFilters', () => {
  it('should return a name startsWith filter', () => {
    const { result } = renderHook(() => useEventStreamActivationsFilters());

    expect(result.current).toEqual([
      expect.objectContaining({
        key: 'name',
        label: 'Name',
        query: 'name',
        comparison: 'startsWith',
      }),
    ]);
  });
});
