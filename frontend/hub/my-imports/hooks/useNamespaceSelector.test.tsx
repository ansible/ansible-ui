import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useNamespaceColumns, useNamespaceFilters } from './useNamespaceSelector';

describe('useNamespaceSelector', () => {
  it('useNamespaceColumns returns a name column', () => {
    const { result } = renderHook(() => useNamespaceColumns());

    expect(result.current).toHaveLength(1);
    expect(result.current[0].header).toBe('Name');
  });

  it('useNamespaceFilters returns a keywords filter', () => {
    const { result } = renderHook(() => useNamespaceFilters());

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({ key: 'keywords', query: 'name' });
  });
});
