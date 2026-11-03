/* eslint-disable i18next/no-literal-string */
import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EdaRulebookActivation } from '../../interfaces/EdaRulebookActivation';
import { StatusEnum } from '../../interfaces/generated/eda-api';
import { useEventStreamActivationsColumns } from './useEventStreamActivationsColumns';

function columnCell<T extends object>(column: ITableColumn<T>, item: T) {
  if (!('cell' in column)) {
    throw new Error(`Column "${column.header}" has no cell renderer`);
  }
  return column.cell(item);
}

const activation = {
  id: 9,
  name: 'Webhook activation',
  description: 'Forwards GitHub events',
  created_at: '2024-01-01T00:00:00Z',
  modified_at: '2024-01-02T00:00:00Z',
  status: StatusEnum.Running,
} as EdaRulebookActivation;

describe('useEventStreamActivationsColumns', () => {
  it('should return name, description, status, created, and modified columns', () => {
    const { result } = renderHook(() => useEventStreamActivationsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Description',
      'Status',
      'Created',
      'Last modified',
    ]);
    expect(result.current[1].value?.(activation)).toBe('Forwards GitHub events');
    expect(result.current[3].value?.(activation)).toBe('2024-01-01T00:00:00Z');
    expect(result.current[4].value?.(activation)).toBe('2024-01-02T00:00:00Z');
  });

  it('should render a pending-delete status for activations that are deleting', () => {
    const { result } = renderHook(() => useEventStreamActivationsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const statusColumn = result.current[2];

    render(
      <MemoryRouter>
        {columnCell(statusColumn, { ...activation, status: StatusEnum.Deleting })}
        {columnCell(statusColumn, activation)}
      </MemoryRouter>
    );

    expect(screen.getByText('Pending delete')).toBeInTheDocument();
  });

  it('should render the activation name cell', () => {
    const { result } = renderHook(() => useEventStreamActivationsColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    render(<MemoryRouter>{columnCell(result.current[0], activation)}</MemoryRouter>);
    expect(screen.getByText('Webhook activation')).toBeInTheDocument();
  });
});
