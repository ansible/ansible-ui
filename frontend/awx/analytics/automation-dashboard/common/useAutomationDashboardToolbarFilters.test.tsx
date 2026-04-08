/* eslint-disable i18next/no-literal-string */
import { render, renderHook, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { useAutomationDashboardToolbarFilters } from './useAutomationDashboardToolbarFilters';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';
import type { PageAsyncSelectQueryOptions } from '@ansible/ansible-ui-framework/PageInputs/PageAsyncSelectOptions';
import React from 'react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRequestGet = vi.hoisted(() => vi.fn());

vi.mock('@ansible/common-ui/crud/Data', () => ({
  requestGet: mockRequestGet,
}));

vi.mock('@ansible/common-ui/AsyncQueryLabel', () => ({
  AsyncQueryLabel: ({ id, field }: { id: string; field: string }) => (
    <div data-testid="async-query-label" data-id={id} data-field={field} />
  ),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

type AsyncFilter = IToolbarFilter & {
  queryOptions: (opts: Partial<PageAsyncSelectQueryOptions>) => Promise<{
    options: { label: string; value: string }[];
    next: string | number;
    remaining: number;
  }>;
  queryLabel: (value: string) => React.ReactElement;
};

function renderFilters(filterableFields: string[], additionalFilters?: IToolbarFilter[]) {
  return renderHook(() =>
    useAutomationDashboardToolbarFilters({ filterableFields, additionalFilters })
  ).result.current as AsyncFilter[];
}

function TestComponent({
  filterableFields,
  additionalFilters,
}: {
  filterableFields: string[];
  additionalFilters?: IToolbarFilter[];
}) {
  const filters = useAutomationDashboardToolbarFilters({ filterableFields, additionalFilters });
  return (
    <div>
      {filters.map((filter) => (
        <div key={filter.key} data-testid={`filter-${filter.key}`}>
          {filter.label}
        </div>
      ))}
    </div>
  );
}

const emptyResponse = { count: 0, next: null, results: [] };

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useAutomationDashboardToolbarFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // --- filter building ---

  test('returns correct filters for known filterableFields', () => {
    render(<TestComponent filterableFields={['label', 'template']} />);
    expect(screen.getByTestId('filter-label')).toHaveTextContent('Label');
    expect(screen.getByTestId('filter-template')).toHaveTextContent('Template');
  });

  test('returns all four known filter keys', () => {
    render(<TestComponent filterableFields={['label', 'template', 'organization', 'project']} />);
    expect(screen.getByTestId('filter-label')).toBeInTheDocument();
    expect(screen.getByTestId('filter-template')).toBeInTheDocument();
    expect(screen.getByTestId('filter-organization')).toBeInTheDocument();
    expect(screen.getByTestId('filter-project')).toBeInTheDocument();
  });

  test('filter has AsyncMultiSelect type and correct query key', () => {
    const filters = renderFilters(['label']);
    expect(filters[0].type).toBe(ToolbarFilterType.AsyncMultiSelect);
    expect(filters[0].query).toBe('label');
  });

  test('includes additionalFilters after dynamic filters', () => {
    const additional: IToolbarFilter = {
      key: 'custom',
      label: 'Custom',
      type: ToolbarFilterType.Search,
      query: '',
    };
    render(<TestComponent filterableFields={['label']} additionalFilters={[additional]} />);
    expect(screen.getByTestId('filter-custom')).toHaveTextContent('Custom');
  });

  test('returns empty array when filterableFields is empty', () => {
    render(<TestComponent filterableFields={[]} />);
    expect(screen.queryByTestId('filter-label')).toBeNull();
  });

  test('handles undefined additionalFilters gracefully', () => {
    render(<TestComponent filterableFields={['label']} additionalFilters={undefined} />);
    expect(screen.getByTestId('filter-label')).toHaveTextContent('Label');
  });

  test('skips unknown filterableFields', () => {
    render(<TestComponent filterableFields={['unknown']} />);
    expect(screen.queryByTestId('filter-unknown')).toBeNull();
  });

  test('deduplicates filterableFields', () => {
    render(<TestComponent filterableFields={['label', 'label']} />);
    expect(screen.getAllByTestId('filter-label')).toHaveLength(1);
  });

  test('skips empty string in filterableFields', () => {
    render(<TestComponent filterableFields={['']} />);
    expect(screen.queryByTestId('filter-')).toBeNull();
  });

  // --- queryOptions (queryResource) ---

  test('queryOptions returns mapped results with no pagination', async () => {
    const filters = renderFilters(['label']);
    mockRequestGet.mockResolvedValueOnce({
      count: 2,
      next: null,
      results: [
        { name: 'Foo', id: '1' },
        { name: 'Bar', id: '2' },
      ],
    });

    const result = await filters[0].queryOptions({});
    expect(result.options).toEqual([
      { label: 'Foo', value: '1' },
      { label: 'Bar', value: '2' },
    ]);
    expect(result.remaining).toBe(0);
    expect(result.next).toBe('');
  });

  test('queryOptions returns empty options for empty results', async () => {
    const filters = renderFilters(['label']);
    mockRequestGet.mockResolvedValueOnce(emptyResponse);

    const result = await filters[0].queryOptions({});
    expect(result.options).toEqual([]);
    expect(result.remaining).toBe(0);
    expect(result.next).toBe('');
  });

  test('queryOptions parses pagination when next URL contains page param', async () => {
    const filters = renderFilters(['template']);
    mockRequestGet.mockResolvedValueOnce({
      count: 25,
      next: '/api/v2/report/?page=3&page_size=10',
      results: [{ name: 'T1', id: '1' }],
    });

    const result = await filters[0].queryOptions({});
    expect(result.next).toBe('3');
    expect(result.remaining).toBe(5); // 25 - (3-1)*10
  });

  test('queryOptions sets next and remaining to defaults when page param is missing from next URL', async () => {
    const filters = renderFilters(['label']);
    mockRequestGet.mockResolvedValueOnce({
      count: 5,
      next: '/api/v2/report/?page_size=10',
      results: [{ name: 'X', id: '1' }],
    });

    const result = await filters[0].queryOptions({});
    expect(result.next).toBe('');
    expect(result.remaining).toBe(0);
  });

  test('queryOptions appends page to URL when next is provided', async () => {
    const filters = renderFilters(['label']);
    mockRequestGet.mockResolvedValueOnce(emptyResponse);

    await filters[0].queryOptions({ next: '2' });
    expect(mockRequestGet).toHaveBeenCalledWith(expect.stringContaining('page=2'), undefined);
  });

  test('queryOptions appends search to URL when search is provided', async () => {
    const filters = renderFilters(['label']);
    mockRequestGet.mockResolvedValueOnce(emptyResponse);

    await filters[0].queryOptions({ search: 'ansible' });
    expect(mockRequestGet).toHaveBeenCalledWith(
      expect.stringContaining('search=ansible'),
      undefined
    );
  });

  test('queryOptions passes AbortSignal to requestGet', async () => {
    const filters = renderFilters(['label']);
    const { signal } = new AbortController();
    mockRequestGet.mockResolvedValueOnce(emptyResponse);

    await filters[0].queryOptions({ signal });
    expect(mockRequestGet).toHaveBeenCalledWith(expect.any(String), signal);
  });

  test('queryOptions falls back to empty string for undefined resource values', async () => {
    const filters = renderFilters(['label']);
    mockRequestGet.mockResolvedValueOnce({
      count: 1,
      next: null,
      results: [{ name: undefined, id: undefined }],
    });

    const result = await filters[0].queryOptions({});
    expect(result.options).toEqual([{ label: '', value: '' }]);
  });

  // --- queryLabel (queryResourceLabel) ---

  test('queryLabel renders AsyncQueryLabel with correct id and field', () => {
    const filters = renderFilters(['label']);
    const { getByTestId } = render(filters[0].queryLabel('42'));
    expect(getByTestId('async-query-label')).toHaveAttribute('data-id', '42');
    expect(getByTestId('async-query-label')).toHaveAttribute('data-field', 'name');
  });
});
