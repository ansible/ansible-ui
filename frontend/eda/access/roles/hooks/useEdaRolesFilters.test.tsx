/* eslint-disable i18next/no-literal-string */
import { ToolbarFilterType } from '@ansible/ansible-ui-framework';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useEdaRolesFilters } from './useEdaRolesFilters';

describe('useEdaRolesFilters', () => {
  it('should return an array of toolbar filters', () => {
    const { result } = renderHook(() => useEdaRolesFilters());

    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include a name filter', () => {
    const { result } = renderHook(() => useEdaRolesFilters());

    const nameFilter = result.current.find((f) => f.key === 'name');
    expect(nameFilter).toBeDefined();
    expect(nameFilter?.label).toBe('Name');
    expect(nameFilter?.type).toBe(ToolbarFilterType.MultiText);
  });

  it('should use icontains query for name filter', () => {
    const { result } = renderHook(() => useEdaRolesFilters());

    const nameFilter = result.current.find((f) => f.key === 'name');
    expect(nameFilter?.query).toBe('name__icontains');
  });

  it('should use contains comparison for name filter', () => {
    const { result } = renderHook(() => useEdaRolesFilters());

    const nameFilter = result.current.find((f) => f.key === 'name');
    expect((nameFilter as unknown as Record<string, unknown>)?.comparison).toBe('contains');
  });
});
