import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useOrganizationFilters } from './useOrganizationFilters';

describe('useOrganizationFilters', () => {
  it('should return toolbar filters array', () => {
    const { result } = renderHook(() => useOrganizationFilters());

    expect(result.current).toBeDefined();
    expect(Array.isArray(result.current)).toBe(true);
  });

  it('should include live/async name filter for dynamic search parity', () => {
    const { result } = renderHook(() => useOrganizationFilters());

    const nameFilter = result.current.find((filter) => filter.key === 'name');
    expect(nameFilter).toBeDefined();
    expect(nameFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);
  });

  it('should include async id filter and description text filter', () => {
    const { result } = renderHook(() => useOrganizationFilters());

    const idFilter = result.current.find((filter) => filter.key === 'id');
    expect(idFilter).toBeDefined();
    expect(idFilter?.type).toBe(ToolbarFilterType.AsyncMultiSelect);

    const descriptionFilter = result.current.find((filter) => filter.key === 'description');
    expect(descriptionFilter).toBeDefined();
    expect(descriptionFilter?.type).toBe(ToolbarFilterType.MultiText);
  });
});
