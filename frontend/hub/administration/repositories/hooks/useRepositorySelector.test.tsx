/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRepositoryColumns, useRepositoryFilters } from './useRepositorySelector';

// Mock isInsightsMode
vi.mock('../../../common/isInsights', () => ({
  isInsightsMode: vi.fn(() => false),
  filterInsightsBulkActions: vi.fn((actions: unknown[]) => actions),
}));

import { isInsightsMode } from '../../../common/isInsights';

describe('useRepositoryColumns', () => {
  it('should return an array of table columns', () => {
    const { result } = renderHook(() => useRepositoryColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBe(2);
  });

  it('should have Name column', () => {
    const { result } = renderHook(() => useRepositoryColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const nameColumn = result.current.find((col) => col.header === 'Name');
    expect(nameColumn).toBeDefined();
  });

  it('should have Description column', () => {
    const { result } = renderHook(() => useRepositoryColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const descColumn = result.current.find((col) => col.header === 'Description');
    expect(descColumn).toBeDefined();
  });
});

describe('useRepositoryFilters', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('in platform mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(false);
    });

    it('should return an array of toolbar filters', () => {
      const { result } = renderHook(() => useRepositoryFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });
      expect(Array.isArray(result.current)).toBe(true);
      expect(result.current.length).toBe(2);
    });

    it('should have Name filter with exact matching', () => {
      const { result } = renderHook(() => useRepositoryFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });
      const nameFilter = result.current.find((filter) => filter.key === 'keywords');
      expect(nameFilter).toBeDefined();
      expect(nameFilter?.query).toBe('name');
      expect((nameFilter as { comparison?: string })?.comparison).toBe('equals');
    });

    it('should have Pipeline filter', () => {
      const { result } = renderHook(() => useRepositoryFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });
      const pipelineFilter = result.current.find((filter) => filter.key === 'pipeline');
      expect(pipelineFilter).toBeDefined();
      expect(pipelineFilter?.query).toBe('pulp_label_select');
    });
  });

  describe('in insights mode', () => {
    beforeEach(() => {
      vi.mocked(isInsightsMode).mockReturnValue(true);
    });

    it('should have Name filter with case-insensitive partial matching', () => {
      const { result } = renderHook(() => useRepositoryFilters(), {
        wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
      });
      const nameFilter = result.current.find((filter) => filter.key === 'keywords');
      expect(nameFilter).toBeDefined();
      expect(nameFilter?.query).toBe('name__icontains');
      expect((nameFilter as { comparison?: string })?.comparison).toBe('contains');
    });
  });
});
