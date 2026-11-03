/* eslint-disable i18next/no-literal-string */
import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EdaRuleAuditAction } from '../../interfaces/EdaRuleAuditAction';
import { useRuleAuditActionsColumns } from './useRuleAuditActionsColumns';

function columnCell<T extends object>(column: ITableColumn<T>, item: T) {
  if (!('cell' in column)) {
    throw new Error(`Column "${column.header}" has no cell renderer`);
  }
  return column.cell(item);
}

const open = vi.fn();
vi.stubGlobal('open', open);

describe('useRuleAuditActionsColumns', () => {
  it('should return name, status, and last fired columns', () => {
    const { result } = renderHook(() => useRuleAuditActionsColumns());
    expect(result.current.map((column) => column.header)).toEqual([
      'Name',
      'Status',
      'Last fired date',
    ]);
  });

  it('should open the action url in a new tab when present', async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useRuleAuditActionsColumns());
    const action = {
      name: 'debug',
      url: 'https://example.com/job/1',
      status: 'successful',
      fired_at: '2024-01-01T00:00:00Z',
    } as EdaRuleAuditAction;

    render(
      <MemoryRouter>
        {columnCell(result.current[0], action)}
        {columnCell(result.current[1], action)}
        {columnCell(result.current[2], action)}
      </MemoryRouter>
    );

    expect(screen.getByText('debug')).toBeInTheDocument();
    await user.click(screen.getByText('debug'));
    expect(open).toHaveBeenCalledWith('https://example.com/job/1', '_blank');
  });

  it('should render a name without a link when url is missing and an empty fired date', () => {
    const { result } = renderHook(() => useRuleAuditActionsColumns());
    const action = { name: 'print_event', status: 'failed' } as EdaRuleAuditAction;

    render(
      <MemoryRouter>
        {columnCell(result.current[0], action)}
        {columnCell(result.current[2], action)}
      </MemoryRouter>
    );

    expect(screen.getByText('print_event')).toBeInTheDocument();
  });
});
