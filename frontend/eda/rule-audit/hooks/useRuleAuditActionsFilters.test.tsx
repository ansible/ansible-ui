import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRuleAuditActionsFilters } from './useRuleAuditActionsFilters';

describe('useRuleAuditActionsFilters', () => {
  it('should return a name startsWith filter', () => {
    const { result } = renderHook(() => useRuleAuditActionsFilters());

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
