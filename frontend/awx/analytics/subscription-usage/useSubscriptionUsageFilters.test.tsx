import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useSubscriptionUsageFilters } from './useSubscriptionUsageFilters';

type SingleSelectFilter = IToolbarFilter & {
  type: ToolbarFilterType.SingleSelect;
  options: { label: string; value: string }[];
};

describe('useSubscriptionUsageFilters', () => {
  it('returns pinned period filter with default year', () => {
    const { result } = renderHook(() => useSubscriptionUsageFilters());
    const filter = result.current[0] as SingleSelectFilter;
    expect(result.current).toHaveLength(1);
    expect(filter).toMatchObject({
      key: 'dateRange',
      type: ToolbarFilterType.SingleSelect,
      isPinned: true,
      isRequired: true,
      defaultValue: 'year',
    });
    expect(filter.options).toHaveLength(3);
  });
});
