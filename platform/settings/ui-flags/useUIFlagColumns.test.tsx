import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, expect, test } from 'vitest';
import { IUIFlag, UIFlag } from './IUIFlag';
import { useUIFlagColumns } from './useUIFlagColumns';

function renderColumnCell(column: ITableColumn<IUIFlag>, item: IUIFlag): ReactNode {
  if (!('cell' in column) || typeof column.cell !== 'function') {
    throw new Error('Expected a column with a cell renderer');
  }
  return column.cell(item);
}

describe('useUIFlagColumns', () => {
  test('should define name, description, and status columns', () => {
    const { result } = renderHook(() => useUIFlagColumns());

    expect(result.current.map((column) => column.id)).toEqual(['name', 'description', 'status']);
  });

  test('should map status values for alpha, beta, and production flags', () => {
    const { result } = renderHook(() => useUIFlagColumns());
    const statusColumn = result.current.find((column) => column.id === 'status');

    const alphaFlag = {
      id: UIFlag.PersonaViewSwitcher,
      name: 'Alpha flag',
      description: 'desc',
      enabled: false,
      status: 'alpha' as const,
    };

    expect(statusColumn?.value?.(alphaFlag)).toEqual(['Alpha']);
    expect(statusColumn?.value?.({ ...alphaFlag, status: 'beta' })).toEqual(['Beta']);
    expect(statusColumn?.value?.({ ...alphaFlag, status: 'production' })).toEqual(['Production']);
  });

  test('should render status labels for each lifecycle state', () => {
    const { result } = renderHook(() => useUIFlagColumns());
    const statusColumn = result.current.find((column) => column.id === 'status');

    const alphaFlag = {
      id: UIFlag.PersonaViewSwitcher,
      name: 'Alpha flag',
      description: 'desc',
      enabled: false,
      status: 'alpha' as const,
    };

    const { container: alphaCell } = render(
      <>{statusColumn && renderColumnCell(statusColumn, alphaFlag)}</>
    );
    expect(alphaCell).toHaveTextContent('Alpha');

    const { container: betaCell } = render(
      <>{statusColumn && renderColumnCell(statusColumn, { ...alphaFlag, status: 'beta' })}</>
    );
    expect(betaCell).toHaveTextContent('Beta');

    const { container: productionCell } = render(
      <>{statusColumn && renderColumnCell(statusColumn, { ...alphaFlag, status: 'production' })}</>
    );
    expect(productionCell).toHaveTextContent('Production');

    const { container: defaultCell } = render(
      <>
        {statusColumn &&
          renderColumnCell(statusColumn, { ...alphaFlag, status: 'unknown' as 'alpha' })}
      </>
    );
    expect(defaultCell).toBeEmptyDOMElement();
  });
});
