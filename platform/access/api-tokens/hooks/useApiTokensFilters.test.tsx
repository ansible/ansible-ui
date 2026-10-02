import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useApiTokensFilters } from './useApiTokenFilters';

describe('useApiTokensFilters', () => {
  test('should expose description, user, scope, and application filters', () => {
    const { result } = renderHook(() => useApiTokensFilters());

    expect(result.current.map((filter) => filter.key)).toEqual([
      'description',
      'user',
      'scope',
      'application',
    ]);
    expect(result.current.find((filter) => filter.key === 'scope')?.type).toBe(
      ToolbarFilterType.MultiSelect
    );
    expect(result.current.find((filter) => filter.key === 'user')?.type).toBe(
      ToolbarFilterType.AsyncMultiSelect
    );
  });
});
