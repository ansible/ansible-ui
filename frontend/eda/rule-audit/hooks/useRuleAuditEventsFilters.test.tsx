import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRuleAuditEventsFilters } from './useRuleAuditEventsFilters';

describe('useRuleAuditEventsFilters', () => {
  it('should return a source_name startsWith filter', () => {
    const { result } = renderHook(() => useRuleAuditEventsFilters());

    expect(result.current).toEqual([
      expect.objectContaining({
        key: 'name',
        label: 'Name',
        query: 'source_name',
        comparison: 'startsWith',
      }),
    ]);
  });
});
