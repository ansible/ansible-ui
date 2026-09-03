import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { PageDashboardContext } from '@ansible/ansible-ui-framework';
import { DashboardGridRow, DashboardLayout } from './DashboardLayout';

function renderWithColumns(columns: number, ui: React.ReactNode) {
  return render(
    <PageDashboardContext.Provider value={{ columns }}>{ui}</PageDashboardContext.Provider>
  );
}

describe('DashboardLayout', () => {
  test('should call its render function with the column count from context', () => {
    renderWithColumns(
      7,
      <DashboardLayout>{(columns) => <span>columns: {columns}</span>}</DashboardLayout>
    );

    expect(screen.getByText('columns: 7')).toBeInTheDocument();
  });

  test('should render a grid with one track per column', () => {
    const { container } = renderWithColumns(5, <DashboardLayout>{() => <div />}</DashboardLayout>);

    const grid = container.querySelector('div[style*="grid-template-columns"]');
    expect(grid).toHaveStyle({ gridTemplateColumns: 'repeat(5, 1fr)' });
  });
});

describe('DashboardGridRow', () => {
  test('should render its children', () => {
    renderWithColumns(
      4,
      <DashboardGridRow>
        <span>child card</span>
      </DashboardGridRow>
    );

    expect(screen.getByText('child card')).toBeInTheDocument();
  });

  test('should span every column of the parent grid', () => {
    const { container } = renderWithColumns(
      12,
      <DashboardGridRow>
        <span>child</span>
      </DashboardGridRow>
    );

    const item = container.querySelector('div[style*="grid-column"]');
    expect(item).toHaveStyle({ gridColumn: 'span 12' });
  });
});
