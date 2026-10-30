/* eslint-disable i18next/no-literal-string */
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { useApprovalFilters } from './useApprovalFilters';

vi.mock('../../repositories/hooks/useRepoQueryOptions', () => ({
  useRepoQueryOptions: () => ({ queryKey: ['repos'] }),
}));

vi.mock('../../repositories/hooks/useRepositorySelector', () => ({
  useSelectRepositorySingle: () => ({ openBrowse: vi.fn() }),
}));

describe('useApprovalFilters', () => {
  it('returns collection, namespace, repository, and status filters', () => {
    const { result } = renderHook(() => useApprovalFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current).toHaveLength(4);
    const keys = result.current.map((filter) => filter.key);
    expect(keys).toEqual(['collection', 'namespace', 'repository', 'status']);
  });

  it('includes pipeline status options', () => {
    const { result } = renderHook(() => useApprovalFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const statusFilter = result.current.find((filter) => filter.key === 'status');
    expect(statusFilter && 'options' in statusFilter && statusFilter.options).toHaveLength(3);
  });

  it('formats repository filter labels from selected values', () => {
    const { result } = renderHook(() => useApprovalFilters(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    const repositoryFilter = result.current.find((filter) => filter.key === 'repository');
    expect(
      repositoryFilter &&
        'queryLabel' in repositoryFilter &&
        repositoryFilter.queryLabel?.('published')
    ).toBe('published');
  });
});
