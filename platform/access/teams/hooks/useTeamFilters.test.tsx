import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { useTeamFilters } from './useTeamFilters';

const mockNameToolbarFilter = { key: 'name', label: 'Name' };

vi.mock('@ansible/awx-ui/common/awx-toolbar-filters', () => ({
  useNameToolbarFilter: () => mockNameToolbarFilter,
}));

describe('useTeamFilters', () => {
  test('should return toolbar filters including the name filter', () => {
    const { result } = renderHook(() => useTeamFilters());

    expect(result.current).toEqual([mockNameToolbarFilter]);
  });
});
