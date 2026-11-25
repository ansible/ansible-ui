/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCollectionFilters } from './useCollectionFilters';
import { IToolbarSingleTextFilter } from '@ansible/ansible-ui-framework/PageToolbar/PageToolbarFilters/ToolbarTextFilter';

// Mock isInsightsMode
vi.mock('../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
}));

import { isInsightsMode } from '../../common/isInsights';

describe('useCollectionFilters', () => {
  describe('Platform mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns name filter with exact match in Platform mode', () => {
      const { result } = renderHook(() => useCollectionFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });

      const nameFilter = result.current.find(
        (filter) => filter.key === 'keywords'
      ) as IToolbarSingleTextFilter;

      expect(nameFilter).toBeDefined();
      expect(nameFilter?.label).toBe('Name');
      expect(nameFilter?.query).toBe('name');
      expect(nameFilter?.comparison).toBe('equals');
    });

    it('returns all expected filters in Platform mode', () => {
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

  describe('Insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('returns name filter with substring search in Insights mode', () => {
      const { result } = renderHook(() => useCollectionFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });

      const nameFilter = result.current.find(
        (filter) => filter.key === 'keywords'
      ) as IToolbarSingleTextFilter;

      expect(nameFilter).toBeDefined();
      expect(nameFilter?.label).toBe('Name');
      expect(nameFilter?.query).toBe('name__icontains');
      expect(nameFilter?.comparison).toBe('contains');
    });

    it('does not change namespace filter in Insights mode', () => {
      const { result } = renderHook(() => useCollectionFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });

      const namespaceFilter = result.current.find(
        (filter) => filter.key === 'namespace'
      ) as IToolbarSingleTextFilter;

      expect(namespaceFilter).toBeDefined();
      expect(namespaceFilter?.query).toBe('namespace');
      expect(namespaceFilter?.comparison).toBe('equals');
    });

    it('does not change tags filter in Insights mode', () => {
      const { result } = renderHook(() => useCollectionFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });

      const tagsFilter = result.current.find(
        (filter) => filter.key === 'tags'
      ) as IToolbarSingleTextFilter;

      expect(tagsFilter).toBeDefined();
      expect(tagsFilter?.query).toBe('tags');
      expect(tagsFilter?.comparison).toBe('equals');
    });

    it('returns all expected filters in Insights mode', () => {
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
});
