import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import React, { useEffect } from 'react';
import { useAutomationDashboardToolbar } from './Toolbar';
import { IToolbarFilter, ToolbarFilterType } from '@ansible/ansible-ui-framework';

function TestToolbarComponent({ onFilters }: { onFilters?: (filters: IToolbarFilter[]) => void }) {
  const filters = useAutomationDashboardToolbar();
  useEffect(() => {
    if (onFilters) onFilters(filters);
  }, [filters, onFilters]);
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

describe('useAutomationDashboardToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('returns all expected filters including period', () => {
    render(<TestToolbarComponent />);
    expect(screen.getByTestId('filter-template')).toHaveTextContent('Template');
    expect(screen.getByTestId('filter-label')).toHaveTextContent('Label');
    expect(screen.getByTestId('filter-organization')).toHaveTextContent('Organization');
    expect(screen.getByTestId('filter-project')).toHaveTextContent('Project');
    expect(screen.getByTestId('filter-period')).toHaveTextContent('Period');
  });

  test('period filter has correct properties', async () => {
    let filters: IToolbarFilter[] = [];
    render(
      <TestToolbarComponent
        onFilters={(f) => {
          filters = f;
        }}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    const period = filters.find((f) => f.key === 'period');
    expect(period).toBeDefined();
    if (period) {
      expect(period.type).toBe(ToolbarFilterType.SingleSelect);
      if ('isPinned' in period) expect(period.isPinned).toBe(true);
      if ('isRequired' in period) expect(period.isRequired).toBe(true);
      if ('disableSortOptions' in period) expect(period.disableSortOptions).toBe(true);
      if ('defaultValue' in period) expect(period.defaultValue).toBe('month_to_date');
      if ('options' in period) {
        expect(Array.isArray(period.options)).toBe(true);
        expect((period.options as unknown[]).length).toBeGreaterThan(0);
      }
    }
  });

  test('returns correct number of filters', async () => {
    let filters: IToolbarFilter[] = [];
    render(
      <TestToolbarComponent
        onFilters={(f) => {
          filters = f;
        }}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(filters.length).toBe(5);
  });

  test('handles empty filter list', async () => {
    const mod = await import('./Toolbar');
    const spy = vi.spyOn(mod, 'useAutomationDashboardToolbar').mockReturnValue([]);
    let filters: IToolbarFilter[] = [];
    render(
      <TestToolbarComponent
        onFilters={(f) => {
          filters = f;
        }}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(filters.length).toBe(0);
    spy.mockRestore();
  });

  test('handles unknown filter key gracefully', async () => {
    const mod = await import('./Toolbar');
    const spy = vi
      .spyOn(mod, 'useAutomationDashboardToolbar')
      .mockReturnValue([
        { key: 'unknown', label: 'Unknown', type: ToolbarFilterType.Search, query: '' },
      ]);
    let filters: IToolbarFilter[] = [];
    render(
      <TestToolbarComponent
        onFilters={(f) => {
          filters = f;
        }}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(filters[0].key).toBe('unknown');
    spy.mockRestore();
  });

  test('handles duplicate filter keys', async () => {
    const mod = await import('./Toolbar');
    const spy = vi.spyOn(mod, 'useAutomationDashboardToolbar').mockReturnValue([
      { key: 'label', label: 'Label', type: ToolbarFilterType.Search, query: '' },
      { key: 'label', label: 'Label', type: ToolbarFilterType.Search, query: '' },
    ]);
    let filters: IToolbarFilter[] = [];
    render(
      <TestToolbarComponent
        onFilters={(f) => {
          filters = f;
        }}
      />
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(filters.filter((f) => f.key === 'label').length).toBeGreaterThan(1);
    spy.mockRestore();
  });
});
