import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAwxRolesFilters } from './useAwxRolesFilters';

describe('useAwxRolesFilters', () => {
  it('returns name multi-text filter', () => {
    const { result } = renderHook(() => useAwxRolesFilters());
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      key: 'name',
      type: ToolbarFilterType.MultiText,
      query: 'name__icontains',
      comparison: 'contains',
    });
  });
});
