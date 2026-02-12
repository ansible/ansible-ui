import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

import { useAutomationDashboardToolbarFilters } from './useAutomationDashboardToolbarFilters';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';

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

describe('useAutomationDashboardToolbarFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('returns correct filters for given filterableFields', () => {
    render(<TestComponent filterableFields={['label', 'template']} />);
    expect(screen.getByTestId('filter-label')).toHaveTextContent('Label');
    expect(screen.getByTestId('filter-template')).toHaveTextContent('Template');
  });

  test('includes additionalFilters if provided', () => {
    const additional: IToolbarFilter = {
      key: 'custom',
      label: 'Custom',
      type: ToolbarFilterType.Search,
      query: '',
    };
    render(<TestComponent filterableFields={['label']} additionalFilters={[additional]} />);
    expect(screen.getByTestId('filter-custom')).toHaveTextContent('Custom');
  });

  test('returns empty array if filterableFields is empty', () => {
    render(<TestComponent filterableFields={[]} />);
    expect(screen.queryByTestId('filter-label')).toBeNull();
    expect(screen.queryByTestId('filter-template')).toBeNull();
  });

  test('handles undefined additionalFilters gracefully', () => {
    render(<TestComponent filterableFields={['label']} additionalFilters={undefined} />);
    expect(screen.getByTestId('filter-label')).toHaveTextContent('Label');
  });

  test('handles unknown filterableFields', () => {
    render(<TestComponent filterableFields={['unknown']} />);
    // Should not render any filter for unknown key
    expect(screen.queryByTestId('filter-unknown')).toBeNull();
  });

  test('handles duplicate filterableFields', () => {
    render(<TestComponent filterableFields={['label', 'label']} />);
    // Should only render one filter for the duplicate key
    const filters = screen.getAllByTestId('filter-label');
    expect(filters.length).toBe(1);
  });

  test('handles empty string in filterableFields', () => {
    render(<TestComponent filterableFields={['']} />);
    expect(screen.queryByTestId('filter-')).toBeNull();
  });
});
