/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { useCollectionFilters } from './useCollectionFilters';
import { IToolbarSingleTextFilter } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarFilters/ToolbarTextFilter';

describe('useCollectionFilters', () => {
  it('returns name filter with substring search', () => {
    const { result } = renderHook(() => useCollectionFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const nameFilter = result.current.find(
      (filter) => filter.key === 'keywords'
    ) as IToolbarSingleTextFilter;

    expect(nameFilter).toBeDefined();
    expect(nameFilter?.label).toBe('Name');
    expect(nameFilter?.query).toBe('keywords');
    expect(nameFilter?.comparison).toBe('contains');
  });

  it('returns all expected filters', () => {
    const { result } = renderHook(() => useCollectionFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(5);
    expect(result.current.map((f) => f.key)).toEqual([
      'keywords',
      'namespace',
      'tags',
      'signature',
      'repository',
    ]);
  });
});
