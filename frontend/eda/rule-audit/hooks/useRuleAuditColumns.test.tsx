import { ITableColumn } from '@ansible/ansible-ui-framework';
import { render, renderHook, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EdaRuleAuditItem } from '../../interfaces/EdaRuleAudit';
import { useRuleAuditColumns } from './useRuleAuditColumns';

function columnCell<T extends object>(column: ITableColumn<T>, item: T) {
  if (!('cell' in column)) {
    throw new Error(`Column "${column.header}" has no cell renderer`);
  }
  return column.cell(item);
}

describe('useRuleAuditColumns', () => {
  it('should render a rulebook activation link when an instance id is present', () => {
    const { result } = renderHook(() => useRuleAuditColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });
    const item = {
      id: 1,
      name: 'Say Hello',
      status: 'successful',
      fired_at: '2024-01-01T00:00:00Z',
      activation_instance: { id: 44, name: 'Hello activation' },
    } as EdaRuleAuditItem;

    render(
      <MemoryRouter>
        {columnCell(result.current[0], item)}
        {columnCell(result.current[2], item)}
        {columnCell(result.current[3], item)}
      </MemoryRouter>
    );

    expect(screen.getByText('Say Hello')).toBeInTheDocument();
    expect(screen.getByText('Hello activation')).toBeInTheDocument();
  });

  it('should render Deleted and Unknown labels when the activation instance has no id', () => {
    const { result } = renderHook(() => useRuleAuditColumns(), {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    render(
      <MemoryRouter>
        {columnCell(result.current[2], {
          id: 1,
          name: 'Gone',
          activation_instance: { name: 'DELETED' },
        } as EdaRuleAuditItem)}
        {columnCell(result.current[2], {
          id: 2,
          name: 'Missing',
          activation_instance: { name: 'other' },
        } as EdaRuleAuditItem)}
        {columnCell(result.current[3], { id: 3, name: 'No fire' } as EdaRuleAuditItem)}
      </MemoryRouter>
    );

    expect(screen.getByText('Deleted')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
